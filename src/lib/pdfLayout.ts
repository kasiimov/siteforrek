import type { PDFPageProxy } from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { pdfjsLib } from './pdf'
import { resolveImage, toCanvas } from './images'

const { OPS } = pdfjsLib

export type Family = 'sans' | 'serif' | 'mono'

export type RunSpec = {
  text: string
  size: number
  bold: boolean
  italic: boolean
  family: Family
  script: 'super' | 'sub' | null
}

export type LineSpec = {
  text: string
  left: number
  right: number
  /** расстояние от верхнего края страницы, в пунктах */
  top: number
  bottom: number
  size: number
  align: 'left' | 'center' | 'right' | 'justify'
  runs: RunSpec[]
}

export type ImageSpec = {
  left: number
  top: number
  width: number
  height: number
  data: Uint8Array
}

export type TableRowSpec = {
  top: number
  bottom: number
  /** по ячейке на колонку, внутри — строки текста */
  cells: LineSpec[][]
}

export type TableSpec = {
  left: number
  width: number
  top: number
  bottom: number
  columns: number[]
  rows: TableRowSpec[]
}

export type PageLayout = {
  width: number
  height: number
  lines: LineSpec[]
  tables: TableSpec[]
  images: ImageSpec[]
  /** центры «коридоров» между колонками; null — обычная одноколоночная страница */
  columns: number[] | null
  scanned: boolean
}

type Matrix = [number, number, number, number, number, number]
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ]
}

function apply(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
}

function styleFromFont(fontName: string, family: string | undefined) {
  const probe = `${family ?? ''} ${fontName}`.toLowerCase()
  const mono = /courier|mono|consol/.test(probe)
  const sans = /sans|arial|helvetica|verdana|tahoma|calibri|roboto|aptos|segoe|inter/.test(probe)
  const serif = !mono && !sans && /times|serif|georgia|garamond|cambria|bookman|minion|literata/.test(probe)
  return {
    bold: /bold|black|heavy|semibold|demi|extrabold|ultra/.test(probe),
    italic: /italic|oblique|kursiv/.test(probe),
    family: (mono ? 'mono' : serif ? 'serif' : 'sans') as Family,
  }
}

function spaceGap(size: number): number {
  return Math.max(1.2, size * 0.22)
}

