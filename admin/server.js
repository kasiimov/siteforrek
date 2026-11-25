/**
 * Админка Congix Docs: D1 с анонимными событиями сайта, журналом, ошибками и настройками.
 *
 * Вход пока открытый: без токена, ключей и cookie — это осознанное временное
 * решение владельца. Изменяющие запросы по-прежнему принимаются только с того же
 * Origin, а сами события сайта не содержат файлов, имён и почты.
 *
 * Файл — только серверная часть. Страница лежит в page.html и встраивается
 * в worker.js сборщиком: `node admin/build.mjs`.
 */

const SITE_ORIGIN = 'https://rekpdf-ircn71.freebuff.site'
const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'])
const MAX_FIELD = 120
const MAX_META = 600
const MAX_PERIOD = 3650
const LIVE_WINDOW_MS = 5 * 60 * 1000

const ACTIONS = new Set(['view', 'open', 'done', 'error', 'leave', 'session'])
const ACTION_LABEL = {
  view: 'открыл страницу',
  open: 'открыл инструмент',
  done: 'получил файл',
  error: 'ошибка',
  leave: 'ушёл со страницы',
  session: 'новая сессия',
}

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

  const columns = await env.DB.prepare('PRAGMA table_info(events)').all()
  const have = new Set((columns.results ?? []).map((column) => column.name))
  const extra = [
    ['session', 'TEXT'],
    ['ref', 'TEXT'],
    ['source', 'TEXT'],
    ['medium', 'TEXT'],
    ['campaign', 'TEXT'],
    ['lang', 'TEXT'],
    ['device', 'TEXT'],
    ['browser', 'TEXT'],
    ['os', 'TEXT'],
    ['screen', 'TEXT'],
    ['country', 'TEXT'],
    ['duration', 'INTEGER'],
    ['meta', 'TEXT'],
  ]
  for (const [name, type] of extra) {
    if (!have.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE events ADD COLUMN ${name} ${type}`).run()
      } catch {
        // Колонка уже есть — миграция идемпотентна.
      }
    }
  }

  await env.DB.prepare('CREATE INDEX IF NOT EXISTS events_ts ON events (ts)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS events_action ON events (action)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS events_session ON events (session)').run()
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS events_path ON events (path)').run()
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

function cleanId(value) {
  return typeof value === 'string' ? value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) : ''
}

function cleanPath(value) {
  const path = clean(value, '/').split('?')[0]
  return path.startsWith('/') ? path : '/'
}

function now() {
  return Date.now()
}

/* ── защита от CSRF для изменяющих запросов ──────────────────── */

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
  if (!name || !ACTIONS.has(action)) return cors(request, new Headers(), 400)

  const meta =
    body?.meta && typeof body.meta === 'object'
      ? JSON.stringify(body.meta).slice(0, MAX_META)
      : clean(body?.meta).slice(0, MAX_META)

  const duration = Number(body?.duration)
  const country = clean(request.cf?.country || body?.country)

  await ensureSchema(env)
  await env.DB.prepare(
    `INSERT INTO events
       (name, action, path, visitor, session, ref, source, medium, campaign, lang, device, browser, os, screen, country, duration, meta, ts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      name,
      action,
      cleanPath(body?.path),
      cleanId(body?.visitor),
      cleanId(body?.session),
      clean(body?.ref),
      clean(body?.source, 'direct') || 'direct',
      clean(body?.medium, 'none') || 'none',
      clean(body?.campaign),
      clean(body?.lang),
      clean(body?.device),
      clean(body?.browser),
      clean(body?.os),
      clean(body?.screen),
      country,
      Number.isFinite(duration) && duration >= 0 ? Math.min(Math.round(duration), 86400) : null,
      meta,
      now(),
    )
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

/* ── открытый вход ───────────────────────────────────────────── */

async function login() {
  return json({ ok: true, open: true })
}

async function logout() {
  return json({ ok: true })
}

async function session(request, env) {
  await ensureSchema(env)
  return json({ authenticated: true, open: true })
}

/* ── статистика ──────────────────────────────────────────────── */

function readDays(url, fallback) {
  const raw = url.searchParams.get('days')
  if (raw === 'all') return 0
  const days = Number(raw)
  if (!Number.isFinite(days) || days <= 0) return fallback
  return Math.min(MAX_PERIOD, Math.round(days))
}

async function stats(request, env, url) {
  await ensureSchema(env)

  const days = readDays(url, 14) || 14
  const since = days ? now() - days * 86400000 : 0
  const periodFilter = since ? ' WHERE ts >= ?' : ''
  const args = since ? [since] : []

  const totals = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT session) AS value FROM events').first(),
    env.DB.prepare(
      "SELECT COUNT(*) AS value FROM events WHERE strftime('%Y-%m-%d', ts/1000, 'unixepoch') = strftime('%Y-%m-%d', 'now')",
    ).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 7 * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 30 * 86400000).first(),
    env.DB.prepare(`SELECT COUNT(*) AS value FROM events${periodFilter}`).bind(...args).first(),
    env.DB.prepare('SELECT MAX(ts) AS value FROM events').first(),
    env.DB.prepare("SELECT COUNT(*) AS value FROM events WHERE action = 'error'").first(),
    env.DB.prepare("SELECT AVG(duration) AS value FROM events WHERE action = 'leave' AND duration IS NOT NULL").first(),
  ])

  const series = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', ts/1000, 'unixepoch') AS day,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people,
            COUNT(DISTINCT session) AS sessions
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
            SUM(CASE WHEN action = 'error' THEN 1 ELSE 0 END) AS errors,
            COUNT(DISTINCT visitor) AS people,
            MAX(ts) AS last
       FROM events
      WHERE action IN ('open', 'done', 'error')${since ? ' AND ts >= ?' : ''}
      GROUP BY name
      ORDER BY total DESC
      LIMIT 60`,
  )
    .bind(...args)
    .all()

  const pages = await env.DB.prepare(
    `SELECT path, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events
      WHERE action = 'view'${since ? ' AND ts >= ?' : ''}
      GROUP BY path ORDER BY total DESC LIMIT 40`,
  )
    .bind(...args)
    .all()

  const sources = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(source, ''), 'direct') AS source, medium,
            COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${periodFilter}
      GROUP BY source, medium ORDER BY total DESC LIMIT 30`,
  )
    .bind(...args)
    .all()

  const devices = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(device, ''), 'unknown') AS device, COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people
       FROM events${periodFilter} GROUP BY device ORDER BY total DESC`,
  )
    .bind(...args)
    .all()

  const browsers = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(browser, ''), 'unknown') AS browser, COUNT(*) AS total
       FROM events${periodFilter} GROUP BY browser ORDER BY total DESC LIMIT 12`,
  )
    .bind(...args)
    .all()

  const langs = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(lang, ''), 'unknown') AS lang, COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people
       FROM events${periodFilter} GROUP BY lang ORDER BY total DESC LIMIT 12`,
  )
    .bind(...args)
    .all()

  const countries = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(country, ''), '—') AS country, COUNT(*) AS total
       FROM events${periodFilter} GROUP BY country ORDER BY total DESC LIMIT 20`,
  )
    .bind(...args)
    .all()

  const actions = await env.DB.prepare(
    `SELECT action, COUNT(*) AS total FROM events${periodFilter} GROUP BY action ORDER BY total DESC`,
  )
    .bind(...args)
    .all()

  const errors = await env.DB.prepare(
    `SELECT ts, path, device, browser, meta FROM events
      WHERE action = 'error'${since ? ' AND ts >= ?' : ''}
      ORDER BY id DESC LIMIT 25`,
  )
    .bind(...args)
    .all()

  const funnel = await env.DB.prepare(
    `SELECT SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views,
            SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS opens,
            SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS dones
       FROM events${periodFilter}`,
  )
    .bind(...args)
    .first()

  const settings = await readSettings(env)

  return json({
    days,
    totals: {
      events: totals[0]?.value ?? 0,
      people: totals[1]?.value ?? 0,
      sessions: totals[2]?.value ?? 0,
      today: totals[3]?.value ?? 0,
      week: totals[4]?.value ?? 0,
      month: totals[5]?.value ?? 0,
      period: totals[6]?.value ?? 0,
      last: totals[7]?.value ?? 0,
      errors: totals[8]?.value ?? 0,
      avgDuration: Math.round(totals[9]?.value ?? 0),
    },
    series: (series.results ?? []).reverse(),
    tools: tools.results ?? [],
    pages: pages.results ?? [],
    sources: sources.results ?? [],
    devices: devices.results ?? [],
    browsers: browsers.results ?? [],
    langs: langs.results ?? [],
    countries: countries.results ?? [],
    actions: actions.results ?? [],
    errors: errors.results ?? [],
    funnel: {
      views: funnel?.views ?? 0,
      opens: funnel?.opens ?? 0,
      dones: funnel?.dones ?? 0,
    },
    settings,
  })
}

