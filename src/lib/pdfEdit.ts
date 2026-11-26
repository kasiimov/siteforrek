import { PDFArray, PDFDocument, PDFName, StandardFonts, degrees, rgb } from 'pdf-lib'
import { pdfjsLib } from './pdf'
import { baseName, formatSize, type Output } from './download'

export type Progress = (done: number, total: number) => void

const A4: [number, number] = [595.28, 841.89]
const LETTER: [number, number] = [612, 792]

function toBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy], { type: 'application/pdf' })
}

function single(bytes: Uint8Array, name: string): Output[] {
  return [{ name, blob: toBlob(bytes) }]
}

async function load(bytes: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true })
}

type PdfJsDocument = Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>

async function renderPage(
  doc: PdfJsDocument,
  pageNumber: number,
  scale: number,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(viewport.width))
  canvas.height = Math.max(1, Math.round(viewport.height))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas недоступен')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: context, viewport, canvas }).promise
  page.cleanup()
  return { canvas, width: base.width, height: base.height }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось закодировать страницу'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Число страниц без рендера — для проверки диапазонов. */
export async function countPages(file: File): Promise<number> {
  const doc = await load(await file.arrayBuffer())
  return doc.getPageCount()
}

/** Объединяет несколько PDF в один в порядке добавления. */
export async function mergePdfs(files: File[], onProgress?: Progress): Promise<Output[]> {
  const out = await PDFDocument.create()
  for (let index = 0; index < files.length; index++) {
    const source = await load(await files[index].arrayBuffer())
    const copied = await out.copyPages(source, source.getPageIndices())
    for (const page of copied) out.addPage(page)
    onProgress?.(index + 1, files.length)
  }
  return single(await out.save(), 'merged.pdf')
}

/** Делит документ на части по диапазонам: «1-2, 3-5» → два файла. */
export async function splitPdf(
  file: File,
  groups: number[][],
  onProgress?: Progress,
): Promise<Output[]> {
  const source = await load(await file.arrayBuffer())
  const name = baseName(file.name)
  const outputs: Output[] = []

  for (let index = 0; index < groups.length; index++) {
    const out = await PDFDocument.create()
    const copied = await out.copyPages(
      source,
      groups[index].map((page) => page - 1),
    )
    for (const page of copied) out.addPage(page)
    const from = groups[index][0]
    const to = groups[index][groups[index].length - 1]
    const suffix = from === to ? String(from) : `${from}-${to}`
    outputs.push({ name: `${name}-${suffix}.pdf`, blob: toBlob(await out.save()) })
    onProgress?.(index + 1, groups.length)
  }

  return outputs
}

/** Оставляет только выбранные страницы. */
export async function keepPages(file: File, pages: number[]): Promise<Output[]> {
  const source = await load(await file.arrayBuffer())
  const out = await PDFDocument.create()
  const copied = await out.copyPages(
    source,
    pages.map((page) => page - 1),
  )
  for (const page of copied) out.addPage(page)
  return single(await out.save(), `${baseName(file.name)}-pages.pdf`)
}

/** Удаляет выбранные страницы, остальные сохраняет по порядку. */
export async function removePages(file: File, pages: number[]): Promise<Output[]> {
  const source = await load(await file.arrayBuffer())
  const drop = new Set(pages)
  const keep = source
    .getPageIndices()
    .map((index) => index + 1)
    .filter((page) => !drop.has(page))
  if (!keep.length) throw new Error('Нельзя удалить все страницы документа')
  const out = await PDFDocument.create()
  const copied = await out.copyPages(
    source,
    keep.map((page) => page - 1),
  )
  for (const page of copied) out.addPage(page)
  return single(await out.save(), `${baseName(file.name)}-trimmed.pdf`)
}

/** Поворачивает страницы (или весь документ) на 90/180/270 градусов. */
export async function rotatePdf(file: File, pages: number[] | null, angle: number): Promise<Output[]> {
  const source = await load(await file.arrayBuffer())
  const targets = pages ? new Set(pages) : null
  source.getPages().forEach((page, index) => {
    if (targets && !targets.has(index + 1)) return
    page.setRotation(degrees((page.getRotation().angle + angle) % 360))
  })
  return single(await source.save(), `${baseName(file.name)}-rotated.pdf`)
}

export type PageNumberOptions = {
  position: 'bottom-center' | 'bottom-right' | 'top-right'
  start: number
}

/** Проставляет номера страниц. */
export async function addPageNumbers(file: File, options: PageNumberOptions): Promise<Output[]> {
  const doc = await load(await file.arrayBuffer())
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const size = 11

  doc.getPages().forEach((page, index) => {
    const { width, height } = page.getSize()
    const label = String(options.start + index)
    const textWidth = font.widthOfTextAtSize(label, size)
    const x = options.position === 'bottom-center' ? width / 2 - textWidth / 2 : width - 36 - textWidth
    const y = options.position === 'top-right' ? height - 30 : 22
    page.drawText(label, { x, y, size, font, color: rgb(0.32, 0.32, 0.38) })
  })

  return single(await doc.save(), `${baseName(file.name)}-numbered.pdf`)
}

