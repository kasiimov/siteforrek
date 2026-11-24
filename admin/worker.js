// Сгенерировано: node admin/build.mjs. Правьте page.html и server.js, не этот файл.
const PAGE = "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n<meta name=\"robots\" content=\"noindex, nofollow\" />\n<title>Congix Docs · админка</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23171512'/%3E%3Ctext x='16' y='23' font-family='monospace' font-size='19' fill='%23efece4' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E\" />\n<style>\n  :root {\n    color-scheme: light;\n    --paper: #efece4;\n    --panel: #faf8f3;\n    --ink: #171512;\n    --ink-soft: #3b3833;\n    --muted: #8a8477;\n    --line: #ddd7c9;\n    --accent: #d4452a;\n    --ok: #3f7a52;\n    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;\n  }\n  * { box-sizing: border-box; }\n  [hidden] { display: none !important; }\n  html { scroll-behavior: smooth; }\n  body {\n    margin: 0;\n    min-height: 100vh;\n    color: var(--ink);\n    background: var(--paper);\n    background-image: linear-gradient(to right, rgba(23,21,18,.035) 1px, transparent 1px);\n    background-size: 76px 100%;\n    font: 14px/1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    -webkit-font-smoothing: antialiased;\n  }\n  a { color: inherit; }\n  button, input, select { font: inherit; color: inherit; }\n  ::selection { background: rgba(212,69,42,.18); }\n\n  .shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 100vh; }\n\n  /* ── левая рейка ─────────────────────────────── */\n  .rail {\n    position: sticky; top: 0; align-self: start; height: 100vh;\n    display: flex; flex-direction: column; gap: 30px;\n    padding: 30px 22px 26px;\n    border-right: 1px solid var(--line);\n    background: rgba(239,236,228,.72);\n    backdrop-filter: blur(6px);\n  }\n  .brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }\n  .brand-mark {\n    display: grid; place-items: center; width: 30px; height: 30px;\n    background: var(--ink); color: var(--paper);\n    font: 600 15px/1 var(--mono); border-radius: 3px;\n  }\n  .brand-text b { display: block; font-size: 14px; letter-spacing: -.01em; }\n  .brand-text small {\n    display: block; font: 9px/1.4 var(--mono); letter-spacing: .2em;\n    text-transform: uppercase; color: var(--muted); margin-top: 2px;\n  }\n  .nav { display: flex; flex-direction: column; }\n  .nav button {\n    display: flex; align-items: baseline; gap: 10px; width: 100%;\n    padding: 9px 0; background: none; border: 0; border-bottom: 1px solid transparent;\n    text-align: left; text-decoration: none; font-size: 13px; color: var(--ink-soft);\n    cursor: pointer; transition: color .15s;\n  }\n  .nav button i {\n    font: 9px/1 var(--mono); font-style: normal; letter-spacing: .1em; color: var(--muted);\n    min-width: 16px; transition: color .15s;\n  }\n  .nav button:hover, .nav button[aria-current=\"page\"] { color: var(--accent); }\n  .nav button:hover i, .nav button[aria-current=\"page\"] i { color: var(--accent); }\n  .nav button em { margin-left: auto; font: 9px/1 var(--mono); color: var(--accent); }\n  .rail-foot { margin-top: auto; display: grid; gap: 2px; }\n  .stamp {\n    margin: 0 0 6px; font: 9.5px/1.6 var(--mono); letter-spacing: .1em;\n    text-transform: uppercase; color: var(--muted);\n  }\n  .ghost {\n    display: flex; align-items: center; justify-content: space-between; gap: 8px;\n    padding: 9px 0; background: none; border: 0; border-top: 1px solid var(--line);\n    cursor: pointer; text-align: left;\n    font: 10px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft);\n    transition: color .15s;\n  }\n  .ghost:hover { color: var(--accent); }\n  .ghost:disabled { opacity: .45; cursor: progress; }\n  .ghost kbd { font: 9px var(--mono); color: var(--muted); border: 1px solid var(--line); padding: 2px 4px; border-radius: 2px; }\n\n  /* ── основная колонка ───────────────────────── */\n  main { padding: 42px 46px 90px; min-width: 0; }\n  .inner { max-width: 1140px; }\n\n  .eyebrow {\n    display: flex; align-items: center; gap: 9px; margin: 0 0 14px;\n    font: 10px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: var(--muted);\n  }\n  .eyebrow::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }\n  h1 { margin: 0; font-size: 46px; font-weight: 500; letter-spacing: -.045em; line-height: 1.02; }\n  h1 em { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; letter-spacing: -.02em; }\n  .sub { margin: 14px 0 0; font-size: 12.5px; color: var(--muted); }\n  .sub span { color: var(--ink-soft); }\n\n  /* ── полоса KPI ──────────────────────────────── */\n  .strip {\n    display: grid; grid-template-columns: 1.25fr 1fr 1fr 1fr;\n    margin: 34px 0 22px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--line);\n  }\n  .cell { padding: 18px 20px 16px; border-right: 1px solid var(--line); min-width: 0; }\n  .cell:first-child { padding-left: 0; }\n  .cell:last-child { border-right: 0; }\n  .cell .label {\n    display: block; margin-bottom: 6px;\n    font: 9.5px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--muted);\n  }\n  .cell b {\n    display: block; font: 500 34px/1.1 var(--mono); letter-spacing: -.05em;\n    font-variant-numeric: tabular-nums;\n  }\n  .cell.hero b { font-size: 54px; letter-spacing: -.06em; }\n  .cell .note, .cell .delta { display: block; margin-top: 6px; font-size: 11px; color: var(--muted); }\n  .delta.up { color: var(--accent); }\n  .delta.flat { color: var(--muted); }\n\n  /* ── панели ─────────────────────────────────── */\n  .panel {\n    background: var(--panel); border: 1px solid var(--line);\n    padding: 20px 22px 18px; margin-bottom: 18px;\n  }\n  .panel-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }\n  .panel-head h2 {\n    margin: 0; font: 10px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--ink);\n  }\n  .panel-head .hint { margin-left: auto; font-size: 10.5px; color: var(--muted); }\n  .empty { margin: 0; padding: 18px 0; font-size: 12px; color: var(--muted); }\n  .chart-body svg { display: block; width: 100%; height: auto; overflow: visible; }\n  .chart-body .grid { stroke: rgba(23,21,18,.09); stroke-dasharray: 3 5; }\n  .chart-body .line { fill: none; stroke: var(--ink); stroke-width: 1.6; stroke-linejoin: round; }\n  .chart-body .area { fill: var(--accent); fill-opacity: .1; }\n  .chart-body .dot { fill: var(--panel); stroke: var(--accent); stroke-width: 1.5; }\n  .chart-body .tick { fill: var(--muted); font: 9px var(--mono); }\n\n  .duo { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap: 18px; align-items: start; }\n  .duo .panel { margin-bottom: 18px; }\n\n  .ranks { display: flex; flex-direction: column; }\n  .row {\n    display: grid; grid-template-columns: 22px minmax(0,1fr) 46px 46px;\n    align-items: center; gap: 12px; padding: 9px 0;\n    border-bottom: 1px dashed var(--line);\n  }\n  .row.two { grid-template-columns: 22px minmax(0,1fr) 46px; }\n  .row:last-child { border-bottom: 0; }\n  .row .idx { font: 9.5px/1 var(--mono); color: var(--muted); }\n  .row .name { display: block; font-size: 13px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .row .meter { position: relative; display: block; height: 4px; margin-top: 7px; background: rgba(23,21,18,.07); overflow: hidden; }\n  .row .meter u, .row .meter i { position: absolute; left: 0; top: 0; bottom: 0; transition: width .3s ease; }\n  .row .meter u { background: rgba(23,21,18,.3); }\n  .row .meter i { background: var(--accent); }\n  .row .n { text-align: right; }\n  .row .n b { display: block; font: 500 14px/1.2 var(--mono); font-variant-numeric: tabular-nums; }\n  .row .n small { font: 8.5px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }\n\n  .actions { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 0; margin-top: 16px; border-top: 1px solid var(--ink); }\n  .action { padding: 12px 12px 2px 0; }\n  .action span { display: block; font: 9px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }\n  .action b { display: block; margin-top: 6px; font: 500 22px/1 var(--mono); font-variant-numeric: tabular-nums; }\n  .action small { display: block; margin-top: 4px; font-size: 10.5px; color: var(--muted); }\n\n  /* ── сегменты периода ───────────────────────── */\n  .seg { display: inline-flex; border: 1px solid var(--line); background: var(--paper); }\n  .seg button {\n    padding: 7px 11px; border: 0; background: none; cursor: pointer;\n    font: 9.5px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--muted);\n    transition: background .15s, color .15s;\n  }\n  .seg button + button { border-left: 1px solid var(--line); }\n  .seg button:hover { color: var(--ink); }\n  .seg button[aria-pressed=\"true\"] { background: var(--ink); color: var(--paper); }\n\n  /* ── журнал событий ─────────────────────────── */\n  .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 26px 0 14px; }\n  .toolbar .grow { flex: 1 1 200px; }\n  .control {\n    width: 100%; padding: 9px 11px; background: var(--panel);\n    border: 1px solid var(--line); border-radius: 2px; font-size: 12.5px; outline: none;\n    transition: border-color .15s;\n  }\n  .control:focus { border-color: var(--ink); }\n  .control[type=\"search\"] { font-family: var(--mono); font-size: 11.5px; }\n  select.control { cursor: pointer; max-width: 190px; }\n  .search-wrap { position: relative; flex: 1 1 240px; }\n  .search-wrap .control { padding-right: 52px; }\n  .search-wrap kbd {\n    position: absolute; right: 9px; top: 50%; transform: translateY(-50%);\n    font: 9px var(--mono); color: var(--muted); border: 1px solid var(--line);\n    padding: 2px 5px; border-radius: 2px; background: var(--paper); pointer-events: none;\n  }\n  .check { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--muted); cursor: pointer; user-select: none; }\n  .check input { accent-color: var(--accent); }\n  .table-wrap { overflow-x: auto; border-top: 1px solid var(--ink); }\n  table.log { width: 100%; border-collapse: collapse; font-size: 12.5px; }\n  table.log th {\n    padding: 8px 10px 8px 0; text-align: left; white-space: nowrap;\n    font: 9px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted);\n    border-bottom: 1px solid var(--line);\n  }\n  table.log td { padding: 9px 10px 9px 0; border-bottom: 1px solid var(--line); vertical-align: top; }\n  table.log tr:last-child td { border-bottom: 0; }\n  table.log td.time { font: 10.5px/1.6 var(--mono); color: var(--ink-soft); white-space: nowrap; }\n  table.log td.path, table.log td.visitor { font: 10.5px/1.6 var(--mono); color: var(--muted); word-break: break-all; }\n  table.log td.tool { font-weight: 500; }\n  .chip {\n    display: inline-block; padding: 2px 7px; border: 1px solid var(--line); border-radius: 2px;\n    font: 8.5px/1.6 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft);\n    white-space: nowrap;\n  }\n  .chip.done { border-color: rgba(63,122,82,.4); color: var(--ok); }\n  .chip.open { border-color: rgba(212,69,42,.35); color: var(--accent); }\n  .pager { display: flex; align-items: center; gap: 12px; margin-top: 16px; flex-wrap: wrap; }\n  .pager .info { font: 10px/1 var(--mono); letter-spacing: .08em; color: var(--muted); }\n  .pager .btn {\n    padding: 8px 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 2px;\n    cursor: pointer; font: 9.5px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft);\n    transition: border-color .15s, color .15s;\n  }\n  .pager .btn:hover:not(:disabled) { border-color: var(--ink); color: var(--ink); }\n  .pager .btn:disabled { opacity: .4; cursor: default; }\n  .pager .spacer { flex: 1; }\n\n  /* ── настройки ──────────────────────────────── */\n  .settings-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 18px; align-items: start; }\n  .field { display: grid; gap: 7px; margin-bottom: 14px; }\n  .field span { font: 9.5px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }\n  .field .hint { font-size: 11px; line-height: 1.5; color: var(--muted); letter-spacing: 0; text-transform: none; }\n  .field input {\n    width: 100%; padding: 11px 12px; background: var(--paper);\n    border: 1px solid var(--line); border-radius: 2px; font-family: var(--mono); font-size: 13px;\n    outline: none; transition: border-color .15s;\n  }\n  .field input:focus { border-color: var(--ink); }\n  .solid {\n    display: inline-flex; align-items: center; justify-content: center; gap: 8px;\n    padding: 12px 18px; border: 0; border-radius: 2px; cursor: pointer;\n    background: var(--ink); color: var(--paper);\n    font: 10px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase;\n    transition: background .15s;\n  }\n  .solid:hover { background: var(--accent); }\n  .solid:disabled { opacity: .5; cursor: progress; }\n  .solid.danger { background: var(--accent); }\n  .solid.danger:hover { background: #b2341d; }\n  .danger-note { margin: 10px 0 0; font-size: 11.5px; line-height: 1.6; color: var(--accent); }\n  .audit { display: flex; flex-direction: column; }\n  .audit-row { display: grid; grid-template-columns: 86px minmax(0,1fr); gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--line); font-size: 12px; }\n  .audit-row:last-child { border-bottom: 0; }\n  .audit-row time { font: 10px/1.7 var(--mono); color: var(--muted); }\n  .audit-row b { font-weight: 500; }\n  .audit-row small { display: block; color: var(--muted); font-size: 11px; }\n\n  /* ── вход ───────────────────────────────────── */\n  .gate { max-width: 400px; margin: 7vh 0 0; }\n  .gate h1 { font-size: 34px; }\n  .gate .panel { padding: 22px; margin-top: 24px; }\n  .fine { margin: 14px 0 0; font-size: 11px; line-height: 1.6; color: var(--muted); }\n  .error { margin: 12px 0 0; font-size: 12px; color: var(--accent); }\n\n  /* ── тост ───────────────────────────────────── */\n  .toast {\n    position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%);\n    z-index: 40; max-width: min(440px, calc(100vw - 32px));\n    padding: 11px 16px; border-radius: 3px;\n    background: var(--ink); color: var(--paper);\n    font: 11px/1.5 var(--mono); letter-spacing: .04em;\n    box-shadow: 0 8px 26px rgba(23,21,18,.18);\n  }\n  .toast.bad { background: var(--accent); }\n\n  @media (max-width: 1024px) {\n    .shell { grid-template-columns: 1fr; }\n    .rail {\n      position: static; height: auto; flex-direction: row; align-items: center; gap: 18px;\n      padding: 14px 18px; border-right: 0; border-bottom: 1px solid var(--line);\n    }\n    .brand-text small { display: none; }\n    .nav { flex-direction: row; gap: 16px; margin-left: auto; overflow-x: auto; }\n    .nav button { border-bottom: 0; padding: 0; white-space: nowrap; width: auto; }\n    .nav button i { display: none; }\n    .rail-foot { margin: 0; display: flex; gap: 14px; align-items: center; }\n    .stamp, .rail-foot .desktop-only { display: none; }\n    .ghost { border-top: 0; padding: 0; white-space: nowrap; }\n    main { padding: 30px 22px 70px; }\n    h1 { font-size: 34px; }\n    .strip { grid-template-columns: 1fr 1fr; }\n    .cell { padding: 16px 16px 14px; }\n    .cell:nth-child(2n) { border-right: 0; }\n    .cell:first-child { padding-left: 16px; }\n    .cell.hero b { font-size: 40px; }\n    .duo, .settings-grid { grid-template-columns: 1fr; }\n  }\n  @media (max-width: 680px) {\n    .rail { justify-content: space-between; flex-wrap: wrap; gap: 10px 14px; padding: 13px 16px; }\n    .nav { margin-left: 0; gap: 12px; width: 100%; order: 3; }\n    .nav button { font-size: 12px; }\n    .rail-foot { gap: 12px; }\n    .ghost { font-size: 9px; letter-spacing: .08em; }\n    main { padding: 24px 16px 60px; }\n    h1 { font-size: 30px; }\n    .sub { font-size: 12px; }\n    .strip { margin: 24px 0 18px; }\n    .cell { padding: 14px 12px 12px; }\n    .cell:first-child { padding-left: 12px; }\n    .cell b { font-size: 27px; }\n    .cell.hero b { font-size: 36px; }\n    .cell:nth-child(n + 3) { border-top: 1px solid var(--line); }\n    .panel { padding: 16px 14px 12px; }\n    .panel-head { flex-wrap: wrap; gap: 4px 10px; }\n    .panel-head .hint { margin-left: 0; }\n    .row { grid-template-columns: 18px minmax(0,1fr) 40px 40px; gap: 9px; }\n    .row.two { grid-template-columns: 18px minmax(0,1fr) 40px; }\n    .action { padding-right: 8px; }\n    .action b { font-size: 19px; }\n    select.control { max-width: none; flex: 1 1 130px; }\n    table.log th.hide-m, table.log td.hide-m { display: none; }\n    .toast { bottom: 16px; }\n  }\n</style>\n</head>\n<body>\n<div class=\"shell\">\n  <aside class=\"rail\">\n    <a class=\"brand\" href=\"/\" aria-label=\"Congix Docs, админка\">\n      <span class=\"brand-mark\">C</span>\n      <span class=\"brand-text\"><b>Congix Docs</b><small>админка</small></span>\n    </a>\n\n    <nav class=\"nav\" id=\"nav\" hidden aria-label=\"Разделы админки\">\n      <button type=\"button\" data-tab=\"overview\"><i>01</i>Сводка</button>\n      <button type=\"button\" data-tab=\"events\"><i>02</i>События</button>\n      <button type=\"button\" data-tab=\"settings\"><i>03</i>Настройки</button>\n    </nav>\n\n    <div class=\"rail-foot\">\n      <p class=\"stamp\" id=\"stamp\" hidden>—</p>\n      <button class=\"ghost desktop-only\" id=\"refresh\" hidden>Обновить <kbd>R</kbd></button>\n      <button class=\"ghost\" id=\"csv\" hidden>CSV ↓</button>\n      <button class=\"ghost\" id=\"logout\" hidden>Выйти</button>\n    </div>\n  </aside>\n\n  <main>\n    <div class=\"inner\">\n      <section class=\"gate\" id=\"login\">\n        <p class=\"eyebrow\">вход · только для владельца</p>\n        <h1>Служебный<br /><em>доступ</em></h1>\n        <form class=\"panel\" id=\"loginForm\" novalidate>\n          <label class=\"field\">\n            <span>Ключ доступа</span>\n            <input id=\"token\" type=\"password\" placeholder=\"ADMIN_TOKEN\" autocomplete=\"current-password\" spellcheck=\"false\" />\n          </label>\n          <button class=\"solid\" id=\"enter\" type=\"submit\" style=\"width:100%\">Открыть панель</button>\n          <p class=\"error\" id=\"loginError\" hidden></p>\n          <p class=\"fine\">Ключ живёт в секрете <span style=\"font-family:var(--mono)\">ADMIN_TOKEN</span>. После входа браузер получает закрытую сессию на 12 часов — сам ключ в нём не хранится.</p>\n        </form>\n      </section>\n\n      <div id=\"app\" hidden>\n        <header>\n          <p class=\"eyebrow\" id=\"eyebrow\">обзор · сегодня</p>\n          <h1 id=\"title\">Пульт <em>Congix Docs</em></h1>\n          <p class=\"sub\" id=\"range\">—</p>\n        </header>\n\n        <!-- ── сводка ───────────────────────────── -->\n        <section id=\"viewOverview\">\n          <section class=\"strip\">\n            <div class=\"cell hero\">\n              <span class=\"label\">Событий сегодня</span>\n              <b id=\"kToday\">0</b>\n              <span class=\"delta flat\" id=\"kDelta\">—</span>\n            </div>\n            <div class=\"cell\">\n              <span class=\"label\">Людей всего</span>\n              <b id=\"kPeople\">0</b>\n              <span class=\"note\">по уникальным посетителям</span>\n            </div>\n            <div class=\"cell\">\n              <span class=\"label\">За 7 дней</span>\n              <b id=\"kWeek\">0</b>\n              <span class=\"note\" id=\"kAvg\">—</span>\n            </div>\n            <div class=\"cell\">\n              <span class=\"label\">Дошли до файла</span>\n              <b id=\"kConv\">—</b>\n              <span class=\"note\">открыл инструмент → сохранил</span>\n            </div>\n          </section>\n\n          <section class=\"panel\">\n            <div class=\"panel-head\">\n              <h2>Активность</h2>\n              <div class=\"seg\" id=\"periodSeg\" role=\"group\" aria-label=\"Период графика\">\n                <button type=\"button\" data-days=\"7\">7 дней</button>\n                <button type=\"button\" data-days=\"14\">14 дней</button>\n                <button type=\"button\" data-days=\"30\">30 дней</button>\n                <button type=\"button\" data-days=\"90\">90 дней</button>\n              </div>\n              <span class=\"hint\" id=\"chartHint\">события по дням</span>\n            </div>\n            <div class=\"chart-body\" id=\"chart\"></div>\n          </section>\n\n          <div class=\"duo\">\n            <section class=\"panel\" id=\"tools\">\n              <div class=\"panel-head\"><h2>Инструменты</h2><span class=\"hint\" id=\"toolsHint\">кто чем пользуется</span></div>\n              <div class=\"ranks\" id=\"toolList\"></div>\n            </section>\n\n            <div>\n              <section class=\"panel\" id=\"audience\">\n                <div class=\"panel-head\"><h2>Страницы</h2><span class=\"hint\">просмотры</span></div>\n                <div class=\"ranks\" id=\"pageList\"></div>\n                <div class=\"actions\" id=\"actionList\"></div>\n              </section>\n            </div>\n          </div>\n        </section>\n\n        <!-- ── события ──────────────────────────── -->\n        <section id=\"viewEvents\" hidden>\n          <div class=\"toolbar\">\n            <select class=\"control\" id=\"evDays\" aria-label=\"Период событий\">\n              <option value=\"1\">Сутки</option>\n              <option value=\"7\" selected>7 дней</option>\n              <option value=\"30\">30 дней</option>\n              <option value=\"90\">90 дней</option>\n              <option value=\"0\">Всё время</option>\n            </select>\n            <select class=\"control\" id=\"evAction\" aria-label=\"Действие\">\n              <option value=\"\">Все действия</option>\n              <option value=\"view\">Открыл страницу</option>\n              <option value=\"open\">Открыл инструмент</option>\n              <option value=\"done\">Получил файл</option>\n            </select>\n            <span class=\"search-wrap\">\n              <input class=\"control\" id=\"evSearch\" type=\"search\" placeholder=\"инструмент, страница или посетитель\" aria-label=\"Поиск по журналу\" />\n              <kbd>/</kbd>\n            </span>\n            <button class=\"pager btn\" id=\"evReset\" type=\"button\" style=\"padding:9px 12px\">Сбросить</button>\n            <label class=\"check\"><input type=\"checkbox\" id=\"autoRefresh\" checked /> автообновление</label>\n          </div>\n\n          <div class=\"panel\" style=\"padding-top:0\">\n            <div class=\"table-wrap\">\n              <table class=\"log\">\n                <thead>\n                  <tr>\n                    <th style=\"width:96px\">Время</th>\n                    <th style=\"width:150px\">Действие</th>\n                    <th>Инструмент</th>\n                    <th class=\"hide-m\">Страница</th>\n                    <th class=\"hide-m\" style=\"width:96px\">Посетитель</th>\n                  </tr>\n                </thead>\n                <tbody id=\"evBody\"></tbody>\n              </table>\n            </div>\n            <div class=\"pager\">\n              <button class=\"btn\" id=\"evPrev\" type=\"button\">← Назад</button>\n              <button class=\"btn\" id=\"evNext\" type=\"button\">Вперёд →</button>\n              <span class=\"spacer\"></span>\n              <span class=\"info\" id=\"evInfo\">—</span>\n            </div>\n          </div>\n        </section>\n\n        <!-- ── настройки ────────────────────────── -->\n        <section id=\"viewSettings\" hidden>\n          <div class=\"settings-grid\">\n            <section class=\"panel\">\n              <div class=\"panel-head\"><h2>Хранение событий</h2><span class=\"hint\">сколько держим статистику</span></div>\n              <label class=\"field\">\n                <span>Дней</span>\n                <input id=\"retention\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n                <span class=\"hint\">0 — хранить всё время. По умолчанию 90 дней: этого хватает, чтобы видеть сезонность, и база не растёт бесконечно.</span>\n              </label>\n              <button class=\"solid\" id=\"saveSettings\" type=\"button\">Сохранить</button>\n              <p class=\"fine\" id=\"settingsStamp\">—</p>\n            </section>\n\n            <section class=\"panel\">\n              <div class=\"panel-head\"><h2>Очистка</h2><span class=\"hint\">необратимо</span></div>\n              <label class=\"field\">\n                <span>Удалить события старше</span>\n                <input id=\"purgeDays\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n                <span class=\"hint\">0 — удалить всю статистику. Пользователи сайта этого не заметят, журнал действий останется.</span>\n              </label>\n              <button class=\"solid danger\" id=\"purge\" type=\"button\">Удалить</button>\n              <p class=\"danger-note\" id=\"purgeNote\" hidden></p>\n              <p class=\"fine\" id=\"dbStamp\">—</p>\n            </section>\n          </div>\n\n          <section class=\"panel\" style=\"margin-top:18px\">\n            <div class=\"panel-head\"><h2>Журнал действий</h2><span class=\"hint\">вход, выгрузки, настройки, очистка</span></div>\n            <div class=\"audit\" id=\"audit\"></div>\n          </section>\n        </section>\n      </div>\n    </div>\n  </main>\n</div>\n\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n(() => {\n  'use strict'\n\n  const $ = (id) => document.getElementById(id)\n  const num = (value) => Number(value || 0).toLocaleString('ru-RU')\n  const pad = (value) => (value < 10 ? '0' + value : String(value))\n  const ACTION_LABEL = { view: 'визит', open: 'открыл', done: 'файл' }\n\n  const state = {\n    tab: 'overview',\n    days: 14,\n    ev: { days: '7', action: '', q: '', page: 1 },\n    loaded: { overview: false, events: false, settings: false },\n    settings: null,\n    auto: true,\n    purgeArmed: false,\n    page: 1,\n    pages: 1,\n    timer: null,\n    toastTimer: null,\n  }\n\n  /* ── мелочи интерфейса ────────────────────── */\n\n  function toast(text, bad) {\n    const node = $('toast')\n    node.textContent = text\n    node.className = 'toast' + (bad ? ' bad' : '')\n    node.hidden = false\n    clearTimeout(state.toastTimer)\n    state.toastTimer = setTimeout(() => { node.hidden = true }, bad ? 5000 : 2600)\n  }\n\n  function fmtWhen(ts) {\n    const date = new Date(ts)\n    const sameDay = date.toDateString() === new Date().toDateString()\n    const time = pad(date.getHours()) + ':' + pad(date.getMinutes())\n    return sameDay ? time : pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + ' ' + time\n  }\n\n  function fmtNumDays(days) {\n    return days === 0 ? 'всё время' : days + ' дн.'\n  }\n\n  async function api(path, options) {\n    const response = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}))\n    if (response.status === 401 && state.tab !== 'login') {\n      showLogin()\n      throw new Error('Сессия истекла — войдите снова.')\n    }\n    const type = response.headers.get('content-type') || ''\n    const data = type.includes('application/json') ? await response.json().catch(() => ({})) : null\n    if (!response.ok) throw new Error((data && data.error) || 'Запрос не удался (' + response.status + ')')\n    return data\n  }\n\n  /* ── вход ─────────────────────────────────── */\n\n  function showLogin(message) {\n    $('login').hidden = false\n    $('app').hidden = true\n    $('nav').hidden = true\n    $('stamp').hidden = true\n    $('refresh').hidden = true\n    $('csv').hidden = true\n    $('logout').hidden = true\n    $('loginError').hidden = !message\n    if (message) $('loginError').textContent = message\n    clearInterval(state.timer)\n    state.timer = null\n  }\n\n  function showApp() {\n    $('login').hidden = true\n    $('app').hidden = false\n    $('nav').hidden = false\n    $('stamp').hidden = false\n    $('refresh').hidden = false\n    $('csv').hidden = false\n    $('logout').hidden = false\n    clearInterval(state.timer)\n    state.timer = setInterval(() => {\n      if (state.auto && !document.hidden && state.tab !== 'settings') reloadActive(true)\n    }, 60000)\n  }\n\n  async function submitLogin(event) {\n    if (event) event.preventDefault()\n    const token = $('token').value.trim()\n    if (!token) return\n    const button = $('enter')\n    button.disabled = true\n    button.textContent = 'Проверяем…'\n    $('loginError').hidden = true\n    try {\n      await api('/api/login', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ token }),\n      })\n      $('token').value = ''\n      showApp()\n      await refreshAll()\n      toast('Добро пожаловать')\n    } catch (error) {\n      $('loginError').hidden = false\n      $('loginError').textContent = error.message\n    } finally {\n      button.disabled = false\n      button.textContent = 'Открыть панель'\n    }\n  }\n\n  async function logout() {\n    try {\n      await api('/api/logout', { method: 'POST' })\n    } catch {\n      // выходим локально в любом случае\n    }\n    showLogin()\n    $('token').value = ''\n    state.loaded = { overview: false, events: false, settings: false }\n  }\n\n  /* ── загрузка данных ──────────────────────── */\n\n  async function refreshAll() {\n    await Promise.all([loadOverview(false), loadEvents(false), loadSettings()])\n  }\n\n  function reloadActive(silent) {\n    if (state.tab === 'overview') return loadOverview(silent)\n    if (state.tab === 'events') return loadEvents(silent)\n    return loadSettings()\n  }\n\n  async function loadOverview(silent) {\n    try {\n      const data = await api('/api/stats?days=' + state.days)\n      renderOverview(data)\n      state.loaded.overview = true\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  async function loadEvents(silent) {\n    const query = new URLSearchParams({\n      days: state.ev.days,\n      page: String(state.ev.page),\n      limit: '50',\n    })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.q) query.set('q', state.ev.q)\n    try {\n      const data = await api('/api/events?' + query)\n      renderEvents(data)\n      state.loaded.events = true\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  async function loadSettings() {\n    try {\n      const [settings, log] = await Promise.all([api('/api/settings'), api('/api/audit?limit=25')])\n      state.settings = settings\n      $('retention').value = settings.retentionDays\n      $('purgeDays').value = settings.retentionDays\n      $('dbStamp').textContent = 'Событий в базе: ' + num(settings.events)\n      $('settingsStamp').textContent = 'Хранение: ' + fmtNumDays(Number(settings.retentionDays))\n      renderAudit(log.rows || [])\n      state.loaded.settings = true\n    } catch (error) {\n      toast(error.message, true)\n    }\n  }\n\n  /* ── отрисовка сводки ─────────────────────── */\n\n  function chart(days) {\n    if (!days.length) return '<p class=\"empty\">Данных пока нет — открой сайт, и здесь появятся точки.</p>'\n    const narrow = window.matchMedia('(max-width: 680px)').matches\n    const w = narrow ? 340 : 780\n    const h = narrow ? 200 : 200\n    const pl = narrow ? 16 : 28\n    const pr = narrow ? 8 : 12\n    const pt = 18\n    const pb = 24\n    const max = Math.max(...days.map((d) => d.total), 1)\n    const step = days.length > 1 ? (w - pl - pr) / (days.length - 1) : 0\n    const x = (i) => pl + step * i\n    const y = (v) => pt + (h - pt - pb) * (1 - v / max)\n    const pts = days.map((d, i) => [x(i), y(d.total), d])\n    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')\n    const area = line + ' L ' + x(days.length - 1).toFixed(1) + ' ' + (h - pb) + ' L ' + pl + ' ' + (h - pb) + ' Z'\n    const grid = [0, 0.5, 1].map((f) => {\n      const gy = y(max * f).toFixed(1)\n      return '<line class=\"grid\" x1=\"' + pl + '\" x2=\"' + (w - pr) + '\" y1=\"' + gy + '\" y2=\"' + gy + '\" />'\n    }).join('')\n    const dots = pts.map((p) => {\n      return '<circle class=\"dot\" cx=\"' + p[0].toFixed(1) + '\" cy=\"' + p[1].toFixed(1) + '\" r=\"2.8\">' +\n        '<title>' + esc(p[2].day) + ' · ' + p[2].total + ' событий · ' + p[2].people + ' людей</title></circle>'\n    }).join('')\n    const every = Math.max(1, Math.ceil(days.length / (narrow ? 5 : 10)))\n    const labels = pts.map((p, i) => {\n      const show = i === pts.length - 1 || (i % every === 0 && pts.length - 1 - i >= every / 2)\n      if (!show) return ''\n      return '<text class=\"tick\" x=\"' + p[0].toFixed(1) + '\" y=\"' + (h - 6) + '\" text-anchor=\"middle\">' + p[2].day.slice(5) + '</text>'\n    }).join('')\n    const top = '<text class=\"tick\" x=\"0\" y=\"' + (pt + 3) + '\">' + max + '</text>'\n    return '<svg viewBox=\"0 0 ' + w + ' ' + h + '\" role=\"img\" aria-label=\"Активность по дням\">' +\n      grid + '<path class=\"area\" d=\"' + area + '\" /><path class=\"line\" d=\"' + line + '\" />' + dots + labels + top + '</svg>'\n  }\n\n  function esc(value) {\n    return String(value == null ? '' : value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]))\n  }\n\n  function toolRows(tools) {\n    if (!tools.length) return '<p class=\"empty\">За этот период инструменты не открывали.</p>'\n    const max = Math.max(...tools.map((t) => Number(t.total) || 0), 1)\n    return tools.map((tool, i) => {\n      const opens = Number(tool.total) || 0\n      const done = Number(tool.done) || 0\n      const opensShare = Math.max(2, Math.round((opens / max) * 100))\n      const doneShare = Math.max(done ? 2 : 0, Math.round((done / max) * 100))\n      return '<div class=\"row\" title=\"' + esc(tool.name) + ': открытий ' + opens + ', до файла ' + done + ', людей ' + tool.people + '\">' +\n        '<span class=\"idx\">' + pad(i + 1) + '</span>' +\n        '<span><span class=\"name\">' + esc(tool.name) + '</span>' +\n        '<span class=\"meter\"><u style=\"width:' + opensShare + '%\"></u><i style=\"width:' + doneShare + '%\"></i></span></span>' +\n        '<span class=\"n\"><b>' + opens + '</b><small>откр.</small></span>' +\n        '<span class=\"n\"><b>' + done + '</b><small>файл</small></span>' +\n        '</div>'\n    }).join('')\n  }\n\n  function pageRows(pages) {\n    if (!pages.length) return '<p class=\"empty\">Нет просмотров страниц за период.</p>'\n    const max = Math.max(...pages.map((p) => p.total), 1)\n    return pages.map((page, i) => {\n      const width = Math.max(3, Math.round((page.total / max) * 100))\n      return '<div class=\"row two\">' +\n        '<span class=\"idx\">' + pad(i + 1) + '</span>' +\n        '<span><span class=\"name\">' + esc(page.path) + '</span>' +\n        '<span class=\"meter\"><u style=\"width:' + width + '%\"></u></span></span>' +\n        '<span class=\"n\"><b>' + page.total + '</b><small>раз</small></span>' +\n        '</div>'\n    }).join('')\n  }\n\n  function actionTiles(actions, total) {\n    return ['view', 'open', 'done'].map((name) => {\n      const found = actions.filter((a) => a.action === name)[0]\n      const value = found ? found.total : 0\n      const share = total ? Math.round((value / total) * 100) : 0\n      return '<div class=\"action\"><span>' + ACTION_LABEL[name] + '</span><b>' + num(value) + '</b><small>' + share + '% от всех</small></div>'\n    }).join('')\n  }\n\n  function renderOverview(data) {\n    const t = data.totals\n    const utcToday = new Date().toISOString().slice(0, 10)\n    let todayIndex = -1\n    data.days.forEach((day, i) => { if (day.day === utcToday) todayIndex = i })\n    const previous = todayIndex > 0 ? data.days[todayIndex - 1].total : 0\n    const today = todayIndex >= 0 ? data.days[todayIndex].total : 0\n\n    $('kToday').textContent = num(t.today)\n    $('kPeople').textContent = num(t.people)\n    $('kWeek').textContent = num(t.week)\n\n    const delta = $('kDelta')\n    if (todayIndex === 0) {\n      delta.className = 'delta flat'\n      delta.textContent = 'первый день наблюдений'\n    } else if (previous > 0) {\n      const change = today - previous\n      delta.className = 'delta ' + (change >= 0 ? 'up' : 'flat')\n      delta.textContent = (change > 0 ? '▲ +' : change < 0 ? '▼ ' : '= ') + Math.abs(change) + ' к вчера'\n    } else {\n      delta.className = 'delta flat'\n      delta.textContent = 'вчера было 0'\n    }\n\n    $('kAvg').textContent = 'в среднем ' + (t.week / 7).toFixed(1).replace('.', ',') + ' в день'\n\n    let opens = 0\n    let done = 0\n    data.tools.forEach((tool) => { opens += Number(tool.total) || 0; done += Number(tool.done) || 0 })\n    $('kConv').textContent = opens ? Math.round((done / opens) * 100) + '%' : '—'\n\n    $('chartHint').textContent = 'события по дням · ' + data.days.length + ' сут.'\n    $('toolsHint').textContent = 'за ' + fmtNumDays(data.days)\n    $('range').innerHTML = '<span>' + num(t.events) + '</span> событий всего · <span>' + num(t.period) + '</span> за ' + fmtNumDays(data.days) +\n      ' · <span>' + num(t.month) + '</span> за 30 дней · наблюдение с ' +\n      (t.first ? new Date(t.first).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : 'сегодня')\n\n    $('chart').innerHTML = chart(data.days)\n    $('toolList').innerHTML = toolRows(data.tools)\n    $('pageList').innerHTML = pageRows(data.pages)\n    $('actionList').innerHTML = actionTiles(data.actions, t.period)\n    $('stamp').textContent = 'обновлено ' + fmtWhen(data.updated || Date.now())\n\n    document.querySelectorAll('#periodSeg button').forEach((button) => {\n      button.setAttribute('aria-pressed', String(Number(button.dataset.days) === Number(data.days)))\n    })\n  }\n\n  /* ── отрисовка журнала ────────────────────── */\n\n  function renderEvents(data) {\n    const body = $('evBody')\n    if (!data.rows.length) {\n      body.innerHTML = '<tr><td colspan=\"5\"><p class=\"empty\">Ничего не нашлось. Смените период, действие или запрос.</p></td></tr>'\n    } else {\n      body.innerHTML = data.rows.map((row) => {\n        const label = ACTION_LABEL[row.action] || row.action\n        const visitor = (row.visitor || '').slice(0, 6)\n        return '<tr>' +\n          '<td class=\"time\">' + fmtWhen(row.ts) + '</td>' +\n          '<td><span class=\"chip ' + esc(row.action) + '\">' + esc(label) + '</span></td>' +\n          '<td class=\"tool\">' + esc(row.name) + '</td>' +\n          '<td class=\"path hide-m\">' + esc(row.path || '/') + '</td>' +\n          '<td class=\"visitor hide-m\">' + esc(visitor || '—') + '</td>' +\n          '</tr>'\n      }).join('')\n    }\n\n    state.page = data.page\n    state.pages = data.pages\n    $('evPrev').disabled = data.page <= 1\n    $('evNext').disabled = data.page >= data.pages\n    $('evInfo').textContent = 'стр. ' + data.page + ' из ' + data.pages + ' · всего ' + num(data.total)\n  }\n\n  /* ── журнал действий ──────────────────────── */\n\n  function renderAudit(rows) {\n    if (!rows.length) {\n      $('audit').innerHTML = '<p class=\"empty\">Пока пусто — здесь появятся входы, выгрузки и изменения настроек.</p>'\n      return\n    }\n    $('audit').innerHTML = rows.map((row) => {\n      return '<div class=\"audit-row\">' +\n        '<time>' + fmtWhen(row.at) + '</time>' +\n        '<div><b>' + esc(row.action) + '</b>' + (row.detail ? '<small>' + esc(row.detail) + '</small>' : '') + '</div>' +\n        '</div>'\n    }).join('')\n  }\n\n  /* ── вкладки ──────────────────────────────── */\n\n  const TITLES = {\n    overview: { eyebrow: () => 'обзор · ' + new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }), title: 'Пульт <em>Congix Docs</em>' },\n    events: { eyebrow: () => 'журнал · анонимно', title: 'Что <em>происходит</em>' },\n    settings: { eyebrow: () => 'настройки · данные', title: 'Хозяйство <em>панели</em>' },\n  }\n\n  function setTab(tab, push) {\n    if (!TITLES[tab]) tab = 'overview'\n    state.tab = tab\n    if (push !== false && location.hash !== '#/' + tab) history.replaceState(null, '', '#/' + tab)\n\n    document.querySelectorAll('.nav button').forEach((button) => {\n      if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page')\n      else button.removeAttribute('aria-current')\n    })\n\n    $('viewOverview').hidden = tab !== 'overview'\n    $('viewEvents').hidden = tab !== 'events'\n    $('viewSettings').hidden = tab !== 'settings'\n    $('eyebrow').textContent = TITLES[tab].eyebrow()\n    $('title').innerHTML = TITLES[tab].title\n    $('range').hidden = tab !== 'overview'\n\n    if (tab === 'overview' && !state.loaded.overview) loadOverview(false)\n    if (tab === 'events' && !state.loaded.events) loadEvents(false)\n    if (tab === 'settings') loadSettings()\n  }\n\n  /* ── CSV ──────────────────────────────────── */\n\n  async function downloadCsv() {\n    const button = $('csv')\n    const label = button.textContent\n    const query = new URLSearchParams({ days: state.ev.days })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.q) query.set('q', state.ev.q)\n    button.disabled = true\n    button.textContent = 'Готовим…'\n    try {\n      const response = await fetch('/api/export.csv?' + query, { credentials: 'same-origin' })\n      if (!response.ok) {\n        const data = await response.json().catch(() => ({}))\n        throw new Error(data.error || 'Не удалось выгрузить CSV')\n      }\n      const disposition = response.headers.get('content-disposition') || ''\n      const match = disposition.match(/filename=\"([^\"]+)\"/)\n      const blob = await response.blob()\n      const url = URL.createObjectURL(blob)\n      const link = document.createElement('a')\n      link.href = url\n      link.download = match ? match[1] : 'congix-docs-stats.csv'\n      document.body.appendChild(link)\n      link.click()\n      link.remove()\n      setTimeout(() => URL.revokeObjectURL(url), 5000)\n      toast('CSV готов')\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      button.disabled = false\n      button.textContent = label\n    }\n  }\n\n  /* ── события интерфейса ───────────────────── */\n\n  $('loginForm').addEventListener('submit', submitLogin)\n  $('logout').addEventListener('click', logout)\n  $('refresh').addEventListener('click', () => reloadActive(false))\n  $('csv').addEventListener('click', downloadCsv)\n\n  document.querySelectorAll('.nav button').forEach((button) => {\n    button.addEventListener('click', () => setTab(button.dataset.tab))\n  })\n\n  document.querySelectorAll('#periodSeg button').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.days = Number(button.dataset.days)\n      loadOverview(false)\n    })\n  })\n\n  let searchTimer = null\n  function applyEventsFilter(immediate) {\n    clearTimeout(searchTimer)\n    const run = () => {\n      state.ev.q = $('evSearch').value.trim()\n      state.ev.page = 1\n      loadEvents(false)\n    }\n    if (immediate) run()\n    else searchTimer = setTimeout(run, 350)\n  }\n\n  $('evDays').addEventListener('change', () => {\n    state.ev.days = $('evDays').value\n    state.ev.page = 1\n    loadEvents(false)\n  })\n  $('evAction').addEventListener('change', () => {\n    state.ev.action = $('evAction').value\n    state.ev.page = 1\n    loadEvents(false)\n  })\n  $('evSearch').addEventListener('input', () => applyEventsFilter(false))\n  $('evSearch').addEventListener('keydown', (event) => {\n    if (event.key === 'Enter') applyEventsFilter(true)\n    if (event.key === 'Escape') { $('evSearch').value = ''; applyEventsFilter(true) }\n  })\n  $('evReset').addEventListener('click', () => {\n    $('evSearch').value = ''\n    $('evDays').value = '7'\n    $('evAction').value = ''\n    state.ev = { days: '7', action: '', q: '', page: 1 }\n    loadEvents(false)\n  })\n  $('evPrev').addEventListener('click', () => {\n    if (state.page > 1) { state.ev.page = state.page - 1; loadEvents(false) }\n  })\n  $('evNext').addEventListener('click', () => {\n    if (state.page < state.pages) { state.ev.page = state.page + 1; loadEvents(false) }\n  })\n  $('autoRefresh').addEventListener('change', () => { state.auto = $('autoRefresh').checked })\n\n  function saveSettings() {\n    const value = Number($('retention').value)\n    if (!Number.isFinite(value) || value < 0 || value > 3650) {\n      toast('Срок хранения — от 0 до 3650 дней', true)\n      return\n    }\n    const button = $('saveSettings')\n    button.disabled = true\n    api('/api/settings', {\n      method: 'PUT',\n      headers: { 'content-type': 'application/json' },\n      body: JSON.stringify({ retentionDays: value }),\n    })\n      .then(() => { toast('Настройки сохранены'); loadSettings() })\n      .catch((error) => toast(error.message, true))\n      .finally(() => { button.disabled = false })\n  }\n\n  $('saveSettings').addEventListener('click', saveSettings)\n\n  $('purge').addEventListener('click', async () => {\n    const days = Number($('purgeDays').value)\n    if (!Number.isFinite(days) || days < 0 || days > 3650) {\n      toast('Укажите число дней от 0 до 3650', true)\n      return\n    }\n\n    if (!state.purgeArmed) {\n      state.purgeArmed = true\n      $('purge').textContent = 'Точно удалить?'\n      $('purgeNote').hidden = false\n      $('purgeNote').textContent = days === 0\n        ? 'Будут удалены все события. Нажмите кнопку ещё раз, чтобы подтвердить.'\n        : 'Будут удалены события старше ' + days + ' дн. Нажмите кнопку ещё раз, чтобы подтвердить.'\n      setTimeout(() => {\n        if (!state.purgeArmed) return\n        state.purgeArmed = false\n        $('purge').textContent = 'Удалить'\n        $('purgeNote').hidden = true\n      }, 8000)\n      return\n    }\n\n    state.purgeArmed = false\n    $('purge').textContent = 'Удалить'\n    $('purgeNote').hidden = true\n    $('purge').disabled = true\n    try {\n      const data = await api('/api/purge', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ days }),\n      })\n      toast('Удалено событий: ' + num(data.removed))\n      state.loaded.overview = false\n      state.loaded.events = false\n      await loadSettings()\n      await loadOverview(true)\n      if (state.tab === 'events') await loadEvents(true)\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      $('purge').disabled = false\n    }\n  })\n\n  document.addEventListener('keydown', (event) => {\n    if ($('app').hidden) return\n    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)\n    if (event.key === '/' && !typing) {\n      event.preventDefault()\n      if (state.tab !== 'events') setTab('events')\n      $('evSearch').focus()\n    }\n    if ((event.key === 'r' || event.key === 'R') && !typing && !event.metaKey && !event.ctrlKey) {\n      reloadActive(false)\n    }\n  })\n\n  window.addEventListener('hashchange', () => {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    if (tab !== state.tab) setTab(tab, false)\n  })\n\n  /* ── старт ────────────────────────────────── */\n\n  async function boot() {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    try {\n      const response = await fetch('/api/session', { credentials: 'same-origin' })\n      if (!response.ok) {\n        showLogin()\n        return\n      }\n      showApp()\n      await refreshAll()\n      setTab(TITLES[tab] ? tab : 'overview', false)\n    } catch {\n      showLogin('Нет связи с сервером. Проверьте подключение.')\n    }\n  }\n\n  boot()\n})()\n</script>\n</body>\n</html>\n"

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