/** Собирает строки страницы: группирует фрагменты по базовой линии и склеивает в раны. */
function buildLines(content: Awaited<ReturnType<PDFPageProxy['getTextContent']>>, height: number, offsetX: number) {
  const styles = content.styles as Record<string, { fontFamily?: string }>
  const items = content.items.filter((item): item is TextItem => 'str' in item && item.str.trim().length > 0)

  const rows: { y: number; size: number; items: TextItem[] }[] = []

  for (const item of items) {
    const size = Math.abs(item.transform[3]) || item.height || 10
    const y = item.transform[5]
    const tolerance = Math.max(1.5, Math.min(6, size * 0.4))
    const row = rows.find((candidate) => Math.abs(candidate.y - y) <= tolerance)
    if (row) {
      row.items.push(item)
      row.size = Math.max(row.size, size)
      row.y = (row.y * (row.items.length - 1) + y) / row.items.length
    } else {
      rows.push({ y, size, items: [item] })
    }
  }

  rows.sort((a, b) => b.y - a.y)

  const lines: LineSpec[] = []

  for (const row of rows) {
    const sorted = [...row.items].sort((a, b) => a.transform[4] - b.transform[4])

    // Одна «строка» PDF часто содержит несколько колонок или ячеек таблицы.
    // Режем её там, где между словами большой разрыв, иначе текст слипается.
    const segments: TextItem[][] = []
    let segment: TextItem[] = []
    let segmentEnd = Number.NEGATIVE_INFINITY

    for (const item of sorted) {
      const itemSize = Math.abs(item.transform[3]) || item.height || 10
      const left = item.transform[4]
      if (segment.length && left - segmentEnd > Math.max(14, itemSize * 1.7)) {
        segments.push(segment)
        segment = []
        segmentEnd = Number.NEGATIVE_INFINITY
      }
      segment.push(item)
      segmentEnd = Math.max(segmentEnd, left + (item.width ?? 0))
    }
    if (segment.length) segments.push(segment)

    for (const part of segments) {
      const runs: RunSpec[] = []
      let text = ''
      let size = 0
      let previousRight: number | null = null

      for (const item of part) {
        const itemSize = Math.abs(item.transform[3]) || item.height || 10
        size = Math.max(size, itemSize)
        const left = item.transform[4] - offsetX
        const gap = previousRight === null ? 0 : left - previousRight
        const needSpace =
          previousRight !== null && gap > spaceGap(itemSize) && !/\s$/.test(text) && !/^\s/.test(item.str)

        if (needSpace) text += ' '

        const style = styleFromFont(item.fontName, styles[item.fontName]?.fontFamily)
        const rise = item.transform[5] - row.y
        const script: RunSpec['script'] = rise > itemSize * 0.25 ? 'super' : rise < -itemSize * 0.18 ? 'sub' : null
        const previous = runs[runs.length - 1]

        if (
          previous &&
          previous.script === script &&
          previous.bold === style.bold &&
          previous.italic === style.italic &&
          previous.family === style.family &&
          Math.abs(previous.size - itemSize) < 0.7
        ) {
          previous.text += needSpace ? ` ${item.str}` : item.str
        } else {
          runs.push({ text: (needSpace ? ' ' : '') + item.str, size: itemSize, ...style, script })
        }

        text += item.str
        previousRight = left + (item.width ?? 0)
      }

      const trimmed = text.trim()
      if (!trimmed) continue

      if (runs.length) runs[0].text = runs[0].text.replace(/^\s+/, '')

      const lastItem = part[part.length - 1]
      lines.push({
        text: trimmed,
        left: part[0].transform[4] - offsetX,
        right: lastItem.transform[4] - offsetX + (lastItem.width ?? 0),
        top: height - (row.y + size * 0.82),
        bottom: height - (row.y - size * 0.22),
        size,
        align: 'left',
        runs,
      })
    }
  }

  return lines
}

type HorizontalRule = { y: number; x1: number; x2: number }
type VerticalRule = { x: number; y1: number; y2: number }

function mergeHorizontal(rules: HorizontalRule[]): HorizontalRule[] {
  const sorted = [...rules].sort((a, b) => b.y - a.y || a.x1 - b.x1)
  const merged: HorizontalRule[] = []
  for (const rule of sorted) {
    const target = merged.find((candidate) => Math.abs(candidate.y - rule.y) <= 1.5 && rule.x1 <= candidate.x2 + 4 && rule.x2 >= candidate.x1 - 4)
    if (target) {
      target.x1 = Math.min(target.x1, rule.x1)
      target.x2 = Math.max(target.x2, rule.x2)
    } else {
      merged.push({ ...rule })
    }
  }
  return merged.filter((rule) => rule.x2 - rule.x1 >= 16)
}

function mergeVertical(rules: VerticalRule[]): VerticalRule[] {
  const sorted = [...rules].sort((a, b) => a.x - b.x || a.y1 - b.y1)
  const merged: VerticalRule[] = []
  for (const rule of sorted) {
    const target = merged.find((candidate) => Math.abs(candidate.x - rule.x) <= 1.5 && rule.y1 <= candidate.y2 + 4 && rule.y2 >= candidate.y1 - 4)
    if (target) {
      target.y1 = Math.min(target.y1, rule.y1)
      target.y2 = Math.max(target.y2, rule.y2)
    } else {
      merged.push({ ...rule })
    }
  }
  return merged.filter((rule) => rule.y2 - rule.y1 >= 16)
}

function uniqueSorted(values: number[], tolerance = 1.5): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const result: number[] = []
  for (const value of sorted) {
    if (!result.length || value - result[result.length - 1] > tolerance) result.push(value)
  }
  return result
}