export type WatermarkOptions = {
  text: string
  size: number
  opacity: number
}

let watermarkFontBytes: Promise<ArrayBuffer> | null = null

/** Шрифт с кириллицей: стандартные шрифты PDF её не кодируют. */
function loadWatermarkFont(): Promise<ArrayBuffer> {
  if (!watermarkFontBytes) {
    const url = new URL('fonts/watermark.ttf', document.baseURI).href
    watermarkFontBytes = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Не удалось загрузить шрифт для водяного знака')
        return response.arrayBuffer()
      })
      .catch((error: unknown) => {
        watermarkFontBytes = null
        throw error
      })
  }
  return watermarkFontBytes
}

/** Накладывает текстовый водяной знак по диагонали на каждую страницу. */
export async function addWatermark(file: File, options: WatermarkOptions): Promise<Output[]> {
  const text = options.text.trim()
  if (!text) throw new Error('Введите текст водяного знака')

  const doc = await load(await file.arrayBuffer())
  // Шрифт с кириллицей требует fontkit (1,1 МБ) — грузим его только здесь, а не вместе с инструментом.
  const { default: fontkit } = await import('@pdf-lib/fontkit')
  doc.registerFontkit(fontkit)
  const font = await doc.embedFont(await loadWatermarkFont(), { subset: true })

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, options.size)
    const textHeight = font.heightAtSize(options.size)
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: options.size,
      font,
      color: rgb(0.36, 0.29, 0.52),
      opacity: options.opacity,
      rotate: degrees(45),
    })
  }

  return single(await doc.save(), `${baseName(file.name)}-watermark.pdf`)
}

/** Убирает пометки, комментарии и подписи-аннотации — само содержимое страниц не трогаем. */
export async function eraseAnnotations(file: File): Promise<{ outputs: Output[]; note?: string }> {
  const doc = await load(await file.arrayBuffer())
  let removed = 0

  for (const page of doc.getPages()) {
    const annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)
    if (annotations) removed += annotations.size()
    page.node.delete(PDFName.of('Annots'))
  }

  return {
    outputs: single(await doc.save(), `${baseName(file.name)}-clean.pdf`),
    note: removed
      ? `Убрали пометок и подписей-аннотаций: ${removed}. Содержимое страниц осталось как было.`
      : 'Пометок и подписей-аннотаций в файле не нашлось. Если подпись врисована в саму страницу, это обычная графика — её так не убрать.',
  }
}

/** Новый порядок страниц: 1-based список из всех страниц файла. */
export async function reorderPages(file: File, order: number[], onProgress?: Progress): Promise<Output[]> {
  const source = await load(await file.arrayBuffer())
  const out = await PDFDocument.create()
  const copied = await out.copyPages(
    source,
    order.map((page) => page - 1),
  )
  for (const page of copied) out.addPage(page)
  onProgress?.(1, 1)
  return single(await out.save(), `${baseName(file.name)}-reordered.pdf`)
}

/** Текстовый слой PDF → .txt. Для сканов текста нет — об этом честно скажем. */
export async function pdfToText(file: File, onProgress?: Progress): Promise<{ outputs: Output[]; note?: string }> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const content = await page.getTextContent()
      let text = ''

      for (const item of content.items) {
        if (!('str' in item)) continue
        text += item.str
        text += item.hasEOL ? '\n' : ' '
      }

      pages.push(text.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim())
      page.cleanup()
      onProgress?.(pageNumber, doc.numPages)
    }
  } finally {
    await doc.destroy()
  }

  const body = pages.filter(Boolean).join('\n\n')
  if (!body) {
    return {
      outputs: [],
      note: 'В этом PDF нет текстового слоя — перед нами скан или фотография. Текст из такого файла без распознавания не достать.',
    }
  }

  return {
    outputs: [
      {
        name: `${baseName(file.name)}-text.txt`,
        blob: new Blob([body], { type: 'text/plain;charset=utf-8' }),
      },
    ],
    note: `Готово: ${pages.length} страниц(ы) текста в .txt.`,
  }
}

export type LongImageOptions = {
  scale: number
  format: 'png' | 'jpg'
}

