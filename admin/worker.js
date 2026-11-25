// Сгенерировано: node admin/build.mjs. Правьте page.html и server.js, не этот файл.
const PAGE = "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n<meta name=\"robots\" content=\"noindex, nofollow\" />\n<title>Congix Docs · админка</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23171512'/%3E%3Ctext x='16' y='23' font-family='monospace' font-size='19' fill='%23efece4' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E\" />\n<style>\n  :root {\n    color-scheme: light;\n    --bg: #f1f2f5;\n    --surface: #ffffff;\n    --surface-2: #f8f9fb;\n    --rail: #0f172a;\n    --rail-2: #0b1220;\n    --ink: #0f172a;\n    --ink-soft: #374151;\n    --muted: #6b7280;\n    --line: #e5e7eb;\n    --line-strong: #d1d5db;\n    --accent: #d6452f;\n    --accent-dark: #b93a26;\n    --accent-soft: #fdecea;\n    --ok: #15803d;\n    --warn: #b45309;\n    --radius: 10px;\n    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;\n    --shadow: 0 1px 2px rgba(16, 24, 40, .06), 0 1px 3px rgba(16, 24, 40, .05);\n  }\n  * { box-sizing: border-box; }\n  [hidden] { display: none !important; }\n  body {\n    margin: 0; min-height: 100vh; background: var(--bg); color: var(--ink);\n    font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    -webkit-font-smoothing: antialiased;\n  }\n  a { color: inherit; text-decoration: none; }\n  button, input, select { font: inherit; color: inherit; }\n  ::selection { background: rgba(214, 69, 47, .2); }\n\n  /* ── каркас ─────────────────────────────────────────── */\n\n  .shell { display: grid; grid-template-columns: 232px minmax(0, 1fr); min-height: 100vh; }\n\n  .rail {\n    position: sticky; top: 0; align-self: start; height: 100vh;\n    display: flex; flex-direction: column; gap: 22px; padding: 18px 14px 16px;\n    background: var(--rail); color: #e5e7eb; border-right: 1px solid #0a0f1c;\n  }\n  .brand { display: flex; align-items: center; gap: 10px; padding: 4px 6px 0; }\n  .brand-mark {\n    display: grid; place-items: center; width: 32px; height: 32px; flex: none;\n    border-radius: 9px; background: var(--accent); color: #fff;\n    font: 700 15px/1 var(--mono);\n  }\n  .brand-text b { display: block; color: #fff; font-size: 13.5px; letter-spacing: -.01em; }\n  .brand-text small {\n    display: block; margin-top: 1px; color: #8b93a5;\n    font: 9px/1.4 var(--mono); letter-spacing: .16em; text-transform: uppercase;\n  }\n\n  .nav { display: flex; flex-direction: column; gap: 2px; }\n  .nav-label {\n    margin: 12px 8px 5px; color: #6b7280;\n    font: 9px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase;\n  }\n  .nav-label:first-child { margin-top: 0; }\n  .nav button {\n    display: flex; align-items: center; gap: 10px; width: 100%;\n    padding: 8px 9px; border: 0; border-radius: 8px; background: none;\n    color: #aeb6c6; font-size: 12.5px; text-align: left; cursor: pointer;\n    transition: background .12s, color .12s;\n  }\n  .nav button i {\n    display: grid; place-items: center; width: 22px; height: 22px; flex: none;\n    border: 1px solid rgba(255,255,255,.12); border-radius: 6px;\n    color: #7d879c; font: 9px/1 var(--mono); font-style: normal;\n  }\n  .nav button em {\n    margin-left: auto; padding: 1px 6px; border-radius: 999px;\n    background: rgba(214, 69, 47, .18); color: #fca69a;\n    font: 9.5px/1.5 var(--mono); font-style: normal;\n  }\n  .nav button:hover { background: rgba(255,255,255,.06); color: #fff; }\n  .nav button[aria-current=\"page\"] { background: rgba(255,255,255,.09); color: #fff; font-weight: 600; }\n  .nav button[aria-current=\"page\"] i { border-color: transparent; background: var(--accent); color: #fff; }\n\n  .rail-foot {\n    margin-top: auto; display: grid; gap: 2px; padding-top: 14px;\n    border-top: 1px solid rgba(255,255,255,.09);\n  }\n  .stamp { margin: 0 0 6px; color: #7d879c; font: 10px/1.5 var(--mono); }\n  .open-badge {\n    display: inline-flex; align-items: center; gap: 6px; margin-bottom: 8px;\n    color: #4ade80; font: 9px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase;\n  }\n  .open-badge::before {\n    content: ''; width: 6px; height: 6px; border-radius: 50%;\n    background: #4ade80; box-shadow: 0 0 0 3px rgba(74, 222, 128, .14);\n  }\n  .ghost {\n    display: flex; align-items: center; justify-content: space-between; gap: 8px;\n    padding: 8px 6px; border: 0; border-radius: 6px; background: none;\n    color: #aeb6c6; font-size: 11.5px; text-align: left; cursor: pointer;\n  }\n  .ghost:hover { background: rgba(255,255,255,.06); color: #fff; }\n  .ghost:disabled { opacity: .45; cursor: progress; }\n  .ghost kbd {\n    padding: 1px 5px; border: 1px solid rgba(255,255,255,.16); border-radius: 4px;\n    color: #8b93a5; font: 9px var(--mono);\n  }\n\n  main { min-width: 0; display: flex; flex-direction: column; }\n  .inner { max-width: none; min-width: 0; }\n\n  header {\n    position: sticky; top: 0; z-index: 20;\n    display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas:\n      \"eyebrow actions\"\n      \"title actions\"\n      \"sub actions\";\n    align-items: center; gap: 2px 18px;\n    padding: 14px 28px 15px;\n    background: rgba(255,255,255,.94); backdrop-filter: blur(8px);\n    border-bottom: 1px solid var(--line);\n  }\n  .head-actions { grid-area: actions; display: flex; align-items: center; gap: 8px; }\n  .eyebrow {\n    grid-area: eyebrow; margin: 0; color: var(--muted);\n    font: 9.5px/1.2 var(--mono); letter-spacing: .14em; text-transform: uppercase;\n  }\n  h1 { grid-area: title; margin: 2px 0 0; font-size: 21px; font-weight: 650; letter-spacing: -.02em; line-height: 1.2; }\n  h1 em { font-style: normal; color: var(--accent); }\n  .sub { grid-area: sub; margin: 3px 0 0; color: var(--muted); font-size: 11.5px; }\n\n  .inner > section { padding: 18px 28px 0; }\n  .inner > section:last-child { padding-bottom: 48px; }\n\n  /* ── KPI ────────────────────────────────────────────── */\n\n  .strip {\n    display: grid; grid-template-columns: 1.25fr repeat(5, minmax(0, 1fr));\n    gap: 10px; margin: 2px 0 14px;\n  }\n  .cell {\n    min-width: 0; padding: 13px 14px 12px;\n    background: var(--surface); border: 1px solid var(--line);\n    border-radius: var(--radius); box-shadow: var(--shadow);\n  }\n  .cell .label {\n    display: block; margin-bottom: 7px; color: var(--muted);\n    font: 9.5px/1.25 var(--mono); letter-spacing: .1em; text-transform: uppercase;\n  }\n  .cell b {\n    display: block; color: var(--ink);\n    font: 600 25px/1.05 var(--mono); letter-spacing: -.04em; font-variant-numeric: tabular-nums;\n  }\n  .cell .note { display: block; margin-top: 5px; color: var(--muted); font-size: 10.5px; }\n  .cell.hero { border-left: 3px solid var(--accent); }\n  .cell.hero b { font-size: 31px; color: var(--accent); }\n\n  /* ── сетки и панели ─────────────────────────────────── */\n\n  .grid2 { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); gap: 12px; align-items: start; }\n  .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }\n  .panel {\n    min-width: 0; margin-bottom: 12px; padding: 15px 16px 14px;\n    background: var(--surface); border: 1px solid var(--line);\n    border-radius: var(--radius); box-shadow: var(--shadow);\n  }\n  .panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }\n  .panel-head h2 {\n    margin: 0; color: var(--ink-soft);\n    font: 600 11px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase;\n  }\n  .panel-head .hint { margin-left: auto; color: var(--muted); font-size: 10.5px; }\n  .empty { margin: 0; padding: 12px 0; color: var(--muted); font-size: 12px; }\n\n  /* ── переключатель периода ──────────────────────────── */\n\n  .seg {\n    display: inline-flex; margin-left: auto; padding: 3px;\n    background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px;\n  }\n  .seg button {\n    padding: 5px 10px; border: 0; border-radius: 6px; background: none;\n    color: var(--muted); font-size: 11px; cursor: pointer; white-space: nowrap;\n  }\n  .seg button:hover { color: var(--ink); }\n  .seg button[aria-pressed=\"true\"] {\n    background: var(--surface); color: var(--accent); font-weight: 600;\n    box-shadow: 0 1px 2px rgba(16,24,40,.12);\n  }\n\n  /* ── графики ────────────────────────────────────────── */\n\n  .chart { overflow: visible; }\n  .chart svg { display: block; width: 100%; height: auto; }\n  .chart .grid { stroke: #e5e7eb; stroke-dasharray: 3 5; }\n  .chart .area { fill: var(--accent); fill-opacity: .08; }\n  .chart .line { fill: none; stroke: var(--accent); stroke-width: 1.8; }\n  .chart .dot { fill: #fff; stroke: var(--accent); stroke-width: 1.4; }\n  .chart .tick { fill: var(--muted); font: 9px var(--mono); }\n  .chart .bar { fill: #cbd2dd; }\n  .chart .bar.is-now { fill: var(--accent); }\n\n  /* ── списки и рейтинги ──────────────────────────────── */\n\n  .ranks { display: flex; flex-direction: column; }\n  .row {\n    display: grid; grid-template-columns: 18px minmax(0,1fr) 52px 52px;\n    align-items: center; gap: 10px; padding: 7px 0;\n    border-bottom: 1px solid var(--line);\n  }\n  .row.two { grid-template-columns: 18px minmax(0,1fr) 60px; }\n  .row:last-child { border-bottom: 0; }\n  .row .idx { color: var(--muted); font: 9px/1 var(--mono); }\n  .row .name { display: block; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .row .meter { position: relative; display: block; height: 4px; margin-top: 5px; background: #eef0f4; border-radius: 999px; overflow: hidden; }\n  .row .meter u { position: absolute; inset: 0 auto 0 0; background: var(--accent); border-radius: 999px; }\n  .row .n { text-align: right; }\n  .row .n b { display: block; font: 500 12.5px/1.2 var(--mono); font-variant-numeric: tabular-nums; }\n  .row .n small { color: var(--muted); font: 8px/1 var(--mono); letter-spacing: .06em; text-transform: uppercase; }\n\n  .funnel { display: flex; flex-direction: column; gap: 8px; }\n  .funnel-step { display: grid; grid-template-columns: 96px minmax(0,1fr) 60px; gap: 10px; align-items: center; font-size: 11.5px; }\n  .funnel-step .bar { height: 20px; background: #f1f3f7; border-radius: 5px; position: relative; overflow: hidden; }\n  .funnel-step .bar u { position: absolute; inset: 0 auto 0 0; background: #334155; border-radius: 5px; }\n  .funnel-step:nth-child(2) .bar u { background: var(--warn); }\n  .funnel-step:nth-child(3) .bar u { background: var(--accent); }\n  .funnel-step b { text-align: right; font: 500 12px/1 var(--mono); }\n\n  .chips { display: flex; flex-wrap: wrap; gap: 5px; }\n  .chip {\n    display: inline-block; padding: 2px 8px; border-radius: 999px;\n    background: #f1f3f7; color: var(--ink-soft);\n    font: 9.5px/1.7 var(--mono); letter-spacing: .03em; white-space: nowrap;\n  }\n  .chip.done { background: #e8f5ec; color: var(--ok); }\n  .chip.error { background: var(--accent-soft); color: var(--accent); }\n  .chip.muted { color: var(--muted); }\n\n  .insights { display: grid; gap: 1px; }\n  .insight {\n    display: grid; grid-template-columns: 8px minmax(0,1fr); gap: 10px; align-items: start;\n    padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 12px;\n  }\n  .insight:last-child { border-bottom: 0; }\n  .insight::before { content: ''; width: 8px; height: 8px; margin-top: 4px; border-radius: 50%; background: var(--muted); }\n  .insight.warn::before { background: var(--warn); }\n  .insight.bad::before { background: var(--accent); }\n  .insight.ok::before { background: var(--ok); }\n  .insight b { font-weight: 550; }\n  .insight small { display: block; margin-top: 1px; color: var(--muted); font-size: 10.5px; }\n\n  .errors { display: grid; gap: 8px; max-height: 250px; overflow: auto; }\n  .error-row { display: grid; grid-template-columns: 48px minmax(0,1fr); gap: 8px; font-size: 11px; }\n  .error-row time { color: var(--muted); font: 9.5px/1.6 var(--mono); }\n  .error-row b { display: block; font-weight: 500; font-size: 11.5px; word-break: break-word; }\n  .error-row small { color: var(--muted); font: 9.5px/1.5 var(--mono); }\n\n  /* ── фильтры, кнопки, таблицы ───────────────────────── */\n\n  .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 2px 0 12px; }\n  .toolbar-note { color: var(--muted); font: 10.5px/1 var(--mono); }\n  .control {\n    width: 100%; padding: 7px 10px; background: var(--surface);\n    border: 1px solid var(--line-strong); border-radius: 8px; font-size: 12px; outline: none;\n  }\n  .control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(214,69,47,.12); }\n  select.control { cursor: pointer; width: auto; min-width: 122px; }\n  .search-wrap { position: relative; flex: 1 1 240px; }\n  .search-wrap kbd {\n    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);\n    padding: 1px 5px; border: 1px solid var(--line); border-radius: 4px;\n    background: var(--surface-2); color: var(--muted); font: 9px var(--mono); pointer-events: none;\n  }\n  .btn {\n    padding: 7px 11px; background: var(--surface); border: 1px solid var(--line-strong);\n    border-radius: 8px; color: var(--ink-soft); font-size: 11.5px; cursor: pointer;\n  }\n  .btn:hover { border-color: var(--ink-soft); }\n  .btn[aria-pressed=\"true\"] { background: var(--accent-soft); border-color: rgba(214,69,47,.45); color: var(--accent); font-weight: 600; }\n  .btn:disabled { opacity: .45; cursor: progress; }\n  .check { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; cursor: pointer; }\n  .check input { accent-color: var(--accent); }\n\n  .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; }\n  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }\n  th {\n    padding: 8px 10px; text-align: left; white-space: nowrap;\n    background: var(--surface-2); color: var(--muted);\n    font: 9px/1.2 var(--mono); letter-spacing: .09em; text-transform: uppercase;\n    border-bottom: 1px solid var(--line);\n  }\n  td { padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }\n  tbody tr:last-child td { border-bottom: 0; }\n  tbody tr:hover { background: #fafbfc; }\n  td.time { font: 10px/1.5 var(--mono); color: var(--ink-soft); white-space: nowrap; }\n  td.mono { font: 10px/1.5 var(--mono); color: var(--muted); word-break: break-word; }\n  td.num { text-align: right; font: 11px/1.5 var(--mono); font-variant-numeric: tabular-nums; white-space: nowrap; }\n  .pager { display: flex; align-items: center; gap: 8px; padding-top: 12px; }\n  .pager .info { margin-left: auto; color: var(--muted); font: 10px/1 var(--mono); }\n\n  /* ── настройки ──────────────────────────────────────── */\n\n  .settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }\n  .field { display: grid; gap: 5px; margin-bottom: 12px; }\n  .field > span:first-child { color: var(--muted); font: 9px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase; }\n  .field .hint { color: var(--muted); font-size: 10.5px; }\n  .solid {\n    padding: 8px 13px; border: 1px solid var(--accent); border-radius: 8px;\n    background: var(--accent); color: #fff; font-size: 11.5px; font-weight: 600; cursor: pointer;\n  }\n  .solid:hover { background: var(--accent-dark); border-color: var(--accent-dark); }\n  .solid.danger { background: transparent; color: var(--accent); border-color: rgba(214,69,47,.45); }\n  .solid.danger:hover { background: var(--accent); color: #fff; }\n  .fine { margin: 9px 0 0; color: var(--muted); font-size: 10.5px; }\n  .danger-note { margin: 9px 0 0; color: var(--accent); font-size: 11px; }\n  .audit { display: grid; gap: 6px; }\n  .audit-row {\n    display: grid; grid-template-columns: 108px minmax(0,1fr); gap: 9px;\n    padding-bottom: 6px; border-bottom: 1px solid var(--line); font-size: 11px;\n  }\n  .audit-row time { color: var(--muted); font: 9.5px/1.6 var(--mono); }\n  .audit-row b { font-weight: 550; }\n\n  .feed { display: grid; gap: 6px; max-height: 400px; overflow: auto; }\n  .feed-row {\n    display: grid; grid-template-columns: 46px 72px minmax(0,1fr); gap: 7px;\n    padding-bottom: 6px; border-bottom: 1px solid var(--line); font-size: 11px;\n  }\n  .feed-row time { color: var(--muted); font: 9.5px/1.6 var(--mono); }\n  .feed-row .what { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .feed-row small { display: block; color: var(--muted); font: 9px/1.4 var(--mono); }\n\n  /* ── профиль посетителя ─────────────────────────────── */\n\n  .drawer-backdrop {\n    position: fixed; inset: 0; z-index: 30;\n    background: rgba(15, 23, 42, .38); backdrop-filter: blur(1px);\n  }\n  .drawer {\n    position: fixed; top: 0; right: 0; bottom: 0; z-index: 31;\n    display: flex; flex-direction: column;\n    width: min(560px, 100%); background: var(--surface);\n    border-left: 1px solid var(--line);\n    box-shadow: -24px 0 60px rgba(15, 23, 42, .22);\n  }\n  .drawer-head {\n    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;\n    padding: 16px 18px 13px; border-bottom: 1px solid var(--line);\n  }\n  .drawer-head h2 {\n    margin: 4px 0 0; font: 600 15px/1.3 var(--mono); letter-spacing: -.01em;\n    word-break: break-all;\n  }\n  .drawer-body { flex: 1; overflow: auto; padding: 16px 18px 28px; }\n  .drawer-body h3 {\n    margin: 18px 0 8px; color: var(--ink-soft);\n    font: 600 10px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase;\n  }\n  .drawer-body h3:first-child { margin-top: 0; }\n  .ud-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 4px; }\n  .ud-stats {\n    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;\n    margin: 14px 0 4px;\n  }\n  .ud-stat { padding: 9px 10px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; }\n  .ud-stat span { display: block; color: var(--muted); font: 8.5px/1.3 var(--mono); letter-spacing: .06em; text-transform: uppercase; }\n  .ud-stat b { display: block; margin-top: 3px; font: 600 16px/1.1 var(--mono); font-variant-numeric: tabular-nums; }\n  .ud-note { display: grid; gap: 7px; }\n  .ud-note textarea {\n    width: 100%; min-height: 74px; resize: vertical; padding: 9px 10px;\n    border: 1px solid var(--line-strong); border-radius: 8px; font-size: 12px; outline: none;\n  }\n  .ud-note textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(214,69,47,.12); }\n  .ud-note .row-actions { display: flex; align-items: center; gap: 8px; }\n  .ud-note .row-actions .fine { margin: 0 auto 0 0; }\n  .ud-session { padding: 10px 0; border-bottom: 1px solid var(--line); }\n  .ud-session:last-child { border-bottom: 0; }\n  .ud-session-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 11px; }\n  .ud-session-head time { color: var(--muted); font: 9.5px/1.5 var(--mono); }\n  .ud-session-head .note { margin-left: auto; color: var(--muted); font: 9.5px/1.5 var(--mono); }\n  .ud-steps { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 7px; }\n  .ud-steps .arrow { color: var(--line-strong); font: 10px var(--mono); }\n  .ud-steps .chip { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }\n  .ud-delete { margin-top: 22px; padding-top: 14px; border-top: 1px solid var(--line); }\n  .ud-delete .solid { width: 100%; margin-top: 8px; }\n\n  .toast {\n    position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);\n    padding: 9px 14px; border-radius: 8px; background: #111827; color: #fff;\n    box-shadow: 0 12px 30px -12px rgba(0,0,0,.5);\n    font-size: 11.5px; z-index: 40; max-width: min(92vw, 520px);\n  }\n  .toast.bad { background: var(--accent); }\n\n  @media (max-width: 1180px) {\n    .strip { grid-template-columns: repeat(3, minmax(0,1fr)); }\n    .grid2, .grid3, .settings-grid { grid-template-columns: 1fr; }\n  }\n  @media (max-width: 900px) {\n    .shell { grid-template-columns: 1fr; }\n    .rail {\n      position: static; height: auto; flex-direction: row; flex-wrap: wrap;\n      align-items: center; gap: 10px 18px; padding: 12px 16px;\n      border-right: 0; border-bottom: 1px solid #0a0f1c;\n    }\n    .brand { margin-right: auto; padding: 0; }\n    .nav { flex-direction: row; flex-wrap: wrap; gap: 2px; width: 100%; }\n    .nav-label { display: none; }\n    .nav button { width: auto; padding: 7px 10px; }\n    .rail-foot { display: none; }\n    header { padding: 12px 16px; }\n    .inner > section { padding: 14px 16px 0; }\n    .head-actions .btn span { display: none; }\n  }\n  @media (max-width: 640px) {\n    h1 { font-size: 18px; }\n    .strip { grid-template-columns: repeat(2, minmax(0,1fr)); }\n    .cell b { font-size: 21px; }\n    .cell.hero b { font-size: 25px; }\n    .panel { padding: 13px 12px 12px; }\n    td.hide-m, th.hide-m { display: none; }\n    .funnel-step { grid-template-columns: 78px minmax(0,1fr) 48px; }\n    .seg { margin-left: 0; }\n  }\n</style>\n</head>\n<body>\n<div class=\"shell\">\n  <aside class=\"rail\">\n    <a class=\"brand\" href=\"/\" aria-label=\"Congix Docs, админка\">\n      <span class=\"brand-mark\">C</span>\n      <span class=\"brand-text\"><b>Congix Docs</b><small>админка</small></span>\n    </a>\n\n    <nav class=\"nav\" id=\"nav\" aria-label=\"Разделы админки\">\n      <p class=\"nav-label\">Аналитика</p>\n      <button type=\"button\" data-tab=\"overview\"><i>01</i>Сводка</button>\n      <button type=\"button\" data-tab=\"live\"><i>02</i>Онлайн<em id=\"navLive\">0</em></button>\n      <button type=\"button\" data-tab=\"tools\"><i>03</i>Инструменты</button>\n      <button type=\"button\" data-tab=\"audience\"><i>04</i>Аудитория</button>\n      <button type=\"button\" data-tab=\"users\"><i>05</i>Пользователи</button>\n      <button type=\"button\" data-tab=\"events\"><i>06</i>Журнал</button>\n      <p class=\"nav-label\">Система</p>\n      <button type=\"button\" data-tab=\"settings\"><i>07</i>Настройки</button>\n    </nav>\n\n    <div class=\"rail-foot\">\n      <span class=\"open-badge\">открытый вход</span>\n      <p class=\"stamp\" id=\"stamp\">—</p>\n    </div>\n  </aside>\n\n  <main>\n    <div class=\"inner\">\n      <header>\n        <p class=\"eyebrow\" id=\"eyebrow\">обзор · всё сразу</p>\n        <h1 id=\"title\">Пульт <em>Congix Docs</em></h1>\n        <p class=\"sub\" id=\"range\">—</p>\n        <div class=\"head-actions\">\n          <button class=\"btn\" id=\"refresh\" type=\"button\">Обновить <span>данные</span></button>\n          <button class=\"btn\" id=\"csv\" type=\"button\">CSV ↓</button>\n        </div>\n      </header>\n\n      <!-- ── сводка ─────────────────────────────────────────── -->\n      <section id=\"viewOverview\">\n        <section class=\"strip\">\n          <div class=\"cell hero\">\n            <span class=\"label\">Событий сегодня</span>\n            <b id=\"kToday\">0</b>\n            <span class=\"note\" id=\"kTodayNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Людей</span>\n            <b id=\"kPeople\">0</b>\n            <span class=\"note\" id=\"kPeopleNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Сессий</span>\n            <b id=\"kSessions\">0</b>\n            <span class=\"note\" id=\"kSessionsNote\">—</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Конверсия в файл</span>\n            <b id=\"kConv\">—</b>\n            <span class=\"note\">сессия → готовый файл</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Средняя сессия</span>\n            <b id=\"kTime\">—</b>\n            <span class=\"note\" id=\"kTimeNote\">видимое время</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Ошибки</span>\n            <b id=\"kErrors\">0</b>\n            <span class=\"note\" id=\"kErrorsNote\">за период</span>\n          </div>\n        </section>\n\n        <section class=\"panel\">\n          <div class=\"panel-head\">\n            <h2>Что улучшить</h2>\n            <span class=\"hint\">выводы из текущих данных</span>\n          </div>\n          <div class=\"insights\" id=\"insights\"></div>\n        </section>\n\n        <section class=\"panel\">\n          <div class=\"panel-head\">\n            <h2>Активность</h2>\n            <div class=\"seg\" id=\"periodSeg\" role=\"group\" aria-label=\"Период графика\">\n              <button type=\"button\" data-days=\"7\">7 дней</button>\n              <button type=\"button\" data-days=\"14\">14 дней</button>\n              <button type=\"button\" data-days=\"30\">30 дней</button>\n              <button type=\"button\" data-days=\"90\">90 дней</button>\n            </div>\n            <span class=\"hint\" id=\"chartHint\">события по дням</span>\n          </div>\n          <div class=\"chart\" id=\"chart\"></div>\n        </section>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Воронка</h2><span class=\"hint\">по сессиям, от визита до файла</span></div>\n            <div class=\"funnel\" id=\"funnel\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Ошибки</h2><span class=\"hint\">последние 25</span></div>\n            <div class=\"errors\" id=\"errors\"></div>\n          </section>\n        </div>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Инструменты</h2><span class=\"hint\" id=\"toolsHint\">кто чем пользуется</span></div>\n            <div class=\"ranks\" id=\"toolList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Страницы</h2><span class=\"hint\">просмотры</span></div>\n            <div class=\"ranks\" id=\"pageList\"></div>\n          </section>\n        </div>\n\n        <div class=\"grid3\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Источники</h2></div>\n            <div class=\"ranks\" id=\"sourceList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Устройства</h2></div>\n            <div class=\"ranks\" id=\"deviceList\"></div>\n            <div class=\"chips\" id=\"browserChips\" style=\"margin-top:12px\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Языки</h2></div>\n            <div class=\"ranks\" id=\"langList\"></div>\n            <div class=\"chips\" id=\"countryChips\" style=\"margin-top:12px\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── онлайн ────────────────────────────────────────── -->\n      <section id=\"viewLive\" hidden>\n        <section class=\"strip\">\n          <div class=\"cell hero\">\n            <span class=\"label\">Сейчас на сайте</span>\n            <b id=\"livePeople\">0</b>\n            <span class=\"note\">уникальных за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Сессий</span>\n            <b id=\"liveSessions\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Событий</span>\n            <b id=\"liveEvents\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Активных страниц</span>\n            <b id=\"livePages\">0</b>\n            <span class=\"note\">за 5 минут</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Обновление</span>\n            <b style=\"font-size:18px\">10 с</b>\n            <span class=\"note\">пока вкладка открыта</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Последнее событие</span>\n            <b id=\"liveLast\" style=\"font-size:18px\">—</b>\n            <span class=\"note\">по времени сервера</span>\n          </div>\n        </section>\n\n        <section class=\"panel\">\n          <div class=\"panel-head\"><h2>Последние 30 минут</h2><span class=\"hint\">события по минутам</span></div>\n          <div class=\"chart\" id=\"liveChart\"></div>\n        </section>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Где сейчас люди</h2><span class=\"hint\">страницы за 5 минут</span></div>\n            <div class=\"ranks\" id=\"livePageList\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Поток</h2><span class=\"hint\">последние 30 событий</span></div>\n            <div class=\"feed\" id=\"liveFeed\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── инструменты ───────────────────────────────────── -->\n      <section id=\"viewTools\" hidden>\n        <div class=\"toolbar\">\n          <button class=\"btn\" data-days-tools=\"7\" type=\"button\">7 дней</button>\n          <button class=\"btn\" data-days-tools=\"30\" type=\"button\">30 дней</button>\n          <button class=\"btn\" data-days-tools=\"90\" type=\"button\">90 дней</button>\n          <button class=\"btn\" data-days-tools=\"0\" type=\"button\">Всё время</button>\n          <span class=\"toolbar-note\" id=\"toolsPeriod\">за 30 дней</span>\n        </div>\n        <div class=\"panel\" style=\"padding-top:0\">\n          <div class=\"table-wrap\">\n            <table>\n              <thead>\n                <tr>\n                  <th>Инструмент</th>\n                  <th class=\"num\">Открыли</th>\n                  <th class=\"num\">Дошли до файла</th>\n                  <th class=\"num\">Конверсия</th>\n                  <th class=\"num\">Ошибки</th>\n                  <th class=\"num hide-m\">Ср. время</th>\n                  <th class=\"num hide-m\">Последний раз</th>\n                </tr>\n              </thead>\n              <tbody id=\"toolBody\"></tbody>\n            </table>\n          </div>\n          <p class=\"fine\" id=\"toolsNote\" hidden></p>\n        </div>\n      </section>\n\n      <!-- ── аудитория ─────────────────────────────────────── -->\n      <section id=\"viewAudience\" hidden>\n        <div class=\"grid2\">\n          <section class=\"panel\" style=\"grid-column:1/-1\">\n            <div class=\"panel-head\"><h2>Страницы</h2><span class=\"hint\">просмотры, время и скролл</span></div>\n            <div class=\"table-wrap\">\n              <table>\n                <thead>\n                  <tr>\n                    <th>Страница</th>\n                    <th class=\"num\">Просмотры</th>\n                    <th class=\"num\">Люди</th>\n                    <th class=\"num\">Входы</th>\n                    <th class=\"num\">Выходы</th>\n                    <th class=\"num\">Ср. время</th>\n                    <th class=\"num\">Скролл</th>\n                  </tr>\n                </thead>\n                <tbody id=\"pageBody\"></tbody>\n              </table>\n            </div>\n            <p class=\"fine\" id=\"audCoverage\">—</p>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Источники</h2><span class=\"hint\">откуда пришли</span></div>\n            <div class=\"ranks\" id=\"audSources\"></div>\n          </section>\n        </div>\n        <div class=\"grid3\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Устройства</h2></div>\n            <div class=\"ranks\" id=\"audDevices\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Браузеры</h2></div>\n            <div class=\"chips\" id=\"audBrowsers\"></div>\n            <h2 style=\"margin:18px 0 10px;font:10px/1 var(--mono);letter-spacing:.18em;text-transform:uppercase\">Языки</h2>\n            <div class=\"chips\" id=\"audLangs\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Страны</h2><span class=\"hint\">по Cloudflare</span></div>\n            <div class=\"chips\" id=\"audCountries\"></div>\n          </section>\n        </div>\n      </section>\n\n      <!-- ── пользователи ──────────────────────────────────── -->\n      <section id=\"viewUsers\" hidden>\n        <section class=\"strip\">\n          <div class=\"cell hero\">\n            <span class=\"label\">Всего посетителей</span>\n            <b id=\"uPeople\">0</b>\n            <span class=\"note\">уникальные анонимные ID</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Заходили сегодня</span>\n            <b id=\"uToday\">0</b>\n            <span class=\"note\">по времени сервера</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">За 7 дней</span>\n            <b id=\"uWeek\">0</b>\n            <span class=\"note\">были хоть раз</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Новых за неделю</span>\n            <b id=\"uFresh\">0</b>\n            <span class=\"note\">первый визит</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Вернувшихся</span>\n            <b id=\"uReturning\">0</b>\n            <span class=\"note\">больше одной сессии</span>\n          </div>\n          <div class=\"cell\">\n            <span class=\"label\">Дошли до файла</span>\n            <b id=\"uConverted\">0</b>\n            <span class=\"note\">хотя бы один готовый файл</span>\n          </div>\n        </section>\n\n        <div class=\"toolbar\">\n          <span class=\"search-wrap\">\n            <input class=\"control\" id=\"usSearch\" type=\"search\" placeholder=\"ID посетителя, страница, сессия, страна\" aria-label=\"Поиск по посетителям\" />\n            <kbd>/</kbd>\n          </span>\n          <div class=\"seg\" id=\"userFilter\" role=\"group\" aria-label=\"Фильтр посетителей\">\n            <button type=\"button\" data-user-filter=\"all\">Все</button>\n            <button type=\"button\" data-user-filter=\"new\">Новые</button>\n            <button type=\"button\" data-user-filter=\"returning\">Вернувшиеся</button>\n            <button type=\"button\" data-user-filter=\"done\">С файлом</button>\n            <button type=\"button\" data-user-filter=\"error\">С ошибкой</button>\n          </div>\n          <select class=\"control\" id=\"usDays\" aria-label=\"Период активности\">\n            <option value=\"7\">7 дней</option>\n            <option value=\"30\" selected>30 дней</option>\n            <option value=\"90\">90 дней</option>\n            <option value=\"0\">Всё время</option>\n          </select>\n          <span class=\"toolbar-note\" id=\"usCount\">—</span>\n        </div>\n\n        <div class=\"panel\" style=\"padding-top:0\">\n          <div class=\"table-wrap\">\n            <table>\n              <thead>\n                <tr>\n                  <th>Посетитель</th>\n                  <th>Откуда</th>\n                  <th class=\"hide-m\">Устройство</th>\n                  <th class=\"num\">Сессии</th>\n                  <th class=\"num\">Просмотры</th>\n                  <th class=\"num\">Файлы</th>\n                  <th class=\"num\">Ошибки</th>\n                  <th class=\"hide-m\">Первый визит</th>\n                  <th>Последний</th>\n                  <th></th>\n                </tr>\n              </thead>\n              <tbody id=\"userBody\"></tbody>\n            </table>\n          </div>\n          <div class=\"pager\">\n            <button class=\"btn\" id=\"usPrev\" type=\"button\">← Назад</button>\n            <button class=\"btn\" id=\"usNext\" type=\"button\">Вперёд →</button>\n            <span class=\"info\" id=\"usInfo\">—</span>\n          </div>\n          <p class=\"fine\">Имён и почты здесь нет: сайт не собирает их в аналитику. Посетитель — случайный ID браузера, путь — страницы и инструменты за сессию.</p>\n        </div>\n      </section>\n\n      <!-- ── журнал ────────────────────────────────────────── -->\n      <section id=\"viewEvents\" hidden>\n        <div class=\"toolbar\">\n          <select class=\"control\" id=\"evDays\" aria-label=\"Период\">\n            <option value=\"1\">Сутки</option>\n            <option value=\"7\" selected>7 дней</option>\n            <option value=\"30\">30 дней</option>\n            <option value=\"90\">90 дней</option>\n            <option value=\"0\">Всё время</option>\n          </select>\n          <select class=\"control\" id=\"evAction\" aria-label=\"Действие\">\n            <option value=\"\">Все действия</option>\n            <option value=\"view\">Открыл страницу</option>\n            <option value=\"open\">Открыл инструмент</option>\n            <option value=\"done\">Получил файл</option>\n            <option value=\"error\">Ошибка</option>\n            <option value=\"leave\">Ушёл со страницы</option>\n            <option value=\"session\">Новая сессия</option>\n          </select>\n          <select class=\"control\" id=\"evDevice\" aria-label=\"Устройство\">\n            <option value=\"\">Все устройства</option>\n            <option value=\"desktop\">Компьютер</option>\n            <option value=\"mobile\">Телефон</option>\n            <option value=\"tablet\">Планшет</option>\n          </select>\n          <select class=\"control\" id=\"evLang\" aria-label=\"Язык\">\n            <option value=\"\">Все языки</option>\n            <option value=\"ru\">ru</option>\n            <option value=\"uz\">uz</option>\n            <option value=\"en\">en</option>\n          </select>\n          <span class=\"search-wrap\">\n            <input class=\"control\" id=\"evSearch\" type=\"search\" placeholder=\"инструмент, страница, источник, сессия\" aria-label=\"Поиск по журналу\" />\n            <kbd>/</kbd>\n          </span>\n          <button class=\"btn\" id=\"evReset\" type=\"button\">Сбросить</button>\n          <label class=\"check\"><input type=\"checkbox\" id=\"autoRefresh\" checked /> автообновление</label>\n        </div>\n\n        <div class=\"panel\" style=\"padding-top:0\">\n          <div class=\"table-wrap\">\n            <table>\n              <thead>\n                <tr>\n                  <th style=\"width:92px\">Время</th>\n                  <th style=\"width:132px\">Действие</th>\n                  <th>Инструмент / детали</th>\n                  <th class=\"hide-m\">Страница</th>\n                  <th class=\"hide-m\">Откуда</th>\n                  <th class=\"hide-m\">Устройство</th>\n                  <th class=\"hide-m\">Сессия</th>\n                </tr>\n              </thead>\n              <tbody id=\"evBody\"></tbody>\n            </table>\n          </div>\n          <div class=\"pager\">\n            <button class=\"btn\" id=\"evPrev\" type=\"button\">← Назад</button>\n            <button class=\"btn\" id=\"evNext\" type=\"button\">Вперёд →</button>\n            <span class=\"info\" id=\"evInfo\">—</span>\n          </div>\n        </div>\n      </section>\n\n      <!-- ── настройки ─────────────────────────────────────── -->\n      <section id=\"viewSettings\" hidden>\n        <div class=\"settings-grid\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Хранение событий</h2><span class=\"hint\">сколько держим статистику</span></div>\n            <label class=\"field\">\n              <span>Дней</span>\n              <input class=\"control\" id=\"retention\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n              <span class=\"hint\">0 — хранить всё время. По умолчанию 90 дней.</span>\n            </label>\n            <button class=\"solid\" id=\"saveSettings\" type=\"button\">Сохранить</button>\n            <p class=\"fine\" id=\"settingsStamp\">—</p>\n          </section>\n\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Очистка</h2><span class=\"hint\">необратимо</span></div>\n            <label class=\"field\">\n              <span>Удалить события старше</span>\n              <input class=\"control\" id=\"purgeDays\" type=\"number\" min=\"0\" max=\"3650\" step=\"1\" inputmode=\"numeric\" />\n              <span class=\"hint\">0 — удалить всю статистику. Журнал действий останется.</span>\n            </label>\n            <button class=\"solid danger\" id=\"purge\" type=\"button\">Удалить</button>\n            <p class=\"danger-note\" id=\"purgeNote\" hidden></p>\n            <p class=\"fine\" id=\"dbStamp\">—</p>\n            <p class=\"fine\" id=\"dataStamp\">—</p>\n          </section>\n        </div>\n\n        <div class=\"grid2\">\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Журнал действий</h2><span class=\"hint\">выгрузки, настройки, очистка</span></div>\n            <div class=\"audit\" id=\"audit\"></div>\n          </section>\n          <section class=\"panel\">\n            <div class=\"panel-head\"><h2>Система</h2><span class=\"hint\">состояние сборщика</span></div>\n            <div class=\"audit\" id=\"health\"></div>\n          </section>\n        </div>\n      </section>\n    </div>\n  </main>\n</div>\n\n<div class=\"drawer-backdrop\" id=\"userBackdrop\" hidden></div>\n<aside class=\"drawer\" id=\"userDrawer\" hidden aria-label=\"Профиль посетителя\">\n  <div class=\"drawer-head\">\n    <div>\n      <p class=\"eyebrow\">посетитель · анонимный ID</p>\n      <h2 id=\"udId\">—</h2>\n    </div>\n    <button class=\"btn\" id=\"udClose\" type=\"button\">Закрыть</button>\n  </div>\n  <div class=\"drawer-body\" id=\"udBody\"></div>\n</aside>\n\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" hidden></div>\n\n<script>\n(() => {\n  'use strict'\n\n  const $ = (id) => document.getElementById(id)\n  const num = (value) => Number(value || 0).toLocaleString('ru-RU')\n  const pad = (value) => (value < 10 ? '0' + value : String(value))\n  const esc = (value) => String(value == null ? '' : value)\n    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;')\n\n  const ACTION_LABEL = {\n    view: 'страница',\n    open: 'открыл',\n    done: 'файл',\n    error: 'ошибка',\n    leave: 'ушёл',\n    session: 'сессия',\n  }\n\n  const TITLES = {\n    overview: ['обзор · всё сразу', 'Пульт <em>Congix Docs</em>'],\n    live: ['онлайн · последние 5 минут', 'Что <em>сейчас</em> происходит'],\n    tools: ['инструменты · конверсия', 'Чем <em>пользуются</em>'],\n    audience: ['аудитория · страницы и откуда', 'Кто и <em>где</em>'],\n    users: ['пользователи · путь и заметки', 'Кто <em>приходил</em>'],\n    events: ['журнал · каждое событие', 'Полный <em>журнал</em>'],\n    settings: ['настройки · хранение и очистка', 'Служебные <em>настройки</em>'],\n  }\n\n  // Номер последнего запроса по каждому разделу: ответ, пришедший позже\n  // нового, не должен затирать свежие данные (иначе период «залипает»).\n  const seq = { overview: 0, live: 0, tools: 0, audience: 0, users: 0, events: 0 }\n\n  const state = {\n    tab: 'overview',\n    days: 14,\n    toolDays: 30,\n    ev: { days: '7', action: '', device: '', lang: '', q: '', page: 1 },\n    us: { days: '30', filter: 'all', q: '', page: 1, pages: 1, current: '' },\n    userDeleteArmed: false,\n    pages: 1,\n    auto: true,\n    purgeArmed: false,\n    timer: null,\n    liveTimer: null,\n    toastTimer: null,\n  }\n\n  function toast(text, bad) {\n    const node = $('toast')\n    node.textContent = text\n    node.className = 'toast' + (bad ? ' bad' : '')\n    node.hidden = false\n    clearTimeout(state.toastTimer)\n    state.toastTimer = setTimeout(() => { node.hidden = true }, bad ? 5000 : 2600)\n  }\n\n  function fmtWhen(ts) {\n    if (!ts) return '—'\n    const date = new Date(ts)\n    const sameDay = date.toDateString() === new Date().toDateString()\n    const time = pad(date.getHours()) + ':' + pad(date.getMinutes())\n    return sameDay ? time : pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + ' ' + time\n  }\n\n  function fmtFull(ts) {\n    if (!ts) return '—'\n    const date = new Date(ts)\n    return pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())\n  }\n\n  function fmtDuration(seconds) {\n    const value = Number(seconds) || 0\n    if (!value) return '—'\n    if (value < 60) return value + ' с'\n    return Math.floor(value / 60) + ' мин ' + (value % 60) + ' с'\n  }\n\n  function fmtNumDays(days) {\n    return days === 0 ? 'всё время' : days + ' дн.'\n  }\n\n  /**\n   * Ряд по дням без пропусков: иначе 7 и 90 дней выглядят одинаково, если\n   * события были только в паре дней. Пустые дни — нули, график честно меняется.\n   */\n  function fillSeries(rows, days) {\n    if (!days || days <= 0) return rows\n    const byDay = new Map((rows || []).map((row) => [row.day, row]))\n    const today = new Date()\n    const out = []\n    for (let offset = days - 1; offset >= 0; offset--) {\n      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)\n      const key = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())\n      const row = byDay.get(key)\n      out.push({\n        day: key,\n        total: row ? Number(row.total) || 0 : 0,\n        people: row ? Number(row.people) || 0 : 0,\n        sessions: row ? Number(row.sessions) || 0 : 0,\n      })\n    }\n    return out\n  }\n\n  function metaDetail(row) {\n    if (!row.meta) return ''\n    try {\n      const meta = JSON.parse(row.meta)\n      const parts = []\n      if (meta.message) parts.push(meta.message)\n      if (meta.source) parts.push(meta.source)\n      if (meta.status) parts.push('HTTP ' + meta.status)\n      if (meta.seconds != null) parts.push(meta.seconds + ' с')\n      return parts.join(' · ').slice(0, 160)\n    } catch {\n      return String(row.meta).slice(0, 160)\n    }\n  }\n\n  async function api(path, options) {\n    const response = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}))\n    const type = response.headers.get('content-type') || ''\n    const data = type.includes('application/json') ? await response.json().catch(() => ({})) : null\n    if (!response.ok) throw new Error((data && data.error) || 'Запрос не удался (' + response.status + ')')\n    return data\n  }\n\n  /* ── отрисовка списков ─────────────────────────────── */\n\n  function rankList(target, rows, options) {\n    const config = options || {}\n    const max = Math.max(1, ...rows.map((row) => Number(row[config.value || 'total']) || 0))\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">Пока нет данных.</p>'\n      return\n    }\n    target.innerHTML = rows.slice(0, config.limit || 8).map((row, index) => {\n      const value = Number(row[config.value || 'total']) || 0\n      const label = row[config.label || 'name'] ?? '—'\n      const note = config.note ? config.note(row) : ''\n      return '<div class=\"row' + (config.note ? '' : ' two') + '\">' +\n        '<span class=\"idx\">' + pad(index + 1) + '</span>' +\n        '<span><span class=\"name\" title=\"' + esc(label) + '\">' + esc(label) + '</span>' +\n        '<span class=\"meter\"><u style=\"width:' + Math.max(2, Math.round(value / max * 100)) + '%\"></u></span></span>' +\n        '<span class=\"n\"><b>' + num(value) + '</b><small>' + esc(note) + '</small></span>' +\n        (config.note ? '<span class=\"n\"><b>' + num(row.people) + '</b><small>людей</small></span>' : '') +\n        '</div>'\n    }).join('')\n  }\n\n  function chips(target, rows, valueKey) {\n    if (!rows.length) {\n      target.innerHTML = '<span class=\"chip muted\">нет данных</span>'\n      return\n    }\n    target.innerHTML = rows.slice(0, 14).map((row) => {\n      const label = row[valueKey] ?? row.name ?? '—'\n      return '<span class=\"chip\">' + esc(label) + ' · ' + num(row.total) + '</span>'\n    }).join('')\n  }\n\n  function chart(target, rows, labelKey, valueKey) {\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">Пока нет событий за этот период.</p>'\n      return\n    }\n    const width = 760\n    const height = 190\n    const padX = 8\n    const padY = 14\n    const values = rows.map((row) => Number(row[valueKey]) || 0)\n    const max = Math.max(1, ...values)\n    const stepX = rows.length > 1 ? (width - padX * 2) / (rows.length - 1) : 0\n    const point = (index, value) => {\n      const x = padX + index * stepX\n      const y = height - padY - (value / max) * (height - padY * 2)\n      return [x, y]\n    }\n    const points = values.map((value, index) => point(index, value))\n    const line = points.map(([x, y], index) => (index ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ')\n    const area = line + ' L' + points[points.length - 1][0].toFixed(1) + ' ' + (height - padY) +\n      ' L' + points[0][0].toFixed(1) + ' ' + (height - padY) + ' Z'\n    const ticks = values.map((value, index) => {\n      // Первую и последнюю подпись прижимаем к краям, иначе они обрезаются.\n      const anchor = index === 0 ? 'start' : index === values.length - 1 ? 'end' : 'middle'\n      if (rows.length > 12 && index % Math.ceil(rows.length / 8) !== 0 && index !== rows.length - 1) return ''\n      const [x] = point(index, value)\n      const label = String(rows[index][labelKey] || '').slice(5)\n      return '<text class=\"tick\" x=\"' + x.toFixed(1) + '\" y=\"' + (height - 1) + '\" text-anchor=\"' + anchor + '\">' + esc(label) + '</text>'\n    }).join('')\n    // На длинном периоде точки превращаются в шум — оставляем только линию.\n    const dots = rows.length <= 45\n      ? points.map(([x, y]) => '<circle class=\"dot\" cx=\"' + x.toFixed(1) + '\" cy=\"' + y.toFixed(1) + '\" r=\"2.4\" />').join('')\n      : ''\n\n    target.innerHTML = '<svg viewBox=\"0 0 ' + width + ' ' + height + '\" role=\"img\" aria-label=\"График активности\">' +\n      '<line class=\"grid\" x1=\"0\" y1=\"' + (height - padY) + '\" x2=\"' + width + '\" y2=\"' + (height - padY) + '\"/>' +\n      '<path class=\"area\" d=\"' + area + '\"/><path class=\"line\" d=\"' + line + '\"/>' + dots + ticks + '</svg>'\n  }\n\n  function minutesChart(target, rows) {\n    if (!rows.length) {\n      target.innerHTML = '<p class=\"empty\">За последние 30 минут событий не было.</p>'\n      return\n    }\n    const width = 760\n    const height = 150\n    const max = Math.max(1, ...rows.map((row) => Number(row.total) || 0))\n    const slot = width / Math.max(rows.length, 1)\n    const bars = rows.map((row, index) => {\n      const value = Number(row.total) || 0\n      const h = Math.max(2, Math.round(value / max * (height - 30)))\n      const x = index * slot + slot * 0.18\n      const last = index === rows.length - 1\n      return '<rect class=\"bar' + (last ? ' is-now' : '') + '\" x=\"' + x.toFixed(1) + '\" y=\"' + (height - 18 - h) + '\" width=\"' + Math.max(2, slot * 0.64).toFixed(1) + '\" height=\"' + h + '\" />'\n    }).join('')\n    target.innerHTML = '<svg viewBox=\"0 0 ' + width + ' ' + height + '\" role=\"img\" aria-label=\"События по минутам\">' +\n      '<line class=\"grid\" x1=\"0\" y1=\"' + (height - 18) + '\" x2=\"' + width + '\" y2=\"' + (height - 18) + '\"/>' + bars +\n      '<text class=\"tick\" x=\"0\" y=\"' + (height - 2) + '\">' + esc(rows[0].minute) + '</text>' +\n      '<text class=\"tick\" x=\"' + width + '\" y=\"' + (height - 2) + '\" text-anchor=\"end\">' + esc(rows[rows.length - 1].minute) + '</text></svg>'\n  }\n\n  /* ── сводка ────────────────────────────────────────── */\n\n  async function loadOverview(silent) {\n    const ticket = ++seq.overview\n    try {\n      const data = await api('/api/stats?days=' + state.days)\n      if (ticket !== seq.overview) return\n      renderOverview(data)\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  function renderInsights(data) {\n    const t = data.totals\n    const funnel = data.funnel\n    const conversion = funnel.views ? Math.round(funnel.dones / funnel.views * 100) : 0\n    const items = []\n\n    if (!t.sessions || t.sessions < 5) {\n      items.push({ tone: '', text: 'Мало данных для выводов', note: (t.sessions || 0) + ' сессий за период — нужно хотя бы 5–10.' })\n    }\n    if (t.sessions >= 5 && t.bounceRate >= 60) {\n      items.push({ tone: 'warn', text: t.bounceRate + '% сессий уходят с одной страницы', note: 'Проверьте первый экран и кнопку выбора инструмента.' })\n    }\n    if (funnel.views >= 10 && conversion < 20) {\n      items.push({ tone: 'warn', text: 'До файла доходит ' + conversion + '% сессий (' + funnel.dones + ' из ' + funnel.views + ')', note: 'Путь от главной до загрузки файла слишком длинный.' })\n    }\n    for (const page of data.pages.filter((row) => row.avgTime > 0 && row.avgTime < 15 && row.views >= 3).slice(0, 2)) {\n      items.push({ tone: 'warn', text: page.path + ': ' + page.avgTime + ' с в среднем', note: page.views + ' просмотров — первый экран не удерживает.' })\n    }\n    for (const tool of data.tools.filter((row) => row.total >= 3 && row.conversion < 50).slice(0, 2)) {\n      items.push({ tone: 'bad', text: tool.name + ': ' + tool.done + ' из ' + tool.total + ' открытий дошли до файла', note: 'Проверьте подсказки и сообщения об ошибках на этом инструменте.' })\n    }\n    if (data.errorGroups.length) {\n      const total = data.errorGroups.reduce((sum, group) => sum + group.count, 0)\n      items.push({ tone: 'bad', text: total + ' ошибок за период', note: data.errorGroups[0].message })\n    }\n    if (!items.length) {\n      items.push({ tone: 'ok', text: 'Явных провалов нет', note: 'Конверсия и удержание в норме на текущих данных.' })\n    }\n\n    $('insights').innerHTML = items.map((item) =>\n      '<div class=\"insight ' + item.tone + '\"><span><b>' + esc(item.text) + '</b>' +\n      '<small>' + esc(item.note) + '</small></span></div>').join('')\n  }\n\n  function renderOverview(data) {\n    const t = data.totals\n    const periodErrors = (data.actions || []).find((row) => row.action === 'error')?.total ?? 0\n    $('kToday').textContent = num(t.today)\n    $('kTodayNote').textContent = 'за 7 дней: ' + num(t.week) + ' · за 30: ' + num(t.month)\n    const periodPeople = t.peoplePeriod ?? t.people\n    const periodSessions = t.sessionsPeriod ?? t.sessions\n    $('kPeople').textContent = num(periodPeople)\n    $('kPeopleNote').textContent = 'всего: ' + num(t.people) + ' · за ' + fmtNumDays(data.days)\n    $('kSessions').textContent = num(periodSessions)\n    $('kSessionsNote').textContent = (t.avgViews || 0) + ' стр. за сессию' +\n      (data.quality?.since ? ' · с ' + fmtFull(data.quality.since) : '')\n    $('kConv').textContent = data.funnel.views ? Math.round(data.funnel.dones / Math.max(1, data.funnel.views) * 100) + '%' : '—'\n    $('kTime').textContent = fmtDuration(t.avgSessionSeconds)\n    $('kTimeNote').textContent = 'отказы ' + (t.bounceRate || 0) + '%'\n    $('kErrors').textContent = num(periodErrors)\n    $('kErrorsNote').textContent = data.quality?.since ? 'с ' + fmtFull(data.quality.since) : 'за период'\n    $('range').textContent = 'период: ' + fmtNumDays(data.days) + ' · событий в периоде: ' + num(t.period) +\n      ' · последнее: ' + fmtWhen(t.last) +\n      (data.quality?.since ? ' · сбор с ' + fmtFull(data.quality.since) : '')\n    renderInsights(data)\n    const series = fillSeries(data.series, data.days)\n    chart($('chart'), series, 'day', 'total')\n    $('chartHint').textContent = 'за ' + fmtNumDays(data.days) + ' · ' + num(t.period) + ' событий' +\n      (periodPeople ? ' · ' + num(periodPeople) + ' людей' : '')\n\n    const views = data.funnel.views || 0\n    const opens = data.funnel.opens || 0\n    const dones = data.funnel.dones || 0\n    const base = Math.max(1, views)\n    $('funnel').innerHTML = [\n      ['Сессий с просмотром', views],\n      ['Открыли инструмент', opens],\n      ['Получили файл', dones],\n    ].map(([label, value]) =>\n      '<div class=\"funnel-step\"><span>' + esc(label) + '</span>' +\n      '<span class=\"bar\"><u style=\"width:' + Math.max(1, Math.round(Number(value) / base * 100)) + '%\"></u></span>' +\n      '<b>' + num(value) + '</b></div>').join('')\n\n    if (!data.errors.length) {\n      $('errors').innerHTML = '<p class=\"empty\">Ошибок не зафиксировано.</p>'\n    } else {\n      $('errors').innerHTML = data.errors.map((row) =>\n        '<div class=\"error-row\"><time>' + fmtWhen(row.ts) + '</time><span>' +\n        '<b>' + esc(metaDetail(row) || 'Ошибка') + '</b>' +\n        '<small>' + esc(row.path || '/') + ' · ' + esc(row.device || '—') + ' · ' + esc(row.browser || '—') + '</small>' +\n        '</span></div>').join('')\n    }\n\n    rankList($('toolList'), data.tools.slice(0, 8), { note: (row) => row.conversion + '%', value: 'total' })\n    rankList($('pageList'), data.pages.slice(0, 8), { label: 'path', value: 'views', note: (row) => row.avgTime ? row.avgTime + ' с' : '' })\n    rankList($('sourceList'), data.sources.slice(0, 6), { label: 'source', note: (row) => row.medium || row.sessions + ' сес.' })\n    rankList($('deviceList'), data.devices.slice(0, 4), { label: 'device' })\n    rankList($('langList'), data.langs.slice(0, 5), { label: 'lang' })\n    chips($('browserChips'), data.browsers, 'browser')\n    chips($('countryChips'), data.countries, 'country')\n    $('toolsHint').textContent = data.tools.length + ' инструментов в периоде'\n  }\n\n  /* ── онлайн ────────────────────────────────────────── */\n\n  async function loadLive(silent) {\n    const ticket = ++seq.live\n    try {\n      const data = await api('/api/live')\n      if (ticket !== seq.live) return\n      $('livePeople').textContent = num(data.people)\n      $('liveSessions').textContent = num(data.sessions)\n      $('liveEvents').textContent = num(data.events)\n      $('livePages').textContent = num(data.pages.length)\n      $('liveLast').textContent = data.recent[0] ? fmtWhen(data.recent[0].ts) : '—'\n      $('navLive').textContent = data.people ? String(data.people) : ''\n      minutesChart($('liveChart'), data.minutes)\n      rankList($('livePageList'), data.pages.slice(0, 10), { label: 'path' })\n      $('liveFeed').innerHTML = data.recent.length ? data.recent.map((row) => {\n        const detail = metaDetail(row)\n        return '<div class=\"feed-row\"><time>' + fmtWhen(row.ts) + '</time>' +\n          '<span><span class=\"chip' + (row.action === 'done' ? ' done' : row.action === 'error' ? ' error' : '') + '\">' +\n          esc(ACTION_LABEL[row.action] || row.action) + '</span></span>' +\n          '<span class=\"what\">' + esc(row.name) + (detail ? ' — ' + esc(detail) : '') +\n          '<small>' + esc(row.path || '/') + ' · ' + esc(row.device || '—') + ' · ' + esc(row.source || '—') + '</small></span></div>'\n      }).join('')\n        : '<p class=\"empty\">Пока тихо.</p>'\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── инструменты ───────────────────────────────────── */\n\n  async function loadTools(silent) {\n    const ticket = ++seq.tools\n    try {\n      const data = await api('/api/stats?days=' + state.toolDays)\n      if (ticket !== seq.tools) return\n      $('toolsPeriod').textContent = 'за ' + fmtNumDays(state.toolDays)\n      const rows = (data.tools || []).slice().sort((a, b) => b.total - a.total)\n      $('toolBody').innerHTML = rows.length ? rows.map((row) =>\n        '<tr><td><b>' + esc(row.name) + '</b></td>' +\n        '<td class=\"num\">' + num(row.total) + '</td>' +\n        '<td class=\"num\">' + num(row.done) + '</td>' +\n        '<td class=\"num\">' + (row.total ? row.conversion + '%' : '—') + '</td>' +\n        '<td class=\"num\">' + num(row.errors) + '</td>' +\n        '<td class=\"num hide-m\">' + (row.avgMs ? fmtDuration(Math.round(row.avgMs / 1000)) : '—') + '</td>' +\n        '<td class=\"num hide-m\">' + fmtWhen(row.last) + '</td></tr>').join('')\n        : '<tr><td colspan=\"7\"><p class=\"empty\">Нет данных за период.</p></td></tr>'\n      const legacy = rows.some((row) => row.legacy)\n      $('toolsNote').hidden = !legacy\n      if (legacy) {\n        $('toolsNote').textContent = 'Открытия до ' + fmtFull(data.quality?.since) +\n          ' писались без сессий: для них конверсия считается по открытиям и готовым файлам.'\n      }\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── аудитория ─────────────────────────────────────── */\n\n  async function loadAudience(silent) {\n    const ticket = ++seq.audience\n    try {\n      const data = await api('/api/stats?days=' + state.days)\n      if (ticket !== seq.audience) return\n      $('pageBody').innerHTML = data.pages.length ? data.pages.map((row) =>\n        '<tr><td class=\"mono\">' + esc(row.path || '/') + '</td>' +\n        '<td class=\"num\">' + num(row.views) + '</td>' +\n        '<td class=\"num\">' + num(row.people) + '</td>' +\n        '<td class=\"num\">' + num(row.entries) + '</td>' +\n        '<td class=\"num\">' + num(row.exits) + '</td>' +\n        '<td class=\"num\">' + fmtDuration(row.avgTime) + '</td>' +\n        '<td class=\"num\">' + (row.avgScroll ? row.avgScroll + '%' : '—') + '</td></tr>').join('')\n        : '<tr><td colspan=\"7\"><p class=\"empty\">Просмотров за период нет.</p></td></tr>'\n      const coverage = data.coverage || { total: 0, devices: 0, countries: 0 }\n      $('audCoverage').textContent = 'Устройство известно у ' + num(coverage.devices) + ' из ' + num(coverage.total) +\n        ' событий, страна — у ' + num(coverage.countries) +\n        '. Старые события писались без этих полей и не искажают разрезы.'\n      rankList($('audSources'), data.sources, { label: 'source', note: (row) => row.medium || row.sessions + ' сес.' })\n      rankList($('audDevices'), data.devices, { label: 'device' })\n      chips($('audBrowsers'), data.browsers, 'browser')\n      chips($('audLangs'), data.langs, 'lang')\n      chips($('audCountries'), data.countries, 'country')\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  /* ── пользователи ──────────────────────────────────── */\n\n  function fmtVisit(ts) {\n    if (!ts) return '—'\n    const date = new Date(ts)\n    const today = new Date()\n    const time = pad(date.getHours()) + ':' + pad(date.getMinutes())\n    if (date.toDateString() === today.toDateString()) return time\n    const day = pad(date.getDate()) + '.' + pad(date.getMonth() + 1) +\n      (date.getFullYear() !== today.getFullYear() ? '.' + String(date.getFullYear()).slice(2) : '')\n    return day + ' ' + time\n  }\n\n  function syncUserFilterButtons() {\n    document.querySelectorAll('#userFilter button').forEach((button) => {\n      button.setAttribute('aria-pressed', button.dataset.userFilter === state.us.filter ? 'true' : 'false')\n    })\n  }\n\n  async function loadUsers(silent) {\n    const ticket = ++seq.users\n    const query = new URLSearchParams({\n      days: state.us.days,\n      filter: state.us.filter,\n      page: String(state.us.page),\n      limit: '25',\n    })\n    if (state.us.q) query.set('q', state.us.q)\n    try {\n      const data = await api('/api/users?' + query)\n      if (ticket !== seq.users) return\n      renderUsers(data)\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  function renderUsers(data) {\n    const s = data.summary || {}\n    $('uPeople').textContent = num(s.people)\n    $('uToday').textContent = num(s.today)\n    $('uWeek').textContent = num(s.week)\n    $('uFresh').textContent = num(s.fresh)\n    $('uReturning').textContent = num(s.returning)\n    $('uConverted').textContent = num(s.converted)\n    $('usCount').textContent = 'найдено ' + num(data.total) + ' · ' +\n      (data.filter === 'all' ? '' : ({ new: 'новые', returning: 'вернувшиеся', done: 'с файлом', error: 'с ошибкой' })[data.filter] + ' · ') +\n      'активность за ' + fmtNumDays(data.days)\n    $('range').textContent = 'активность за ' + fmtNumDays(data.days) + ' · всего ID: ' + num(s.people) +\n      ' · без имён и почты — только анонимные браузеры'\n    syncUserFilterButtons()\n\n    $('userBody').innerHTML = data.rows.length ? data.rows.map((row) =>\n      '<tr><td><b class=\"mono\" style=\"color:var(--ink)\" title=\"' + esc(row.visitor) + '\">' + esc(String(row.visitor).slice(0, 14)) + '</b>' +\n      (row.note ? '<div class=\"mono\" style=\"color:var(--ink-soft)\">заметка: ' + esc(row.note) + '</div>' : '') + '</td>' +\n      '<td class=\"mono\">' + esc(row.source || '—') + (row.country ? ' · ' + esc(row.country) : '') + '</td>' +\n      '<td class=\"mono hide-m\">' + esc(row.device || '—') + ' · ' + esc(row.browser || '—') + '</td>' +\n      '<td class=\"num\">' + num(row.sessions) + '</td>' +\n      '<td class=\"num\">' + num(row.views) + '</td>' +\n      '<td class=\"num\">' + num(row.dones) + '</td>' +\n      '<td class=\"num\">' + (row.errors ? '<span style=\"color:var(--accent)\">' + num(row.errors) + '</span>' : '0') + '</td>' +\n      '<td class=\"mono hide-m\">' + fmtVisit(row.first) + '</td>' +\n      '<td class=\"mono\">' + fmtVisit(row.last) + '</td>' +\n      '<td><button class=\"btn\" type=\"button\" data-open-user=\"' + esc(row.visitor) + '\">Профиль</button></td></tr>').join('')\n      : '<tr><td colspan=\"10\"><p class=\"empty\">За этими фильтрами посетителей нет.</p></td></tr>'\n\n    $('usInfo').textContent = 'всего ' + num(data.total) + ' · страница ' + data.page + ' из ' + data.pages\n    $('usPrev').disabled = data.page <= 1\n    $('usNext').disabled = data.page >= data.pages\n    state.us.page = data.page\n    state.us.pages = data.pages\n\n    document.querySelectorAll('[data-open-user]').forEach((button) => {\n      button.addEventListener('click', () => openUser(button.dataset.openUser))\n    })\n  }\n\n  function closeUser() {\n    state.us.current = ''\n    state.userDeleteArmed = false\n    $('userDrawer').hidden = true\n    $('userBackdrop').hidden = true\n  }\n\n  async function openUser(visitor) {\n    state.us.current = visitor\n    state.userDeleteArmed = false\n    $('userDrawer').hidden = false\n    $('userBackdrop').hidden = false\n    $('udId').textContent = visitor\n    $('udBody').innerHTML = '<p class=\"empty\">Загружаем профиль…</p>'\n    try {\n      const data = await api('/api/user?visitor=' + encodeURIComponent(visitor))\n      if (state.us.current !== visitor) return\n      renderUser(data)\n    } catch (error) {\n      $('udBody').innerHTML = '<p class=\"empty\">' + esc(error.message) + '</p>'\n    }\n  }\n\n  function renderUser(data) {\n    const profile = data.profile\n    const meta = [\n      profile.country, profile.device, profile.browser, profile.os, profile.lang,\n      profile.screen, profile.source,\n    ].filter(Boolean)\n\n    const bySession = new Map()\n    for (const event of data.events.slice().reverse()) {\n      const key = event.session || ''\n      if (!bySession.has(key)) bySession.set(key, [])\n      bySession.get(key).push(event)\n    }\n\n    const sessionRows = data.sessions.length ? data.sessions.map((session) => {\n      // В путь попадают только осмысленные шаги, без «ушёл со страницы».\n      const walk = (bySession.get(session.session) || [])\n        .filter((event) => ['view', 'open', 'done', 'error'].includes(event.action))\n        .filter((event, index, list) => index === 0 ||\n          event.path !== list[index - 1].path || event.action !== list[index - 1].action)\n      const steps = walk.slice(-24).map((event) => {\n        const done = event.action === 'done'\n        const failed = event.action === 'error'\n        const title = (ACTION_LABEL[event.action] || event.action) + ' · ' + event.name +\n          (event.path ? ' · ' + event.path : '')\n        const label = event.path || event.name || '/'\n        return '<span class=\"chip' + (done ? ' done' : failed ? ' error' : '') + '\" title=\"' + esc(title) + '\">' +\n          esc(label) + (done ? ' ✓' : failed ? ' !' : '') + '</span>'\n      }).join('<span class=\"arrow\">→</span>')\n      return '<div class=\"ud-session\"><div class=\"ud-session-head\">' +\n        '<time>' + fmtVisit(session.start) + ' — ' + fmtVisit(session.end) + '</time>' +\n        '<span class=\"chip\">' + num(session.views) + ' просм.</span>' +\n        (session.dones ? '<span class=\"chip done\">' + num(session.dones) + ' файл</span>' : '') +\n        (session.errors ? '<span class=\"chip error\">' + num(session.errors) + ' ошибок</span>' : '') +\n        '<span class=\"note\">' + (session.seconds ? fmtDuration(session.seconds) + ' · ' : '') +\n        num(session.events) + ' событий</span></div>' +\n        (steps ? '<div class=\"ud-steps\">' + steps + '</div>' : '<p class=\"fine\">Событий в этой сессии нет.</p>') +\n        '</div>'\n    }).join('') : '<p class=\"empty\">Сессий не записано.</p>'\n\n    $('udBody').innerHTML =\n      '<div class=\"ud-meta\">' + (meta.length\n        ? meta.map((value) => '<span class=\"chip\">' + esc(value) + '</span>').join('')\n        : '<span class=\"chip muted\">метаданных нет — старые события</span>') + '</div>' +\n      '<div class=\"ud-stats\">' +\n        '<div class=\"ud-stat\"><span>Сессии</span><b>' + num(profile.sessions) + '</b></div>' +\n        '<div class=\"ud-stat\"><span>Просмотры</span><b>' + num(profile.views) + '</b></div>' +\n        '<div class=\"ud-stat\"><span>Файлы</span><b>' + num(profile.dones) + '</b></div>' +\n        '<div class=\"ud-stat\"><span>Ошибки</span><b>' + num(profile.errors) + '</b></div>' +\n        '<div class=\"ud-stat\"><span>Время</span><b>' + fmtDuration(profile.seconds) + '</b></div>' +\n        '<div class=\"ud-stat\"><span>События</span><b>' + num(profile.events) + '</b></div>' +\n      '</div>' +\n      '<p class=\"fine\">Первый визит: ' + fmtVisit(profile.first) + ' · последний: ' + fmtVisit(profile.last) + '</p>' +\n      '<h3>Заметка</h3>' +\n      '<div class=\"ud-note\">' +\n        '<textarea id=\"udNote\" maxlength=\"500\" placeholder=\"Например: написал в поддержку, проверить редактор\">' + esc(data.note) + '</textarea>' +\n        '<div class=\"row-actions\"><span class=\"fine\" id=\"udNoteStamp\">' +\n          (data.note ? 'сохранена ' + fmtVisit(data.noteUpdated) : 'видна только в админке') + '</span>' +\n          '<button class=\"btn\" type=\"button\" id=\"udSaveNote\">Сохранить</button></div>' +\n      '</div>' +\n      '<h3>Путь по сессиям</h3>' + sessionRows +\n      '<div class=\"ud-delete\">' +\n        '<p class=\"fine\">Удаление стирает все события и заметку этого ID из базы. Отменить нельзя.</p>' +\n        '<button class=\"solid danger\" type=\"button\" id=\"udDelete\">Удалить данные посетителя</button>' +\n        '<p class=\"danger-note\" id=\"udDeleteNote\" hidden></p>' +\n      '</div>'\n\n    $('udSaveNote').addEventListener('click', async () => {\n      const button = $('udSaveNote')\n      const note = $('udNote').value\n      button.disabled = true\n      try {\n        await api('/api/user', {\n          method: 'PUT',\n          headers: { 'content-type': 'application/json' },\n          body: JSON.stringify({ visitor: profile.visitor, note }),\n        })\n        toast(note.trim() ? 'Заметка сохранена' : 'Заметка очищена')\n        $('udNoteStamp').textContent = note.trim() ? 'сохранена только что' : 'видна только в админке'\n        loadUsers(true)\n      } catch (error) {\n        toast(error.message, true)\n      } finally {\n        button.disabled = false\n      }\n    })\n\n    $('udDelete').addEventListener('click', async () => {\n      if (!state.userDeleteArmed) {\n        state.userDeleteArmed = true\n        $('udDelete').textContent = 'Точно удалить все данные?'\n        $('udDeleteNote').hidden = false\n        $('udDeleteNote').textContent = 'Будут удалены ' + num(profile.events) + ' событий и заметка. Нажмите ещё раз, чтобы подтвердить.'\n        setTimeout(() => {\n          if (!state.userDeleteArmed) return\n          state.userDeleteArmed = false\n          $('udDelete').textContent = 'Удалить данные посетителя'\n          $('udDeleteNote').hidden = true\n        }, 6000)\n        return\n      }\n      state.userDeleteArmed = false\n      $('udDelete').disabled = true\n      try {\n        const result = await api('/api/user', {\n          method: 'DELETE',\n          headers: { 'content-type': 'application/json' },\n          body: JSON.stringify({ visitor: profile.visitor }),\n        })\n        closeUser()\n        toast('Удалено событий: ' + num(result.removed))\n        await loadUsers(true)\n      } catch (error) {\n        toast(error.message, true)\n        $('udDelete').disabled = false\n      }\n    })\n  }\n\n  /* ── журнал ────────────────────────────────────────── */\n\n  async function loadEvents(silent) {\n    const query = new URLSearchParams({ days: state.ev.days, page: String(state.ev.page), limit: '50' })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.device) query.set('device', state.ev.device)\n    if (state.ev.lang) query.set('lang', state.ev.lang)\n    if (state.ev.q) query.set('q', state.ev.q)\n    const ticket = ++seq.events\n    try {\n      const data = await api('/api/events?' + query)\n      if (ticket !== seq.events) return\n      state.pages = data.pages\n      state.ev.page = data.page\n      $('evBody').innerHTML = data.rows.length ? data.rows.map((row) => {\n        const detail = metaDetail(row)\n        return '<tr><td class=\"time\">' + fmtWhen(row.ts) + '</td>' +\n          '<td><span class=\"chip' + (row.action === 'done' ? ' done' : row.action === 'error' ? ' error' : '') + '\">' +\n          esc(ACTION_LABEL[row.action] || row.action) + '</span></td>' +\n          '<td><b>' + esc(row.name) + '</b>' + (detail ? '<div class=\"mono\">' + esc(detail) + '</div>' : '') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.path || '/') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.source || '—') + (row.medium && row.medium !== 'none' ? ' / ' + esc(row.medium) : '') + '</td>' +\n          '<td class=\"mono hide-m\">' + esc(row.device || '—') + ' · ' + esc(row.browser || '—') + '</td>' +\n          '<td class=\"mono hide-m\" title=\"' + esc(row.visitor) + '\">' + esc(String(row.session || '—').slice(0, 10)) + '</td></tr>'\n      }).join('') : '<tr><td colspan=\"7\"><p class=\"empty\">Событий за этими фильтрами нет.</p></td></tr>'\n      $('evInfo').textContent = 'всего ' + num(data.total) + ' · страница ' + data.page + ' из ' + data.pages\n      $('evPrev').disabled = data.page <= 1\n      $('evNext').disabled = data.page >= data.pages\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      if (!silent) toast(error.message, true)\n    }\n  }\n\n  function applyEventsFilter(immediate) {\n    clearTimeout(state.searchTimer)\n    const run = () => {\n      state.ev.q = $('evSearch').value.trim()\n      state.ev.page = 1\n      loadEvents(false)\n    }\n    if (immediate) run()\n    else state.searchTimer = setTimeout(run, 350)\n  }\n\n  /* ── настройки ─────────────────────────────────────── */\n\n  async function loadSettings() {\n    try {\n      const [settings, log, health, stats] = await Promise.all([\n        api('/api/settings'),\n        api('/api/audit?limit=25'),\n        api('/api/health'),\n        api('/api/stats?days=3650'),\n      ])\n      $('retention').value = settings.retentionDays\n      $('purgeDays').value = settings.retentionDays\n      $('settingsStamp').textContent = 'Хранение: ' + fmtNumDays(Number(settings.retentionDays)) +\n        ' · событий: ' + num(settings.events)\n      $('dbStamp').textContent = 'Событий: ' + num(settings.events) +\n        ' · сессий: ' + num(settings.sessions) + ' · людей: ' + num(settings.people)\n      const quality = stats.quality || { tracked: 0, legacy: 0, since: 0 }\n      $('dataStamp').textContent = 'Новый сбор: ' + num(quality.tracked) + ' событий' +\n        (quality.since ? ' с ' + fmtFull(quality.since) : '') +\n        ' · старых без устройства и страны: ' + num(quality.legacy)\n      $('audit').innerHTML = (log.rows || []).length ? log.rows.map((row) =>\n        '<div class=\"audit-row\"><time>' + fmtWhen(row.at) + '</time><span><b>' + esc(row.action) + '</b>' +\n        (row.detail ? '<small style=\"display:block;color:var(--muted)\">' + esc(row.detail) + '</small>' : '') + '</span></div>').join('')\n        : '<p class=\"empty\">Журнал пуст.</p>'\n      $('health').innerHTML =\n        '<div class=\"audit-row\"><time>события</time><span><b>' + num(health.events) + '</b><small style=\"display:block;color:var(--muted)\">записей в D1</small></span></div>' +\n        '<div class=\"audit-row\"><time>аудит</time><span><b>' + num(health.audit) + '</b><small style=\"display:block;color:var(--muted)\">действий владельца</small></span></div>' +\n        '<div class=\"audit-row\"><time>вход</time><span><b>открытый</b><small style=\"display:block;color:var(--muted)\">без токена и ключей</small></span></div>' +\n        '<div class=\"audit-row\"><time>сервер</time><span><b>ok</b><small style=\"display:block;color:var(--muted)\">' + fmtWhen(health.now) + '</small></span></div>'\n      $('stamp').textContent = 'обновлено ' + fmtWhen(Date.now())\n    } catch (error) {\n      toast(error.message, true)\n    }\n  }\n\n  /* ── CSV ───────────────────────────────────────────── */\n\n  async function downloadCsv() {\n    const button = $('csv')\n    const label = button.textContent\n    const query = new URLSearchParams({ days: state.ev.days })\n    if (state.ev.action) query.set('action', state.ev.action)\n    if (state.ev.device) query.set('device', state.ev.device)\n    if (state.ev.lang) query.set('lang', state.ev.lang)\n    if (state.ev.q) query.set('q', state.ev.q)\n    button.disabled = true\n    button.textContent = 'Готовим…'\n    try {\n      const response = await fetch('/api/export.csv?' + query, { credentials: 'same-origin' })\n      if (!response.ok) {\n        const data = await response.json().catch(() => ({}))\n        throw new Error(data.error || 'Не удалось выгрузить CSV')\n      }\n      const disposition = response.headers.get('content-disposition') || ''\n      const match = disposition.match(/filename=\"([^\"]+)\"/)\n      const blob = await response.blob()\n      const url = URL.createObjectURL(blob)\n      const link = document.createElement('a')\n      link.href = url\n      link.download = match ? match[1] : 'congix-docs-stats.csv'\n      document.body.appendChild(link)\n      link.click()\n      link.remove()\n      setTimeout(() => URL.revokeObjectURL(url), 5000)\n      toast('CSV готов')\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      button.disabled = false\n      button.textContent = label\n    }\n  }\n\n  /* ── вкладки и обновление ──────────────────────────── */\n\n  function loadActive(silent) {\n    if (state.tab === 'overview') return loadOverview(silent)\n    if (state.tab === 'live') return loadLive(silent)\n    if (state.tab === 'tools') return loadTools(silent)\n    if (state.tab === 'audience') return loadAudience(silent)\n    if (state.tab === 'users') return loadUsers(silent)\n    if (state.tab === 'events') return loadEvents(silent)\n    return loadSettings()\n  }\n\n  function setTab(tab, push) {\n    const next = TITLES[tab] ? tab : 'overview'\n    state.tab = next\n    document.querySelectorAll('.nav button').forEach((button) => {\n      button.setAttribute('aria-current', button.dataset.tab === next ? 'page' : 'false')\n    })\n    $('viewOverview').hidden = next !== 'overview'\n    $('viewLive').hidden = next !== 'live'\n    $('viewTools').hidden = next !== 'tools'\n    $('viewAudience').hidden = next !== 'audience'\n    $('viewUsers').hidden = next !== 'users'\n    $('viewEvents').hidden = next !== 'events'\n    $('viewSettings').hidden = next !== 'settings'\n    $('eyebrow').textContent = TITLES[next][0]\n    $('title').innerHTML = TITLES[next][1]\n    syncPeriodButtons()\n    syncToolDaysButtons()\n    if (push !== false) location.hash = '#/' + next\n    if (next === 'live') {\n      clearInterval(state.liveTimer)\n      state.liveTimer = setInterval(() => {\n        if (!document.hidden) loadLive(true)\n      }, 10000)\n    } else {\n      clearInterval(state.liveTimer)\n      state.liveTimer = null\n    }\n    loadActive(false)\n  }\n\n  document.querySelectorAll('.nav button').forEach((button) => {\n    button.addEventListener('click', () => setTab(button.dataset.tab))\n  })\n\n  $('refresh').addEventListener('click', () => loadActive(false))\n  $('csv').addEventListener('click', downloadCsv)\n\n  function syncPeriodButtons() {\n    document.querySelectorAll('#periodSeg button').forEach((button) => {\n      button.setAttribute('aria-pressed', Number(button.dataset.days) === state.days ? 'true' : 'false')\n    })\n  }\n\n  document.querySelectorAll('#periodSeg button').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.days = Number(button.dataset.days)\n      document.querySelectorAll('#periodSeg button').forEach((item) => {\n        item.setAttribute('aria-pressed', item === button ? 'true' : 'false')\n      })\n      if (state.tab === 'overview') loadOverview(false)\n      else if (state.tab === 'audience') loadAudience(false)\n    })\n  })\n\n  function syncToolDaysButtons() {\n    document.querySelectorAll('[data-days-tools]').forEach((button) => {\n      button.setAttribute('aria-pressed', Number(button.dataset.daysTools) === state.toolDays ? 'true' : 'false')\n    })\n  }\n\n  document.querySelectorAll('[data-days-tools]').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.toolDays = Number(button.dataset.daysTools)\n      syncToolDaysButtons()\n      loadTools(false)\n    })\n  })\n\n  document.querySelectorAll('#userFilter button').forEach((button) => {\n    button.addEventListener('click', () => {\n      state.us.filter = button.dataset.userFilter\n      state.us.page = 1\n      syncUserFilterButtons()\n      loadUsers(false)\n    })\n  })\n\n  $('usDays').addEventListener('change', () => {\n    state.us.days = $('usDays').value\n    state.us.page = 1\n    loadUsers(false)\n  })\n\n  $('usSearch').addEventListener('input', () => {\n    clearTimeout(state.usTimer)\n    state.usTimer = setTimeout(() => {\n      state.us.q = $('usSearch').value.trim()\n      state.us.page = 1\n      loadUsers(false)\n    }, 350)\n  })\n  $('usSearch').addEventListener('keydown', (event) => {\n    if (event.key === 'Enter') {\n      state.us.q = $('usSearch').value.trim()\n      state.us.page = 1\n      loadUsers(false)\n    }\n    if (event.key === 'Escape') {\n      $('usSearch').value = ''\n      state.us.q = ''\n      state.us.page = 1\n      loadUsers(false)\n    }\n  })\n  $('usPrev').addEventListener('click', () => {\n    if (state.us.page > 1) { state.us.page -= 1; loadUsers(false) }\n  })\n  $('usNext').addEventListener('click', () => {\n    if (state.us.page < state.us.pages) { state.us.page += 1; loadUsers(false) }\n  })\n\n  $('udClose').addEventListener('click', closeUser)\n  $('userBackdrop').addEventListener('click', closeUser)\n\n  $('evDays').addEventListener('change', () => { state.ev.days = $('evDays').value; state.ev.page = 1; loadEvents(false) })\n  $('evAction').addEventListener('change', () => { state.ev.action = $('evAction').value; state.ev.page = 1; loadEvents(false) })\n  $('evDevice').addEventListener('change', () => { state.ev.device = $('evDevice').value; state.ev.page = 1; loadEvents(false) })\n  $('evLang').addEventListener('change', () => { state.ev.lang = $('evLang').value; state.ev.page = 1; loadEvents(false) })\n  $('evSearch').addEventListener('input', () => applyEventsFilter(false))\n  $('evSearch').addEventListener('keydown', (event) => {\n    if (event.key === 'Enter') applyEventsFilter(true)\n    if (event.key === 'Escape') { $('evSearch').value = ''; applyEventsFilter(true) }\n  })\n  $('evReset').addEventListener('click', () => {\n    $('evSearch').value = ''\n    $('evDays').value = '7'\n    $('evAction').value = ''\n    $('evDevice').value = ''\n    $('evLang').value = ''\n    state.ev = { days: '7', action: '', device: '', lang: '', q: '', page: 1 }\n    loadEvents(false)\n  })\n  $('evPrev').addEventListener('click', () => {\n    if (state.ev.page > 1) { state.ev.page -= 1; loadEvents(false) }\n  })\n  $('evNext').addEventListener('click', () => {\n    if (state.ev.page < state.pages) { state.ev.page += 1; loadEvents(false) }\n  })\n  $('autoRefresh').addEventListener('change', () => { state.auto = $('autoRefresh').checked })\n\n  $('saveSettings').addEventListener('click', () => {\n    const value = Number($('retention').value)\n    if (!Number.isFinite(value) || value < 0 || value > 3650) {\n      toast('Срок хранения — от 0 до 3650 дней', true)\n      return\n    }\n    const button = $('saveSettings')\n    button.disabled = true\n    api('/api/settings', {\n      method: 'PUT',\n      headers: { 'content-type': 'application/json' },\n      body: JSON.stringify({ retentionDays: value }),\n    })\n      .then(() => { toast('Настройки сохранены'); loadSettings() })\n      .catch((error) => toast(error.message, true))\n      .finally(() => { button.disabled = false })\n  })\n\n  $('purge').addEventListener('click', async () => {\n    const days = Number($('purgeDays').value)\n    if (!Number.isFinite(days) || days < 0 || days > 3650) {\n      toast('Укажите число дней от 0 до 3650', true)\n      return\n    }\n    if (!state.purgeArmed) {\n      state.purgeArmed = true\n      $('purge').textContent = 'Точно удалить?'\n      $('purgeNote').hidden = false\n      $('purgeNote').textContent = days === 0\n        ? 'Будут удалены все события. Нажмите кнопку ещё раз, чтобы подтвердить.'\n        : 'Будут удалены события старше ' + days + ' дн. Нажмите кнопку ещё раз, чтобы подтвердить.'\n      setTimeout(() => {\n        if (!state.purgeArmed) return\n        state.purgeArmed = false\n        $('purge').textContent = 'Удалить'\n        $('purgeNote').hidden = true\n      }, 8000)\n      return\n    }\n    state.purgeArmed = false\n    $('purge').textContent = 'Удалить'\n    $('purgeNote').hidden = true\n    $('purge').disabled = true\n    try {\n      const data = await api('/api/purge', {\n        method: 'POST',\n        headers: { 'content-type': 'application/json' },\n        body: JSON.stringify({ days }),\n      })\n      toast('Удалено событий: ' + num(data.removed))\n      await loadSettings()\n      await loadActive(true)\n    } catch (error) {\n      toast(error.message, true)\n    } finally {\n      $('purge').disabled = false\n    }\n  })\n\n  document.addEventListener('keydown', (event) => {\n    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)\n    if (event.key === '/' && !typing) {\n      event.preventDefault()\n      if (state.tab === 'users') {\n        $('usSearch').focus()\n        return\n      }\n      if (state.tab !== 'events') setTab('events')\n      $('evSearch').focus()\n    }\n    if (event.key === 'Escape' && state.us.current) closeUser()\n    if ((event.key === 'r' || event.key === 'R') && !typing && !event.metaKey && !event.ctrlKey) {\n      loadActive(false)\n    }\n  })\n\n  window.addEventListener('hashchange', () => {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    if (tab !== state.tab) setTab(tab, false)\n  })\n\n  /* ── старт ─────────────────────────────────────────── */\n\n  function boot() {\n    const tab = (location.hash.replace('#/', '') || 'overview').trim()\n    const initial = TITLES[tab] ? tab : 'overview'\n    syncPeriodButtons()\n    syncToolDaysButtons()\n    syncUserFilterButtons()\n    setTab(initial, false)\n    state.timer = setInterval(() => {\n      if (state.auto && !document.hidden && state.tab !== 'settings') loadActive(true)\n    }, 60000)\n  }\n\n  boot()\n})()\n</script>\n</body>\n</html>\n"

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