/** Ищет сетки таблиц по нарисованным линиям и раскладывает текст по ячейкам. */
function detectTables(
  horizontal: HorizontalRule[],
  vertical: VerticalRule[],
  lines: LineSpec[],
  height: number,
): { tables: TableSpec[]; free: LineSpec[] } {
  if (!horizontal.length || !vertical.length) return { tables: [], free: lines }

  const nodes = [...horizontal.map((rule) => ({ kind: 'h' as const, rule })), ...vertical.map((rule) => ({ kind: 'v' as const, rule }))]
  const parent = nodes.map((_, index) => index)

  const find = (index: number): number => {
    let current = index
    while (parent[current] !== current) current = parent[current]
    return current
  }
  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootB] = rootA
  }

  horizontal.forEach((h, hIndex) => {
    vertical.forEach((v, vIndex) => {
      if (v.x >= h.x1 - 2 && v.x <= h.x2 + 2 && h.y >= v.y1 - 2 && h.y <= v.y2 + 2) {
        union(hIndex, horizontal.length + vIndex)
      }
    })
  })

  const groups = new Map<number, { h: HorizontalRule[]; v: VerticalRule[] }>()
  nodes.forEach((node, index) => {
    const root = find(index)
    const group = groups.get(root) ?? { h: [], v: [] }
    if (node.kind === 'h') group.h.push(node.rule)
    else group.v.push(node.rule)
    groups.set(root, group)
  })

  const tables: TableSpec[] = []
  const used = new Set<LineSpec>()

  for (const group of groups.values()) {
    if (group.h.length < 2 || group.v.length < 2) continue

    const left = Math.min(...group.h.map((rule) => rule.x1))
    const right = Math.max(...group.h.map((rule) => rule.x2))
    const columns = uniqueSorted(group.v.map((rule) => rule.x).filter((x) => x >= left - 3 && x <= right + 3))
    const rowBounds = uniqueSorted(group.h.map((rule) => rule.y)).sort((a, b) => b - a)

    if (columns.length < 2 || rowBounds.length < 2) continue
    if ((columns.length - 1) * (rowBounds.length - 1) > 600) continue

    const rows: TableRowSpec[] = rowBounds.slice(0, -1).map((y, index) => ({
      top: height - y,
      bottom: height - rowBounds[index + 1],
      cells: columns.slice(0, -1).map(() => [] as LineSpec[]),
    }))

    let placed = 0

    for (const line of lines) {
      if (used.has(line)) continue
      const centerX = (line.left + line.right) / 2
      const centerY = height - (line.top + line.bottom) / 2
      if (centerX < columns[0] || centerX > columns[columns.length - 1]) continue

      const columnIndex = columns.findIndex((x, index) => index < columns.length - 1 && centerX >= x && centerX <= columns[index + 1])
      const rowIndex = rowBounds.findIndex((y, index) => index < rowBounds.length - 1 && centerY <= y && centerY >= rowBounds[index + 1])
      if (columnIndex < 0 || rowIndex < 0) continue

      rows[rowIndex].cells[columnIndex].push(line)
      used.add(line)
      placed++
    }

    if (placed < 3) {
      used.clear()
      continue
    }

    tables.push({
      left: columns[0],
      width: columns[columns.length - 1] - columns[0],
      top: height - rowBounds[0],
      bottom: height - rowBounds[rowBounds.length - 1],
      columns,
      rows,
    })
  }

  return { tables, free: lines.filter((line) => !used.has(line)) }
}

