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
<title>RekPDF · панель наблюдения</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23171512'/%3E%3Ctext x='16' y='23' font-family='monospace' font-size='19' fill='%23efece4' text-anchor='middle'%3ER%3C/text%3E%3C/svg%3E" />
<style>
  :root {
    color-scheme: light;
    --paper: #efece4;
    --panel: #faf8f3;
    --ink: #171512;
    --ink-soft: #3b3833;
    --muted: #8a8477;
    --line: #ddd7c9;
    --accent: #d4452a;
    --blue: #3a44c4;
    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    min-height: 100vh;
    color: var(--ink);
    background: var(--paper);
    background-image: linear-gradient(to right, rgba(23,21,18,.035) 1px, transparent 1px);
    background-size: 76px 100%;
    font: 14px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; }
  button, input { font: inherit; color: inherit; }
  ::selection { background: rgba(212,69,42,.18); }

  .shell { display: grid; grid-template-columns: 216px minmax(0, 1fr); min-height: 100vh; }

  /* ── левая рейка ─────────────────────────────── */
  .rail {
    position: sticky; top: 0; align-self: start; height: 100vh;
    display: flex; flex-direction: column; gap: 32px;
    padding: 30px 22px 26px;
    border-right: 1px solid var(--line);
    background: rgba(239,236,228,.72);
    backdrop-filter: blur(6px);
  }
  .brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }
  .brand-mark {
    display: grid; place-items: center; width: 30px; height: 30px;
    background: var(--ink); color: var(--paper);
    font: 600 15px/1 var(--mono); border-radius: 3px;
  }
  .brand-text b { display: block; font-size: 14px; letter-spacing: -.01em; }
  .brand-text small {
    display: block; font: 9px/1.4 var(--mono); letter-spacing: .2em;
    text-transform: uppercase; color: var(--muted); margin-top: 2px;
  }
  .nav { display: flex; flex-direction: column; }
  .nav a {
    display: flex; align-items: baseline; gap: 10px;
    padding: 8px 0; text-decoration: none; font-size: 13px; color: var(--ink-soft);
    border-bottom: 1px solid transparent; transition: color .15s;
  }
  .nav a i {
    font: 9px/1 var(--mono); letter-spacing: .1em; color: var(--muted);
    min-width: 16px; transition: color .15s;
  }
  .nav a:hover { color: var(--accent); }
  .nav a:hover i { color: var(--accent); }
  .rail-foot { margin-top: auto; display: grid; gap: 8px; }
  .stamp {
    margin: 0 0 4px; font: 9.5px/1.6 var(--mono); letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted);
  }
  .ghost {
    text-align: left; padding: 9px 0; background: none; border: 0;
    border-top: 1px solid var(--line); cursor: pointer;
    font: 10px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft);
    transition: color .15s;
  }
  .ghost:hover { color: var(--accent); }

  /* ── основная колонка ───────────────────────── */
  main { padding: 42px 46px 90px; min-width: 0; }
  .inner { max-width: 1120px; }

  .eyebrow {
    display: flex; align-items: center; gap: 9px; margin: 0 0 14px;
    font: 10px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: var(--muted);
  }
  .eyebrow::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
  h1 { margin: 0; font-size: 46px; font-weight: 500; letter-spacing: -.045em; line-height: 1.02; }
  h1 em { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; letter-spacing: -.02em; }
  .sub { margin: 14px 0 0; font-size: 12.5px; color: var(--muted); }
  .sub span { color: var(--ink-soft); }

  /* ── полоса KPI ──────────────────────────────── */
  .strip {
    display: grid; grid-template-columns: 1.25fr 1fr 1fr 1fr;
    margin: 34px 0 22px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--line);
  }
  .cell { padding: 18px 20px 16px; border-right: 1px solid var(--line); min-width: 0; }
  .cell:first-child { padding-left: 0; }
  .cell:last-child { border-right: 0; }
  .cell .label {
    display: block; margin-bottom: 6px;
    font: 9.5px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--muted);
  }
  .cell b {
    display: block; font: 500 34px/1.1 var(--mono); letter-spacing: -.05em;
    font-variant-numeric: tabular-nums;
  }
  .cell.hero b { font-size: 54px; letter-spacing: -.06em; }
  .cell .note, .cell .delta { display: block; margin-top: 6px; font-size: 11px; color: var(--muted); }
  .delta.up { color: var(--accent); }
  .delta.flat { color: var(--muted); }

  /* ── панели ─────────────────────────────────── */
  .panel {
    background: var(--panel); border: 1px solid var(--line);
    padding: 20px 22px 18px; margin-bottom: 18px;
  }
  .panel-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }
  .panel-head h2 {
    margin: 0; font: 10px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--ink);
  }
  .panel-head .hint { margin-left: auto; font-size: 10.5px; color: var(--muted); }
  .empty { margin: 0; padding: 18px 0; font-size: 12px; color: var(--muted); }
  .chart-body svg { display: block; width: 100%; height: auto; overflow: visible; }
  .chart-body .grid { stroke: rgba(23,21,18,.09); stroke-dasharray: 3 5; }
  .chart-body .line { fill: none; stroke: var(--ink); stroke-width: 1.6; stroke-linejoin: round; }
  .chart-body .area { fill: var(--accent); fill-opacity: .1; }
  .chart-body .dot { fill: var(--panel); stroke: var(--accent); stroke-width: 1.5; }
  .chart-body .tick { fill: var(--muted); font: 9px var(--mono); }

  .duo { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap: 18px; align-items: start; }
  .duo .panel { margin-bottom: 18px; }

  .ranks { display: flex; flex-direction: column; }
  .row {
    display: grid; grid-template-columns: 22px minmax(0,1fr) 46px 46px;
    align-items: center; gap: 12px; padding: 9px 0;
    border-bottom: 1px dashed var(--line);
  }
  .row.two { grid-template-columns: 22px minmax(0,1fr) 46px; }
  .row:last-child { border-bottom: 0; }
  .row .idx { font: 9.5px/1 var(--mono); color: var(--muted); }
  .row .name { display: block; font-size: 13px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row .meter {
    position: relative; display: block; height: 4px; margin-top: 7px;
    background: rgba(23,21,18,.07); overflow: hidden;
  }
  .row .meter u, .row .meter i { position: absolute; left: 0; top: 0; bottom: 0; }
  .row .meter u { background: rgba(23,21,18,.3); }
  .row .meter i { background: var(--accent); }
  .row .meter u, .row .meter i { transition: width .3s ease; }
  .row .n { text-align: right; }
  .row .n b { display: block; font: 500 14px/1.2 var(--mono); font-variant-numeric: tabular-nums; }
  .row .n small { font: 8.5px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }

  .actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 0; margin-top: 16px; border-top: 1px solid var(--ink); }
  .action { padding: 12px 12px 2px 0; }
  .action span { display: block; font: 9px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .action b { display: block; margin-top: 6px; font: 500 22px/1 var(--mono); font-variant-numeric: tabular-nums; }
  .action small { display: block; margin-top: 4px; font-size: 10.5px; color: var(--muted); }

  .feed { display: flex; flex-direction: column; }
  .event {
    display: grid; grid-template-columns: 62px minmax(0,1fr) auto;
    gap: 12px; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(221,215,201,.7);
  }
  .event:last-child { border-bottom: 0; }
  .chip {
    display: inline-block; padding: 3px 6px; border: 1px solid var(--line);
    font: 8.5px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); text-align: center;
  }
  .chip.open { border-color: rgba(58,68,196,.35); color: var(--blue); }
  .chip.done { border-color: rgba(212,69,42,.35); color: var(--accent); }
  .event .what { min-width: 0; display: flex; align-items: baseline; gap: 9px; }
  .event .what b { font-weight: 500; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .event .what span { font: 10.5px/1 var(--mono); color: var(--muted); white-space: nowrap; }
  .event time { font: 10px/1 var(--mono); color: var(--muted); white-space: nowrap; }

  /* ── вход ───────────────────────────────────── */
  .gate { max-width: 390px; margin: 7vh 0 0; }
  .gate h1 { font-size: 34px; }
  .gate .panel { padding: 22px; margin-top: 24px; }
  .field { display: grid; gap: 7px; margin-bottom: 14px; }
  .field span { font: 9.5px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  .field input {
    width: 100%; padding: 12px 13px; background: var(--paper);
    border: 1px solid var(--line); border-radius: 2px; font-family: var(--mono); font-size: 13px;
    outline: none; transition: border-color .15s;
  }
  .field input:focus { border-color: var(--ink); }
  .solid {
    width: 100%; padding: 13px 16px; border: 0; border-radius: 2px; cursor: pointer;
    background: var(--ink); color: var(--paper);
    font: 10px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase;
    transition: background .15s;
  }
  .solid:hover { background: var(--accent); }
  .fine { margin: 14px 0 0; font-size: 11px; line-height: 1.6; color: var(--muted); }
  .error { margin: 12px 0 0; font-size: 12px; color: var(--accent); }

  @media (max-width: 1024px) {
    .shell { grid-template-columns: 1fr; }
    .rail {
      position: static; height: auto; flex-direction: row; align-items: center; gap: 18px;
      padding: 16px 18px; border-right: 0; border-bottom: 1px solid var(--line);
    }
    .brand-text small { display: none; }
    .nav { flex-direction: row; gap: 16px; margin-left: auto; overflow-x: auto; }
    .nav a { border-bottom: 0; padding: 0; white-space: nowrap; }
    .nav a i { display: none; }
    .rail-foot { margin: 0; display: flex; gap: 14px; }
    .stamp { display: none; }
    .ghost { border-top: 0; padding: 0; white-space: nowrap; }
    main { padding: 30px 22px 70px; }
    h1 { font-size: 34px; }
    .strip { grid-template-columns: 1fr 1fr; }
    .cell { padding: 16px 16px 14px; }
    .cell:nth-child(2n) { border-right: 0; }
    .cell:first-child { padding-left: 16px; }
    .cell.hero b { font-size: 40px; }
    .duo { grid-template-columns: 1fr; }
  }
  @media (max-width: 620px) {
    .nav { display: none; }
    .rail { justify-content: space-between; }
    .event { grid-template-columns: 58px minmax(0,1fr); }
    .event time { grid-column: 2; }
    .row { grid-template-columns: 18px minmax(0,1fr) 40px 40px; gap: 9px; }
    .row.two { grid-template-columns: 18px minmax(0,1fr) 40px; }
  }
</style>
</head>
<body>
<div class="shell">
  <aside class="rail">
    <a class="brand" href="/">
      <span class="brand-mark">R</span>
      <span class="brand-text"><b>RekPDF</b><small>панель наблюдения</small></span>
    </a>

    <nav class="nav" id="nav" hidden>
      <a href="#tools"><i>01</i>Инструменты</a>
      <a href="#audience"><i>02</i>Аудитория</a>
      <a href="#feed"><i>03</i>Лента</a>
    </nav>

    <div class="rail-foot">
      <p class="stamp" id="stamp" hidden>—</p>
      <button class="ghost" id="refresh" hidden>Обновить</button>
      <button class="ghost" id="logout" hidden>Выйти</button>
    </div>
  </aside>

  <main>
    <div class="inner">
      <section class="gate" id="login">
        <p class="eyebrow">вход · только для владельца</p>
        <h1>Служебный<br /><em>доступ</em></h1>
        <div class="panel">
          <label class="field">
            <span>Ключ доступа</span>
            <input id="token" type="password" placeholder="ADMIN_TOKEN" autocomplete="current-password" />
          </label>
          <button class="solid" id="enter">Открыть панель</button>
          <p class="error" id="loginError" hidden></p>
          <p class="fine">Ключ хранится в секрете <span style="font-family:var(--mono)">ADMIN_TOKEN</span> и запоминается только в этой вкладке.</p>
        </div>
      </section>

      <div id="dashboard" hidden>
        <header>
          <p class="eyebrow" id="eyebrow">обзор · сегодня</p>
          <h1>Пульт <em>RekPDF</em></h1>
          <p class="sub" id="range">—</p>
        </header>

        <section class="strip">
          <div class="cell hero">
            <span class="label">Событий сегодня</span>
            <b id="kToday">0</b>
            <span class="delta flat" id="kDelta">—</span>
          </div>
          <div class="cell">
            <span class="label">Людей всего</span>
            <b id="kPeople">0</b>
            <span class="note">по уникальным посетителям</span>
          </div>
          <div class="cell">
            <span class="label">За 7 дней</span>
            <b id="kWeek">0</b>
            <span class="note" id="kAvg">—</span>
          </div>
          <div class="cell">
            <span class="label">Дошли до файла</span>
            <b id="kConv">—</b>
            <span class="note">открыл инструмент → сохранил</span>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>Активность</h2><span class="hint">события по дням · 14 суток</span></div>
          <div class="chart-body" id="chart"></div>
        </section>

        <div class="duo">
          <section class="panel" id="tools">
            <div class="panel-head"><h2>Инструменты</h2><span class="hint">кто чем пользуется</span></div>
            <div class="ranks" id="toolList"></div>
          </section>

          <div>
            <section class="panel" id="audience">
              <div class="panel-head"><h2>Страницы</h2><span class="hint">просмотры</span></div>
              <div class="ranks" id="pageList"></div>
              <div class="actions" id="actionList"></div>
            </section>
          </div>
        </div>

        <section class="panel" id="feed">
          <div class="panel-head"><h2>Последние события</h2><span class="hint">live · 40 записей</span></div>
          <div class="feed" id="feedList"></div>
        </section>
      </div>
    </div>
  </main>
</div>

<script>
  var $ = function (id) { return document.getElementById(id) }
  var esc = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    })
  }
  var num = function (value) { return Number(value || 0).toLocaleString('ru-RU') }
  var pad = function (value) { return value < 10 ? '0' + value : String(value) }

  function fmt(ts) {
    if (!ts) return '—'
    var d = new Date(ts)
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  }

  function ago(ts) {
    if (!ts) return '—'
    var diff = Math.round((Date.now() - ts) / 1000)
    if (diff < 60) return 'только что'
    if (diff < 3600) return Math.round(diff / 60) + ' мин'
    if (diff < 86400) return Math.round(diff / 3600) + ' ч'
    return Math.round(diff / 86400) + ' дн'
  }

  function hoursAgo(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleString('ru-RU')
  }

  var ACTION_LABEL = { view: 'визит', open: 'открыл', done: 'файл' }

  var token = sessionStorage.getItem('rekpdf.admin') || ''
  var timer = null

  function setChrome(visible) {
    $('login').hidden = visible
    $('dashboard').hidden = !visible
    $('nav').hidden = !visible
    $('refresh').hidden = !visible
    $('logout').hidden = !visible
    $('stamp').hidden = !visible
    if (timer) { clearInterval(timer); timer = null }
    if (visible) timer = setInterval(function () { if (!document.hidden) load(true) }, 60000)
  }

  async function load(silent) {
    $('loginError').hidden = true
    if (!silent) {
      $('enter').textContent = 'Проверяем…'
      $('enter').disabled = true
    }
    try {
      var response = await fetch('/api/stats', { headers: { Authorization: 'Bearer ' + token } })
      var data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить статистику')
      sessionStorage.setItem('rekpdf.admin', token)
      setChrome(true)
      render(data)
    } catch (error) {
      setChrome(false)
      $('loginError').hidden = false
      $('loginError').textContent = error.message
    } finally {
      $('enter').textContent = 'Открыть панель'
      $('enter').disabled = false
    }
  }

  function chart(days) {
    if (!days.length) return '<p class="empty">Данных пока нет — открой сайт, и здесь появятся точки.</p>'
    var w = 720, h = 190, pl = 26, pr = 10, pt = 18, pb = 26
    var max = Math.max.apply(null, days.map(function (d) { return d.total }).concat([1]))
    var step = days.length > 1 ? (w - pl - pr) / (days.length - 1) : 0
    var x = function (i) { return pl + step * i }
    var y = function (v) { return pt + (h - pt - pb) * (1 - v / max) }
    var pts = days.map(function (d, i) { return [x(i), y(d.total), d] })
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join(' ')
    var area = line + ' L ' + x(days.length - 1).toFixed(1) + ' ' + (h - pb) + ' L ' + pl + ' ' + (h - pb) + ' Z'
    var grid = [0, 0.5, 1].map(function (f) {
      var gy = y(max * f).toFixed(1)
      return '<line class="grid" x1="' + pl + '" x2="' + (w - pr) + '" y1="' + gy + '" y2="' + gy + '" />'
    }).join('')
    var dots = pts.map(function (p) {
      return '<circle class="dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.8"><title>' +
        esc(p[2].day) + ' · ' + p[2].total + ' событий · ' + p[2].people + ' людей</title></circle>'
    }).join('')
    var labels = pts.map(function (p, i) {
      if (i % 2 !== 0 && i !== pts.length - 1) return ''
      return '<text class="tick" x="' + p[0].toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle">' + p[2].day.slice(5) + '</text>'
    }).join('')
    var top = '<text class="tick" x="0" y="' + (pt + 3) + '">' + max + '</text>'
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Активность по дням">' +
      grid + '<path class="area" d="' + area + '" /><path class="line" d="' + line + '" />' + dots + labels + top + '</svg>'
  }

  function toolRows(tools) {
    if (!tools.length) return '<p class="empty">Пока никто не открывал инструменты.</p>'
    var max = Math.max.apply(null, tools.map(function (t) { return t.total }).concat([1]))
    return tools.map(function (tool, i) {
      var opens = Number(tool.total) || 0
      var done = Number(tool.done) || 0
      var opensShare = Math.max(2, Math.round((opens / max) * 100))
      var doneShare = Math.max(opensShare ? (done ? 2 : 0) : 0, Math.round((done / max) * 100))
      return '<div class="row" title="' + esc(tool.name) + ': открытий ' + opens + ', до файла ' + done + ', людей ' + tool.people + '">' +
        '<span class="idx">' + pad(i + 1) + '</span>' +
        '<span><span class="name">' + esc(tool.name) + '</span>' +
        '<span class="meter"><u style="width:' + opensShare + '%"></u><i style="width:' + doneShare + '%"></i></span></span>' +
        '<span class="n"><b>' + opens + '</b><small>откр.</small></span>' +
        '<span class="n"><b>' + done + '</b><small>файл</small></span>' +
        '</div>'
    }).join('')
  }

  function pageRows(pages) {
    if (!pages.length) return '<p class="empty">Нет просмотров страниц.</p>'
    var max = Math.max.apply(null, pages.map(function (p) { return p.total }).concat([1]))
    return pages.map(function (page, i) {
      var width = Math.max(3, Math.round((page.total / max) * 100))
      return '<div class="row two">' +
        '<span class="idx">' + pad(i + 1) + '</span>' +
        '<span><span class="name">' + esc(page.path) + '</span>' +
        '<span class="meter"><u style="width:' + width + '%"></u></span></span>' +
        '<span class="n"><b>' + page.total + '</b><small>раз</small></span>' +
        '</div>'
    }).join('')
  }

  function actionTiles(actions, totalEvents) {
    var names = ['view', 'open', 'done']
    return names.map(function (name) {
      var found = actions.filter(function (a) { return a.action === name })[0]
      var value = found ? found.total : 0
      var share = totalEvents ? Math.round((value / totalEvents) * 100) : 0
      return '<div class="action"><span>' + (ACTION_LABEL[name] || name) + '</span><b>' + num(value) + '</b><small>' + share + '% от всех</small></div>'
    }).join('')
  }

  function render(data) {
    var t = data.totals
    var utcToday = new Date().toISOString().slice(0, 10)
    var todayIndex = -1
    data.days.forEach(function (day, i) { if (day.day === utcToday) todayIndex = i })
    var previous = todayIndex > 0 ? data.days[todayIndex - 1].total : 0
    var today = todayIndex >= 0 ? data.days[todayIndex].total : 0

    $('kToday').textContent = num(t.today)
    $('kPeople').textContent = num(t.people)
    $('kWeek').textContent = num(t.week)

    var delta = $('kDelta')
    if (todayIndex === 0) {
      delta.className = 'delta flat'
      delta.textContent = 'первый день наблюдений'
    } else if (previous > 0) {
      var change = today - previous
      delta.className = 'delta ' + (change >= 0 ? 'up' : 'flat')
      delta.textContent = (change > 0 ? '▲ +' : change < 0 ? '▼ ' : '= ') + Math.abs(change) + ' к вчера'
    } else {
      delta.className = 'delta flat'
      delta.textContent = 'вчера было 0'
    }

    $('kAvg').textContent = 'в среднем ' + (t.week / 7).toFixed(1).replace('.', ',') + ' в день'

    var opens = 0, done = 0
    data.tools.forEach(function (tool) { opens += Number(tool.total) || 0; done += Number(tool.done) || 0 })
    $('kConv').textContent = opens ? Math.round((done / opens) * 100) + '%' : '—'

    $('eyebrow').textContent = 'обзор · ' + new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    $('range').innerHTML = '<span>' + num(t.events) + '</span> событий за всё время · <span>' + num(t.month) + '</span> за 30 дней · наблюдение с ' +
      (data.days.length ? esc(new Date(data.days[0].day + 'T00:00:00Z').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })) : 'сегодня')
    $('stamp').textContent = 'обновлено ' + fmt(Date.now())

    $('chart').innerHTML = chart(data.days)
    $('toolList').innerHTML = toolRows(data.tools)
    $('pageList').innerHTML = pageRows(data.pages)
    $('actionList').innerHTML = actionTiles(data.actions, t.events)

    $('feedList').innerHTML = data.recent.length
      ? data.recent.map(function (event) {
          var action = esc(event.action)
          return '<div class="event">' +
            '<span class="chip ' + action + '">' + esc(ACTION_LABEL[event.action] || event.action) + '</span>' +
            '<span class="what"><b>' + esc(event.name) + '</b><span>' + esc(event.path || '/') + '</span></span>' +
            '<time title="' + esc(hoursAgo(event.ts)) + '">' + ago(event.ts) + '</time>' +
            '</div>'
        }).join('')
      : '<p class="empty">Событий пока нет.</p>'
  }

  $('enter').addEventListener('click', function () {
    token = $('token').value.trim()
    if (token) load(false)
  })
  $('token').addEventListener('keydown', function (event) { if (event.key === 'Enter') $('enter').click() })
  $('refresh').addEventListener('click', function () { load(false) })
  $('logout').addEventListener('click', function () {
    sessionStorage.removeItem('rekpdf.admin')
    token = ''
    $('token').value = ''
    setChrome(false)
  })

  if (token) load(true)
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
