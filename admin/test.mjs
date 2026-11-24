/**
 * Проверка админки без Cloudflare: настоящий worker.js + D1-совместимая обёртка
 * над node:sqlite. Покрывает вход, сессию, сбор событий, сводку, журнал, CSV,
 * настройки, очистку и аудит.
 *
 * Запуск: node admin/build.mjs && node admin/test.mjs
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import worker from './worker.js'

/* ── D1-совместимая обёртка ──────────────────────────────── */

class Statement {
  constructor(db, sql, args = []) {
    this.db = db
    this.sql = sql
    this.args = args
  }

  bind(...args) {
    return new Statement(this.db, this.sql, args)
  }

  first() {
    const row = this.db.prepare(this.sql).get(...this.args)
    return row ?? null
  }

  all() {
    return { results: this.db.prepare(this.sql).all(...this.args) }
  }

  run() {
    const result = this.db.prepare(this.sql).run(...this.args)
    return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }
  }
}

function makeD1() {
  const db = new DatabaseSync(':memory:')
  return { prepare: (sql) => new Statement(db, sql), raw: db }
}

const env = { DB: makeD1(), ADMIN_TOKEN: 'test-token-0123456789' }
const origin = 'https://admin.test'
const siteOrigin = 'https://rekpdf-ircn71.freebuff.site'

let cookie = ''

function call(path, init = {}) {
  const headers = new Headers(init.headers ?? {})
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  if (cookie && !headers.has('cookie')) headers.set('cookie', cookie)
  return worker.fetch(new Request(origin + path, { ...init, headers }), env)
}

async function login(token = env.ADMIN_TOKEN) {
  const response = await worker.fetch(
    new Request(origin + '/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    }),
    env,
  )
  const setCookie = response.headers.get('set-cookie') ?? ''
  return { response, setCookie }
}

const checks = []
function check(name, run) {
  checks.push({ name, run })
}

/* ── сценарии ────────────────────────────────────────────── */

check('страница панели отдаётся и её скрипт синтаксически цел', async () => {
  const response = await call('/')
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.match(html, /Congix Docs · админка/)
  assert.match(response.headers.get('content-type'), /text\/html/)
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
  assert.equal(scripts.length, 1, 'ожидается один встроенный скрипт')
  new Function(scripts[0]) // бросит при синтаксической ошибке
  assert.ok(html.includes('events'), 'в разметке есть журнал событий')
})

check('без входа панель закрыта', async () => {
  const session = await call('/api/session')
  assert.equal(session.status, 401)
  const stats = await call('/api/stats')
  assert.equal(stats.status, 401)
  const events = await call('/api/events')
  assert.equal(events.status, 401)
})

check('неверный ключ отклоняется', async () => {
  const { response } = await login('wrong-token')
  assert.equal(response.status, 401)
  assert.match((await response.json()).error, /Неверный/)
})

check('верный ключ выдаёт HttpOnly-сессию', async () => {
  const { response, setCookie } = await login()
  assert.equal(response.status, 200)
  assert.match(setCookie, /rekpdf_admin=/)
  assert.match(setCookie, /HttpOnly/)
  assert.match(setCookie, /SameSite=Strict/)
  assert.match(setCookie, /Max-Age=43200/)
  cookie = setCookie.split(';')[0]
})

check('сессия опознаётся, подделка — нет', async () => {
  const session = await call('/api/session')
  assert.equal(session.status, 200)
  assert.equal((await session.json()).authenticated, true)

  const forged = await worker.fetch(
    new Request(origin + '/api/session', { headers: { cookie: 'rekpdf_admin=9999999999999.deadbeef' } }),
    env,
  )
  assert.equal(forged.status, 401)
})

check('события собираются только со своих источников', async () => {
  const bad = await call('/api/collect', {
    method: 'POST',
    headers: { Origin: 'https://evil.example' },
    body: JSON.stringify({ name: 'x', action: 'view' }),
  })
  assert.equal(bad.status, 403)

  const events = [
    { name: 'Редактор PDF', action: 'open', path: '/editor', visitor: 'visitor-aaa' },
    { name: 'Редактор PDF', action: 'done', path: '/editor', visitor: 'visitor-aaa' },
    { name: 'PDF в Word', action: 'open', path: '/pdf-v-word', visitor: 'visitor-bbb' },
    { name: 'Главная', action: 'view', path: '/', visitor: 'visitor-ccc' },
  ]
  for (const event of events) {
    const response = await call('/api/collect', {
      method: 'POST',
      headers: { Origin: siteOrigin },
      body: JSON.stringify(event),
    })
    assert.equal(response.status, 204)
  }
})

check('публичный свод считает людей и события', async () => {
  const response = await worker.fetch(new Request(origin + '/api/overview'), env)
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.people, 3)
  assert.equal(data.today, 4)
  assert.ok(Array.isArray(data.tools))
})

