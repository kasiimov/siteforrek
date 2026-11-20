import {
  AlignmentType,
  BorderStyle,
  Document,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LineRuleType,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  TextWrappingType,
  VerticalAlign,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { buildPageLayout } from './pdfLayout'
import type { CellBorder, Family, LineSpec, PageLayout, TableSpec } from './pdfLayout'
import { throwIfAborted } from './batch'
import { docxBorderSize } from './tableBorders'

const FONT: Record<Family, string> = {
  sans: 'Arial',
  serif: 'Times New Roman',
  mono: 'Courier New',
}

const TWIPS = 20
const EMU = 12700
const SCAN_SCALE = 1.5
const SCAN_MAX_WIDTH = 1400
const SCAN_QUALITY = 0.82

type Progress = (done: number, total: number) => void
type Block = Paragraph | Table

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
}

/** Граница ячейки из PDF: тот же цвет и та же толщина, что в исходнике. */
function cellBorder(border: CellBorder | null) {
  if (!border) return { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  return { style: BorderStyle.SINGLE, size: docxBorderSize(border.width), color: border.color }
}

const ALIGN = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
} as const

function lineHeight(line: LineSpec): number {
  return Math.max(line.size * 1.16, 1)
}

/** Параграф из строки PDF: шрифт, размер, жирность внутри строки и отступ как в оригинале. */
function paragraphFrom(line: LineSpec, beforePt: number, leftShift = 0): Paragraph {
  const runs = line.runs.length
    ? line.runs
    : [{ text: line.text, size: line.size, bold: false, italic: false, family: 'sans' as Family, script: null }]

  return new Paragraph({
    alignment: ALIGN[line.align],
    indent: line.align === 'left' ? { left: Math.max(0, Math.round((line.left - leftShift) * TWIPS)) } : undefined,
    spacing: {
      before: Math.max(0, Math.round(beforePt * TWIPS)),
      after: 0,
      line: Math.max(20, Math.round(lineHeight(line) * TWIPS)),
      lineRule: LineRuleType.EXACT,
    },
    children: runs.map(
      (run) =>
        new TextRun({
          text: run.text,
          bold: run.bold,
          italics: run.italic,
          size: Math.max(2, Math.round(run.size * 2)),
          font: FONT[run.family],
          superScript: run.script === 'super',
          subScript: run.script === 'sub',
        }),
    ),
  })
}

function spacerParagraph(heightPt: number): Paragraph {
  return new Paragraph({
    spacing: {
      before: 0,
      after: 0,
      line: Math.max(20, Math.round(heightPt * TWIPS)),
      lineRule: LineRuleType.EXACT,
    },
    children: [new TextRun({ text: '', size: 2 })],
  })
}

/** Картинка ставится на то же место страницы, где она была в PDF. */
function imageParagraph(image: PageLayout['images'][number]): Paragraph {
  // Абзац-якорь занимает минимум места: сама картинка висит на абсолютных координатах.
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 1, lineRule: LineRuleType.EXACT },
    children: [
      new ImageRun({
        type: image.type,
        data: image.data,
        transformation: {
          width: Math.max(2, Math.round(image.width * (4 / 3))),
          height: Math.max(2, Math.round(image.height * (4 / 3))),
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            offset: Math.round(image.left * EMU),
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            offset: Math.round(image.top * EMU),
          },
          wrap: { type: TextWrappingType.NONE },
          allowOverlap: true,
          behindDocument: false,
        },
      }),
    ],
  })
}

