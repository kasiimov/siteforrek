/**
 * Админка RekPDF: собирает анонимные события основного сайта в D1 и показывает сводку.
 * События: инструмент, действие, путь, случайный id посетителя, время. Файлы и почта не приходят.
 */

const SITE_ORIGIN = 'https://rekpdf-ircn71.freebuff.site'
const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'])
const MAX_FIELD = 80

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
  schemaReady = true
}

function cors(request, headers = new Headers(), status = 200) {
  const origin = request.headers.get('Origin') ?? ''
  const response = new Response(null, { status, headers })
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS.has(origin) ? origin : SITE_ORIGIN)
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'content-type, authorization')
  response.headers.set('Vary', 'Origin')
  return response
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function clean(value, fallback = '') {
  return typeof value === 'string' ? value.slice(0, MAX_FIELD) : fallback
}

function authorized(request, env) {
  const token = env.ADMIN_TOKEN
  if (!token) return false
  const header = request.headers.get('Authorization') ?? ''
  const given = header.startsWith('Bearer ') ? header.slice(7) : ''
  // Сравнение постоянного времени: длина у токенов одинаковая.
  if (!given || given.length !== token.length) return false
  let diff = 0
  for (let index = 0; index < token.length; index++) diff |= token.charCodeAt(index) ^ given.charCodeAt(index)
  return diff === 0
}

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
    .bind(name, action, clean(body?.path, '/'), clean(body?.visitor), Date.now())
    .run()

  return cors(request, new Headers(), 204)
}

async function stats(request, env) {
  if (!env.ADMIN_TOKEN) return json({ error: 'ADMIN_TOKEN не настроен на сервере.' }, 503)
  if (!authorized(request, env)) return json({ error: 'Неверный ключ доступа.' }, 401)

  await ensureSchema(env)

  const [total, people, week, month, today] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(DISTINCT visitor) AS value FROM events').first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(Date.now() - 7 * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS value FROM events WHERE ts >= ?').bind(Date.now() - 30 * 86400000).first(),
    env.DB.prepare("SELECT COUNT(*) AS value FROM events WHERE strftime('%Y-%m-%d', ts/1000, 'unixepoch') = strftime('%Y-%m-%d', 'now')").first(),
  ])

  const days = await env.DB.prepare(
    `SELECT strftime('%Y-%m-%d', ts/1000, 'unixepoch') AS day,
            COUNT(*) AS total,
            COUNT(DISTINCT visitor) AS people
       FROM events
      GROUP BY day
      ORDER BY day DESC
      LIMIT 14`,
  ).all()

  const tools = await env.DB.prepare(
    `SELECT name,
            SUM(CASE WHEN action = 'open' THEN 1 ELSE 0 END) AS total,
            COUNT(DISTINCT visitor) AS people,
            MAX(ts) AS last,
            SUM(CASE WHEN action = 'done' THEN 1 ELSE 0 END) AS done
       FROM events
      WHERE action IN ('open', 'done')
      GROUP BY name
      ORDER BY total DESC
      LIMIT 40`,
  ).all()

  const actions = await env.DB.prepare(
    `SELECT action, COUNT(*) AS total FROM events GROUP BY action ORDER BY total DESC LIMIT 20`,
  ).all()

  const pages = await env.DB.prepare(
    `SELECT path, COUNT(*) AS total FROM events WHERE action = 'view' GROUP BY path ORDER BY total DESC LIMIT 20`,
  ).all()

  const recent = await env.DB.prepare(
    `SELECT name, action, path, visitor, ts FROM events ORDER BY id DESC LIMIT 40`,
  ).all()

  return json({
    totals: {
      events: total?.value ?? 0,
      people: people?.value ?? 0,
      week: week?.value ?? 0,
      month: month?.value ?? 0,
      today: today?.value ?? 0,
    },
    days: (days.results ?? []).reverse(),
    tools: tools.results ?? [],
    actions: actions.results ?? [],
    pages: pages.results ?? [],
    recent: recent.results ?? [],
  })
}