/** Ищет вертикальные «коридоры», по которым страница делится на колонки. */
function detectColumns(lines: LineSpec[], contentLeft: number, contentRight: number): number[] | null {
  if (lines.length < 8) return null
  const width = Math.round(contentRight - contentLeft)
  if (width < 120) return null

  const counts = new Array<number>(width).fill(0)
  for (const line of lines) {
    const from = Math.max(contentLeft, line.left)
    const to = Math.min(contentRight, line.right)
    for (let x = from; x < to; x += 1) counts[Math.round(x - contentLeft)]++
  }

  const limit = Math.max(1, Math.floor(lines.length * 0.15))
  const runs: { start: number; end: number }[] = []
  let start: number | null = null

  for (let index = 0; index < counts.length; index++) {
    const empty = counts[index] <= limit
    if (empty && start === null) start = index
    if (!empty && start !== null) {
      runs.push({ start: start + contentLeft, end: index + contentLeft })
      start = null
    }
  }

  const gutters = runs
    .filter((run) => run.end - run.start >= 14)
    .filter((run) => run.start > contentLeft + 8 && run.end < contentRight - 8)
    .map((run) => (run.start + run.end) / 2)

  if (!gutters.length || gutters.length > 2) return null

  const zones = [contentLeft, ...gutters, contentRight]
  for (let index = 0; index < zones.length - 1; index++) {
    const inside = lines.filter((line) => {
      const center = (line.left + line.right) / 2
      return center > zones[index] && center < zones[index + 1]
    })
    if (inside.length < 3) return null
    const wide = inside.filter((line) => line.right - line.left > (zones[index + 1] - zones[index]) * 0.95)
    if (wide.length > inside.length * 0.5) return null
  }

  return gutters
}

type OperatorList = Awaited<ReturnType<PDFPageProxy['getOperatorList']>>

async function readImages(page: PDFPageProxy, operators: OperatorList, height: number, offsetX: number, offsetY: number) {
  const images: ImageSpec[] = []
  let ctm: Matrix = IDENTITY
  const stack: Matrix[] = []
  const pending: { matrix: Matrix; id: string | null; inline?: unknown }[] = []

  for (let index = 0; index < operators.fnArray.length; index++) {
    const fn = operators.fnArray[index]
    const args = operators.argsArray[index] as unknown[]

    if (fn === OPS.save) {
      stack.push(ctm)
      continue
    }
    if (fn === OPS.restore) {
      ctm = stack.pop() ?? IDENTITY
      continue
    }
    if (fn === OPS.transform) {
      ctm = multiply(ctm, args as Matrix)
      continue
    }
    if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
      const id = args?.[0]
      if (typeof id === 'string') pending.push({ matrix: ctm, id })
      continue
    }
    if (fn === OPS.paintInlineImageXObject) {
      pending.push({ matrix: ctm, id: null, inline: args?.[0] })
    }
  }

  for (const entry of pending.slice(0, 40)) {
    const corners = [apply(entry.matrix, 0, 0), apply(entry.matrix, 1, 0), apply(entry.matrix, 0, 1), apply(entry.matrix, 1, 1)]
    const left = Math.min(...corners.map((corner) => corner[0])) - offsetX
    const top = height - (Math.max(...corners.map((corner) => corner[1])) - offsetY)
    const drawWidth = Math.max(...corners.map((corner) => corner[0])) - Math.min(...corners.map((corner) => corner[0]))
    const drawHeight = Math.max(...corners.map((corner) => corner[1])) - Math.min(...corners.map((corner) => corner[1]))

    if (drawWidth < 6 || drawHeight < 6 || drawWidth > 4000 || drawHeight > 4000) continue

    try {
      const source = entry.id ? await resolveImage(page, entry.id) : entry.inline
      const canvas = toCanvas(source)
      if (!canvas || canvas.width < 8 || canvas.height < 8) continue

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      if (!blob) continue
      if (blob.size > 8 * 1024 * 1024) continue

      images.push({
        left,
        top,
        width: drawWidth,
        height: drawHeight,
        data: new Uint8Array(await blob.arrayBuffer()),
      })
      canvas.width = 0
      canvas.height = 0
    } catch {
      // битая картинка не должна ломать всю конвертацию
    }
  }

  return images
}

