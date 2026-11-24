/**
 * Админка Congix Docs: D1 с анонимными событиями сайта, журналом событий и настройками.
 *
 * Авторизация: пароль из секрета ADMIN_TOKEN обменивается на подписанную
 * HttpOnly-cookie (HMAC-SHA256, 12 часов). Токен в браузере не хранится.
 * Заголовок `Authorization: Bearer <ADMIN_TOKEN>` тоже принимается — для curl.
 *
 * Файл — только серверная часть. Страница лежит в page.html и встраивается
 * в worker.js сборщиком: `node admin/build.mjs`.
 */

const SITE_ORIGIN = 'https://rekpdf-ircn71.freebuff.site'
const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'])
const MAX_FIELD = 80
const COOKIE_NAME = 'rekpdf_admin'
const SESSION_TTL_S = 12 * 60 * 60
const MAX_PERIOD = 3650

let schemaReady = false

async function ensureSchema(env) {
  if (schemaReady) return
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS events (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       action TEXT NOT NULL,
       path TEXT,
       visitor TEXT,
       ts INTEGER NOT NULL
     )`,
  ).run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS events_ts ON events (ts)').run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS settings (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
  ).run()
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS audit (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       at INTEGER NOT NULL,
       actor TEXT NOT NULL,
       action TEXT NOT NULL,
       detail TEXT
     )`,
  ).run()
  schemaReady = true
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  })
}

function cors(request, headers = new Headers(), status = 200) {
  const origin = request.headers.get('Origin') ?? ''
  const response = new Response(null, { status, headers })
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS.has(origin) ? origin : SITE_ORIGIN)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'content-type, authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Vary', 'Origin')
  return response
}

function clean(value, fallback = '') {
  return typeof value === 'string' ? value.slice(0, MAX_FIELD) : fallback
}

function now() {
  return Date.now()
}

/* ── авторизация ─────────────────────────────────────────────── */

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const left = a
  const right = b.length === a.length ? b : a
  let diff = a.length === b.length ? 0 : 1
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

