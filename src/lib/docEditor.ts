import type { PDFFont, PDFPage } from 'pdf-lib'

export { parsePageOrder } from './pageOrder'

/** Модель редактора: страница-источник + объекты, которые пользователь добавил. */

export type PageBox = { width: number; height: number }

export type ObjectBase = {
  id: string
  /** левый край от левого края страницы, в точках отображения */
  x: number
  /** верхний край от верхнего края страницы, в точках отображения */
  y: number
}

export type TextFamily = 'sans' | 'serif' | 'mono'

/** Выравнивание абзаца внутри текстового блока. */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export const DEFAULT_LINE_HEIGHT = 1.3

/** Межстрочный интервал, ограниченный разумными пределами. */
export function lineHeightOf(object: TextObject): number {
  const value = object.lineHeight
  if (!value || !Number.isFinite(value)) return DEFAULT_LINE_HEIGHT
  return Math.min(3, Math.max(1, value))
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
  /** подчёркнутый текст */
  underline?: boolean
  /** зачёркнутый текст */
  strike?: boolean
  /** выравнивание абзаца внутри блока */
  align?: TextAlign
  /** межстрочный интервал: 1.0–3.0, по умолчанию 1.3 */
  lineHeight?: number
  /** семейство шрифта: без засечек, с засечками или моноширинный */
  family?: TextFamily
  /** текст пришёл из распознавания: повторный OCR его заменяет, а не дублирует */
  ocr?: boolean
  /** строку из распознавания правили руками: второй OCR её не трогает */
  edited?: boolean
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

export type MarkKind = 'highlight' | 'frame' | 'rect' | 'line' | 'arrow' | 'check' | 'cross' | 'ink'

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
export type CoverRect = {
  x: number
  y: number
  width: number
  height: number
  owner?: string
  /** цвет заплатки под пипеткой: на цветном фоне белый прямоугольник выглядит дырой */
  color?: string
}

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

/** Классические базовые шрифты: с засечками, без засечек и моноширинный. */
export const TEXT_FONTS = [
  { value: 'sans', label: 'PT Sans', hint: 'без засечек' },
  { value: 'serif', label: 'PT Serif', hint: 'с засечками' },
  { value: 'mono', label: 'IBM Plex Mono', hint: 'моноширинный' },
] as const

/** Размеры как в Word: можно выбрать из списка или вписать своё число. */
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72] as const

export const MIN_FONT_SIZE = 4
export const MAX_FONT_SIZE = 400

