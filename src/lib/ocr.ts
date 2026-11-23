/** Распознавание текста (OCR) прямо в браузере: tesseract.js, без загрузки файла на сервер. */

export type OcrLine = {
  text: string
  x: number
  y: number
  width: number
  height: number
}

type RawWord = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }

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
      if (previousRight !== null && word.bbox.x0 - previousRight > row.height * 0.3) text += ' '
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
  // Быстрые модели: пара языков весит ~3–5 МБ вместо 10–20 МБ.
  { langPath: 'https://tessdata.projectnaptha.com/4.0.0_fast' },
  { langPath: 'https://raw.githack.com/naptha/tessdata/gh-pages/4.0.0_fast' },
  { langPath: 'https://tessdata.projectnaptha.com/4.0.0' },
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
  const { createWorker } = await import('tesseract.js')
  return createWorker(lang, 1, {
    workerPath: attempt.workerPath ?? LOCAL_WORKER(),
    corePath: attempt.corePath ?? LOCAL_CORE(),
    ...(attempt.langPath ? { langPath: attempt.langPath } : {}),
    logger: (message: { status?: string; progress?: number }) => {
      if (typeof message.progress !== 'number') return
      // Прогресс нужен не только по тексту: загрузка языка на телефоне занимает время.
      onProgress?.(message.progress, message.status)
    },
  })
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
      return groupWords(page.words ?? [], Math.max(0.01, rasterScale))
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