/** Настоящая Word-таблица из найденной в PDF сетки, с объединёнными ячейками. */
function gridTable(table: TableSpec): Table {
  const widths = table.columns.slice(0, -1).map((x, index) => Math.max(240, Math.round((table.columns[index + 1] - x) * TWIPS)))

  return new Table({
    rows: table.rows.map((row, rowIndex) => {
      const cells = table.cells.filter((cell) => cell.row === rowIndex).sort((a, b) => a.column - b.column)
      const rowHeight = row.bottom - row.top
      // Шапку повторяем на новой странице, если она целиком набрана жирным.
      const header =
        rowIndex === 0 &&
        cells.length > 0 &&
        cells.every((cell) => cell.lines.length > 0 && cell.lines.every((line) => line.runs.every((run) => run.bold)))

      return new TableRow({
        tableHeader: header,
        children: cells.map((cell) => {
          const width = widths.slice(cell.column, cell.column + cell.columnSpan).reduce((sum, value) => sum + value, 0)
          let cursor = cell.top
          const children: Paragraph[] = cell.lines.length
            ? cell.lines.map((line) => {
                const paragraph = paragraphFrom(line, Math.max(0, line.top - cursor), cell.left)
                cursor = line.top + lineHeight(line)
                return paragraph
              })
            : [spacerParagraph(Math.max(2, row.bottom - row.top))]

          // Если текста в ячейке заметно меньше её высоты — центрируем по вертикали,
          // как это выглядело в исходном PDF.
          const contentHeight = cell.lines.reduce((sum, line) => sum + lineHeight(line), 0)
          const centered = cell.lines.length > 0 && rowHeight - contentHeight > lineHeight(cell.lines[0]) * 0.8

          return new TableCell({
            children,
            verticalAlign: centered ? VerticalAlign.CENTER : undefined,
            width: { size: width, type: WidthType.DXA },
            columnSpan: cell.columnSpan > 1 ? cell.columnSpan : undefined,
            rowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            borders: {
              top: cellBorder(cell.borders.top),
              bottom: cellBorder(cell.borders.bottom),
              left: cellBorder(cell.borders.left),
              right: cellBorder(cell.borders.right),
            },
          })
        }),
      })
    }),
    width: { size: Math.round(table.width * TWIPS), type: WidthType.DXA },
    columnWidths: widths,
    indent: { size: Math.max(0, Math.round(table.left * TWIPS)), type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    // Сами линии рисуются на сторонах ячеек — так сохраняются цвет и толщина каждой.
    borders: NO_BORDERS,
  })
}

/** Многоколоночная вёрстка: строки-«полосы» из ячеек, чтобы колонки стояли рядом. */
function columnTable(layout: PageLayout): Table | null {
  const gutters = layout.columns
  if (!gutters || !layout.lines.length) return null

  const contentLeft = layout.lines.reduce((min, line) => Math.min(min, line.left), Number.POSITIVE_INFINITY)
  const contentRight = layout.lines.reduce((max, line) => Math.max(max, line.right), 0)
  const zones = [contentLeft, ...gutters, contentRight]
  const widths = zones.slice(0, -1).map((x, index) => Math.max(240, Math.round((zones[index + 1] - x) * TWIPS)))

  const sorted = [...layout.lines].sort((a, b) => a.top - b.top)
  const bands: { top: number; bottom: number; lines: LineSpec[]; table?: TableSpec }[] = []

  for (const line of sorted) {
    const band = bands.find(
      (candidate) => !candidate.table && line.top < candidate.bottom - 1 && line.bottom > candidate.top + 1,
    )
    if (band) {
      band.lines.push(line)
      band.top = Math.min(band.top, line.top)
      band.bottom = Math.max(band.bottom, line.bottom)
    } else {
      bands.push({ top: line.top, bottom: line.bottom, lines: [line] })
    }
  }

  // Таблицы занимают пустые по тексту полосы — встают отдельной строкой с вложенной таблицей.
  for (const table of layout.tables) bands.push({ top: table.top, bottom: table.bottom, lines: [], table })
  bands.sort((a, b) => a.top - b.top)

  const totalWidth = widths.reduce((sum, width) => sum + width, 0)

  const rows = bands.map((band) => {
    if (band.table) {
      return new TableRow({
        children: [
          new TableCell({
            children: [gridTable(band.table)],
            columnSpan: zones.length - 1,
            width: { size: totalWidth, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
          }),
        ],
      })
    }

    if (band.lines.length === 1) {
      const line = band.lines[0]
      return new TableRow({
        children: [
          new TableCell({
            children: [paragraphFrom(line, 0, contentLeft)],
            columnSpan: zones.length - 1,
            width: { size: totalWidth, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
          }),
        ],
      })
    }

    return new TableRow({
      children: zones.slice(0, -1).map((zoneStart, index) => {
        const inColumn = band.lines.filter((line) => {
          const center = (line.left + line.right) / 2
          return center >= zoneStart && center <= zones[index + 1]
        })

        return new TableCell({
          children: inColumn.length
            ? inColumn.map((line, lineIndex) =>
                paragraphFrom(line, lineIndex === 0 ? Math.max(0, line.top - band.top) : Math.max(0, line.top - inColumn[lineIndex - 1].top - lineHeight(inColumn[lineIndex - 1])), zoneStart),
              )
            : [spacerParagraph(Math.max(2, band.bottom - band.top))],
          width: { size: widths[index], type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        })
      }),
    })
  })

  return new Table({
    rows,
    width: { size: widths.reduce((sum, width) => sum + width, 0), type: WidthType.DXA },
    columnWidths: widths,
    indent: { size: Math.max(0, Math.round(contentLeft * TWIPS)), type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: NO_BORDERS,
  })
}

function pageBlocks(layout: PageLayout): Block[] {
  const blocks: Block[] = layout.images.map(imageParagraph)

  if (layout.columns && layout.lines.length) {
    const table = columnTable(layout)
    if (table) {
      const top = Math.min(...layout.lines.map((line) => line.top), ...layout.tables.map((item) => item.top))
      if (top > 6) blocks.push(spacerParagraph(top))
      blocks.push(table)
      return blocks
    }
  }

  const flow = [
    ...layout.lines.map((line) => ({ kind: 'line' as const, top: line.top, line })),
    ...layout.tables.map((table) => ({ kind: 'table' as const, top: table.top, table })),
  ].sort((a, b) => a.top - b.top)

  let cursor = 0

  for (const item of flow) {
    if (item.kind === 'line') {
      blocks.push(paragraphFrom(item.line, Math.max(0, item.line.top - cursor)))
      cursor = item.line.top + lineHeight(item.line)
    } else {
      const gap = item.table.top - cursor
      if (gap > 4) blocks.push(spacerParagraph(gap))
      blocks.push(gridTable(item.table))
      cursor = item.table.bottom
    }
  }

  return blocks
}

async function renderPageToJpeg(page: PDFPageProxy): Promise<{ data: Uint8Array; width: number; height: number }> {
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

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', SCAN_QUALITY))
  if (!blob) throw new Error('Не удалось сгенерировать изображение страницы')

  return { data: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height }
}

function scanBlocks(page: PDFPageProxy, image: { data: Uint8Array; width: number; height: number }): Block[] {
  const view = page.view as number[]
  const pageWidth = view[2] - view[0]
  const pageHeight = view[3] - view[1]
  const scale = Math.min(pageWidth / image.width, pageHeight / image.height)

  return [
    new Paragraph({
      children: [
        new ImageRun({
          type: 'jpg',
          data: image.data,
          transformation: {
            width: Math.max(2, Math.round(image.width * scale * (4 / 3))),
            height: Math.max(2, Math.round(image.height * scale * (4 / 3))),
          },
        }),
      ],
    }),
  ]
}

/**
 * Собирает .docx с сохранением вёрстки: размер страницы как в PDF, отступы строк,
 * шрифты, картинки на своих местах, таблицы и колонки. Скан без текстового слоя
 * вставляется картинками страниц.
 */
export type DocxStats = { pages: number; scanned: number; tables: number; images: number }

export async function pdfToDocx(
  pdf: PDFDocumentProxy,
  onProgress?: Progress,
  signal?: AbortSignal,
): Promise<{ blob: Blob; stats: DocxStats }> {
  const total = pdf.numPages
  const steps = total * 2
  const stats: DocxStats = { pages: total, scanned: 0, tables: 0, images: 0 }
  const sections: { properties: { page: { size: { width: number; height: number }; margin: Record<string, number> } }; children: Block[] }[] = []

  for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
    throwIfAborted(signal)
    const page = await pdf.getPage(pageNumber)
    const view = page.view as number[]
    const width = view[2] - view[0]
    const height = view[3] - view[1]
    const children: Block[] = []

    let layout: PageLayout | null = null
    try {
      layout = await buildPageLayout(page)
    } catch {
      layout = null
    }

    if (layout && !layout.scanned) {
      stats.tables += layout.tables.length
      stats.images += layout.images.length
      children.push(...pageBlocks(layout))
      onProgress?.(pageNumber, steps)
    } else {
      stats.scanned += 1
      // Скан или страница, которую не удалось разобрать, — вставляем картинкой.
      try {
        const image = await renderPageToJpeg(page)
        children.push(...scanBlocks(page, image))
      } catch {
        children.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
      }
      onProgress?.(total + pageNumber, steps)
    }

    if (!children.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
    }

    sections.push({
      properties: {
        page: {
          size: {
            width: Math.round((layout?.width ?? width) * TWIPS),
            height: Math.round((layout?.height ?? height) * TWIPS),
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0, gutter: 0 },
        },
      },
      children,
    })

    page.cleanup()
  }

  const doc = new Document({
    creator: 'RekPDF',
    title: 'Документ, сконвертированный из PDF',
    styles: {
      default: {
        document: {
          run: { font: FONT.sans, size: 22 },
        },
      },
    },
    sections,
  })

  throwIfAborted(signal)
  return { blob: await Packer.toBlob(doc), stats }
}
