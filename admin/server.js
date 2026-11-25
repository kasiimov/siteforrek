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

const schemaReady = new WeakSet()

async function ensureSchema(env) {
  if (schemaReady.has(env.DB)) return
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
    ['v', 'INTEGER DEFAULT 1'],
    ['scroll', 'INTEGER'],
    ['ms', 'INTEGER'],
    ['kind', 'TEXT'],
    ['size', 'INTEGER'],
    ['pages', 'INTEGER'],
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
  // Заметки владельца о посетителях: только анонимный ID, без имён и почты.
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS visitor_notes (
       visitor TEXT PRIMARY KEY,
       note TEXT NOT NULL,
       updated_at INTEGER NOT NULL
     )`,
  ).run()
  schemaReady.add(env.DB)
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

function cleanInt(value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Math.max(min, Math.min(max, Math.round(number)))
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
  const rawCountry = request.headers.get('cf-ipcountry') || request.cf?.country || body?.country || ''
  const country = /^[A-Za-z]{2}$/.test(rawCountry) && !/^(XX|T1)$/i.test(rawCountry)
    ? rawCountry.toUpperCase()
    : ''
  const scroll = cleanInt(body?.scroll, 0, 100)
  const ms = cleanInt(body?.ms, 0, 86400000)
  const kind = clean(body?.kind)
  const size = cleanInt(body?.size, 0, 1024 * 1024 * 1024)
  const pages = cleanInt(body?.pages, 0, 100000)

  await ensureSchema(env)
  await env.DB.prepare(
    `INSERT INTO events
       (name, action, path, visitor, session, ref, source, medium, campaign, lang, device, browser, os, screen, country, duration, scroll, ms, kind, size, pages, meta, v, ts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, ?)`,
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
      scroll,
      ms,
      kind,
      size,
      pages,
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
  if (raw === null || raw === '') return fallback
  const days = Number(raw)
  // days=0 — «всё время»: период не ограничиваем, а не подменяем дефолтом.
  if (!Number.isFinite(days) || days < 0) return fallback
  return Math.min(MAX_PERIOD, Math.round(days))
}

async function stats(request, env, url) {
  await ensureSchema(env)

  const days = readDays(url, 14)
  const since = days ? now() - days * 86400000 : 0
  // Для «всего времени» график всё равно ограничиваем годом, чтобы не тянуть тысячи точек.
  const seriesLimit = days || 365
  const args = since ? [since] : []
  const periodFilter = since ? ' AND ts >= ?' : ''
  const periodWhere = since ? ' WHERE ts >= ?' : ''

  const totals = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT session) AS value FROM events').first(),
    env.DB.prepare(
      "SELECT COUNT(*) AS value FROM events WHERE strftime('%Y-%m-%d', ts/1000, 'unixepoch') = strftime('%Y-%m-%d', 'now')",
    ).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 7 * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(now() - 30 * 86400000).first(),
    env.DB.prepare(`SELECT COUNT(*) AS value FROM events${periodWhere}`).bind(...args).first(),
    env.DB.prepare('SELECT MAX(ts) AS value FROM events').first(),
    env.DB.prepare("SELECT COUNT(*) AS value FROM events WHERE action = 'error'").first(),
    env.DB.prepare("SELECT AVG(duration) AS value FROM events WHERE action = 'leave' AND duration IS NOT NULL").first(),
    env.DB.prepare(`SELECT COUNT(DISTINCT visitor) AS value FROM events${periodWhere}`).bind(...args).first(),
    env.DB.prepare(`SELECT COUNT(DISTINCT session) AS value FROM events${periodWhere}`).bind(...args).first(),
  ])

  const series = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', ts/1000, 'unixepoch') AS day,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people,
            COUNT(DISTINCT session) AS sessions
       FROM events${periodWhere}
      GROUP BY day
      ORDER BY day DESC
      LIMIT ?`,
  )
    .bind(...(since ? [since, seriesLimit] : [seriesLimit]))
    .all()

  const engagement = await env.DB.prepare(
    `SELECT COUNT(*) AS sessions,
            AVG(CASE WHEN seconds > 0 THEN seconds END) AS avg_seconds,
            AVG(views) AS avg_views
       FROM (SELECT session,
                    SUM(CASE WHEN action = 'leave' THEN COALESCE(duration, 0) ELSE 0 END) AS seconds,
                    SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views
               FROM events WHERE session != ''${periodFilter}
              GROUP BY session)`,
  )
    .bind(...args)
    .first()

  const bounces = await env.DB.prepare(
    `SELECT COUNT(*) AS value FROM (
       SELECT session,
              SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views,
              SUM(CASE WHEN action IN ('open', 'done') THEN 1 ELSE 0 END) AS acts
         FROM events WHERE session != ''${periodFilter}
        GROUP BY session)
      WHERE views <= 1 AND acts = 0`,
  )
    .bind(...args)
    .first()

  const tools = await env.DB.prepare(
    `SELECT name,
            SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS total,
            SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS done,
            SUM(CASE WHEN action = 'error' THEN 1 ELSE 0 END) AS errors,
            COUNT(DISTINCT CASE WHEN action = 'open' THEN session END) AS opened,
            COUNT(DISTINCT CASE WHEN action = 'done' THEN session END) AS completed,
            COUNT(DISTINCT visitor) AS people,
            AVG(CASE WHEN action = 'done' THEN ms END) AS avg_ms,
            MAX(ts) AS last
       FROM events
      WHERE action IN ('open', 'done', 'error')${periodFilter}
      GROUP BY name
      ORDER BY total DESC
      LIMIT 60`,
  )
    .bind(...args)
    .all()

  const pageViews = await env.DB.prepare(
    `SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor) AS people
       FROM events WHERE action = 'view'${periodFilter}
      GROUP BY path ORDER BY views DESC LIMIT 50`,
  )
    .bind(...args)
    .all()

  const pageTimes = await env.DB.prepare(
    `SELECT path, COUNT(*) AS leaves, AVG(duration) AS avg_time, AVG(scroll) AS avg_scroll
       FROM events WHERE action = 'leave' AND duration IS NOT NULL${periodFilter}
      GROUP BY path`,
  )
    .bind(...args)
    .all()

  const pageEntries = await env.DB.prepare(
    `SELECT path, COUNT(*) AS entries FROM events
      WHERE action = 'view' AND id IN (
        SELECT MIN(id) FROM events WHERE action = 'view' AND session != ''${periodFilter} GROUP BY session
      )${periodFilter}
      GROUP BY path ORDER BY entries DESC LIMIT 50`,
  )
    .bind(...(since ? [since, since] : []))
    .all()

  const pageExits = await env.DB.prepare(
    `SELECT path, COUNT(*) AS exits FROM events
      WHERE id IN (
        SELECT MAX(id) FROM events WHERE session != ''${periodFilter} GROUP BY session
      )${periodFilter}
      GROUP BY path ORDER BY exits DESC LIMIT 50`,
  )
    .bind(...(since ? [since, since] : []))
    .all()

  const sources = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(source, ''), 'direct') AS source,
            COALESCE(MAX(CASE WHEN medium IN ('', 'none') THEN '' ELSE medium END), '') AS medium,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people,
            COUNT(DISTINCT session) AS sessions
       FROM events${periodWhere}
      GROUP BY COALESCE(NULLIF(source, ''), 'direct') ORDER BY total DESC LIMIT 30`,
  )
    .bind(...args)
    .all()

  const known = (column) => ` WHERE COALESCE(${column}, '') != ''${periodFilter}`
  const devices = await env.DB.prepare(
    `SELECT device, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${known('device')} GROUP BY device ORDER BY total DESC`,
  )
    .bind(...args)
    .all()

  const browsers = await env.DB.prepare(
    `SELECT browser, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${known('browser')} GROUP BY browser ORDER BY total DESC LIMIT 12`,
  )
    .bind(...args)
    .all()

  const oses = await env.DB.prepare(
    `SELECT os, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${known('os')} GROUP BY os ORDER BY total DESC LIMIT 12`,
  )
    .bind(...args)
    .all()

  const langs = await env.DB.prepare(
    `SELECT lang, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${known('lang')} GROUP BY lang ORDER BY total DESC LIMIT 12`,
  )
    .bind(...args)
    .all()

  const countries = await env.DB.prepare(
    `SELECT country, COUNT(*) AS total, COUNT(DISTINCT visitor) AS people
       FROM events${known('country')} GROUP BY country ORDER BY total DESC LIMIT 20`,
  )
    .bind(...args)
    .all()

  const coverage = await env.DB.prepare(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN COALESCE(device, '') != '' THEN 1 ELSE 0 END) AS devices,
            SUM(CASE WHEN COALESCE(country, '') != '' THEN 1 ELSE 0 END) AS countries,
            SUM(CASE WHEN COALESCE(duration, 0) > 0 THEN 1 ELSE 0 END) AS timed
       FROM events${periodWhere}`,
  )
    .bind(...args)
    .first()

  const quality = await env.DB.prepare(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN v >= 2 THEN 1 ELSE 0 END) AS tracked,
            MIN(CASE WHEN v >= 2 THEN ts END) AS since
       FROM events`,
  ).first()

  const hourly = await env.DB.prepare(
    `SELECT strftime('%H', ts/1000, 'unixepoch') AS hour,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people
       FROM events${periodWhere}
      GROUP BY hour ORDER BY hour`,
  )
    .bind(...args)
    .all()

  const actions = await env.DB.prepare(
    `SELECT action, COUNT(*) AS total FROM events${periodWhere} GROUP BY action ORDER BY total DESC`,
  )
    .bind(...args)
    .all()

  const errors = await env.DB.prepare(
    `SELECT ts, name, path, device, browser, meta FROM events
      WHERE action = 'error'${periodFilter}
      ORDER BY id DESC LIMIT 50`,
  )
    .bind(...args)
    .all()

  const funnel = await env.DB.prepare(
    `SELECT COUNT(DISTINCT CASE WHEN action = 'view' THEN session END) AS views,
            COUNT(DISTINCT CASE WHEN action = 'open' THEN session END) AS opens,
            COUNT(DISTINCT CASE WHEN action = 'done' THEN session END) AS dones
       FROM events WHERE session != ''${periodFilter}`,
  )
    .bind(...args)
    .first()

  const timesByPath = new Map((pageTimes.results ?? []).map((row) => [row.path, row]))
  const entriesByPath = new Map((pageEntries.results ?? []).map((row) => [row.path, row.entries]))
  const exitsByPath = new Map((pageExits.results ?? []).map((row) => [row.path, row.exits]))

  const pages = (pageViews.results ?? []).map((row) => {
    const time = timesByPath.get(row.path)
    return {
      path: row.path,
      views: row.views,
      people: row.people,
      entries: entriesByPath.get(row.path) ?? 0,
      exits: exitsByPath.get(row.path) ?? 0,
      avgTime: Math.round(time?.avg_time ?? 0),
      avgScroll: Math.round(time?.avg_scroll ?? 0),
    }
  })

  const toolRows = (tools.results ?? []).map((row) => {
    const opened = row.opened || row.total
    const completed = row.opened ? row.completed : row.done
    return {
      ...row,
      opened,
      completed,
      conversion: opened ? Math.round((completed / opened) * 100) : 0,
      legacy: !row.opened,
      avgMs: Math.round(row.avg_ms ?? 0),
    }
  })

  const errorGroups = []
  for (const row of errors.results ?? []) {
    let message = 'Ошибка'
    try {
      message = String(JSON.parse(row.meta || '{}')?.message || message).slice(0, 160)
    } catch {
      message = String(row.meta || message).slice(0, 160)
    }
    const group = errorGroups.find((item) => item.message === message)
    if (group) {
      group.count += 1
    } else {
      errorGroups.push({ message, count: 1, last: row.ts, path: row.path })
    }
  }
  errorGroups.sort((a, b) => b.count - a.count)

  const settings = await readSettings(env)
  const sessions = totals[11]?.value ?? totals[2]?.value ?? 0

  return json({
    days,
    totals: {
      events: totals[0]?.value ?? 0,
      people: totals[1]?.value ?? 0,
      sessions,
      today: totals[3]?.value ?? 0,
      week: totals[4]?.value ?? 0,
      month: totals[5]?.value ?? 0,
      period: totals[6]?.value ?? 0,
      last: totals[7]?.value ?? 0,
      errors: totals[8]?.value ?? 0,
      avgDuration: Math.round(totals[9]?.value ?? 0),
      peoplePeriod: totals[10]?.value ?? 0,
      sessionsPeriod: totals[11]?.value ?? 0,
      avgSessionSeconds: Math.round(engagement?.avg_seconds ?? 0),
      avgViews: Math.round((engagement?.avg_views ?? 0) * 10) / 10,
      bounceRate: sessions ? Math.round(((bounces?.value ?? 0) / sessions) * 100) : 0,
    },
    series: (series.results ?? []).reverse(),
    tools: toolRows,
    pages,
    sources: sources.results ?? [],
    devices: devices.results ?? [],
    browsers: browsers.results ?? [],
    os: oses.results ?? [],
    langs: langs.results ?? [],
    countries: countries.results ?? [],
    hourly: hourly.results ?? [],
    actions: actions.results ?? [],
    errors: errors.results ?? [],
    errorGroups: errorGroups.slice(0, 8),
    funnel: {
      views: funnel?.views ?? 0,
      opens: funnel?.opens ?? 0,
      dones: funnel?.dones ?? 0,
    },
    coverage: {
      total: coverage?.total ?? 0,
      devices: coverage?.devices ?? 0,
      countries: coverage?.countries ?? 0,
      timed: coverage?.timed ?? 0,
    },
    quality: {
      total: quality?.total ?? 0,
      tracked: quality?.tracked ?? 0,
      legacy: (quality?.total ?? 0) - (quality?.tracked ?? 0),
      since: quality?.since ?? 0,
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
              lang, device, browser, os, screen, country, duration, scroll, ms, kind, size, pages, meta
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
            visitor, session, duration, scroll, ms, kind, size, pages, meta
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
    'Скролл',
    'мс обработки',
    'Тип файла',
    'КБ',
    'Страниц',
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
        row.scroll ?? '',
        row.ms ?? '',
        row.kind || '',
        row.size ?? '',
        row.pages ?? '',
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

/* ── посетители: путь, заметки, удаление ─────────────────────── */

const USER_FILTERS = new Set(['all', 'new', 'returning', 'done', 'error'])

const VISITOR_AGG = `visitor,
      MIN(ts) AS first,
      MAX(ts) AS last,
      COUNT(DISTINCT CASE WHEN session != '' THEN session END) AS sessions,
      COUNT(*) AS events,
      SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views,
      SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS opens,
      SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS dones,
      SUM(CASE WHEN action = 'error' THEN 1 ELSE 0 END) AS errors,
      SUM(CASE WHEN action = 'leave' THEN COALESCE(duration, 0) ELSE 0 END) AS seconds,
      MAX(NULLIF(country, '')) AS country,
      MAX(NULLIF(device, '')) AS device,
      MAX(NULLIF(browser, '')) AS browser,
      MAX(NULLIF(os, '')) AS os,
      MAX(NULLIF(lang, '')) AS lang,
      MAX(NULLIF(source, '')) AS source,
      MAX(NULLIF(screen, '')) AS screen`

function userListCte() {
  return `WITH agg AS (SELECT ${VISITOR_AGG} FROM events WHERE visitor != '' GROUP BY visitor),
    list AS (SELECT agg.*, COALESCE(n.note, '') AS note
               FROM agg LEFT JOIN visitor_notes n ON n.visitor = agg.visitor)`
}

/** Список посетителей: агрегат по анонимному ID за период активности. */
async function users(request, env, url) {
  if (request.method !== 'GET') return json({ error: 'Только чтение.' }, 405)
  await ensureSchema(env)

  const nowMs = now()
  const days = readDays(url, 30)
  const since = days ? nowMs - days * 86400000 : 0
  const rawFilter = url.searchParams.get('filter') ?? 'all'
  const filter = USER_FILTERS.has(rawFilter) ? rawFilter : 'all'
  const search = (url.searchParams.get('q') ?? '').trim().slice(0, 60)
  const limit = Math.min(100, Math.max(10, Math.round(Number(url.searchParams.get('limit')) || 25)))
  const page = Math.max(1, Math.round(Number(url.searchParams.get('page')) || 1))
  const offset = (page - 1) * limit

  const where = []
  const args = []
  if (since) {
    where.push('last >= ?')
    args.push(since)
  }
  if (filter === 'new' && since) {
    where.push('first >= ?')
    args.push(since)
  }
  if (filter === 'returning') where.push('sessions > 1')
  if (filter === 'done') where.push('dones > 0')
  if (filter === 'error') where.push('errors > 0')
  if (search) {
    where.push(
      "(visitor LIKE ? ESCAPE '\\' OR note LIKE ? ESCAPE '\\' OR COALESCE(country, '') LIKE ? ESCAPE '\\' OR COALESCE(device, '') LIKE ? ESCAPE '\\' OR COALESCE(browser, '') LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM events e WHERE e.visitor = list.visitor AND (COALESCE(e.session, '') LIKE ? ESCAPE '\\' OR COALESCE(e.path, '') LIKE ? ESCAPE '\\')))",
    )
    const pattern = likeQuery(search)
    args.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern)
  }
  const clause = where.length ? ' WHERE ' + where.join(' AND ') : ''
  const cte = userListCte()
  const todayStart = Math.floor(nowMs / 86400000) * 86400000
  const weekSince = nowMs - 7 * 86400000

  const [total, rows, summary] = await Promise.all([
    env.DB.prepare(`${cte} SELECT COUNT(*) AS value FROM list${clause}`)
      .bind(...args)
      .first(),
    env.DB.prepare(`${cte} SELECT * FROM list${clause} ORDER BY last DESC LIMIT ? OFFSET ?`)
      .bind(...args, limit, offset)
      .all(),
    env.DB.prepare(
      `WITH agg AS (
         SELECT visitor, MIN(ts) AS first, MAX(ts) AS last,
                COUNT(DISTINCT CASE WHEN session != '' THEN session END) AS sessions,
                SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS dones
           FROM events WHERE visitor != '' GROUP BY visitor)
       SELECT COUNT(*) AS people,
              SUM(CASE WHEN last >= ? THEN 1 ELSE 0 END) AS today,
              SUM(CASE WHEN last >= ? THEN 1 ELSE 0 END) AS week,
              SUM(CASE WHEN first >= ? THEN 1 ELSE 0 END) AS fresh,
              SUM(CASE WHEN sessions > 1 THEN 1 ELSE 0 END) AS repeats,
              SUM(CASE WHEN dones > 0 THEN 1 ELSE 0 END) AS converted,
              MAX(last) AS last
         FROM agg`,
    )
      .bind(todayStart, weekSince, weekSince)
      .first(),
  ])

  const count = total?.value ?? 0
  return json({
    days,
    filter,
    q: search,
    rows: rows.results ?? [],
    total: count,
    page,
    limit,
    pages: Math.max(1, Math.ceil(count / limit)),
    summary: {
      people: summary?.people ?? 0,
      today: summary?.today ?? 0,
      week: summary?.week ?? 0,
      fresh: summary?.fresh ?? 0,
      returning: summary?.repeats ?? 0,
      converted: summary?.converted ?? 0,
      last: summary?.last ?? 0,
    },
  })
}

/** Профиль посетителя: сводка, сессии, события и заметка. GET / PUT / DELETE. */
async function user(request, env, url) {
  await ensureSchema(env)

  if (request.method === 'GET') {
    const visitor = cleanId(url.searchParams.get('visitor') ?? '')
    if (!visitor) return json({ error: 'Нужен visitor — анонимный ID посетителя.' }, 400)

    const [profile, sessions, events, noteRow] = await Promise.all([
      env.DB.prepare(`SELECT ${VISITOR_AGG} FROM events WHERE visitor = ?`).bind(visitor).first(),
      env.DB.prepare(
        `SELECT session, MIN(ts) AS start, MAX(ts) AS end, COUNT(*) AS events,
                SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views,
                SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS opens,
                SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS dones,
                SUM(CASE WHEN action = 'error' THEN 1 ELSE 0 END) AS errors,
                SUM(CASE WHEN action = 'leave' THEN COALESCE(duration, 0) ELSE 0 END) AS seconds,
                MAX(NULLIF(device, '')) AS device,
                MAX(NULLIF(browser, '')) AS browser,
                MAX(NULLIF(source, '')) AS source
           FROM events WHERE visitor = ? AND session != ''
          GROUP BY session ORDER BY start DESC LIMIT 100`,
      )
        .bind(visitor)
        .all(),
      env.DB.prepare(
        `SELECT ts, name, action, path, session, device, browser, os, source, lang,
                country, duration, scroll, ms, kind, size, pages, meta
           FROM events WHERE visitor = ? ORDER BY id DESC LIMIT 300`,
      )
        .bind(visitor)
        .all(),
      env.DB.prepare('SELECT note, updated_at FROM visitor_notes WHERE visitor = ?').bind(visitor).first(),
    ])

    if (!profile || !profile.events) return json({ error: 'Посетитель не найден.' }, 404)
    return json({
      profile,
      sessions: sessions.results ?? [],
      events: events.results ?? [],
      note: noteRow?.note ?? '',
      noteUpdated: noteRow?.updated_at ?? 0,
    })
  }

  if (request.method !== 'PUT' && request.method !== 'DELETE') {
    return json({ error: 'Метод не поддерживается.' }, 405)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Нужен JSON с visitor.' }, 400)
  }
  const visitor = cleanId(body?.visitor ?? '')
  if (!visitor) return json({ error: 'Нужен visitor — анонимный ID посетителя.' }, 400)

  if (request.method === 'PUT') {
    const note = String(body?.note ?? '').replace(/\s+/g, ' ').trim().slice(0, 500)
    if (note) {
      await env.DB.prepare(
        `INSERT INTO visitor_notes (visitor, note, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(visitor) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at`,
      )
        .bind(visitor, note, now())
        .run()
    } else {
      await env.DB.prepare('DELETE FROM visitor_notes WHERE visitor = ?').bind(visitor).run()
    }
    await audit(env, 'заметка о посетителе', visitor + (note ? ': ' + note.slice(0, 80) : ': очищена'))
    return json({ visitor, note })
  }

  // DELETE: удаляем только события и заметку этого анонимного ID.
  const result = await env.DB.prepare('DELETE FROM events WHERE visitor = ?').bind(visitor).run()
  await env.DB.prepare('DELETE FROM visitor_notes WHERE visitor = ?').bind(visitor).run()
  const removed = result?.meta?.changes ?? 0
  await audit(env, 'удаление посетителя', visitor + ': ' + removed + ' событий')
  return json({ removed, visitor })
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
      '/api/users': () => users(request, env, url),
      '/api/user': () => user(request, env, url),
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