check('сводка отдаёт KPI и разбивки за период', async () => {
  const response = await call('/api/stats?days=14')
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.totals.events, 4)
  assert.equal(data.totals.people, 3)
  assert.equal(data.totals.today, 4)
  assert.equal(data.tools.length, 2)
  assert.equal(data.tools[0].name, 'Редактор PDF')
  assert.equal(data.tools[0].total, 1)
  assert.equal(data.tools[0].done, 1)
  assert.ok(data.days.length >= 1)
  assert.equal(data.settings.retentionDays, 90)

  const empty = await call('/api/stats?days=' + 3650)
  assert.equal(empty.status, 200)
})

check('журнал фильтруется и делится на страницы', async () => {
  const open = await call('/api/events?days=7&action=open')
  const openData = await open.json()
  assert.equal(openData.total, 2)
  assert.ok(openData.rows.every((row) => row.action === 'open'))

  const search = await call('/api/events?days=7&q=' + encodeURIComponent('word'))
  const searchData = await search.json()
  assert.equal(searchData.total, 1)
  assert.equal(searchData.rows[0].name, 'PDF в Word')

  const paged = await call('/api/events?days=7&limit=10&page=2')
  const pagedData = await paged.json()
  assert.equal(pagedData.total, 4)
  assert.equal(pagedData.pages, 1)
  assert.equal(pagedData.page, 2)
  assert.equal(pagedData.rows.length, 0)

  const visitor = await call('/api/events?days=7&q=visitor-ccc')
  assert.equal((await visitor.json()).total, 1)
})

check('CSV выгружается с BOM и понятными подписями', async () => {
  const response = await call('/api/export.csv?days=7')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/csv/)
  assert.match(response.headers.get('content-disposition'), /congix-docs-stats-7d/)
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf], 'файл начинается с BOM для Excel')
  const text = new TextDecoder().decode(bytes) // BOM съедается, дальше проверяем содержимое
  assert.match(text, /Инструмент;Действие/)
  assert.match(text, /получил файл/)
  assert.equal(text.trim().split('\r\n').length, 5)
})

check('настройки читаются и сохраняются', async () => {
  const before = await call('/api/settings')
  assert.equal((await before.json()).retentionDays, 90)

  const saved = await call('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ retentionDays: 30 }),
  })
  assert.equal(saved.status, 200)
  assert.equal((await saved.json()).retentionDays, 30)

  const rejected = await call('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ retentionDays: 5000 }),
  })
  assert.equal(rejected.status, 400)
})

check('мутация с чужого Origin отклоняется', async () => {
  const response = await call('/api/settings', {
    method: 'PUT',
    headers: { Origin: 'https://evil.example' },
    body: JSON.stringify({ retentionDays: 7 }),
  })
  assert.equal(response.status, 403)
})

check('очистка удаляет события и пишет аудит', async () => {
  const response = await call('/api/purge', { method: 'POST', body: JSON.stringify({ days: 0 }) })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).removed, 4)

  const stats = await (await call('/api/stats?days=14')).json()
  assert.equal(stats.totals.events, 0)

  const audit = await (await call('/api/audit')).json()
  const actions = audit.rows.map((row) => row.action)
  assert.ok(actions.includes('вход'))
  assert.ok(actions.includes('настройки'))
  assert.ok(actions.includes('выгрузка CSV'))
  assert.ok(actions.includes('очистка'))
})

check('выход закрывает сессию', async () => {
  const response = await call('/api/logout', { method: 'POST' })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/)
  cookie = ''
  const session = await call('/api/session')
  assert.equal(session.status, 401)
})

/* ── прогон ──────────────────────────────────────────────── */

let failed = 0
for (const { name, run } of checks) {
  try {
    await run()
    console.log('  ✓ ' + name)
  } catch (error) {
    failed += 1
    console.error('  ✗ ' + name + '\n    ' + (error?.stack ?? error))
  }
}

console.log(`\n${checks.length - failed}/${checks.length} проверок прошло`)
if (failed) process.exitCode = 1
