/**
 * Собирает admin/worker.js из серверной части (server.js) и страницы (page.html).
 * Страница встраивается строкой, поэтому деплой остаётся одним модулем.
 *
 * Запуск: node admin/build.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const page = readFileSync(join(here, 'page.html'), 'utf8')
const server = readFileSync(join(here, 'server.js'), 'utf8')

const banner = `// Сгенерировано: node admin/build.mjs. Правьте page.html и server.js, не этот файл.\n`
const worker = `${banner}const PAGE = ${JSON.stringify(page)}\n\n${server}`
writeFileSync(join(here, 'worker.js'), worker)
console.log(`admin/worker.js: ${worker.length} байт (страница ${page.length} байт)`)