/** Все страницы одной длинной картинкой — удобно для пересылки и чтения с телефона. */
export async function pdfToLongImage(
  file: File,
  options: LongImageOptions,
  onProgress?: Progress,
): Promise<Output[]> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise

  try {
    const sizes: { width: number; height: number }[] = []
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1 })
      sizes.push({ width: viewport.width, height: viewport.height })
      page.cleanup()
    }

    const widest = Math.max(...sizes.map((size) => size.width))
    const stacked = sizes.reduce((sum, size) => sum + size.height, 0)
    // Браузер не любит гигантские canvas: держим и площадь, и высоту в разумных пределах.
    const byArea = Math.sqrt(36_000_000 / Math.max(1, widest * stacked))
    const byHeight = 32_000 / Math.max(1, stacked)
    const scale = Math.max(0.5, Math.min(options.scale, byArea, byHeight))

    const width = Math.max(1, Math.round(widest * scale))
    const height = Math.max(1, Math.round(stacked * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas недоступен')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)

    let offset = 0
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = Math.max(1, Math.round(viewport.width))
      pageCanvas.height = Math.max(1, Math.round(viewport.height))
      const pageContext = pageCanvas.getContext('2d')
      if (!pageContext) throw new Error('Canvas недоступен')
      pageContext.fillStyle = '#ffffff'
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      await page.render({ canvas: pageCanvas, canvasContext: pageContext, viewport }).promise
      context.drawImage(pageCanvas, Math.round((width - pageCanvas.width) / 2), offset)
      offset += pageCanvas.height
      pageCanvas.width = 0
      pageCanvas.height = 0
      page.cleanup()
      onProgress?.(pageNumber, doc.numPages)
    }

    const type = options.format === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92))
    canvas.width = 0
    canvas.height = 0
    if (!blob) throw new Error('Не удалось собрать изображение')

    return [
      {
        name: `${baseName(file.name)}-long.${options.format}`,
        blob,
      },
    ]
  } finally {
    await doc.destroy()
  }
}

export type ImagesToPdfOptions = {
  page: 'a4' | 'letter' | 'fit'
  margin: number
}

/** Собирает PDF из JPG/PNG: одна картинка — одна страница. */
export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions,
  onProgress?: Progress,
): Promise<Output[]> {
  const out = await PDFDocument.create()

  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    const bytes = await file.arrayBuffer()
    const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name)
    const image = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes)

    const [pageWidth, pageHeight] =
      options.page === 'fit'
        ? [image.width + options.margin * 2, image.height + options.margin * 2]
        : options.page === 'letter'
          ? LETTER
          : A4

    const page = out.addPage([pageWidth, pageHeight])
    const maxWidth = pageWidth - options.margin * 2
    const maxHeight = pageHeight - options.margin * 2
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height)
    const drawWidth = image.width * ratio
    const drawHeight = image.height * ratio

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    })

    onProgress?.(index + 1, files.length)
  }

  if (!out.getPageCount()) throw new Error('Не добавлено ни одной картинки')
  return single(await out.save(), 'images.pdf')
}

export type PdfToJpgOptions = {
  scale: number
  quality: number
}

/** Рендерит каждую страницу в JPEG. */
export async function pdfToJpgs(
  file: File,
  options: PdfToJpgOptions,
  onProgress?: Progress,
): Promise<Output[]> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const name = baseName(file.name)
  const outputs: Output[] = []

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const { canvas } = await renderPage(doc, pageNumber, options.scale)
      const blob = await canvasToJpeg(canvas, options.quality)
      outputs.push({
        name: `${name}-${String(pageNumber).padStart(2, '0')}.jpg`,
        blob,
      })
      canvas.width = 0
      canvas.height = 0
      onProgress?.(pageNumber, doc.numPages)
    }
  } finally {
    await doc.destroy()
  }

  return outputs
}

export type CompressOptions = {
  scale: number
  quality: number
}

/** Сжимает PDF: страницы пересобираются в JPEG с выбранным качеством. */
export type CompressResult = { outputs: Output[]; note?: string }

export async function compressPdf(
  file: File,
  options: CompressOptions,
  onProgress?: Progress,
): Promise<CompressResult> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const out = await PDFDocument.create()

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const { canvas, width, height } = await renderPage(doc, pageNumber, options.scale)
      const jpeg = canvas.toDataURL('image/jpeg', options.quality)
      const image = await out.embedJpg(jpeg)
      const page = out.addPage([width, height])
      page.drawImage(image, { x: 0, y: 0, width, height })
      canvas.width = 0
      canvas.height = 0
      onProgress?.(pageNumber, doc.numPages)
    }
  } finally {
    await doc.destroy()
  }

  const name = baseName(file.name)
  const bytes = await out.save()
  const compressed = toBlob(bytes)

  // Текстовый или уже оптимизированный PDF от пересборки в JPEG только растёт:
  // в таком случае отдаём исходный файл, а не раздутый результат.
  if (compressed.size >= file.size) {
    return {
      outputs: [{ name: `${name}-original.pdf`, blob: file }],
      note:
        `Сжатие не дало выигрыша: после пересборки вышло ${formatSize(compressed.size)} ` +
        `против ${formatSize(file.size)} в исходнике. Так бывает с текстовыми и уже сжатыми PDF — ` +
        `отдали ваш файл без изменений. Этот инструмент помогает сканам и фото.`,
    }
  }

  return { outputs: single(bytes, `${name}-compressed.pdf`) }
}