/* ── онлайн сейчас ───────────────────────────────────────────── */

async function live(request, env) {
  await ensureSchema(env)
  const since = now() - LIVE_WINDOW_MS
  const minuteSince = now() - 30 * 60 * 1000

  const [people, sessions, events, pages, recent, minutes] = await Promise.all([
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events WHERE ts >= ?').bind(since).first(),
    env.DB.prepare('SELECT COUNT(DISTINCT session) AS value FROM events WHERE ts >= ?').bind(since).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(since).first(),
    env.DB.prepare(
      `SELECT path, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
         FROM events WHERE ts >= ? AND action IN ('view', 'open', 'done')
        GROUP BY path ORDER BY total DESC LIMIT 12`,
    )
      .bind(since)
      .all(),
    env.DB.prepare(
      `SELECT id, ts, name, action, path, device, browser, source, visitor, session, meta
         FROM events WHERE ts >= ? ORDER BY id DESC LIMIT 30`,
    )
      .bind(since)
      .all(),
    env.DB.prepare(
      `SELECT strftime('%H:%M', ts/1000, 'unixepoch') AS minute,
              COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
         FROM events WHERE ts >= ?
        GROUP BY minute ORDER BY minute ASC`,
    )
      .bind(minuteSince)
      .all(),
  ])

  return json({
    windowSeconds: LIVE_WINDOW_MS / 1000,
    people: people?.value ?? 0,
    sessions: sessions?.value ?? 0,
    events: events?.value ?? 0,
    pages: pages.results ?? [],
    recent: recent.results ?? [],
    minutes: minutes.results ?? [],
    now: now(),
  })
}

