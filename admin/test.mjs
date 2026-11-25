/**
 * Проверка админки без Cloudflare: настоящий worker.js + D1-совместимая обёртка
 * над node:sqlite. Покрывает открытый вход, сбор обогащённых событий, сводку,
 * live-режим, журнал с фильтрами, CSV, настройки, очистку и аудит.
 *
 * Запуск: node admin/build.mjs && node admin/test.mjs
 */

import assert from 'node:assert/strict'
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

const env = { DB: makeD1() }
const origin = 'https://admin.test'
const siteOrigin = 'https://rekpdf-ircn71.freebuff.site'

function call(path, init = {}) {
  const headers = new Headers(init.headers ?? {})
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
  return worker.fetch(new Request(origin + path, { ...init, headers }), env)
}

const checks = []
function check(name, run) {
  checks.push({ name, run })
}

/* ── сценарии ────────────────────────────────────────────── */

check('страница панели отдаётся, скрипт цел и без токена', async () => {
  const response = await call('/')
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.match(html, /Congix Docs · админка/)
  assert.match(response.headers.get('content-type'), /text\/html/)
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
  assert.equal(scripts.length, 1, 'ожидается один встроенный скрипт')
  new Function(scripts[0])
  assert.ok(!html.includes('ADMIN_TOKEN'), 'на странице нет поля для токена')
  for (const tab of ['overview', 'live', 'tools', 'audience', 'events', 'settings']) {
    assert.ok(html.includes('data-tab="' + tab + '"'), 'есть вкладка ' + tab)
  }
})

check('вход открыт без токена и ключей', async () => {
  const session = await call('/api/session')
  assert.equal(session.status, 200)
  assert.deepEqual(await session.json(), { authenticated: true, open: true })
  assert.equal((await call('/api/stats')).status, 200)
  assert.equal((await call('/api/events')).status, 200)
  assert.equal((await call('/api/live')).status, 200)
  assert.equal((await call('/api/login', { method: 'POST' })).status, 200)
})

check('события принимаются только со своих источников и с известным действием', async () => {
  const badOrigin = await call('/api/collect', {
    method: 'POST',
    headers: { Origin: 'https://evil.example' },
    body: JSON.stringify({ name: 'x', action: 'view' }),
  })
  assert.equal(badOrigin.status, 403)

  const badAction = await call('/api/collect', {
    method: 'POST',
    headers: { Origin: siteOrigin },
    body: JSON.stringify({ name: 'x', action: 'drop-tables' }),
  })
  assert.equal(badAction.status, 400)

  const events = [
    {
      name: 'Главная', action: 'view', path: '/', visitor: 'visitor-aaa', session: 'sess-aaa',
      ref: 'google.com', source: 'google', medium: 'organic', lang: 'ru', device: 'desktop',
      browser: 'Chrome', os: 'Windows', screen: '1920x1080', country: 'UZ',
      meta: { title: 'главная' },
    },
    {
      name: 'PDF в Word', action: 'open', path: '/tools', visitor: 'visitor-aaa', session: 'sess-aaa',
      source: 'google', medium: 'organic', lang: 'ru', device: 'desktop', browser: 'Chrome', country: 'UZ',
    },
    {
      name: 'PDF в Word', action: 'done', path: '/tools', visitor: 'visitor-aaa', session: 'sess-aaa',
      source: 'google', medium: 'organic', lang: 'ru', device: 'desktop', browser: 'Chrome', country: 'UZ',
      duration: 47,
    },
    {
      name: 'Главная', action: 'leave', path: '/', visitor: 'visitor-aaa', session: 'sess-aaa',
      lang: 'ru', device: 'desktop', browser: 'Chrome', country: 'UZ', duration: 40,
      meta: { seconds: 40 },
    },
    {
      name: 'Редактор PDF', action: 'error', path: '/editor', visitor: 'visitor-bbb', session: 'sess-bbb',
      source: 'telegram', medium: 'social', lang: 'en', device: 'mobile', browser: 'Safari', os: 'iOS', country: 'RU',
      meta: { message: 'PDF повреждён' },
    },
    {
      name: 'Редактор PDF', action: 'open', path: '/editor', visitor: 'visitor-bbb', session: 'sess-bbb',
      source: 'telegram', medium: 'social', lang: 'en', device: 'mobile', browser: 'Safari', os: 'iOS', country: 'RU',
    },
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
  assert.equal(data.people, 2)
  assert.equal(data.today, 6)
  assert.ok(Array.isArray(data.tools))
})

check('сводка отдаёт KPI, воронку, разрезы и ошибки', async () => {
  const response = await call('/api/stats?days=14')
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.totals.events, 6)
  assert.equal(data.totals.people, 2)
  assert.equal(data.totals.sessions, 2)
  assert.equal(data.totals.errors, 1)
  assert.equal(data.totals.avgDuration, 40)
  assert.equal(data.funnel.views, 1)
  assert.equal(data.funnel.opens, 2)
  assert.equal(data.funnel.dones, 1)
  assert.equal(data.tools.length, 2)
  assert.equal(data.tools.find((tool) => tool.name === 'PDF в Word').done, 1)
  assert.equal(data.pages.length, 1)
  assert.equal(data.devices.length, 2)
  assert.equal(data.langs.length, 2)
  assert.equal(data.countries.length, 2)
  assert.equal(data.sources.length, 3)
  assert.equal(data.errors.length, 1)
  assert.match(data.errors[0].meta, /PDF повреждён/)
  assert.ok(data.series.length >= 1)

  const empty = await call('/api/stats?days=' + 3650)
  assert.equal(empty.status, 200)
})

