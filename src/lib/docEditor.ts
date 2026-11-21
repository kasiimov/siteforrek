import { PDFDocument, PDFName, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { PDFPage } from 'pdf-lib'

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
}

export type ImageObject = ObjectBase & {
  kind: 'image'
  width: number
  height: number
  data: Uint8Array
  type: 'png' | 'jpg'
}

export type EditorObject = TextObject | ImageObject

export type EditorPage = {
  /** номер страницы в исходном PDF (с нуля) или null для пустого листа */
  source: number | null
  box: PageBox
  objects: EditorObject[]
}

export const TEXT_COLORS = [
  { value: '111111', label: 'Чёрный' },
  { value: '1A56DB', label: 'Синий' },
  { value: 'C81E1E', label: 'Красный' },
  { value: '0F7B4F', label: 'Зелёный' },
] as const

export const FONT_SIZES = [8, 10, 12, 14, 18, 24, 32, 48] as const

/** Сколько места занимает объект — нужно и для перетаскивания, и для рамки выделения. */
export function objectSize(object: EditorObject, lineHeight = 1.3): { width: number; height: number } {
  if (object.kind === 'image') return { width: object.width, height: object.height }
  const lines = object.text.split('\n').length
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

async function loadEditorFontBytes(): Promise<ArrayBuffer> {
  const url = new URL('fonts/watermark.ttf', document.baseURI).href
  const response = await fetch(url)
  if (!response.ok) throw new Error('Не удалось загрузить шрифт для текста')
  return response.arrayBuffer()
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
  const font = await out.embedFont(await loadEditorFontBytes(), { subset: true })

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

  for (let index = 0; index < options.pages.length; index++) {
    const model = options.pages[index]
    const target = targets[index]

    for (const object of model.objects) {
      if (object.kind === 'text') {
        if (!object.text.trim()) continue
        const [x, top] = options.toPdf(index, object.x, object.y)
        const baseline = top - font.heightAtSize(object.size)
        target.drawText(object.text, {
          x,
          y: baseline,
          size: object.size,
          font,
          color: hexToRgb(object.color),
          lineHeight: object.size * 1.3,
        })
      } else {
        if (!object.data.length) continue
        const image = object.type === 'png' ? await out.embedPng(object.data) : await out.embedJpg(object.data)
        const [x1, y1] = options.toPdf(index, object.x, object.y)
        const [x2, y2] = options.toPdf(index, object.x + object.width, object.y + object.height)
        const left = Math.min(x1, x2)
        const bottom = Math.min(y1, y2)
        target.drawImage(image, {
          x: left,
          y: bottom,
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        })
      }
      objects += 1
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