function bearer(request) {
  const header = request.headers.get('Authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}

function cookies(request) {
  const header = request.headers.get('Cookie') ?? ''
  const found = {}
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    found[part.slice(0, index).trim()] = part.slice(index + 1).trim()
  }
  return found
}

function base64url(bytes) {
  let binary = ''
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(env, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.ADMIN_TOKEN),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return base64url(signature)
}

/** Проверяет cookie или Bearer-токен. Возвращает true/false. */
async function authorized(request, env) {
  if (!env.ADMIN_TOKEN) return false
  if (timingSafeEqual(bearer(request), env.ADMIN_TOKEN)) return true

  const value = cookies(request)[COOKIE_NAME]
  if (!value) return false
  const dot = value.lastIndexOf('.')
  if (dot < 1) return false
  const payload = value.slice(0, dot)
  const signature = value.slice(dot + 1)
  const expires = Number(payload)
  if (!Number.isFinite(expires) || expires < now()) return false
  const expected = await sign(env, payload)
  return timingSafeEqual(signature, expected)
}

/** Cookie ставим только по HTTPS: по HTTP браузер её просто не сохранит. */
function sessionCookie(request, value, maxAge) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`
}

/** Защита от CSRF для изменяющих запросов с cookie: Origin обязан совпасть. */
function sameOrigin(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return true
  const origin = request.headers.get('Origin')
  if (!origin) return true // curl и скрипты без Origin
  return origin === new URL(request.url).origin || ALLOWED_ORIGINS.has(origin)
}

/* ── аудит и настройки ───────────────────────────────────────── */

async function audit(env, action, detail = '') {
  try {
    await env.DB.prepare('INSERT INTO audit (at, actor, action, detail) VALUES (?, ?, ?, ?)')
      .bind(now(), 'owner', clean(action, '—'), clean(detail, ''))
      .run()
  } catch {
    // Журнал не должен ломать саму операцию.
  }
}

const SETTINGS_KEY = 'retention_days'
const DEFAULT_SETTINGS = { retentionDays: 90 }

async function readSettings(env) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(SETTINGS_KEY).first()
  const days = Number(row?.value)
  return { retentionDays: Number.isFinite(days) && days >= 0 && days <= MAX_PERIOD ? days : DEFAULT_SETTINGS.retentionDays }
}

/* ── публичные ручки сайта ───────────────────────────────────── */

async function collect(request, env) {
  if (request.method !== 'POST') return cors(request, new Headers(), 405)

  const origin = request.headers.get('Origin') ?? ''
  if (origin && !ALLOWED_ORIGINS.has(origin)) return cors(request, new Headers(), 403)

  let body
  try {
    body = await request.json()
  } catch {
    return cors(request, new Headers(), 400)
  }

  const name = clean(body?.name)
  const action = clean(body?.action)
  if (!name || !action) return cors(request, new Headers(), 400)

  await ensureSchema(env)
  await env.DB.prepare('INSERT INTO events (name, action, path, visitor, ts) VALUES (?, ?, ?, ?, ?)')
    .bind(name, action, clean(body?.path, '/'), clean(body?.visitor), now())
    .run()

  return cors(request, new Headers(), 204)
}

/** Публичный мини-свод для основного сайта: без ключа, только обезличенные числа. */
async function overview(request, env) {
  if (request.method !== 'GET') return cors(request, new Headers(), 405)

  await ensureSchema(env)

  const [people, today, week, tools] = await Promise.all([
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    env.DB.prepare(
      "SELECT COUNT(*) AS value FROM events WHERE strftime('%Y-%m-%d', ts/1000, 'unixepoch') = strftime('%Y-%m-%d', 'now')",
    ).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 7 * 86400000).first(),
    env.DB.prepare("SELECT name, COUNT(*) AS total FROM events WHERE action = 'open' GROUP BY name ORDER BY total DESC LIMIT 3").all(),
  ])

  const response = json({
    people: people?.value ?? 0,
    today: today?.value ?? 0,
    week: week?.value ?? 0,
    tools: tools.results ?? [],
    updated: now(),
  })
  response.headers.set('cache-control', 'public, max-age=60')
  response.headers.set('access-control-allow-origin', '*')
  return response
}

/* ── вход и выход ────────────────────────────────────────────── */

const attempts = new Map()
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const LOGIN_LIMIT = 8

function tooManyAttempts(request) {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? 'local'
  const stamp = now()
  const entry = attempts.get(ip)
  if (!entry || stamp - entry.first > LOGIN_WINDOW_MS) return false
  return entry.count >= LOGIN_LIMIT
}

function noteAttempt(request) {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? 'local'
  const stamp = now()
  const entry = attempts.get(ip)
  if (!entry || stamp - entry.first > LOGIN_WINDOW_MS) attempts.set(ip, { first: stamp, count: 1 })
  else entry.count += 1
}

async function login(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (tooManyAttempts(request)) return json({ error: 'Слишком много попыток. Подождите 10 минут.' }, 429)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Нужен JSON с ключом.' }, 400)
  }

  const given = typeof body?.token === 'string' ? body.token.trim() : ''
  if (!given || !timingSafeEqual(given, env.ADMIN_TOKEN)) {
    noteAttempt(request)
    await new Promise((resolve) => setTimeout(resolve, 350))
    return json({ error: 'Неверный ключ доступа.' }, 401)
  }

  await ensureSchema(env)
  const expires = now() + SESSION_TTL_S * 1000
  const payload = String(expires)
  const value = `${payload}.${await sign(env, payload)}`
  await audit(env, 'вход', 'новая сессия на 12 часов')

  return json(
    { ok: true, expiresAt: expires },
    200,
    { 'set-cookie': sessionCookie(request, value, SESSION_TTL_S) },
  )
}

async function logout(request, env) {
  const hadSession = await authorized(request, env)
  if (hadSession) await audit(env, 'выход', '')
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(request, '', 0) })
}

async function session(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  const ok = await authorized(request, env)
  return json({ authenticated: ok }, ok ? 200 : 401)
}

/* ── статистика ──────────────────────────────────────────────── */

function readDays(url, fallback) {
  const raw = url.searchParams.get('days')
  if (raw === 'all') return 0
  const days = Number(raw)
  if (!Number.isFinite(days) || days <= 0) return fallback
  return Math.min(MAX_PERIOD, Math.round(days))
}

const ACTION_NAMES = new Set(['view', 'open', 'done'])

async function stats(request, env, url) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)

  await ensureSchema(env)

  const days = readDays(url, 14) || 14
  const since = days ? now() - days * 86400000 : 0
  const periodFilter = since ? ' WHERE ts >= ?' : ''

  const totals = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    env.DB.prepare(
      "SELECT COUNT(*) AS value FROM events WHERE strftime('%Y-%m-%d', ts/1000, 'unixepoch') = strftime('%Y-%m-%d', 'now')",
    ).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 7 * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 30 * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(since || 0).first(),
    env.DB.prepare('SELECT MAX(ts) AS value FROM events').first(),
    env.DB.prepare('SELECT MIN(ts) AS value FROM events').first(),
  ])

  const series = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', ts/1000, 'unixepoch') AS day,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people
       FROM events
      ${periodFilter}
      GROUP BY day
      ORDER BY day DESC
      LIMIT ?`,
  )
    .bind(...(since ? [since, days] : [days]))
    .all()

  const tools = await env.DB.prepare(
    `SELECT name,
            SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS total,
            SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS done,
            COUNT(DISTINCT visitor) AS people,
            MAX(ts) AS last
       FROM events
      WHERE action IN ('open', 'done')${since ? ' AND ts >= ?' : ''}
      GROUP BY name
      ORDER BY total DESC
      LIMIT 40`,
  )
    .bind(...(since ? [since] : []))
    .all()

  const actions = await env.DB.prepare(
    `SELECT action, COUNT(*) AS total FROM events${periodFilter} GROUP BY action ORDER BY total DESC LIMIT 20`,
  )
    .bind(...(since ? [since] : []))
    .all()

  const pages = await env.DB.prepare(
    `SELECT path, COUNT(*) AS total FROM events WHERE action = 'view'${since ? ' AND ts >= ?' : ''}
      GROUP BY path ORDER BY total DESC LIMIT 20`,
  )
    .bind(...(since ? [since] : []))
    .all()

  const settings = await readSettings(env)

  return json({
    days,
    totals: {
      events: totals[0]?.value ?? 0,
      people: totals[1]?.value ?? 0,
      today: totals[2]?.value ?? 0,
      week: totals[3]?.value ?? 0,
      month: totals[4]?.value ?? 0,
      period: totals[5]?.value ?? 0,
      last: totals[6]?.value ?? 0,
      first: totals[7]?.value ?? 0,
    },
    days: (series.results ?? []).reverse(),
    tools: tools.results ?? [],
    actions: actions.results ?? [],
    pages: pages.results ?? [],
    settings,
    updated: now(),
  })
}

