/**
 * Кладёт движок OCR (воркер и ядро WASM) в public/tesseract.
 *
 * Раньше tesseract.js тянул их с cdn.jsdelivr.net, а он в некоторых сетях
 * блокируется — распознавание не запускалось вообще. Теперь эти файлы
 * отдаются с нашего же домена и ни от какого CDN не зависят.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'public/tesseract')

const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
]

await mkdir(out, { recursive: true })

for (const [from, to] of files) {
  const source = resolve(root, from)
  const target = resolve(out, to)
  try {
    const [a, b] = await Promise.all([stat(source), stat(target).catch(() => null)])
    if (b && b.size === a.size) continue
    await copyFile(source, target)
    console.log(`tesseract: ${to} (${Math.round(a.size / 1024)} КБ)`)
  } catch (error) {
    console.warn(`tesseract: не удалось скопировать ${from} — ${error.message}`)
  }
}