const PAGE = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RekPDF · админка</title>
<style>
  :root { color-scheme: dark; --ink:#07070b; --card:rgba(255,255,255,.04); --line:rgba(255,255,255,.1); --muted:#9a9bb0; --violet:#8b5cf6; --red:#ff4f5e; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; background:#07070b; color:#f4f4f8; font: 15px/1.5 'Golos Text', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
  .wrap { width:min(1100px, calc(100% - 40px)); margin: 0 auto; padding: 28px 0 60px; }
  header { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom: 26px; }
  .logo { display:grid; place-items:center; width:36px; height:36px; border-radius:12px; background:linear-gradient(140deg,#ff4f5e,#8b5cf6); font-weight:800; color:#0a0a12; }
  h1 { margin:0; font-size:1.15rem; font-weight:600; letter-spacing:-.01em; }
  .spacer { margin-left:auto; }
  .btn { padding:9px 16px; border-radius:11px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:#f4f4f8; font:inherit; font-size:.86rem; cursor:pointer; }
  .btn.primary { background:linear-gradient(120deg,#8b5cf6,#5a8bff); border-color:transparent; color:#fff; font-weight:600; }
  .card { border:1px solid var(--line); border-radius:18px; background:var(--card); padding:18px; }
  .login { max-width: 420px; display:flex; flex-direction:column; gap:12px; }
  label { display:grid; gap:6px; font-size:.8rem; color:var(--muted); }
  input { padding:11px 13px; border-radius:11px; border:1px solid var(--line); background:#101018; color:#f4f4f8; font:inherit; }
  .kpis { display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:12px; margin-bottom:16px; }
  .kpi { border:1px solid var(--line); border-radius:16px; padding:16px; background:var(--card); }
  .kpi b { display:block; font-size:1.6rem; font-weight:600; letter-spacing:-.02em; }
  .kpi span { font-size:.76rem; color:var(--muted); }
  .grid { display:grid; grid-template-columns: 1.2fr 1fr; gap:16px; align-items:start; }
  h2 { margin:0 0 12px; font-size:.92rem; font-weight:600; }
  .bars { display:flex; align-items:flex-end; gap:8px; height:140px; }
  .bar { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; justify-content:flex-end; height:100%; }
  .bar i { display:block; width:100%; border-radius:8px 8px 3px 3px; background:linear-gradient(180deg,#8b5cf6,rgba(90,139,255,.35)); min-height:3px; }
  .bar small { font-size:.62rem; color:#6f7085; transform:rotate(-45deg); white-space:nowrap; }
  table { width:100%; border-collapse:collapse; font-size:.83rem; }
  th, td { text-align:left; padding:8px 6px; border-bottom:1px solid rgba(255,255,255,.06); }
  th { color:#7f8096; font-weight:500; font-size:.74rem; text-transform:uppercase; letter-spacing:.06em; }
  td.num, th.num { text-align:right; }
  .muted { color:var(--muted); }
  .error { color:#ffb3b8; font-size:.85rem; }
  .recent { display:grid; gap:6px; font-size:.82rem; }
  .recent div { display:flex; gap:10px; padding:8px 10px; border-radius:10px; background:rgba(255,255,255,.03); }
  .recent time { margin-left:auto; color:#6f7085; white-space:nowrap; }
  @media (max-width: 900px) { .kpis { grid-template-columns:repeat(2, minmax(0,1fr)); } .grid { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="logo">R</span>
    <h1>RekPDF · админка</h1>
    <span class="spacer"></span>
    <button class="btn" id="refresh" hidden>Обновить</button>
    <button class="btn" id="logout" hidden>Выйти</button>
  </header>

  <div class="card login" id="login">
    <label>Ключ доступа
      <input id="token" type="password" placeholder="ADMIN_TOKEN" autocomplete="current-password" />
    </label>
    <button class="btn primary" id="enter">Показать статистику</button>
    <p class="muted" style="margin:0;font-size:.8rem">Ключ выдаётся в настройках сайта (секрет ADMIN_TOKEN). Он хранится только в этой вкладке.</p>
    <p class="error" id="loginError" hidden></p>
  </div>

  <div id="dashboard" hidden>
    <div class="kpis" id="kpis"></div>
    <div class="grid">
      <section class="card">
        <h2>Активность по дням</h2>
        <div class="bars" id="bars"></div>
      </section>
      <section class="card">
        <h2>Страницы</h2>
        <table><thead><tr><th>Путь</th><th class="num">Событий</th></tr></thead><tbody id="pages"></tbody></table>
        <h2 style="margin-top:18px">Действия</h2>
        <table><thead><tr><th>Действие</th><th class="num">Раз</th></tr></thead><tbody id="actions"></tbody></table>
      </section>
    </div>
    <section class="card" style="margin-top:16px">
      <h2>Инструменты</h2>
      <table>
        <thead><tr><th>Инструмент</th><th class="num">Открытий</th><th class="num">Дошли до файла</th><th class="num">Людей</th><th>Последний раз</th></tr></thead>
        <tbody id="tools"></tbody>
      </table>
    </section>
    <section class="card" style="margin-top:16px">
      <h2>Последние события</h2>
      <div class="recent" id="recent"></div>
    </section>
  </div>
</div>

<script>
  const $ = (id) => document.getElementById(id)
  const fmt = (ts) => ts ? new Date(ts).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
  const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

  let token = sessionStorage.getItem('rekpdf.admin') || ''

  async function load() {
    $('loginError').hidden = true
    try {
      const response = await fetch('/api/stats', { headers: { Authorization: 'Bearer ' + token } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить статистику')
      sessionStorage.setItem('rekpdf.admin', token)
      $('login').hidden = true
      $('dashboard').hidden = false
      $('refresh').hidden = false
      $('logout').hidden = false
      render(data)
    } catch (error) {
      $('login').hidden = false
      $('dashboard').hidden = true
      $('refresh').hidden = true
      $('logout').hidden = true
      $('loginError').hidden = false
      $('loginError').textContent = error.message
    }
  }

  function render(data) {
    const t = data.totals
    $('kpis').innerHTML = [
      ['Всего событий', t.events],
      ['Уникальных посетителей', t.people],
      ['Сегодня', t.today],
      ['За 7 дней', t.week],
      ['За 30 дней', t.month],
    ].map(([label, value]) => '<div class="kpi"><b>' + Number(value).toLocaleString('ru-RU') + '</b><span>' + label + '</span></div>').join('')

    const max = Math.max(1, ...data.days.map((day) => day.total))
    $('bars').innerHTML = data.days.length
      ? data.days.map((day) => {
          const height = Math.max(3, Math.round((day.total / max) * 110))
          return '<div class="bar" title="' + day.day + ': ' + day.total + '"><i style="height:' + height + 'px"></i><small>' + day.day.slice(5) + '</small></div>'
        }).join('')
      : '<p class="muted">Пока нет данных.</p>'

    $('tools').innerHTML = data.tools.length
      ? data.tools.map((tool) => '<tr><td>' + esc(tool.name) + '</td><td class="num">' + tool.total + '</td><td class="num">' + tool.done + '</td><td class="num">' + tool.people + '</td><td class="muted">' + fmt(tool.last) + '</td></tr>').join('')
      : '<tr><td colspan="5" class="muted">Пока пусто.</td></tr>'

    $('pages').innerHTML = data.pages.map((page) => '<tr><td>' + esc(page.path) + '</td><td class="num">' + page.total + '</td></tr>').join('')
    $('actions').innerHTML = data.actions.map((action) => '<tr><td>' + esc(action.action) + '</td><td class="num">' + action.total + '</td></tr>').join('')
    $('recent').innerHTML = data.recent.length
      ? data.recent.map((event) => '<div><b>' + esc(event.name) + '</b><span class="muted">' + esc(event.action) + '</span><span class="muted">' + esc(event.path) + '</span><time>' + fmt(event.ts) + '</time></div>').join('')
      : '<p class="muted">Пока нет событий.</p>'
  }

  $('enter').addEventListener('click', () => { token = $('token').value.trim(); if (token) load() })
  $('token').addEventListener('keydown', (event) => { if (event.key === 'Enter') $('enter').click() })
  $('refresh').addEventListener('click', load)
  $('logout').addEventListener('click', () => { sessionStorage.removeItem('rekpdf.admin'); token = ''; $('dashboard').hidden = true; $('login').hidden = false; $('refresh').hidden = true; $('logout').hidden = true })

  if (token) load()
</script>
</body>
</html>`

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return cors(request, new Headers(), 204)
    if (url.pathname === '/api/collect') {
      try {
        return await collect(request, env)
      } catch {
        return cors(request, new Headers(), 500)
      }
    }
    if (url.pathname === '/api/stats') {
      try {
        return await stats(request, env)
      } catch (error) {
        return json({ error: 'Ошибка базы: ' + (error?.message ?? 'неизвестно') }, 500)
      }
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
    }
    return new Response('Not found', { status: 404 })
  },
}