function readRules(operators: OperatorList) {
  const horizontal: HorizontalRule[] = []
  const vertical: VerticalRule[] = []
  let ctm: Matrix = IDENTITY
  const stack: Matrix[] = []

  const pushHorizontal = (x1: number, x2: number, y: number) => {
    if (Math.abs(x2 - x1) >= 10) horizontal.push({ y, x1: Math.min(x1, x2), x2: Math.max(x1, x2) })
  }
  const pushVertical = (y1: number, y2: number, x: number) => {
    if (Math.abs(y2 - y1) >= 10) vertical.push({ x, y1: Math.min(y1, y2), y2: Math.max(y1, y2) })
  }

  for (let index = 0; index < operators.fnArray.length; index++) {
    const fn = operators.fnArray[index]
    const args = operators.argsArray[index] as unknown[]

    if (fn === OPS.save) {
      stack.push(ctm)
      continue
    }
    if (fn === OPS.restore) {
      ctm = stack.pop() ?? IDENTITY
      continue
    }
    if (fn === OPS.transform) {
      ctm = multiply(ctm, args as Matrix)
      continue
    }
    if (fn !== OPS.constructPath) continue

    // pdf.js 4+ кладёт весь путь в constructPath: [операция отрисовки, [закодированный путь], габариты]
    const path = (args[1] as ArrayLike<ArrayLike<number>> | undefined)?.[0]
    if (!path) continue

    const points: [number, number][] = []
    let start: [number, number] | null = null

    for (let cursor = 0; cursor < path.length; ) {
      const code = path[cursor++]
      if (code === 0 || code === 1) {
        const point = apply(ctm, path[cursor], path[cursor + 1])
        cursor += 2
        points.push(point)
        if (code === 0) start = point
      } else if (code === 2) {
        points.push(apply(ctm, path[cursor + 4], path[cursor + 5]))
        cursor += 6
      } else if (code === 3) {
        points.push(apply(ctm, path[cursor + 2], path[cursor + 3]))
        cursor += 4
      } else if (code === 4) {
        if (start) points.push(start)
      } else {
        break
      }
    }

    for (let point = 1; point < points.length; point++) {
      const [x1, y1] = points[point - 1]
      const [x2, y2] = points[point]
      if (Math.abs(y1 - y2) <= 1.5) pushHorizontal(x1, x2, (y1 + y2) / 2)
      else if (Math.abs(x1 - x2) <= 1.5) pushVertical(y1, y2, (x1 + x2) / 2)
    }
  }

  return { horizontal: mergeHorizontal(horizontal), vertical: mergeVertical(vertical) }
}

/** Разбирает страницу: строки, картинки, таблицы и колонки. */
export async function buildPageLayout(page: PDFPageProxy): Promise<PageLayout> {
  const view = page.view as number[]
  const height = view[3] - view[1]
  const width = view[2] - view[0]
  const content = await page.getTextContent()
  const characters = content.items.reduce((sum, item) => sum + ('str' in item ? item.str.length : 0), 0)
  const lines = buildLines(content, height, view[0])

  if (characters < 20) {
    return { width, height, lines: [], tables: [], images: [], columns: null, scanned: true }
  }

  let tables: TableSpec[] = []
  let free = lines
  let images: ImageSpec[] = []
  try {
    const operators = await page.getOperatorList()
    const rules = readRules(operators)
    const detected = detectTables(rules.horizontal, rules.vertical, lines, height)
    tables = detected.tables
    free = detected.free
    images = await readImages(page, operators, height, view[0], view[1])
  } catch {
    // Если разобрать графику не вышло, остаётся текстовый слой — документ всё равно соберётся.
    tables = []
    free = lines
    images = []
  }

  const contentLeft = Math.min(...free.map((line) => line.left), width)
  const contentRight = Math.max(...free.map((line) => line.right), 0)

  // Выравнивание: центр и правый край вычисляем по содержимому страницы.
  for (const line of free) {
    const leftGap = line.left - contentLeft
    const rightGap = contentRight - line.right
    const lineWidth = line.right - line.left
    const full = lineWidth > (contentRight - contentLeft) * 0.55

    if (full && leftGap < 3 && rightGap < 3) line.align = 'justify'
    else if (full && leftGap < 3) line.align = 'left'
    else if (Math.abs(leftGap - rightGap) <= Math.max(3, line.size) && leftGap > 2) line.align = 'center'
    else if (rightGap < 3 && leftGap > line.size) line.align = 'right'
    else line.align = 'left'
  }

  const columns = detectColumns(free, contentLeft, contentRight)

  return { width, height, lines: free, tables, images, columns, scanned: false }
}
