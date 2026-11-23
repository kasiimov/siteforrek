import { LineCapStyle, PDFDocument, PDFName, rgb, degrees } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PDFFont, PDFPage } from 'pdf-lib'

/** Модель редактора: страница-источник + объекты, которые пользователь добавил. */

export type PageBox = { width: number; height: number }

export type ObjectBase = {
  id: string
  /** левый край от левого края страницы, в точках отображения */
  x: number
  /** верхний край от верхнего края страницы, в точках отображения */
  y: number
}

export type TextObject = ObjectBase & {
  kind: 'text'
  text: string
  size: number
  color: string
  /** ширина блока в точках — по ней текст переносится */
  width: number
  bold?: boolean
  italic?: boolean
}

export type ImageObject = ObjectBase & {
  kind: 'image'
  width: number
  height: number
  data: Uint8Array
  type: 'png' | 'jpg'
  /** фото-подложка страницы: рисуется под пятнами и текстом */
  base?: boolean
}

export type MarkKind = 'highlight' | 'rect' | 'line' | 'arrow' | 'check' | 'cross' | 'ink'

/**
 * Пометка на странице: выделение, рамка, линия, стрелка, галочка, крестик и рисунок от руки.
 * Живёт в координатах страницы и при сохранении рисуется поверх содержимого.
 */
export type MarkObject = ObjectBase & {
  kind: 'mark'
  mark: MarkKind
  width: number
  height: number
  color: string
  /** толщина линии в точках */
  stroke: number
  opacity?: number
  /** линия или стрелка шли справа налево / снизу вверх */
  flipX?: boolean
  flipY?: boolean
  /** карандаш: точки в координатах страницы */
  points?: { x: number; y: number }[]
}

export type EditorObject = TextObject | ImageObject | MarkObject

/**
 * Белое пятно поверх исходного содержимого: так убирают старый текст, фото и штампы.
 * owner — объект, ради которого пятно появилось: вместе с ним оно и удаляется.
 */
export type CoverRect = { x: number; y: number; width: number; height: number; owner?: string }

export type EditorPage = {
  /** номер страницы в исходном PDF (с нуля) или null для пустого листа */
  source: number | null
  box: PageBox
  objects: EditorObject[]
  /** закрашенные области: старый текст или картинка под ними не видны */
  covers?: CoverRect[]
  /** на странице не было текстового слоя — значит, это скан или фото */
  scanned?: boolean
  /** поворот страницы на 90/180/270 градусов поверх исходного */
  rotate?: number
}

export const TEXT_COLORS = [
  { value: '111111', label: 'Чёрный' },
  { value: '1A56DB', label: 'Синий' },
  { value: 'C81E1E', label: 'Красный' },
  { value: '0F7B4F', label: 'Зелёный' },
] as const

export const FONT_SIZES = [8, 10, 12, 14, 18, 24, 32, 48] as const

/**
 * Разбивает текст на строки по ширине блока — так же, как это сделает PDF при сборке.
 * Без этого длинная строка уезжала бы за край блока в готовом файле.
 */
export function wrapTextToWidth(
  text: string,
  width: number,
  measure: (line: string) => number,
): string[] {
  const lines: string[] = []
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }
    let line = words[0]
    for (let index = 1; index < words.length; index++) {
      const candidate = `${line} ${words[index]}`
      if (measure(candidate) <= width) {
        line = candidate
        continue
      }
      lines.push(line)
      line = words[index]
    }
    lines.push(line)
  }
  return lines
}

/** Сколько места занимает объект — нужно и для перетаскивания, и для рамки выделения. */
export function objectSize(object: EditorObject, lineHeight = 1.3): { width: number; height: number } {
  if (object.kind === 'image') return { width: object.width, height: object.height }
  if (object.kind === 'mark') return { width: object.width, height: object.height }
  // Ширина символа примерно 0.52 кегля: этого хватает, чтобы оценить перенос строк.
  const perLine = Math.max(1, Math.floor(object.width / Math.max(1, object.size * 0.52)))
  const lines = object.text
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / perLine)), 0)
  return { width: object.width, height: Math.round(Math.max(object.size, lines * object.size * lineHeight) * 10) / 10 }
}

/** Держит объект внутри страницы, чтобы его нельзя было утащить за край. */
export function clampPosition(
  box: PageBox,
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const maxX = Math.max(0, box.width - Math.min(width, box.width))
  const maxY = Math.max(0, box.height - Math.min(height, box.height))
  return {
    x: Math.round(Math.min(Math.max(0, x), maxX) * 10) / 10,
    y: Math.round(Math.min(Math.max(0, y), maxY) * 10) / 10,
  }
}