check('live показывает людей и последние события за 5 минут', async () => {
  const response = await call('/api/live')
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.people, 2)
  assert.equal(data.sessions, 2)
  assert.equal(data.events, 6)
  assert.ok(data.pages.length >= 2)
  assert.equal(data.recent.length, 6)
  assert.ok(data.minutes.length >= 1)
  assert.equal(data.recent[0].session, 'sess-bbb')
})

check('журнал фильтруется по действию, устройству, языку и поиску', async () => {
  const open = await call('/api/events?days=7&action=open')
  const openData = await open.json()
  assert.equal(openData.total, 2)
  assert.ok(openData.rows.every((row) => row.action === 'open'))

  const errors = await call('/api/events?days=7&action=error')
  const errorData = await errors.json()
  assert.equal(errorData.total, 1)
  assert.equal(errorData.rows[0].browser, 'Safari')

  const mobile = await call('/api/events?days=7&device=mobile')
  assert.equal((await mobile.json()).total, 2)

  const english = await call('/api/events?days=7&lang=en')
  assert.equal((await english.json()).total, 2)

  const search = await call('/api/events?days=7&q=' + encodeURIComponent('word'))
  const searchData = await search.json()
  assert.equal(searchData.total, 2)
  assert.equal(searchData.rows[0].name, 'PDF в Word')

  const bySession = await call('/api/events?days=7&q=sess-aaa')
  assert.equal((await bySession.json()).total, 4)

  const paged = await call('/api/events?days=7&limit=10&page=2')
  const pagedData = await paged.json()
  assert.equal(pagedData.total, 6)
  assert.equal(pagedData.pages, 1)
  assert.equal(pagedData.rows.length, 0)
})

check('CSV выгружается с BOM, новыми колонками и подписями', async () => {
  const response = await call('/api/export.csv?days=7')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/csv/)
  assert.match(response.headers.get('content-disposition'), /congix-docs-stats-7d/)
  const bytes = new Uint8Array(await response.arrayBuffer())
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf], 'файл начинается с BOM для Excel')
  const text = new TextDecoder().decode(bytes)
  assert.match(text, /Действие;Инструмент;Страница;Источник/)
  assert.match(text, /получил файл/)
  assert.match(text, /sess-bbb/)
  assert.equal(text.trim().split('\r\n').length, 7)
})

check('настройки читаются и сохраняются', async () => {
  const before = await call('/api/settings')
  const beforeData = await before.json()
  assert.equal(beforeData.retentionDays, 90)
  assert.equal(beforeData.events, 6)
  assert.equal(beforeData.sessions, 2)
  assert.equal(beforeData.people, 2)

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
  assert.equal((await response.json()).removed, 6)

  const stats = await (await call('/api/stats?days=14')).json()
  assert.equal(stats.totals.events, 0)

  const audit = await (await call('/api/audit')).json()
  const actions = audit.rows.map((row) => row.action)
  assert.ok(actions.includes('настройки'))
  assert.ok(actions.includes('выгрузка CSV'))
  assert.ok(actions.includes('очистка'))
  assert.ok(!actions.includes('вход'))
})

check('выход не закрывает открытую панель, health сообщает open', async () => {
  const response = await call('/api/logout', { method: 'POST' })
  assert.equal(response.status, 200)
  const session = await call('/api/session')
  assert.equal(session.status, 200)
  assert.equal((await session.json()).authenticated, true)

  const health = await (await call('/api/health')).json()
  assert.equal(health.ok, true)
  assert.equal(health.auth, 'open')
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