/* ── журнал событий и CSV ────────────────────────────────────── */

function likeQuery(value) {
  return '%' + value.replace(/[\\%_]/g, (char) => '\\' + char) + '%'
}

function eventFilters(url) {
  const days = readDays(url, 0)
  const action = url.searchParams.get('action') ?? ''
  const device = url.searchParams.get('device') ?? ''
  const lang = url.searchParams.get('lang') ?? ''
  const search = (url.searchParams.get('q') ?? '').trim().slice(0, 60)
  const where = []
  const args = []
  if (days) {
    where.push('ts >= ?')
    args.push(now() - days * 86400000)
  }
  if (ACTIONS.has(action)) {
    where.push('action = ?')
    args.push(action)
  }
  if (device) {
    where.push('device = ?')
    args.push(device)
  }
  if (lang) {
    where.push('lang = ?')
    args.push(lang)
  }
  if (search) {
    where.push(
      "(name LIKE ? ESCAPE '\\' OR path LIKE ? ESCAPE '\\' OR visitor LIKE ? ESCAPE '\\' OR session LIKE ? ESCAPE '\\' OR COALESCE(source, '') LIKE ? ESCAPE '\\')",
    )
    const pattern = likeQuery(search)
    args.push(pattern, pattern, pattern, pattern, pattern)
  }
  return { where: where.length ? ' WHERE ' + where.join(' AND ') : '', args, days, action, device, lang, search }
}

async function events(request, env, url) {
  await ensureSchema(env)

  const filters = eventFilters(url)
  const limit = Math.min(200, Math.max(10, Math.round(Number(url.searchParams.get('limit')) || 50)))
  const page = Math.max(1, Math.round(Number(url.searchParams.get('page')) || 1))
  const offset = (page - 1) * limit

  const [total, rows] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS value FROM events${filters.where}`)
      .bind(...filters.args)
      .first(),
    env.DB.prepare(
      `SELECT id, ts, name, action, path, visitor, session, ref, source, medium, campaign,
              lang, device, browser, os, screen, country, duration, meta
         FROM events${filters.where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    )
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
    filters: { days: filters.days, action: filters.action, device: filters.device, lang: filters.lang, q: filters.search },
  })
}

function csvCell(value) {
  const text = String(value == null ? '' : value)
  return /[";\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

async function exportCsv(request, env, url) {
  await ensureSchema(env)

  const filters = eventFilters(url)
  const rows = await env.DB.prepare(
    `SELECT ts, name, action, path, source, medium, device, browser, os, lang, country,
            visitor, session, duration, meta
       FROM events${filters.where} ORDER BY id DESC LIMIT 50000`,
  )
    .bind(...filters.args)
    .all()

  const head = [
    'Дата (UTC)',
    'Время (UTC)',
    'Действие',
    'Инструмент',
    'Страница',
    'Источник',
    'Канал',
    'Устройство',
    'Браузер',
    'ОС',
    'Язык',
    'Страна',
    'Посетитель',
    'Сессия',
    'Секунд',
    'Детали',
  ]
  const lines = [head.join(';')]
  for (const row of rows.results ?? []) {
    const iso = new Date(row.ts).toISOString()
    lines.push(
      [
        iso.slice(0, 10),
        iso.slice(11, 19),
        ACTION_LABEL[row.action] ?? row.action,
        row.name,
        row.path || '/',
        row.source || '',
        row.medium || '',
        row.device || '',
        row.browser || '',
        row.os || '',
        row.lang || '',
        row.country || '',
        row.visitor || '',
        row.session || '',
        row.duration ?? '',
        row.meta || '',
      ]
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
  await ensureSchema(env)

  if (request.method === 'GET') {
    const [current, count, sessions, people] = await Promise.all([
      readSettings(env),
      env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
      env.DB.prepare('SELECT COUNT(DISTINCT session) AS value FROM events').first(),
      env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    ])
    return json({
      ...current,
      events: count?.value ?? 0,
      sessions: sessions?.value ?? 0,
      people: people?.value ?? 0,
      updated: now(),
    })
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
  await ensureSchema(env)
  const limit = Math.min(100, Math.max(1, Math.round(Number(new URL(request.url).searchParams.get('limit')) || 20)))
  const rows = await env.DB.prepare('SELECT at, action, detail FROM audit ORDER BY id DESC LIMIT ?').bind(limit).all()
  return json({ rows: rows.results ?? [] })
}

async function health(request, env) {
  await ensureSchema(env)
  const [events, auditCount] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM audit').first(),
  ])
  return json({
    ok: true,
    events: events?.value ?? 0,
    audit: auditCount?.value ?? 0,
    auth: 'open',
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
      '/api/live': () => live(request, env),
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