/** Новый порядок страниц: «3, 1, 2» — все страницы ровно по одному разу. */
export function parsePageOrder(input: string, total: number): number[] {
  const tokens = input
    .split(/[^\d]+/)
    .filter(Boolean)
    .map(Number)

  if (!tokens.length) throw new Error('Укажите новый порядок страниц, например: 3, 1, 2')
  if (tokens.some((page) => !Number.isInteger(page) || page < 1 || page > total)) {
    throw new Error(`Страницы должны быть от 1 до ${total}`)
  }
  if (new Set(tokens).size !== tokens.length) throw new Error('Одна и та же страница указана дважды')
  if (tokens.length !== total) {
    throw new Error(`Нужно перечислить все страницы: их ${total}, а в списке ${tokens.length}`)
  }

  return tokens
}

export function describeOrder(order: number[]): string {
  if (order.every((page, index) => page === index + 1)) return 'порядок не меняется'
  return order.join(' → ')
}

/** Вставляет пустой лист после указанной страницы. */
export function insertBlankPage(pages: EditorPage[], index: number, box: PageBox): EditorPage[] {
  const next = [...pages]
  next.splice(index + 1, 0, { source: null, box: { ...box }, objects: [] })
  return next
}

/** Приводит вставленную картинку к разумному размеру на странице. */
export function fitImage(box: PageBox, width: number, height: number, share = 0.5): { width: number; height: number } {
  const targetWidth = Math.max(24, box.width * share)
  const ratio = targetWidth / Math.max(1, width)
  let drawWidth = targetWidth
  let drawHeight = height * ratio
  // Высокое фото не должно свисать за нижний край страницы.
  const maxHeight = box.height * 0.6
  if (drawHeight > maxHeight) {
    const shrink = maxHeight / drawHeight
    drawWidth *= shrink
    drawHeight = maxHeight
  }
  return { width: Math.round(drawWidth), height: Math.round(drawHeight) }
}

async function loadEditorFontBytes(name = 'watermark'): Promise<ArrayBuffer> {
  const url = new URL(`fonts/${name}.ttf`, document.baseURI).href
  const response = await fetch(url)
  if (!response.ok) throw new Error('Не удалось загрузить шрифт для текста')
  return response.arrayBuffer()
}

/** Шрифт для текста: обычный, жирный, курсив или жирный курсив. */
function fontFileFor(bold?: boolean, italic?: boolean): string {
  if (bold && italic) return 'ptsans-bolditalic'
  if (bold) return 'ptsans-bold'
  if (italic) return 'ptsans-italic'
  return 'watermark'
}

function hexToRgb(hex: string) {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? '111111'
  return rgb(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  )
}

/** Переводит точку страницы в координаты PDF: учитывает поворот исходной страницы. */
export type ToPdfPoint = (x: number, y: number) => [number, number]

export type ComposeOptions = {
  /** исходный файл; null — документ из одних пустых листов */
  source: File | null
  pages: EditorPage[]
  /** координаты для каждой страницы: 0..n, где n — число страниц */
  toPdf: (pageIndex: number, x: number, y: number) => [number, number]
  eraseAnnotations: boolean
}

/**
 * Собирает новый PDF: страницы исходника в текущем порядке, пустые листы на своих местах,
 * поверх — добавленные текст и картинки. Пустых страниц без исходника тоже хватает.
 */