/** CSS-стек для предпросмотра: в редакторе подключены те же TTF, что уходят в PDF. */
export function fontStackFor(family?: TextFamily): string {
  if (family === 'serif') return "'PT Serif Editor', Georgia, 'Times New Roman', serif"
  if (family === 'mono') return "'Plex Mono Editor', 'Courier New', monospace"
  return "'PT Sans Editor', Helvetica, Arial, sans-serif"
}

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
export function objectSize(object: EditorObject, fallbackLineHeight = DEFAULT_LINE_HEIGHT): { width: number; height: number } {
  if (object.kind === 'image') return { width: object.width, height: object.height }
  if (object.kind === 'mark') return { width: object.width, height: object.height }
  const lineHeight = lineHeightOf(object) || fallbackLineHeight
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

/**
 * Файлы начертаний по семействам. PT Sans Regular лежит под старым именем
 * watermark.ttf — менять его не стали. У новых семейств есть только обычное
 * и жирное: на курсив берём ближайшее доступное, чтобы PDF не падал без шрифта.
 */
const FAMILY_FILES: Record<TextFamily, { regular: string; bold?: string; italic?: string; bolditalic?: string }> = {
  sans: { regular: 'watermark', bold: 'ptsans-bold', italic: 'ptsans-italic', bolditalic: 'ptsans-bolditalic' },
  serif: { regular: 'ptserif', bold: 'ptserif-bold' },
  mono: { regular: 'plexmono', bold: 'plexmono-bold' },
}

/** Файл шрифта: семейство плюс начертание (обычное, жирное, курсив, жирный курсив). */
function fontFileFor(family: TextFamily = 'sans', bold?: boolean, italic?: boolean): string {
  const files = FAMILY_FILES[family] ?? FAMILY_FILES.sans
  if (bold && italic) return files.bolditalic ?? files.bold ?? files.italic ?? files.regular
  if (bold) return files.bold ?? files.regular
  if (italic) return files.italic ?? files.regular
  return files.regular
}

function hexToRgb(hex: string): [number, number, number] {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? '111111'
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ]
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

  const { PDFDocument, PDFName, LineCapStyle, rgb, degrees } = await import('pdf-lib')
  const out = await PDFDocument.create()
  // fontkit (1,1 МБ) нужен только при сборке готового PDF — грузим его здесь, а не при открытии редактора.
  const { default: fontkit } = await import('@pdf-lib/fontkit')
  out.registerFontkit(fontkit)
  const fontCache = new Map<string, PDFFont>()
  // Начертания и семейства подключаем только если они действительно есть в тексте.
  const getFont = async (family?: TextFamily, bold?: boolean, italic?: boolean): Promise<PDFFont> => {
    const key = fontFileFor(family, bold, italic)
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
      const font = await getFont(object.family, object.bold, object.italic)
      const [x, top] = options.toPdf(index, object.x, object.y)
      const color = rgb(...hexToRgb(object.color))
      const size = object.size
      const align = object.align ?? 'left'
      const step = size * lineHeightOf(object)
      const lines = wrapTextToWidth(object.text, object.width, (line) => font.widthOfTextAtSize(line, size))
      const firstBaseline = top - font.heightAtSize(size)
      const rule = Math.max(0.5, size * 0.055)
      const underlineOffset = size * 0.12
      const strikeOffset = size * 0.3

      /** Подчёркивание и зачёркивание рисуем линией под/по строке. */
      const decorate = (lineX: number, lineWidth: number, baseline: number) => {
        if (object.underline) {
          target.drawLine({
            start: { x: lineX, y: baseline - underlineOffset },
            end: { x: lineX + lineWidth, y: baseline - underlineOffset },
            thickness: rule,
            color,
          })
        }
        if (object.strike) {
          target.drawLine({
            start: { x: lineX, y: baseline + strikeOffset },
            end: { x: lineX + lineWidth, y: baseline + strikeOffset },
            thickness: rule,
            color,
          })
        }
      }

      lines.forEach((line, lineIndex) => {
        const baseline = firstBaseline - lineIndex * step
        const lineWidth = font.widthOfTextAtSize(line, size)
        let lineX = x
        if (align === 'center') lineX = x + Math.max(0, (object.width - lineWidth) / 2)
        else if (align === 'right') lineX = x + Math.max(0, object.width - lineWidth)

        // «По ширине»: все строки кроме последней раздвигаем пробелами до края блока.
        if (align === 'justify' && lineIndex < lines.length - 1) {
          const words = line.split(/\s+/).filter(Boolean)
          if (words.length > 1) {
            const wordsWidth = words.reduce((sum, word) => sum + font.widthOfTextAtSize(word, size), 0)
            const gap = Math.max(0, (object.width - wordsWidth) / (words.length - 1))
            let cursor = x
            for (const word of words) {
              target.drawText(word, { x: cursor, y: baseline, size, font, color })
              cursor += font.widthOfTextAtSize(word, size) + gap
            }
            decorate(x, object.width, baseline)
            return
          }
        }

        target.drawText(line, { x: lineX, y: baseline, size, font, color })
        decorate(lineX, lineWidth, baseline)
      })
      return
    }

    if (object.kind === 'mark') {
      const color = rgb(...hexToRgb(object.color))
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

      if (object.mark === 'highlight' && !(object.points && object.points.length > 1)) {
        // Старые документы хранили маркер полосой — их рисуем как раньше.
        target.drawRectangle({ ...rect(left, top, object.width, object.height), color, opacity: opacity ?? 0.35 })
        return
      }
      if (object.mark === 'frame') {
        const gap = Math.max(3, stroke * 3)
        target.drawRectangle({
          ...rect(left, top, object.width, object.height),
          borderColor: color,
          borderWidth: stroke,
          opacity: opacity ?? 1,
        })
        target.drawRectangle({
          ...rect(
            left + gap,
            top + gap,
            Math.max(1, object.width - gap * 2),
            Math.max(1, object.height - gap * 2),
          ),
          borderColor: color,
          borderWidth: Math.max(0.4, stroke / 2),
          opacity: opacity ?? 1,
        })
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
      // Карандаш и маркер: свободный штрих по точкам.
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
        color: rgb(...hexToRgb(cover.color ?? 'FFFFFF')),
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

/**
 * Поворот страницы вместе с содержимым: текст, картинки, пятна и пометки
 * переезжают вслед за листом, чтобы ничего не разъезжалось.
 */
export function rotateEditorPage(page: EditorPage, clockwise: boolean): EditorPage {
  const oldWidth = page.box.width
  const oldHeight = page.box.height

  const point = (x: number, y: number): { x: number; y: number } =>
    clockwise ? { x: oldHeight - y, y: x } : { x: y, y: oldWidth - x }

  const rect = (r: { x: number; y: number; width: number; height: number }) => {
    const [cornerA, cornerB] = clockwise
      ? [point(r.x, r.y), point(r.x + r.width, r.y + r.height)]
      : [point(r.x + r.width, r.y + r.height), point(r.x, r.y)]
    return {
      x: Math.min(cornerA.x, cornerB.x),
      y: Math.min(cornerA.y, cornerB.y),
      width: Math.abs(cornerB.x - cornerA.x),
      height: Math.abs(cornerB.y - cornerA.y),
    }
  }

  const box = { width: oldHeight, height: oldWidth }

  const objects: EditorObject[] = page.objects.map((object) => {
    if (object.kind === 'text') {
      const height = Math.max(object.size * 1.3, objectSize(object).height)
      const moved = rect({ x: object.x, y: object.y, width: object.width, height })
      return {
        ...object,
        x: moved.x,
        y: moved.y,
        width: Math.max(40, Math.min(moved.width, box.width - moved.x - 6)),
      }
    }

    if (object.kind === 'mark') {
      const moved = rect(object)
      return {
        ...object,
        ...moved,
        flipX: object.mark === 'line' || object.mark === 'arrow' ? !object.flipY : object.flipX,
        flipY: object.mark === 'line' || object.mark === 'arrow' ? object.flipX : object.flipY,
        points: object.points?.map((item) => point(item.x, item.y)),
      }
    }

    return { ...object, ...rect(object) }
  })

  const covers = (page.covers ?? []).map((cover) => ({ ...cover, ...rect(cover) }))

  return {
    ...page,
    box,
    objects,
    covers,
    rotate: page.source === null ? page.rotate : (((page.rotate ?? 0) + (clockwise ? 90 : -90)) % 360 + 360) % 360,
  }
}

/**
 * Пипетка: самый частый светлый цвет в области — это фон. Нужен, чтобы
 * заплатка на сером скане или цветной таблице не выглядела белой дырой.
 */
export function pickBackgroundColor(
  canvas: HTMLCanvasElement | null,
  area: { x: number; y: number; width: number; height: number },
  factor = 1,
): string {
  const fallback = 'FFFFFF'
  if (!canvas) return fallback
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return fallback

  const left = Math.max(0, Math.round(area.x * factor))
  const top = Math.max(0, Math.round(area.y * factor))
  const width = Math.min(canvas.width - left, Math.round(area.width * factor))
  const height = Math.min(canvas.height - top, Math.round(area.height * factor))
  if (width < 1 || height < 1) return fallback

  try {
    const data = context.getImageData(left, top, width, height).data
    // Сетка из 32 оттенков на канал: похожие пиксели складываются в один бакет,
    // внутри бакета считаем средний цвет, чтобы попасть в фон точно.
    const buckets = new Map<number, { r: number; g: number; b: number; count: number }>()
    const step = Math.max(1, Math.floor(width / 64))
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const offset = (py * width + px) * 4
        if (data[offset + 3] < 200) continue
        const key = ((data[offset] >> 3) << 10) | ((data[offset + 1] >> 3) << 5) | (data[offset + 2] >> 3)
        const bucket = buckets.get(key)
        if (bucket) {
          bucket.r += data[offset]
          bucket.g += data[offset + 1]
          bucket.b += data[offset + 2]
          bucket.count += 1
        } else {
          buckets.set(key, { r: data[offset], g: data[offset + 1], b: data[offset + 2], count: 1 })
        }
      }
    }

    let best: { r: number; g: number; b: number; count: number } | null = null
    for (const bucket of buckets.values()) {
      if (!best || bucket.count > best.count) best = bucket
    }
    if (!best) return fallback

    const r = Math.round(best.r / best.count)
    const g = Math.round(best.g / best.count)
    const b = Math.round(best.b / best.count)
    // Слишком тёмный «фон» — это сам текст, заплатку делаем белой.
    if (r + g + b < 240) return fallback
    return [r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()
  } catch {
    return fallback
  }
}
