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
 * Распознаёт картинку. Языковые данные качаются из сети один раз и кешируются браузером;
 * сам документ никуда не уходит.
 */
export async function recognizeImage(
  canvas: HTMLCanvasElement,
  lang: string,
  onProgress?: (progress: number) => void,
): Promise<OcrLine[]> {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker(lang, 1, {
    logger: (message: { status?: string; progress?: number }) => {
      if (message.status === 'recognizing text' && typeof message.progress === 'number') {
        onProgress?.(message.progress)
      }
    },
  })

  try {
    const result = await worker.recognize(canvas)
    const page = result.data as unknown as { words?: RawWord[] }
    const words = page.words ?? []
    const width = canvas.width || 1
    const scale = width / Math.max(1, canvas.width)
    return groupWords(words, scale)
  } finally {
    await worker.terminate()
  }
}
