import type { PDFPageProxy } from 'pdfjs-dist'
import { pdfjsLib } from './pdf'

/** Строка текста, которую уже есть в PDF: её можно взять в редактор как объект. */
export type TextRun = {
  text: string
  /** левый край от левого края страницы, в точках */
  x: number
  /** верхний край от верхнего края страницы, в точках */
  y: number
  width: number
  height: number
  size: number
}

type RawItem = { text: string; x: number; baseline: number; width: number; height: number; size: number }

/**
 * Читает текстовый слой страницы и собирает из фрагментов строки с координатами.
 * Сканы и фото текстового слоя не имеют — вернётся пустой список, и это честный ответ.
 */
export async function readPageRuns(page: PDFPageProxy): Promise<TextRun[]> {
  const viewport = page.getViewport({ scale: 1 })
  const content = await page.getTextContent()
  const items: RawItem[] = []

  for (const item of content.items) {
    if (!('str' in item)) continue
    const text = item.str.replace(/\s+/g, ' ').trim()
    if (!text) continue

    const matrix = pdfjsLib.Util.transform(viewport.transform, item.transform)
    const size = Math.hypot(matrix[2], matrix[3]) || item.height || 10
    const width = Math.abs(item.width) || size * text.length * 0.5
    items.push({
      text,
      x: matrix[4],
      baseline: matrix[5],
      width,
      height: item.height || size,
      size,
    })
  }

  if (!items.length) return []

  const rows: { baseline: number; size: number; items: RawItem[] }[] = []
  for (const item of items) {
    const tolerance = Math.max(1.6, item.size * 0.4)
    const row = rows.find((candidate) => Math.abs(candidate.baseline - item.baseline) <= tolerance)
    if (row) {
      row.items.push(item)
      row.size = Math.max(row.size, item.size)
    } else {
      rows.push({ baseline: item.baseline, size: item.size, items: [item] })
    }
  }

  const runs: TextRun[] = []

  for (const row of rows.sort((a, b) => a.baseline - b.baseline)) {
    const sorted = [...row.items].sort((a, b) => a.x - b.x)
    const segments: RawItem[][] = []
    let segment: RawItem[] = []

    for (const item of sorted) {
      const previous = segment[segment.length - 1]
      // Большой разрыв — это уже другая колонка или ячейка таблицы, а не пробел.
      if (previous && item.x - (previous.x + previous.width) > Math.max(12, item.size * 1.8)) {
        segments.push(segment)
        segment = []
      }
      segment.push(item)
    }
    if (segment.length) segments.push(segment)

    for (const part of segments) {
      let text = ''
      let previousRight: number | null = null
      let size = 0

      for (const item of part) {
        const gap = previousRight === null ? 0 : item.x - previousRight
        if (previousRight !== null && gap > item.size * 0.22 && !text.endsWith(' ')) text += ' '
        text += item.text
        previousRight = item.x + item.width
        size = Math.max(size, item.size)
      }

      const first = part[0]
      const right = Math.max(...part.map((item) => item.x + item.width))
      const width = right - first.x
      if (width < 1) continue

      runs.push({
        text: text.trim(),
        x: Math.round(first.x * 10) / 10,
        y: Math.round((row.baseline - size * 0.86) * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(size * 1.16 * 10) / 10,
        size: Math.max(4, Math.round(size * 10) / 10),
      })
    }
  }

  return runs.filter((run) => run.text)
}

/** Растр страницы в нужном масштабе — из него распознаём текст и фото. */
export async function renderPageRaster(
  page: PDFPageProxy,
  targetWidth = 1600,
): Promise<{ canvas: HTMLCanvasElement; scale: number }> {
  const base = page.getViewport({ scale: 1 })
  const scale = Math.min(4, Math.max(1, targetWidth / Math.max(1, base.width)))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(viewport.width))
  canvas.height = Math.max(1, Math.round(viewport.height))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas недоступен в этом браузере')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: context, viewport }).promise
  return { canvas, scale }
}
