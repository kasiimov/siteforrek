// Сгенерировано: node admin/build.mjs. Правьте page.html и server.js, не этот файл.
const PAGE = "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n<meta name=\"robots\" content=\"noindex, nofollow\" />\n<title>Congix Docs · админка</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23171512'/%3E%3Ctext x='16' y='23' font-family='monospace' font-size='19' fill='%23efece4' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E\" />\n<style>\n  :root {\n    color-scheme: light;\n    --paper: #efece4;\n    --panel: #faf8f3;\n    --ink: #171512;\n    --ink-soft: #3b3833;\n    --muted: #8a8477;\n    --line: #ddd7c9;\n    --accent: #d4452a;\n    --ok: #3f7a52;\n    --warn: #a4761f;\n    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;\n  }\n  * { box-sizing: border-box; }\n  [hidden] { display: none !important; }\n  body {\n    margin: 0; min-height: 100vh; color: var(--ink); background: var(--paper);\n    background-image: linear-gradient(to right, rgba(23,21,18,.035) 1px, transparent 1px);\n    background-size: 76px 100%;\n    font: 14px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    -webkit-font-smoothing: antialiased;\n  }\n  a { color: inherit; }\n  button, input, select { font: inherit; color: inherit; }\n  ::selection { background: rgba(212,69,42,.18); }\n\n  .shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 100vh; }\n  .rail {\n    position: sticky; top: 0; align-self: start; height: 100vh;\n    display: flex; flex-direction: column; gap: 28px; padding: 28px 20px 24px;\n    border-right: 1px solid var(--line); background: rgba(239,236,228,.72); backdrop-filter: blur(6px);\n  }\n  .brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }\n  .brand-mark {\n    display: grid; place-items: center; width: 30px; height: 30px;\n    background: var(--ink); color: var(--paper); font: 600 15px/1 var(--mono); border-radius: 3px;\n  }\n  .brand-text b { display: block; font-size: 14px; letter-spacing: -.01em; }\n  .brand-text small { display: block; font: 9px/1.4 var(--mono); letter-spacing: .2em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }\n  .nav { display: flex; flex-direction: column; }\n  .nav button {\n    display: flex; align-items: baseline; gap: 10px; width: 100%; padding: 9px 0;\n    background: none; border: 0; border-bottom: 1px solid transparent; text-align: left;\n    font-size: 13px; color: var(--ink-soft); cursor: pointer; transition: color .15s;\n  }\n  .nav button i { font: 9px/1 var(--mono); font-style: normal; letter-spacing: .1em; color: var(--muted); min-width: 16px; }\n  .nav button em { margin-left: auto; font: 9.5px/1 var(--mono); font-style: normal; color: var(--accent); }\n  .nav button:hover, .nav button[aria-current=\"page\"] { color: var(--accent); }\n  .nav button:hover i, .nav button[aria-current=\"page\"] i { color: var(--accent); }\n  .rail-foot { margin-top: auto; display: grid; gap: 2px; }\n  .stamp { margin: 0 0 6px; font: 9.5px/1.6 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }\n  .ghost {\n    display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 0;\n    background: none; border: 0; border-top: 1px solid var(--line); cursor: pointer; text-align: left;\n    font: 10px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft);\n  }\n  .ghost:hover { color: var(--accent); }\n  .ghost:disabled { opacity: .45; cursor: progress; }\n  .ghost kbd { font: 9px var(--mono); color: var(--muted); border: 1px solid var(--line); padding: 2px 4px; border-radius: 2px; }\n  .open-badge {\n    display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px;\n    font: 9px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--ok);\n  }\n  .open-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--ok); box-shadow: 0 0 0 3px rgba(63,122,82,.12); }\n\n  main { padding: 40px 44px 90px; min-width: 0; }\n  .inner { max-width: 1180px; }\n  .eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 12px; font: 10px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: var(--muted); }\n  .eyebrow::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }\n  h1 { margin: 0; font-size: 44px; font-weight: 500; letter-spacing: -.045em; line-height: 1.03; }\n  h1 em { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; }\n  .sub { margin: 12px 0 0; font-size: 12.5px; color: var(--muted); }\n\n  .strip { display: grid; grid-template-columns: 1.3fr repeat(5, 1fr); margin: 30px 0 20px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--line); }\n  .cell { padding: 16px 16px 14px; border-right: 1px solid var(--line); min-width: 0; }\n  .cell:first-child { padding-left: 0; }\n  .cell:last-child { border-right: 0; }\n  .cell .label { display: block; margin-bottom: 6px; font: 9px/1.3 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }\n  .cell b { display: block; font: 500 28px/1.1 var(--mono); letter-spacing: -.05em; font-variant-numeric: tabular-nums; }\n  .cell.hero b { font-size: 42px; }\n  .cell .note { display: block; margin-top: 6px; font-size: 10.5px; color: var(--muted); }\n\n  .grid2 { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr); gap: 18px; align-items: start; }\n  .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; align-items: start; }\n  .panel { background: var(--panel); border: 1px solid var(--line); padding: 18px 20px 16px; margin-bottom: 18px; min-width: 0; }\n  .panel-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }\n  .panel-head h2 { margin: 0; font: 10px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; }\n  .panel-head .hint { margin-left: auto; font-size: 10.5px; color: var(--muted); }\n  .empty { margin: 0; padding: 14px 0; font-size: 12px; color: var(--muted); }\n\n  .seg { display: inline-flex; border: 1px solid var(--line); background: var(--paper); margin-left: auto; }\n  .seg button { padding: 6px 10px; border: 0; background: none; cursor: pointer; font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }\n  .seg button + button { border-left: 1px solid var(--line); }\n  .seg button[aria-pressed=\"true\"] { background: var(--ink); color: var(--paper); }\n\n  .chart { overflow: visible; }\n  .chart svg { display: block; width: 100%; height: auto; }\n  .chart .grid { stroke: rgba(23,21,18,.09); stroke-dasharray: 3 5; }\n  .chart .area { fill: var(--accent); fill-opacity: .1; }\n  .chart .line { fill: none; stroke: var(--ink); stroke-width: 1.6; }\n  .chart .dot { fill: var(--panel); stroke: var(--accent); stroke-width: 1.4; }\n  .chart .tick { fill: var(--muted); font: 9px var(--mono); }\n  .chart .bar { fill: rgba(23,21,18,.3); }\n  .chart .bar.is-now { fill: var(--accent); }\n\n  .ranks { display: flex; flex-direction: column; }\n  .row { display: grid; grid-template-columns: 20px minmax(0,1fr) 52px 52px; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--line); }\n  .row.two { grid-template-columns: 20px minmax(0,1fr) 60px; }\n  .row:last-child { border-bottom: 0; }\n  .row .idx { font: 9px/1 var(--mono); color: var(--muted); }\n  .row .name { display: block; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .row .meter { position: relative; display: block; height: 4px; margin-top: 6px; background: rgba(23,21,18,.07); overflow: hidden; }\n  .row .meter u { position: absolute; inset: 0 auto 0 0; background: var(--accent); }\n  .row .n { text-align: right; }\n  .row .n b { display: block; font: 500 13px/1.2 var(--mono); font-variant-numeric: tabular-nums; }\n  .row .n small { font: 8px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }\n\n  .funnel { display: flex; flex-direction: column; gap: 10px; }\n  .funnel-step { display: grid; grid-template-columns: 86px minmax(0,1fr) 72px; gap: 10px; align-items: center; font-size: 12px; }\n  .funnel-step .bar { height: 22px; background: rgba(23,21,18,.06); position: relative; overflow: hidden; }\n  .funnel-step .bar u { position: absolute; inset: 0 auto 0 0; background: var(--ink); }\n  .funnel-step:nth-child(2) .bar u { background: var(--warn); }\n  .funnel-step:nth-child(3) .bar u { background: var(--accent); }\n  .funnel-step b { text-align: right; font: 500 13px/1 var(--mono); }\n\n  .chips { display: flex; flex-wrap: wrap; gap: 6px; }\n  .chip { display: inline-block; padding: 3px 8px; border: 1px solid var(--line); border-radius: 2px; font: 9px/1.6 var(--mono); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); white-space: nowrap; }\n  .chip.done { border-color: rgba(63,122,82,.4); color: var(--ok); }\n  .chip.error { border-color: rgba(212,69,42,.4); color: var(--accent); }\n  .chip.muted { color: var(--muted); }\n\n  .errors { display: grid; gap: 9px; max-height: 260px; overflow: auto; }\n  .error-row { display: grid; grid-template-columns: 52px minmax(0,1fr); gap: 9px; font-size: 11.5px; }\n  .error-row time { font: 9.5px/1.7 var(--mono); color: var(--muted); }\n  .error-row b { display: block; font-weight: 500; font-size: 12px; word-break: break-word; }\n  .error-row small { color: var(--muted); font: 9.5px/1.6 var(--mono); }\n\n  .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin: 24px 0 12px; }\n  .control { width: 100%; padding: 8px 10px; background: var(--panel); border: 1px solid var(--line); border-radius: 2px; font-size: 12px; outline: none; }\n  .control:focus { border-color: var(--ink); }\n  select.control { cursor: pointer; width: auto; min-width: 120px; }\n  .search-wrap { position: relative; flex: 1 1 230px; }\n  .search-wrap kbd { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font: 9px var(--mono); color: var(--muted); border: 1px solid var(--line); padding: 1px 4px; background: var(--paper); pointer-events: none; }\n  .btn { padding: 8px 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; font: 10px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; }\n  .btn:hover { border-color: var(--ink); }\n  .btn:disabled { opacity: .45; cursor: progress; }\n  .check { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); cursor: pointer; }\n  .check input { accent-color: var(--accent); }\n\n  .table-wrap { overflow-x: auto; border-top: 1px solid var(--ink); }\n  table { width: 100%; border-collapse: collapse; font-size: 12px; }\n  th { padding: 8px 10px 8px 0; text-align: left; white-space: nowrap; font: 9px/1 var(--mono); letter-spacing: .13em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }\n  td { padding: 8px 10px 8px 0; border-bottom: 1px solid var(--line); vertical-align: top; }\n  tr:last-child td { border-bottom: 0; }\n  td.time { font: 10px/1.6 var(--mono); color: var(--ink-soft); white-space: nowrap; }\n  td.mono { font: 10px/1.6 var(--mono); color: var(--muted); word-break: break-word; }\n  td.num { text-align: right; font: 11px/1.6 var(--mono); font-variant-numeric: tabular-nums; white-space: nowrap; }\n  .pager { display: flex; align-items: center; gap: 8px; padding-top: 12px; }\n  .pager .info { margin-left: auto; font: 10px/1 var(--mono); color: var(--muted); }\n\n  .settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }\n  .field { display: grid; gap: 5px; margin-bottom: 12px; }\n  .field > span:first-child { font: 9px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }\n  .field .hint { font-size: 10.5px; color: var(--muted); }\n  .solid { padding: 9px 14px; border: 1px solid var(--ink); background: var(--ink); color: var(--paper); border-radius: 2px; cursor: pointer; font: 10px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; }\n  .solid:hover { background: var(--accent); border-color: var(--accent); }\n  .solid.danger { background: transparent; color: var(--accent); border-color: rgba(212,69,42,.5); }\n  .solid.danger:hover { background: var(--accent); color: var(--paper); }\n  .fine { margin: 10px 0 0; font-size: 10.5px; color: var(--muted); }\n  .danger-note { margin: 10px 0 0; font-size: 11px; color: var(--accent); }\n  .audit { display: grid; gap: 7px; }\n  .audit-row { display: grid; grid-template-columns: 118px minmax(0,1fr); gap: 10px; font-size: 11.5px; border-bottom: 1px dashed var(--line); padding-bottom: 7px; }\n  .audit-row time { font: 9.5px/1.7 var(--mono); color: var(--muted); }\n  .audit-row b { font-weight: 500; }\n\n  .feed { display: grid; gap: 7px; max-height: 420px; overflow: auto; }\n  .feed-row { display: grid; grid-template-columns: 52px 76px minmax(0,1fr); gap: 8px; padding-bottom: 6px; border-bottom: 1px dashed var(--line); font-size: 11.5px; }\n  .feed-row time { font: 9.5px/1.7 var(--mono); color: var(--muted); }\n  .feed-row .what { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .feed-row small { display: block; color: var(--muted); font: 9px/1.5 var(--mono); }\n\n  .toast {\n    position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);\n    padding: 10px 16px; background: var(--ink); color: var(--paper);\n    font: 11px/1.4 var(--mono); border-radius: 3px; z-index: 40; max-width: min(92vw, 520px);\n  }\n  .toast.bad { background: var(--accent); }\n\n  @media (max-width: 1080px) {\n    .strip { grid-template-columns: repeat(3, 1fr); }\n    .cell:nth-child(3) { border-right: 0; }\n    .cell:nth-child(n + 4) { border-top: 1px solid var(--line); }\n    .grid2, .grid3, .settings-grid { grid-template-columns: 1fr; }\n  }\n  @media (max-width: 720px) {\n    .shell { grid-template-columns: 1fr; }\n    .rail { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px 18px; padding: 14px 16px; border-right: 0; border-bottom: 1px solid var(--line); }\n    .brand { margin-right: auto; }\n    .nav { flex-direction: row; flex-wrap: wrap; gap: 0 14px; }\n    .rail-foot { margin: 0; display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }\n    .rail-foot .stamp, .rail-foot .open-badge { display: none; }\n    .ghost { border-top: 0; padding: 4px 0; }\n    main { padding: 24px 16px 60px; }\n    h1 { font-size: 30px; }\n    .strip { grid-template-columns: repeat(2, 1fr); margin-top: 22px; }\n    .cell { padding: 12px 12px 10px; }\n    .cell:first-child { padding-left: 12px; }\n    .cell:nth-child(2n) { border-right: 0; }\n    .cell:nth-child(n + 3) { border-top: 1px solid var(--line); }\n    .cell.hero b { font-size: 30px; }\n    .cell b { font-size: 24px; }\n    td.hide-m, th.hide-m { display: none; }\n    .funnel-step { grid-template-columns: 70px minmax(0,1fr) 58px; }\n  }\n</style>\n</head>\n<body>\n<div class=\"shell\">\n  <aside class=\"rail\">\n    <a class=\"brand\" href=\"/\" aria-label=\"Congix Docs, админка\">\n      <span class=\"brand-mark\">C</span>\n      <span class=\"brand-text\"><b>Congix Docs</b><small>админка</small></span>\n    </a>\n\n    <nav class=\"nav\" id=\"nav\" aria-label=\"Разделы админки\">\n      <button type=\"button\" data-tab=\"overview\"><i>01</i>Сводка</button>\n      <button type=\"button\" data-tab=\"live\"><i>02</i>Онлайн<em id=\"navLive\">0</em></button>\n      <button type=\"button\" data-tab=\"tools\"><i>03</i>Инструменты</button>\n      <button type=\"button\" data-tab=\"audience\"><i>04</i>Аудитория</button>\n      <button type=\"button\" data-tab=\"events\"><i>05</i>Журнал</button>\n      <button type=\"button\" data-tab=\"settings\"><i>06</i>Настройки</button>\n    </nav>\n\n    <div class=\"rail-foot\">\n      <span class=\"open-badge\">открытый вход</span>\n      <p class=\"stamp\" id=\"stamp\">—</p>\n      <button class=\"ghost\" id=\"refresh\">Обновить <kbd>R</kbd></button>\n      <button class=\"ghost\" id=\"csv\">CSV ↓</button>\n    </div>\n  </aside>\n\n  <main>\n    <div class=\"inner\">\n      <header>\n        <p class=\"eyebrow\" id=\"eyebrow\">обзор · всё сразу</p>\n        <h1 id=\"title\">Пульт <em>Congix Docs</em></h1>\n        <p class=\"sub\" id=\"range\">—</p>\n      </header>\n\n      <!-- ── сводка ─────────────────────────────────────────── -->\n      <section id=\"viewOverview\">\n        <section class=\"strip\">\n          <div class=\"cell hero\">\n            <span class=\"label\">Событий сегодня</span>\n            <b id=\"kToday\">0</b>\n            <span class=\"note\" id=\"kTodayNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Людей</span>\n            <b id=\"kPeople\">0</b>\n            <span class=\"note\" id=\"kPeopleNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Сессий</span>\n            <b id=\"kSessions\">0</b>\n            <span class=\"note\" id=\"kSessionsNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Дошли до файла</span>\n            <b id=\"kConv\">—</b>\n            <span class=\"note\">open → done</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Среднее на странице</span>\n            <b id=\"kTime\">—</b>\n            <span class=\"note\">по событию leave</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Ошибок</span>\n            <b id=\"kErrors\">0</b>\n            <span class=\"note\">за всё время</span>\n          </div>\n        </section>\n\n        <section class=\"panel\">\n          <div class=\"panel-head\">\n            <h2>Активность</h2>\n            <div class=\"seg\" id=\"periodSeg\" role=\"group\" aria-label=\"Период графика\">\n              <button type=\"button\" data-days=\"7\">7 дней</button>\n              <button type=\"button\" data-days=\"14\">14 дней</button>\n              <button type=\"button\" data-days=\"30\">30 дней</button>\n              <button type=\"button\" data-days=\"90\">90 дней</button>\n            </div>\n            <span class=\"hint\" id=\"chartHint\">события по дням</span>\n          </div>\n          <div class=\"chart\" id=\"chart\"></div>\n        </section>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Воронка</h2><span class=\"hint\">от визита до файла</span></div>\n            <div class=\"funnel\" id=\"funnel\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Ошибки</h2><span class=\"hint\">последние 25</span></div>\n            <div class=\"errors\" id=\"errors\"></div>\n          </section>\n        </div>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Инструменты</h2><span class=\"hint\" id=\"toolsHint\">кто чем пользуется</span></div>\n            <div class=\"ranks\" id=\"toolList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Страницы</h2><span class=\"hint\">просмотры</span></div>\n            <div class=\"ranks\" id=\"pageList\"></div>\n          </section>\n        </div>\n\n        <div class=\"grid3\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Источники</h2></div>\n            <div class=\"ranks\" id=\"sourceList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Устройства</h2></div>\n            <div class=\"ranks\" id=\"deviceList\"></div>\n            <div class=\"chips\" id=\"browserChips\" style=\"margin-top:12px\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Языки</h2></div>\n            <div class=\"ranks\" id=\"langList\"></div>\n            <div class=\"chips\" id=\"countryChips\" style=\"margin-top:12px\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── онлайн ────────────────────────────────────────── -->\n      <section id=\"viewLive\" hidden>\n        <section class=\"strip\">\n          <div class=\"cell hero\">\n            <span class=\"label\">Сейчас на сайте</span>\n            <b id=\"livePeople\">0</b>\n            <span class=\"note\">уникальных за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Сессий</span>\n            <b id=\"liveSessions\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Событий</span>\n            <b id=\"liveEvents\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Активных страниц</span>\n            <b id=\"livePages\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Обновление</span>\n            <b style=\"font-size:18px\">10 с</b>\n            <span class=\"note\">пока вкладка открыта</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Последнее событие</span>\n            <b id=\"liveLast\" style=\"font-size:18px\">—</b>\n            <span class=\"note\">по времени сервера</span>\n          </div>\n        </section>\n\n        <section class=\"panel\">\n          <div class=\"panel-head\"><h2>Последние 30 минут</h2><span class=\"hint\">события по минутам</span></div>\n          <div class=\"chart\" id=\"liveChart\"></div>\n        </section>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Где сейчас люди</h2><span class=\"hint\">страницы за 5 минут</span></div>\n            <div class=\"ranks\" id=\"livePageList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Поток</h2><span class=\"hint\">последние 30 событий</span></div>\n            <div class=\"feed\" id=\"liveFeed\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── инструменты ───────────────────────────────────── -->\n      <section id=\"viewTools\" hidden>\n        <div class=\"toolbar\">\n          <button class=\"btn\" data-days-tools=\"7\" type=\"button\">7 дней</button>\n          <button class=\"btn\" data-days-tools=\"30\" type=\"button\">30 дней</button>\n          <button class=\"btn\" data-days-tools=\"90\" type=\"button\">90 дней</button>\n          <button class=\"btn\" data-days-tools=\"0\" type=\"button\">Всё время</button>\n        </div>\n        <div class=\"panel\" style=\"padding-top:0\">\n          <div class=\"table-wrap\">\n            <table>\n              <thead>\n                <tr>\n                  <th>Инструмент</th>\n                  <th class=\"num\">Открыли</th>\n                  <th class=\"num\">Получили файл</th>\n                  <th class=\"num\">Конверсия</th>\n                  <th class=\"num\">Ошибки</th>\n                  <th class=\"num hide-m\">Людей</th>\n                  <th class=\"num hide-m\">Последний раз</th>\n                </tr>\n              </thead>\n              <tbody id=\"toolBody\"></tbody>\n            </table>\n          </div>\n        </div>\n      </section>\n\n      <!-- ── аудитория ─────────────────────────────────────── -->\n      <section id=\"viewAudience\" hidden>\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Страницы</h2><span class=\"hint\">просмотры и люди</span></div>\n            <div class=\"ranks\" id=\"audPages\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Источники</h2><span class=\"hint\">откуда пришли</span></div>\n            <div class=\"ranks\" id=\"audSources\"></div>\n          </section>\n        </div>\n        <div class=\"grid3\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Устройства</h2></div>\n            <div class=\"ranks\" id=\"audDevices\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Браузеры</h2></div>\n            <div class=\"chips\" id=\"audBrowsers\"></div>\n            <h2 style=\"margin:18px 0 10px;font:10px/1 var(--mono);letter-spacing:.18em;text-transform:uppercase\">Языки</h2>\n            <div class=\"chips\" id=\"audLangs\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Страны</h2><span class=\"hint\">по Cloudflare</span></div>\n            <div class=\"chips\" id=\"audCountries\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── журнал ────────────────────────────────────────── -->\n      <section id=\"viewEvents\" hidden>\n        <div class=\"toolbar\">\n          <select class=\"control\" id=\"evDays\" aria-label=\"Период\">\n            <option value=\"1\">Сутки</option>\n            <option value=\"7\" selected>7 дней</option>\n            <option value=\"30\">30 дней</option>\n            <option value=\"90\">90 дней</option>\n            <option value=\"0\">Всё время</option>\n          </select>\n          <select class=\"control\" id=\"evAction\" aria-label=\"Действие\">\n            <option value=\"\">Все действия</option>\n            <option value=\"view\">Открыл страницу</option>\n            <option value=\"open\">Открыл инструмент</option>\n            <option value=\"done\">Получил файл</option>\n            <option value=\"error\">Ошибка</option>\n            <option value=\"leave\">Ушёл со страницы</option>\n            <option value=\"session\">Новая сессия</option>\n          </select>\n          <select class=\"control\" id=\"evDevice\" aria-label=\"Устройство\">\n            <option value=\"\">Все устройства</option>\n            <option value=\"desktop\">Компьютер</option>\n            <option value=\"mobile\">Телефон</option>\n            <option value=\"tablet\">Планшет</option>\n          </select>\n          <select class=\"control\" id=\"evLang\" aria-label=\"Язык\">\n            <option value=\"\">Все языки</option>\n            <option value=\"ru\">ru</option>\n            <option value=\"uz\">uz</option>\n            <option value=\"en\">en</option>\n          </select>\n          <span class=\"search-wrap\">\n            <input class=\"control\" id=\"evSearch\" type=\"search\" placeholder=\"инструмент, страница, источник, сессия\" aria-label=\"Поиск по журналу\" />\n            <kbd>/</kbd>\n          </span>\n          <button class=\"btn\" id=\"evReset\" type=\"button\">Сбросить</button>\n          <label class=\"check\"><input type=\"checkbox\" id=\"autoRefresh\" checked /> автообновление</label>\n        </div>\n\n        <div class=\"panel\" style=\"padding-top:0\">\n          <div class=\"table-wrap\">\n            <table>\n              <thead>\n                <tr>\n                  <th style=\"width:92px\">Время</th>\n                  <th style=\"width:132px\">Действие</th>\n                  <th>Инструмент / детали</th>\n                  <th class=\"hide-m\">Страница</th>\n                  <th class=\"hide-m\">Откуда</th>\n                  <th class=\"hide-m\">Устройство</th>\n                  <th class=\"hide-m\">Сессия</th>\n                </tr>\n              </thead>\n              <tbody id=\"evBody\"></tbody>\n            </table>\n          </div>\n          <div class=\"pager\">\n            <button class=\"btn\" id=\"evPrev\" type=\"button\">← Назад</button>\n            <button class=\"btn\" id=\"evNext\" type=\"button\">Вперёд →</button>\n            <span class=\"info\" id=\"evInfo\">—</span>\n          </div>\n        </div>\n      </section>\n\n      <!-- ── настройки ─────────────────────────────────────── -->\n      <section id=\"viewSettings\" hidden>\n        <div class=\"settings-grid\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Хранение событий</h2><span class=\"hint\">сколько держим статистику</span></div>\n            <label class=\"field\">\n              <span>Дней</span>\n              <input class=\"control\" id=\"retention\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n              <span class=\"hint\">0 — хранить всё время. По умолчанию 90 дней.</span>\n            </label>\n            <button class=\"solid\" id=\"saveSettings\" type=\"button\">Сохранить</button>\n            <p class=\"fine\" id=\"settingsStamp\">—</p>\n          </section>\n\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Очистка</h2><span class=\"hint\">необратимо</span></div>\n            <label class=\"field\">\n              <span>Удалить события старше</span>\n              <input class=\"control\" id=\"purgeDays\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n              <span class=\"hint\">0 — удалить всю статистику. Журнал действий останется.</span>\n            </label>\n            <button class=\"solid danger\" id=\"purge\" type=\"button\">Удалить</button>\n            <p class=\"danger-note\" id=\"purgeNote\" hidden></p>\n            <p class=\"fine\" id=\"dbStamp\">—</p>\n          </section>\n        </div>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Журнал действий</h2><span class=\"hint\">выгрузки, настройки, очистка</span></div>\n            <div class=\"audit\" id=\"audit\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Система</h2><span class=\"hint\">состояние сборщика</span></div>\n            <div class=\"audit\" id=\"health\"></div>\n          </section>\n        </div>\n      </section>\n    </div>\n  </main>\n</div>\n\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n(() => {\n  'use strict'\n\n  const $ = (id) => document.getElementById(id)\n  const num = (value) => Number(value || 0).toLocaleString('ru-RU')\n  const pad = (value) => (value < 10 ? '0' + value : String(value))\n  const esc = (value) => String(value == null ? '' : value)\n    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;')\n\n  const ACTION_LABEL = {\n    view: 'страница',\n    open: 'открыл',\n    done: 'файл',\n    error: 'ошибка',\n    leave: 'ушёл',\n    session: 'сессия',\n  }\n\n  const TITLES = {\n    overview: ['обзор · всё сразу', 'Пульт <em>Congix Docs</em>'],\n    live: ['онлайн · последние 5 минут', 'Что <em>сейчас</em> происходит'],\n    tools: ['инструменты · конверсия', 'Чем <em>пользуются</em>'],\n    audience: ['аудитория · откуда и на чём', 'Кто <em>приходит</em>'],\n    events: ['журнал · каждое событие', 'Полный <em>журнал</em>'],\n    settings: ['настройки · хранение и очистка', 'Служебные <em>настройки</em>'],\n  }\n\n  const state = {\n    tab: 'overview',\n    days: 14,\n    toolDays: 30,\n    ev: { days: '7', action: '', device: '', lang: '', q: '', page: 1 },\n    pages: 1,\n    auto: true,\n    purgeArmed: false,\n    timer: null,\n    liveTimer: null,\n    toastTimer: null,\n    loaded: {},\n  }\n\n  function toast(text, bad) {\n    const node = $('toast')\n    node.textContent = text\n    node.className = 'toast' + (bad ? ' bad' : '')\n    node.hidden = false\n    clearTimeout(state.toastTimer)\n    state.toastTimer = setTimeout(() => { node.hidden = true }, bad ? 5000 : 2600)\n  }\n\n  function fmtWhen(ts) {\n    if (!ts) return '—'\n    const date = new Date(ts)\n    const sameDay = date.toDateString() === new Date().toDateString()\n    const time = pad(date.getHours()) + ':' + pad(date.getMinutes())\n    return sameDay ? time : pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + ' ' + time\n  }\n\n  function fmtDuration(seconds) {\n    const value = Number(seconds) || 0\n    if (!value) return '—'\n    if (value < 60) return value + ' с'\n    return Math.floor(value / 60) + ' мин ' + (value % 60) + ' с'\n  }\n\n  function fmtNumDays(days) {\n    return days === 0 ? 'всё время' : days + ' дн.'\n  }\n\n  function metaDetail(row) {\n    if (!row.meta) return ''\n    try {\n      const meta = JSON.parse(row.meta)\n      const parts = []\n      if (meta.message) parts.push(meta.message)\n      if (meta.source) parts.push(meta.source)\n      if (meta.status) parts.push('HTTP ' + meta.status)\n      if (meta.seconds != null) parts.push(meta.seconds + ' с')\n      return parts.join(' · ').slice(0, 160)\n    } catch {\n      return String(row.meta).slice(0, 160)\n    }\n  }\n\n  async function api(path, options) {\n    const response = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}))\n    const type = response.headers.get('content-type') || ''\n    const data = type.includes('application/json') ? await response.json().catch(() => ({})) : null\n    if (!response.ok) throw new Error((data && data.error) || 'Запрос не удался (' + response.status + ')')\n    return data\n  }\n\n  /* ── отрисовка списков ─────────────────────────────── */\n\n  function rankList(target, rows, options) {\n    const config = options || {}\n    const max = Math.max(1, ...rows.map((row) => Number(row[config.value || 'total']) || 0))\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">Пока нет данных.</p>'\n      return\n    }\n    target.innerHTML = rows.slice(0, config.limit || 8).map((row, index) => {\n      const value = Number(row[config.value || 'total']) || 0\n      const label = row[config.label || 'name'] ?? '—'\n      const note = config.note ? config.note(row) : ''\n      return '<div class=\"row' + (config.note ? '' : ' two') + '\">' +\n        '<span class=\"idx\">' + pad(index + 1) + '</span>' +\n        '<span><span class=\"name\" title=\"' + esc(label) + '\">' + esc(label) + '</span>' +\n        '<span class=\"meter\"><u style=\"width:' + Math.max(2, Math.round(value / max * 100)) + '%\"></u></span></span>' +\n        '<span class=\"n\"><b>' + num(value) + '</b><small>' + esc(note) + '</small></span>' +\n        (config.note ? '<span class=\"n\"><b>' + num(row.people) + '</b><small>людей</small></span>' : '') +\n        '</div>'\n    }).join('')\n  }\n\n  function chips(target, rows, valueKey) {\n    if (!rows.length) {\n      target.innerHTML = '<span class=\"chip muted\">нет данных</span>'\n      return\n    }\n    target.innerHTML = rows.slice(0, 14).map((row) => {\n      const label = row[valueKey] ?? row.name ?? '—'\n      return '<span class=\"chip\">' + esc(label) + ' · ' + num(row.total) + '</span>'\n    }).join('')\n  }\n\n  function chart(target, rows, labelKey, valueKey) {\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">Пока нет событий за этот период.</p>'\n      return\n    }\n    const width = 760\n    const height = 190\n    const padX = 8\n    const padY = 14\n    const values = rows.map((row) => Number(row[valueKey]) || 0)\n    const max = Math.max(1, ...values)\n    const stepX = rows.length > 1 ? (width - padX * 2) / (rows.length - 1) : 0\n    const point = (index, value) => {\n      const x = padX + index * stepX\n      const y = height - padY - (value / max) * (height - padY * 2)\n      return [x, y]\n    }\n    const points = values.map((value, index) => point(index, value))\n    const line = points.map(([x, y], index) => (index ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ')\n    const area = line + ' L' + points[points.length - 1][0].toFixed(1) + ' ' + (height - padY) +\n      ' L' + points[0][0].toFixed(1) + ' ' + (height - padY) + ' Z'\n    const ticks = values.map((value, index) => {\n      if (rows.length > 12 && index % Math.ceil(rows.length / 8) !== 0 && index !== rows.length - 1) return ''\n      const [x] = point(index, value)\n      const label = String(rows[index][labelKey] || '').slice(5)\n      return '<text class=\"tick\" x=\"' + x.toFixed(1) + '\" y=\"' + (height - 1) + '\" text-anchor=\"middle\">' + esc(label) + '</text>'\n    }).join('')\n    const dots = points.map(([x, y]) => '<circle class=\"dot\" cx=\"' + x.toFixed(1) + '\" cy=\"' + y.toFixed(1) + '\" r=\"2.4\" />').join('')\n\n    target.innerHTML = '<svg viewBox=\"0 0 ' + width + ' ' + height + '\" role=\"img\" aria-label=\"График активности\">' +\n      '<line class=\"grid\" x1=\"0\" y1=\"' + (height - padY) + '\" x2=\"' + width + '\" y2=\"' + (height - padY) + '\"/>' +\n      '<path class=\"area\" d=\"' + area + '\"/><path class=\"line\" d=\"' + line + '\"/>' + dots + ticks + '</svg>'\n  }\n\n  function minutesChart(target, rows) {\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">За последние 30 минут событий не было.</p>'\n      return\n    }\n    const width = 760\n    const height = 150\n    const max = Math.max(1, ...rows.map((row) => Number(row.total) || 0))\n    const slot = width / Math.max(rows.length, 1)\n    const bars = rows.map((row, index) => {\n      const value = Number(row.total) || 0\n      const h = Math.max(2, Math.round(value / max * (height - 30)))\n      const x = index * slot + slot * 0.18\n      const last = index === rows.length - 1\n      return '<rect class=\"bar' + (last ? ' is-now' : '') + '\" x=\"' + x.toFixed(1) + '\" y=\"' + (height - 18 - h) + '\" width=\"' + Math.max(2, slot * 0.64).toFixed(1) + '\" height=\"' + h + '\" />'\n    }).join('')\n    target.innerHTML = '<svg viewBox=\"0 0 ' + width + ' ' + height + '\" role=\"img\" aria-label=\"События по минутам\">' +\n      '<line class=\"grid\" x1=\"0\" y1=\"' + (height - 18) + '\" x2=\"' + width + '\" y2=\"' + (height - 18) + '\"/>' + bars +\n      '<text class=\"tick\" x=\"0\" y=\"' + (height - 2) + '\">' + esc(rows[0].minute) + '</text>' +\n      '<text class=\"tick\" x=\"' + width + '\" y=\"' + (height - 2) + '\" text-anchor=\"end\">' + esc(rows[rows.length - 1].minute) + '</text></svg>'\n  }\n\n  /* ── сводка ────────────────────────────────────────── */\n\n  async function loadOverview(silent) {\n    try {\n      const data = await api('/api/stats?days=' + state.days)\n      renderOverview(data)\n      state.loaded.overview = true\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  function renderOverview(data) {\n    const t = data.totals\n    $('kToday').textContent = num(t.today)\n    $('kTodayNote').textContent = 'за 7 дней: ' + num(t.week) + ' · за 30: ' + num(t.month)\n    $('kPeople').textContent = num(t.people)\n    $('kPeopleNote').textContent = 'всего уникальных'\n    $('kSessions').textContent = num(t.sessions)\n    $('kSessionsNote').textContent = 'за ' + fmtNumDays(data.days)\n    $('kConv').textContent = data.funnel.opens ? Math.round(data.funnel.dones / Math.max(1, data.funnel.opens) * 100) + '%' : '—'\n    $('kTime').textContent = fmtDuration(t.avgDuration)\n    $('kErrors').textContent = num(t.errors)\n    $('range').textContent = 'период: ' + fmtNumDays(data.days) + ' · событий в периоде: ' + num(t.period) +\n      ' · последнее: ' + fmtWhen(t.last)\n    $('navLive').textContent = ''\n\n    chart($('chart'), data.series, 'day', 'total')\n\n    const views = data.funnel.views || 0\n    const opens = data.funnel.opens || 0\n    const dones = data.funnel.dones || 0\n    const base = Math.max(1, views)\n    $('funnel').innerHTML = [\n      ['Просмотры', views, views],\n      ['Открыли инструмент', opens, opens],\n      ['Получили файл', dones, dones],\n    ].map(([label, value, width]) =>\n      '<div class=\"funnel-step\"><span>' + esc(label) + '</span>' +\n      '<span class=\"bar\"><u style=\"width:' + Math.max(1, Math.round(Number(width) / base * 100)) + '%\"></u></span>' +\n      '<b>' + num(value) + '</b></div>').join('')\n\n    if (!data.errors.length) {\n      $('errors').innerHTML = '<p class=\"empty\">Ошибок не зафиксировано.</p>'\n    } else {\n      $('errors').innerHTML = data.errors.map((row) =>\n        '<div class=\"error-row\"><time>' + fmtWhen(row.ts) + '</time><span>' +\n        '<b>' + esc(metaDetail(row) || 'Ошибка') + '</b>' +\n        '<small>' + esc(row.path || '/') + ' · ' + esc(row.device || '—') + ' · ' + esc(row.browser || '—') + '</small>' +\n        '</span></div>').join('')\n    }\n\n    rankList($('toolList'), data.tools.slice(0, 8), { note: (row) => row.total + ' откр.' })\n    rankList($('pageList'), data.pages.slice(0, 8), { label: 'path' })\n    rankList($('sourceList'), data.sources.slice(0, 6), { label: 'source', note: (row) => row.medium || '' })\n    rankList($('deviceList'), data.devices.slice(0, 4), { label: 'device' })\n    rankList($('langList'), data.langs.slice(0, 5), { label: 'lang' })\n    chips($('browserChips'), data.browsers, 'browser')\n    chips($('countryChips'), data.countries, 'country')\n    $('toolsHint').textContent = data.tools.length + ' инструментов в периоде'\n  }\n\n  /* ── онлайн ────────────────────────────────────────── */\n\n  async function loadLive(silent) {\n    try {\n      const data = await api('/api/live')\n      $('livePeople').textContent = num(data.people)\n      $('liveSessions').textContent = num(data.sessions)\n      $('liveEvents').textContent = num(data.events)\n      $('livePages').textContent = num(data.pages.length)\n      $('liveLast').textContent = data.recent[0] ? fmtWhen(data.recent[0].ts) : '—'\n      $('navLive').textContent = data.people ? String(data.people) : ''\n      minutesChart($('liveChart'), data.minutes)\n      rankList($('livePageList'), data.pages.slice(0, 10), { label: 'path' })\n      $('liveFeed').innerHTML = data.recent.length ? data.recent.map((row) =>\n        '<div class=\"feed-row\"><time>' + fmtWhen(row.ts) + '</time>' +\n        '<span><span class=\"chip' + (row.action === 'done' ? ' done' : row.action === 'error' ? ' error' : '') + '\">' +\n        esc(ACTION_LABEL[row.action] || row.action) + '</span></span>' +\n        '<span class=\"what\">' + esc(row.name) + (metaDetail(row) ? ' — ' + esc(metaDetail(row)) : '') +\n        '<small>' + esc(row.path || '/') + ' · ' + esc(row.device || '—') + ' · ' + esc(row.source || '—') + '</small></span></div>').join('')\n        : '<p class=\"empty\">Пока тихо.</p>'\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n      state.loaded.live = true\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── инструменты ───────────────────────────────────── */\n\n  async function loadTools(silent) {\n    try {\n      const data = await api('/api/stats?days=' + (state.toolDays || 3650))\n      const rows = (data.tools || []).slice().sort((a, b) => b.total - a.total)\n      $('toolBody').innerHTML = rows.length ? rows.map((row) => {\n        const conversion = row.total ? Math.round(row.done / row.total * 100) : 0\n        return '<tr><td><b>' + esc(row.name) + '</b></td>' +\n          '<td class=\"num\">' + num(row.total) + '</td>' +\n          '<td class=\"num\">' + num(row.done) + '</td>' +\n          '<td class=\"num\">' + (row.total ? conversion + '%' : '—') + '</td>' +\n          '<td class=\"num\">' + num(row.errors) + '</td>' +\n          '<td class=\"num hide-m\">' + num(row.people) + '</td>' +\n          '<td class=\"num hide-m\">' + fmtWhen(row.last) + '</td></tr>'\n      }).join('') : '<tr><td colspan=\"7\"><p class=\"empty\">Нет данных за период.</p></td></tr>'\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n      state.loaded.tools = true\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── аудитория ─────────────────────────────────────── */\n\n  async function loadAudience(silent) {\n    try {\n      const data = await api('/api/stats?days=' + state.days)\n      rankList($('audPages'), data.pages, { label: 'path' })\n      rankList($('audSources'), data.sources, { label: 'source', note: (row) => row.medium || '' })\n      rankList($('audDevices'), data.devices, { label: 'device' })\n      chips($('audBrowsers'), data.browsers, 'browser')\n      chips($('audLangs'), data.langs, 'lang')\n      chips($('audCountries'), data.countries, 'country')\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n      state.loaded.audience = true\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── журнал ────────────────────────────────────────── */\n\n  async function loadEvents(silent) {\n    const query = new URLSearchParams({ days: state.ev.days, page: String(state.ev.page), limit: '50' })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.device) query.set('device', state.ev.device)\n    if (state.ev.lang) query.set('lang', state.ev.lang)\n    if (state.ev.q) query.set('q', state.ev.q)\n    try {\n      const data = await api('/api/events?' + query)\n      state.pages = data.pages\n      state.ev.page = data.page\n      $('evBody').innerHTML = data.rows.length ? data.rows.map((row) => {\n        const detail = metaDetail(row)\n        return '<tr><td class=\"time\">' + fmtWhen(row.ts) + '</td>' +\n          '<td><span class=\"chip' + (row.action === 'done' ? ' done' : row.action === 'error' ? ' error' : '') + '\">' +\n          esc(ACTION_LABEL[row.action] || row.action) + '</span></td>' +\n          '<td><b>' + esc(row.name) + '</b>' + (detail ? '<div class=\"mono\">' + esc(detail) + '</div>' : '') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.path || '/') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.source || '—') + (row.medium && row.medium !== 'none' ? ' / ' + esc(row.medium) : '') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.device || '—') + ' · ' + esc(row.browser || '—') + '</td>' +\n          '<td class=\"mono hide-m\" title=\"' + esc(row.visitor) + '\">' + esc(String(row.session || '—').slice(0, 10)) + '</td></tr>'\n      }).join('') : '<tr><td colspan=\"7\"><p class=\"empty\">Событий за этими фильтрами нет.</p></td></tr>'\n      $('evInfo').textContent = 'всего ' + num(data.total) + ' · страница ' + data.page + ' из ' + data.pages\n      $('evPrev').disabled = data.page <= 1\n      $('evNext').disabled = data.page >= data.pages\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n      state.loaded.events = true\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  function applyEventsFilter(immediate) {\n    clearTimeout(state.searchTimer)\n    const run = () => {\n      state.ev.q = $('evSearch').value.trim()\n      state.ev.page = 1\n      loadEvents(false)\n    }\n    if (immediate) run()\n    else state.searchTimer = setTimeout(run, 350)\n  }\n\n  /* ── настройки ─────────────────────────────────────── */\n\n  async function loadSettings() {\n    try {\n      const [settings, log, health] = await Promise.all([\n        api('/api/settings'),\n        api('/api/audit?limit=25'),\n        api('/api/health'),\n      ])\n      $('retention').value = settings.retentionDays\n      $('purgeDays').value = settings.retentionDays\n      $('settingsStamp').textContent = 'Хранение: ' + fmtNumDays(Number(settings.retentionDays)) +\n        ' · событий: ' + num(settings.events)\n      $('dbStamp').textContent = 'Событий: ' + num(settings.events) +\n        ' · сессий: ' + num(settings.sessions) + ' · людей: ' + num(settings.people)\n      $('audit').innerHTML = (log.rows || []).length ? log.rows.map((row) =>\n        '<div class=\"audit-row\"><time>' + fmtWhen(row.at) + '</time><span><b>' + esc(row.action) + '</b>' +\n        (row.detail ? '<small style=\"display:block;color:var(--muted)\">' + esc(row.detail) + '</small>' : '') + '</span></div>').join('')\n        : '<p class=\"empty\">Журнал пуст.</p>'\n      $('health').innerHTML =\n        '<div class=\"audit-row\"><time>события</time><span><b>' + num(health.events) + '</b><small style=\"display:block;color:var(--muted)\">записей в D1</small></span></div>' +\n        '<div class=\"audit-row\"><time>аудит</time><span><b>' + num(health.audit) + '</b><small style=\"display:block;color:var(--muted)\">действий владельца</small></span></div>' +\n        '<div class=\"audit-row\"><time>вход</time><span><b>открытый</b><small style=\"display:block;color:var(--muted)\">без токена и ключей</small></span></div>' +\n        '<div class=\"audit-row\"><time>сервер</time><span><b>ok</b><small style=\"display:block;color:var(--muted)\">' + fmtWhen(health.now) + '</small></span></div>'\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n      state.loaded.settings = true\n    } catch (error) {\n      toast(error.message, true)\n    }\n  }\n\n  /* ── CSV ───────────────────────────────────────────── */\n\n  async function downloadCsv() {\n    const button = $('csv')\n    const label = button.textContent\n    const query = new URLSearchParams({ days: state.ev.days })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.device) query.set('device', state.ev.device)\n    if (state.ev.lang) query.set('lang', state.ev.lang)\n    if (state.ev.q) query.set('q', state.ev.q)\n    button.disabled = true\n    button.textContent = 'Готовим…'\n    try {\n      const response = await fetch('/api/export.csv?' + query, { credentials: 'same-origin' })\n      if (!response.ok) {\n        const data = await response.json().catch(() => ({}))\n        throw new Error(data.error || 'Не удалось выгрузить CSV')\n      }\n      const disposition = response.headers.get('content-disposition') || ''\n      const match = disposition.match(/filename=\"([^\"]+)\"/)\n      const blob = await response.blob()\n      const url = URL.createObjectURL(blob)\n      const link = document.createElement('a')\n      link.href = url\n      link.download = match ? match[1] : 'congix-docs-stats.csv'\n      document.body.appendChild(link)\n      link.click()\n      link.remove()\n      setTimeout(() => URL.revokeObjectURL(url), 5000)\n      toast('CSV готов')\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      button.disabled = false\n      button.textContent = label\n    }\n  }\n\n  /* ── вкладки и обновление ──────────────────────────── */\n\n  function loadActive(silent) {\n    if (state.tab === 'overview') return loadOverview(silent)\n    if (state.tab === 'live') return loadLive(silent)\n    if (state.tab === 'tools') return loadTools(silent)\n    if (state.tab === 'audience') return loadAudience(silent)\n    if (state.tab === 'events') return loadEvents(silent)\n    return loadSettings()\n  }\n\n  function setTab(tab, push) {\n    const next = TITLES[tab] ? tab : 'overview'\n    state.tab = next\n    document.querySelectorAll('.nav button').forEach((button) => {\n      button.setAttribute('aria-current', button.dataset.tab === next ? 'page' : 'false')\n    })\n    $('viewOverview').hidden = next !== 'overview'\n    $('viewLive').hidden = next !== 'live'\n    $('viewTools').hidden = next !== 'tools'\n    $('viewAudience').hidden = next !== 'audience'\n    $('viewEvents').hidden = next !== 'events'\n    $('viewSettings').hidden = next !== 'settings'\n    $('eyebrow').textContent = TITLES[next][0]\n    $('title').innerHTML = TITLES[next][1]\n    if (push !== false) location.hash = '#/' + next\n    if (next === 'live') {\n      clearInterval(state.liveTimer)\n      state.liveTimer = setInterval(() => {\n        if (!document.hidden) loadLive(true)\n      }, 10000)\n    } else {\n      clearInterval(state.liveTimer)\n      state.liveTimer = null\n    }\n    loadActive(false)\n  }\n\n  document.querySelectorAll('.nav button').forEach((button) => {\n    button.addEventListener('click', () => setTab(button.dataset.tab))\n  })\n\n  $('refresh').addEventListener('click', () => loadActive(false))\n  $('csv').addEventListener('click', downloadCsv)\n\n  document.querySelectorAll('#periodSeg button').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.days = Number(button.dataset.days)\n      document.querySelectorAll('#periodSeg button').forEach((item) => {\n        item.setAttribute('aria-pressed', item === button ? 'true' : 'false')\n      })\n      if (state.tab === 'overview') loadOverview(false)\n      else if (state.tab === 'audience') loadAudience(false)\n    })\n  })\n\n  document.querySelectorAll('[data-days-tools]').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.toolDays = Number(button.dataset.daysTools)\n      document.querySelectorAll('[data-days-tools]').forEach((item) => {\n        item.style.borderColor = item === button ? 'var(--ink)' : ''\n      })\n      loadTools(false)\n    })\n  })\n\n  $('evDays').addEventListener('change', () => { state.ev.days = $('evDays').value; state.ev.page = 1; loadEvents(false) })\n  $('evAction').addEventListener('change', () => { state.ev.action = $('evAction').value; state.ev.page = 1; loadEvents(false) })\n  $('evDevice').addEventListener('change', () => { state.ev.device = $('evDevice').value; state.ev.page = 1; loadEvents(false) })\n  $('evLang').addEventListener('change', () => { state.ev.lang = $('evLang').value; state.ev.page = 1; loadEvents(false) })\n  $('evSearch').addEventListener('input', () => applyEventsFilter(false))\n  $('evSearch').addEventListener('keydown', (event) => {\n    if (event.key === 'Enter') applyEventsFilter(true)\n    if (event.key === 'Escape') { $('evSearch').value = ''; applyEventsFilter(true) }\n  })\n  $('evReset').addEventListener('click', () => {\n    $('evSearch').value = ''\n    $('evDays').value = '7'\n    $('evAction').value = ''\n    $('evDevice').value = ''\n    $('evLang').value = ''\n    state.ev = { days: '7', action: '', device: '', lang: '', q: '', page: 1 }\n    loadEvents(false)\n  })\n  $('evPrev').addEventListener('click', () => {\n    if (state.ev.page > 1) { state.ev.page -= 1; loadEvents(false) }\n  })\n  $('evNext').addEventListener('click', () => {\n    if (state.ev.page < state.pages) { state.ev.page += 1; loadEvents(false) }\n  })\n  $('autoRefresh').addEventListener('change', () => { state.auto = $('autoRefresh').checked })\n\n  $('saveSettings').addEventListener('click', () => {\n    const value = Number($('retention').value)\n    if (!Number.isFinite(value) || value < 0 || value > 3650) {\n      toast('Срок хранения — от 0 до 3650 дней', true)\n      return\n    }\n    const button = $('saveSettings')\n    button.disabled = true\n    api('/api/settings', {\n      method: 'PUT',\n      headers: { 'content-type': 'application/json' },\n      body: JSON.stringify({ retentionDays: value }),\n    })\n      .then(() => { toast('Настройки сохранены'); loadSettings() })\n      .catch((error) => toast(error.message, true))\n      .finally(() => { button.disabled = false })\n  })\n\n  $('purge').addEventListener('click', async () => {\n    const days = Number($('purgeDays').value)\n    if (!Number.isFinite(days) || days < 0 || days > 3650) {\n      toast('Укажите число дней от 0 до 3650', true)\n      return\n    }\n    if (!state.purgeArmed) {\n      state.purgeArmed = true\n      $('purge').textContent = 'Точно удалить?'\n      $('purgeNote').hidden = false\n      $('purgeNote').textContent = days === 0\n        ? 'Будут удалены все события. Нажмите кнопку ещё раз, чтобы подтвердить.'\n        : 'Будут удалены события старше ' + days + ' дн. Нажмите кнопку ещё раз, чтобы подтвердить.'\n      setTimeout(() => {\n        if (!state.purgeArmed) return\n        state.purgeArmed = false\n        $('purge').textContent = 'Удалить'\n        $('purgeNote').hidden = true\n      }, 8000)\n      return\n    }\n    state.purgeArmed = false\n    $('purge').textContent = 'Удалить'\n    $('purgeNote').hidden = true\n    $('purge').disabled = true\n    try {\n      const data = await api('/api/purge', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ days }),\n      })\n      toast('Удалено событий: ' + num(data.removed))\n      state.loaded = {}\n      await loadSettings()\n      await loadActive(true)\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      $('purge').disabled = false\n    }\n  })\n\n  document.addEventListener('keydown', (event) => {\n    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)\n    if (event.key === '/' && !typing) {\n      event.preventDefault()\n      if (state.tab !== 'events') setTab('events')\n      $('evSearch').focus()\n    }\n    if ((event.key === 'r' || event.key === 'R') && !typing && !event.metaKey && !event.ctrlKey) {\n      loadActive(false)\n    }\n  })\n\n  window.addEventListener('hashchange', () => {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    if (tab !== state.tab) setTab(tab, false)\n  })\n\n  /* ── старт ─────────────────────────────────────────── */\n\n  function boot() {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    const initial = TITLES[tab] ? tab : 'overview'\n    document.querySelectorAll('#periodSeg button').forEach((button) => {\n      button.setAttribute('aria-pressed', Number(button.dataset.days) === state.days ? 'true' : 'false')\n    })\n    setTab(initial, false)\n    state.timer = setInterval(() => {\n      if (state.auto && !document.hidden && state.tab !== 'settings') loadActive(true)\n    }, 60000)\n  }\n\n  boot()\n})()\n</script>\n</body>\n</html>\n"

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
    now: now(),
    updated: now(),
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