export async function composePdf(options: ComposeOptions): Promise<{ blob: Blob; objects: number; pages: number }> {
  if (!options.pages.length) throw new Error('В документе нет ни одной страницы')

  const out = await PDFDocument.create()
  out.registerFontkit(fontkit)
  const fontCache = new Map<string, PDFFont>()
  // Жирный и курсив подключаем только если они действительно есть в тексте.
  const getFont = async (bold?: boolean, italic?: boolean): Promise<PDFFont> => {
    const key = fontFileFor(bold, italic)
    const cached = fontCache.get(key)
    if (cached) return cached
    const embedded = await out.embedFont(await loadEditorFontBytes(key), { subset: true })
    fontCache.set(key, embedded)
    return embedded
  }

  const source = options.source
    ? await PDFDocument.load(await options.source.arrayBuffer(), { ignoreEncryption: true })
    : null

  const sourceIndices = options.pages
    .map((page) => page.source)
    .filter((index): index is number => index !== null)

  const copied = source && sourceIndices.length ? await out.copyPages(source, sourceIndices) : []
  const targets: PDFPage[] = []
  let cursor = 0

  for (const page of options.pages) {
    if (page.source === null) {
      targets.push(out.addPage([page.box.width, page.box.height]))
      continue
    }
    const target = copied[cursor]
    cursor += 1
    if (!target) throw new Error('Не удалось перенести страницу из исходного PDF')
    out.addPage(target)
    targets.push(target)
  }

  let objects = 0

  /** Один объект редактора на готовой странице PDF. */
  const drawObject = async (object: EditorObject, target: PDFPage, index: number) => {
    if (object.kind === 'text') {
      if (!object.text.trim()) return
      const font = await getFont(object.bold, object.italic)
      const [x, top] = options.toPdf(index, object.x, object.y)
      const baseline = top - font.heightAtSize(object.size)
      const lines = wrapTextToWidth(object.text, object.width, (line) => font.widthOfTextAtSize(line, object.size))
      target.drawText(lines.join('\n'), {
        x,
        y: baseline,
        size: object.size,
        font,
        color: hexToRgb(object.color),
        lineHeight: object.size * 1.3,
      })
      return
    }

    if (object.kind === 'mark') {
      const color = hexToRgb(object.color)
      const stroke = Math.max(0.4, object.stroke)
      const opacity = object.opacity
      const left = object.x
      const top = object.y
      const right = left + object.width
      const bottom = top + object.height
      const line = (ax: number, ay: number, bx: number, by: number) => {
        const [x1, y1] = options.toPdf(index, ax, ay)
        const [x2, y2] = options.toPdf(index, bx, by)
        target.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness: stroke,
          color,
          opacity,
          lineCap: LineCapStyle.Round,
        })
      }
      const rect = (x: number, y: number, width: number, height: number) => {
        const [x1, y1] = options.toPdf(index, x, y)
        const [x2, y2] = options.toPdf(index, x + width, y + height)
        return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
      }

      if (object.mark === 'highlight') {
        target.drawRectangle({ ...rect(left, top, object.width, object.height), color, opacity: opacity ?? 0.35 })
        return
      }
      if (object.mark === 'rect') {
        target.drawRectangle({
          ...rect(left, top, object.width, object.height),
          borderColor: color,
          borderWidth: stroke,
          opacity,
        })
        return
      }
      if (object.mark === 'line' || object.mark === 'arrow') {
        const startX = object.flipX ? right : left
        const endX = object.flipX ? left : right
        const startY = object.flipY ? bottom : top
        const endY = object.flipY ? top : bottom
        line(startX, startY, endX, endY)
        if (object.mark === 'arrow') {
          const angle = Math.atan2(endY - startY, endX - startX)
          const size = Math.max(6, stroke * 4)
          line(endX, endY, endX - Math.cos(angle - 0.5) * size, endY - Math.sin(angle - 0.5) * size)
          line(endX, endY, endX - Math.cos(angle + 0.5) * size, endY - Math.sin(angle + 0.5) * size)
        }
        return
      }
      if (object.mark === 'check') {
        line(left + object.width * 0.08, top + object.height * 0.55, left + object.width * 0.36, top + object.height * 0.9)
        line(left + object.width * 0.36, top + object.height * 0.9, left + object.width * 0.94, top + object.height * 0.12)
        return
      }
      if (object.mark === 'cross') {
        line(left + object.width * 0.12, top + object.height * 0.12, right - object.width * 0.12, bottom - object.height * 0.12)
        line(right - object.width * 0.12, top + object.height * 0.12, left + object.width * 0.12, bottom - object.height * 0.12)
        return
      }
      const points = object.points ?? []
      for (let position = 1; position < points.length; position++) {
        line(points[position - 1].x, points[position - 1].y, points[position].x, points[position].y)
      }
      return
    }

    if (!object.data.length) return
    const image = object.type === 'png' ? await out.embedPng(object.data) : await out.embedJpg(object.data)
    const [x1, y1] = options.toPdf(index, object.x, object.y)
    const [x2, y2] = options.toPdf(index, object.x + object.width, object.y + object.height)
    target.drawImage(image, {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    })
  }

  for (let index = 0; index < options.pages.length; index++) {
    const model = options.pages[index]
    const target = targets[index]

    // 1. Подложка страницы: фото скана лежит ниже всех пятен и правок.
    for (const object of model.objects) {
      if (object.kind === 'image' && object.base) await drawObject(object, target, index)
    }

    // 2. Закрываем то, что нужно убрать: старый текст, фото, штампы.
    for (const cover of model.covers ?? []) {
      const [x1, y1] = options.toPdf(index, cover.x, cover.y)
      const [x2, y2] = options.toPdf(index, cover.x + cover.width, cover.y + cover.height)
      const width = Math.abs(x2 - x1)
      const height = Math.abs(y2 - y1)
      if (width < 0.4 || height < 0.4) continue
      target.drawRectangle({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width,
        height,
        color: rgb(1, 1, 1),
      })
    }

    // 3. Всё остальное поверх пятен: новый текст, картинки, подписи.
    for (const object of model.objects) {
      if (object.kind === 'image' && object.base) continue
      await drawObject(object, target, index)
      objects += 1
    }

    // Поворот страницы: пользователь выпрямил кривой скан.
    if (model.rotate) {
      const base = target.getRotation().angle
      target.setRotation(degrees(((base + model.rotate) % 360 + 360) % 360))
    }

    // Пометки и подписи-аннотации живут отдельно от содержимого страницы:
    // убираем их целиком, само содержимое не трогаем.
    if (options.eraseAnnotations) target.node.delete(PDFName.of('Annots'))
  }

  const bytes = await out.save()
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return { blob: new Blob([copy], { type: 'application/pdf' }), objects, pages: targets.length }
}
