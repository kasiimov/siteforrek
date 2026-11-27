/** Распознавание текста (OCR) прямо в браузере: tesseract.js, без загрузки файла на сервер. */

export type OcrLine = {
  text: string
  x: number
  y: number
  width: number
  height: number
}

type RawWord = { text: string; confidence?: number; bbox: { x0: number; y0: number; x1: number; y1: number } }

/** Ниже этого доверия Tesseract обычно выдаёт мусор из теней и фона. */
const MIN_WORD_CONFIDENCE = 35

export const OCR_LANGS = [
  { value: 'rus+eng', label: 'Русский + English' },
  { value: 'eng', label: 'English' },
  { value: 'uzb+rus', label: "O'zbekcha + Русский" },
] as const

export type OcrLang = (typeof OCR_LANGS)[number]['value']

/** Слова собираем в строки: так их удобнее править в редакторе. */
export function groupWords(words: RawWord[], scale: number): OcrLine[] {
  const rows: { top: number; height: number; words: RawWord[] }[] = []

  for (const word of words) {
    if (!word.text.trim()) continue
    if (typeof word.confidence === 'number' && word.confidence < MIN_WORD_CONFIDENCE) continue
    const height = word.bbox.y1 - word.bbox.y0
    const row = rows.find(
      (candidate) =>
        Math.abs(candidate.top + candidate.height / 2 - (word.bbox.y0 + height / 2)) <= Math.max(4, height * 0.6),
    )
    if (row) {
      row.words.push(word)
      row.top = Math.min(row.top, word.bbox.y0)
      row.height = Math.max(row.height, height)
    } else {
      rows.push({ top: word.bbox.y0, height, words: [word] })
    }
  }

  const lines: OcrLine[] = []

  for (const row of rows.sort((a, b) => a.top - b.top)) {
    const sorted = [...row.words].sort((a, b) => a.bbox.x0 - b.bbox.x0)
    let text = ''
    let previousRight: number | null = null

    for (const word of sorted) {
      // Tesseract отдаёт отдельные слова без пробелов: между ними пробел ставим сами.
      if (previousRight !== null) text += ' '
      text += word.text.trim()
      previousRight = word.bbox.x1
    }

    const left = Math.min(...sorted.map((word) => word.bbox.x0))
    const right = Math.max(...sorted.map((word) => word.bbox.x1))
    if (right - left < 2) continue

    lines.push({
      text: text.trim(),
      x: left / scale,
      y: (row.top - row.height * 0.12) / scale,
      width: (right - left) / scale,
      height: (row.height * 1.2) / scale,
    })
  }

  return lines.filter((line) => line.text.length > 1)
}

/**
 * Откуда берём части OCR.
 *
 * Воркер и ядро WASM лежат на нашем домене (public/tesseract) — раньше они
 * грузились с cdn.jsdelivr.net, а он в части сетей блокируется, и распознавание
 * падало с ошибкой ещё до старта. Языковые данные (несколько мегабайт) держим
 * на публичных зеркалах и перебираем их по очереди.
 */
type OcrAttempt = {
  workerPath?: string
  corePath?: string
  langPath?: string
}

const LOCAL_WORKER = () => new URL('tesseract/worker.min.js', document.baseURI).href
const LOCAL_CORE = () => new URL('tesseract/tesseract-core-simd-lstm.wasm.js', document.baseURI).href

const OCR_ATTEMPTS: OcrAttempt[] = [
  // Полные модели: точнее «быстрых», поэтому идут первыми.
  { langPath: 'https://tessdata.projectnaptha.com/4.0.0' },
  { langPath: 'https://raw.githack.com/naptha/tessdata/gh-pages/4.0.0' },
  // Если полные не скачались — быстрые: пара языков весит ~3–5 МБ вместо 10–20 МБ.
  { langPath: 'https://tessdata.projectnaptha.com/4.0.0_fast' },
  // Последняя попытка — штатные адреса tesseract.js на случай, если наш
  // домен отдаёт статику как-то иначе.
  {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/',
    langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/rus/4.0.0_best_int',
  },
]

/** Какой вариант сработал в прошлый раз: следующие запуски идут сразу в него. */
let preferredAttempt = 0

async function loadWorker(
  lang: string,
  attempt: OcrAttempt,
  onProgress?: (progress: number, status?: string) => void,
) {
  const { createWorker, PSM } = await import('tesseract.js')
  const worker = await createWorker(lang, 1, {
    workerPath: attempt.workerPath ?? LOCAL_WORKER(),
    corePath: attempt.corePath ?? LOCAL_CORE(),
    ...(attempt.langPath ? { langPath: attempt.langPath } : {}),
    logger: (message: { status?: string; progress?: number }) => {
      if (typeof message.progress !== 'number') return
      // Прогресс нужен не только по тексту: загрузка языка на телефоне занимает время.
      onProgress?.(message.progress, message.status)
    },
  })
  // Авторазметка страницы, пробелы между словами и подсказка про 300 dpi:
  // без этого строки склеиваются и Tesseract мельчит текст.
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
  })
  return worker
}

/**
 * Распознаёт картинку. Языковые данные качаются из сети один раз и кешируются браузером;
 * сам документ никуда не уходит.
 */
export async function recognizeImage(
  canvas: HTMLCanvasElement,
  lang: string,
  onProgress?: (progress: number, status?: string) => void,
  /** во сколько раз растр крупнее страницы: координаты слов возвращаем в точках страницы */
  rasterScale = 1,
  /** пересчёт точки из координат растра (если растр выравнивали поворотом) */
  mapPoint?: (x: number, y: number) => { x: number; y: number },
): Promise<OcrLine[]> {
  const order = [preferredAttempt, ...OCR_ATTEMPTS.map((_, index) => index)].filter(
    (value, position, list) => list.indexOf(value) === position,
  )

  let lastError: unknown = null

  for (const index of order) {
    const attempt = OCR_ATTEMPTS[index]
    let worker: Awaited<ReturnType<typeof loadWorker>> | null = null
    try {
      worker = await loadWorker(lang, attempt, onProgress)
      const result = await worker.recognize(canvas)
      const page = result.data as unknown as { words?: RawWord[] }
      preferredAttempt = index
      // Строки считаем в пикселях растра, потом переводим в точки страницы:
      // при выравнивании растр повёрнут, и просто делить на масштаб мало.
      const raw = groupWords(page.words ?? [], 1)
      const toPage = 1 / Math.max(0.01, rasterScale)
      if (!mapPoint) {
        return raw.map((line) => ({
          ...line,
          x: line.x * toPage,
          y: line.y * toPage,
          width: line.width * toPage,
          height: line.height * toPage,
        }))
      }
      return raw.map((line) => {
        const center = mapPoint(line.x + line.width / 2, line.y + line.height / 2)
        return {
          ...line,
          x: (center.x - line.width / 2) * toPage,
          y: (center.y - line.height / 2) * toPage,
          width: line.width * toPage,
          height: line.height * toPage,
        }
      })
    } catch (error) {
      lastError = error
      console.warn('OCR: не удалось запустить распознавание', attempt, error)
    } finally {
      // Неудачный воркер тоже надо погасить, иначе он висит в памяти.
      if (worker) await worker.terminate().catch(() => undefined)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Не удалось загрузить языковые данные распознавания')
}