/* ── журнал событий и CSV ────────────────────────────────────── */

function likeQuery(value) {
  return '%' + value.replace(/[\\%_]/g, (char) => '\\' + char) + '%'
}

function eventFilters(url) {
  const days = readDays(url, 0)
  const action = url.searchParams.get('action') ?? ''
  const search = (url.searchParams.get('q') ?? '').trim().slice(0, 60)
  const where = []
  const args = []
  if (days) {
    where.push('ts >= ?')
    args.push(now() - days * 86400000)
  }
  if (ACTION_NAMES.has(action)) {
    where.push('action = ?')
    args.push(action)
  }
  if (search) {
    where.push("(name LIKE ? ESCAPE '\\' OR path LIKE ? ESCAPE '\\' OR visitor LIKE ? ESCAPE '\\')")
    const pattern = likeQuery(search)
    args.push(pattern, pattern, pattern)
  }
  return { where: where.length ? ' WHERE ' + where.join(' AND ') : '', args, days, action, search }
}

/** Постраничный журнал: что именно происходило на сайте. */
async function events(request, env, url) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)

  await ensureSchema(env)

  const filters = eventFilters(url)
  const limit = Math.min(200, Math.max(10, Math.round(Number(url.searchParams.get('limit')) || 50)))
  const page = Math.max(1, Math.round(Number(url.searchParams.get('page')) || 1))
  const offset = (page - 1) * limit

  const [total, rows] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS value FROM events${filters.where}`)
      .bind(...filters.args)
      .first(),
    env.DB.prepare(`SELECT id, ts, name, action, path, visitor FROM events${filters.where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .bind(...filters.args, limit, offset)
      .all(),
  ])

  const count = total?.value ?? 0
  return json({
    rows: rows.results ?? [],
    total: count,
    page,
    limit,
    pages: Math.max(1, Math.ceil(count / limit)),
    filters: { days: filters.days, action: filters.action, q: filters.search },
  })
}

