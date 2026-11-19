import {
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from 'docx'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

const BOLD_RE = /bold|black|heavy|semibold|demi/i
const SCAN_SCALE = 1.5
const SCAN_MAX_WIDTH = 1400
const SCAN_QUALITY = 0.82

type Progress = (done: number, total: number) => void

type Line = {
  size: number
  text: string
  bold: boolean
}

function fontLabel(page: PDFPageProxy, fontName?: string): string {
  if (!fontName) return ''
  try {
    const font = page.commonObjs.get(fontName) as { name?: string } | null
    return font?.name ?? fontName
  } catch {
    return fontName
  }
}

/** Склеивает текстовые фрагменты страницы в строки, сохраняя порядок и пробелы. */
function buildLines(page: PDFPageProxy, items: TextItem[]): Line[] {
  const rows: { y: number; glyphs: TextItem[] }[] = []

  for (const item of items) {
    if (!item.str) continue
    const y = item.transform[5]
    const size = Math.abs(item.transform[3]) || item.height || 10
    const tolerance = Math.max(1.5, Math.min(5, size * 0.35))
    const row = rows.find((r) => Math.abs(r.y - y) <= tolerance)
    if (row) row.glyphs.push(item)
    else rows.push({ y, glyphs: [item] })
  }

  rows.sort((a, b) => b.y - a.y)

  return rows.map((row) => {
    const glyphs = [...row.glyphs].sort((a, b) => a.transform[4] - b.transform[4])
    let text = ''
    let prevEnd: number | null = null
    let size = 0
    const fonts = new Map<string, number>()
    let dominantFont = ''
    let dominantWeight = 0

    for (const glyph of glyphs) {
      const x = glyph.transform[4]
      const glyphSize = Math.abs(glyph.transform[3]) || glyph.height || 10
      size = Math.max(size, glyphSize)

      if (prevEnd !== null) {
        const gap = x - prevEnd
        if (gap > Math.max(1.2, glyphSize * 0.22) && !/\s$/.test(text) && !/^\s/.test(glyph.str)) {
          text += ' '
        }
      }
      text += glyph.str
      prevEnd = x + (glyph.width ?? 0)

      if (glyph.fontName) {
        const weight = (fonts.get(glyph.fontName) ?? 0) + glyph.str.length
        fonts.set(glyph.fontName, weight)
        if (weight > dominantWeight) {
          dominantWeight = weight
          dominantFont = glyph.fontName
        }
      }
    }

    return {
      size,
      text,
      bold: BOLD_RE.test(fontLabel(page, dominantFont)),
    }
  })
}

async function renderPageToJpeg(
  page: PDFPageProxy,
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const base = page.getViewport({ scale: 1 })
  const scale = Math.min(SCAN_SCALE, SCAN_MAX_WIDTH / Math.max(1, base.width))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(viewport.width))
  canvas.height = Math.max(1, Math.floor(viewport.height))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Браузер не дал доступ к canvas')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvas, canvasContext: context, viewport }).promise

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', SCAN_QUALITY),
  )
  if (!blob) throw new Error('Не удалось сгенерировать изображение страницы')

  return {
    data: new Uint8Array(await blob.arrayBuffer()),
    width: canvas.width,
    height: canvas.height,
  }
}

function fit(width: number, height: number) {
  const scale = Math.min(600 / width, 800 / height, 1)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * Собирает .docx: если в PDF есть текстовый слой — переносим строки,
 * если это скан без текста — вставляем отрендеренные страницы картинками.
 */
export async function pdfToDocx(pdf: PDFDocumentProxy, onProgress?: Progress): Promise<Blob> {
  const total = pdf.numPages
  // Половина шкалы — разбор текста, вторая половина — рендер страниц скана.
  const steps = total * 2
  const children: Paragraph[] = []
  const pageLines: Line[][] = []
  let characters = 0

  for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const items = content.items.filter((item): item is TextItem => 'str' in item)
    const lines = buildLines(page, items)
    characters += lines.reduce((sum, line) => sum + line.text.length, 0)
    pageLines.push(lines)
    page.cleanup()
    onProgress?.(pageNumber, steps)
  }

  const scanned = characters < 20

  if (scanned) {
    for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const image = await renderPageToJpeg(page)
      const box = fit(image.width, image.height)
      if (pageNumber > 1) children.push(new Paragraph({ children: [new PageBreak()] }))
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: image.data,
              type: 'jpg',
              transformation: box,
            }),
          ],
        }),
      )
      page.cleanup()
      onProgress?.(total + pageNumber, steps)
    }
  } else {
    onProgress?.(steps, steps)
    pageLines.forEach((lines, index) => {
      if (index > 0) children.push(new Paragraph({ children: [new PageBreak()] }))
      for (const line of lines) {
        if (!line.text.trim()) continue
        children.push(
          new Paragraph({
            spacing: { after: 0, line: 260 },
            children: [
              new TextRun({
                text: line.text,
                bold: line.bold,
                size: Math.round(Math.min(72, Math.max(8, line.size)) * 2),
                font: 'Calibri',
              }),
            ],
          }),
        )
      }
    })
  }

  const doc = new Document({
    creator: 'RekPDF',
    title: 'Документ, сконвертированный из PDF',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{ children }],
  })

  return Packer.toBlob(doc)
}