function csvCell(value) {
  const text = String(value == null ? '' : value)
  return /[";\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

const ACTION_LABEL = { open: 'открыл инструмент', done: 'получил файл', view: 'открыл страницу' }

/** Выгрузка журнала в CSV: те же фильтры, что и в таблице. */
async function exportCsv(request, env, url) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)

  await ensureSchema(env)

  const filters = eventFilters(url)
  const rows = await env.DB.prepare(`SELECT ts, name, action, path, visitor FROM events${filters.where} ORDER BY id DESC LIMIT 20000`)
    .bind(...filters.args)
    .all()

  const head = ['Дата (UTC)', 'Время (UTC)', 'Инструмент', 'Действие', 'Страница', 'Посетитель']
  const lines = [head.join(';')]
  for (const row of rows.results ?? []) {
    const iso = new Date(row.ts).toISOString()
    lines.push(
      [iso.slice(0, 10), iso.slice(11, 19), row.name, ACTION_LABEL[row.action] ?? row.action, row.path || '/', row.visitor]
        .map(csvCell)
        .join(';'),
    )
  }

  await audit(env, 'выгрузка CSV', `${filters.days ? filters.days + ' дн.' : 'всё время'}; ${lines.length - 1} строк`)

  const suffix = filters.days ? `-${filters.days}d` : ''
  return new Response('\ufeff' + lines.join('\r\n') + '\r\n', {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="congix-docs-stats${suffix}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  })
}

/* ── настройки, очистка, аудит ───────────────────────────────── */

async function settings(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)
  await ensureSchema(env)

  if (request.method === 'GET') {
    const [current, count] = await Promise.all([
      readSettings(env),
      env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    ])
    return json({ ...current, events: count?.value ?? 0, updated: now() })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Нужен JSON с настройками.' }, 400)
  }
  const days = Number(body?.retentionDays)
  if (!Number.isFinite(days) || days < 0 || days > MAX_PERIOD) {
    return json({ error: `Срок хранения — целое число от 0 до ${MAX_PERIOD} дней (0 — хранить всё).` }, 400)
  }

  const value = String(Math.round(days))
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  )
    .bind(SETTINGS_KEY, value, now())
    .run()
  await audit(env, 'настройки', `хранение событий: ${value === '0' ? 'всё время' : value + ' дн.'}`)
  return json({ ...(await readSettings(env)), updated: now() })
}

/** Удаляет события старше N дней (N=0 — все). Отмены нет, поэтому есть аудит. */
async function purge(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)
  await ensureSchema(env)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Нужен JSON с days.' }, 400)
  }
  const days = Number(body?.days)
  if (!Number.isFinite(days) || days < 0 || days > MAX_PERIOD) {
    return json({ error: 'days — целое от 0 до 3650.' }, 400)
  }

  const result = days
    ? await env.DB.prepare('DELETE FROM events WHERE ts < ?').bind(now() - Math.round(days) * 86400000).run()
    : await env.DB.prepare('DELETE FROM events').run()
  const removed = result?.meta?.changes ?? 0
  await audit(env, 'очистка', days ? `удалены события старше ${days} дн.: ${removed}` : `удалены все события: ${removed}`)
  return json({ removed, days: Math.round(days) })
}

async function auditLog(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)
  await ensureSchema(env)
  const limit = Math.min(100, Math.max(1, Math.round(Number(new URL(request.url).searchParams.get('limit')) || 20)))
  const rows = await env.DB.prepare('SELECT at, action, detail FROM audit ORDER BY id DESC LIMIT ?').bind(limit).all()
  return json({ rows: rows.results ?? [] })
}

async function health(request, env) {
  if (!(await authorized(request, env))) return json({ error: 'Нужен вход в панель.' }, 401)
  await ensureSchema(env)
  const [events, auditCount] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM audit').first(),
  ])
  return json({
    ok: true,
    events: events?.value ?? 0,
    audit: auditCount?.value ?? 0,
    token: Boolean(env.ADMIN_TOKEN),
    now: now(),
  })
}

/* ── маршруты ────────────────────────────────────────────────── */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return cors(request, new Headers(), 204)

    if (!sameOrigin(request)) return json({ error: 'Запрос с чужого источника отклонён.' }, 403)

    const routes = {
      '/api/collect': () => collect(request, env),
      '/api/overview': () => overview(request, env),
      '/api/login': () => login(request, env),
      '/api/logout': () => logout(request, env),
      '/api/session': () => session(request, env),
      '/api/stats': () => stats(request, env, url),
      '/api/events': () => events(request, env, url),
      '/api/export.csv': () => exportCsv(request, env, url),
      '/api/settings': () => settings(request, env),
      '/api/purge': () => purge(request, env),
      '/api/audit': () => auditLog(request, env),
      '/api/health': () => health(request, env),
    }

    const route = routes[url.pathname]
    if (route) {
      try {
        return await route()
      } catch (error) {
        return json({ error: 'Ошибка базы: ' + (error?.message ?? 'неизвестно') }, 500)
      }
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(PAGE, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-frame-options': 'DENY',
          'x-content-type-options': 'nosniff',
          'referrer-policy': 'no-referrer',
        },
      })
    }

    return new Response('Not found', { status: 404 })
  },
}
