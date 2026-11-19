import JSZip from 'jszip'
import { pdfjsLib } from './pdf'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

const { OPS } = pdfjsLib

export type ExtractedImage = {
  name: string
  blob: Blob
  width: number
  height: number
}

type Progress = (done: number, total: number) => void

/** Достаёт картинку из внутреннего стора pdf.js в любом из поддерживаемых видов. */
function resolveImage(page: PDFPageProxy, id: string): Promise<unknown> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (value: unknown) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    try {
      const immediate = page.objs.get(id, finish)
      if (immediate) finish(immediate)
    } catch {
      finish(null)
    }

    window.setTimeout(() => finish(null), 2000)
  })
}

function drawBitmap(bitmap: ImageBitmap, canvas: HTMLCanvasElement) {
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
}

function imageDataFromRaw(data: ArrayLike<number>, width: number, height: number): ImageData | null {
  const pixels = width * height
  const output = new Uint8ClampedArray(pixels * 4)
  const length = data.length

  if (length === pixels * 4) {
    output.set(data as Uint8ClampedArray)
  } else if (length === pixels * 3) {
    for (let i = 0, j = 0; i < pixels; i++, j += 3) {
      output[i * 4] = data[j]
      output[i * 4 + 1] = data[j + 1]
      output[i * 4 + 2] = data[j + 2]
      output[i * 4 + 3] = 255
    }
  } else if (length === pixels) {
    for (let i = 0; i < pixels; i++) {
      const value = data[i]
      output[i * 4] = value
      output[i * 4 + 1] = value
      output[i * 4 + 2] = value
      output[i * 4 + 3] = 255
    }
  } else {
    return null
  }

  return new ImageData(output, width, height)
}

/** Превращает объект изображения pdf.js в canvas или возвращает null. */
function toCanvas(source: unknown): HTMLCanvasElement | null {
  if (!source || typeof source !== 'object') return null

  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
    const canvas = document.createElement('canvas')
    drawBitmap(source, canvas)
    return canvas
  }

  const object = source as {
    width?: number
    height?: number
    data?: ArrayLike<number>
    bitmap?: unknown
    image?: unknown
  }

  if (typeof ImageBitmap !== 'undefined' && object.bitmap instanceof ImageBitmap) {
    const canvas = document.createElement('canvas')
    drawBitmap(object.bitmap, canvas)
    return canvas
  }

  if (typeof ImageBitmap !== 'undefined' && object.image instanceof ImageBitmap) {
    const canvas = document.createElement('canvas')
    drawBitmap(object.image, canvas)
    return canvas
  }

  if (object.data && object.width && object.height) {
    const image = imageDataFromRaw(object.data, object.width, object.height)
    if (!image) return null
    const canvas = document.createElement('canvas')
    canvas.width = object.width
    canvas.height = object.height
    canvas.getContext('2d')?.putImageData(image, 0, 0)
    return canvas
  }

  return null
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/** Находит все встроенные растровые изображения во всех страницах PDF. */
export async function extractImages(
  pdf: PDFDocumentProxy,
  onProgress?: Progress,
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = []
  const seen = new Set<string>()
  const total = pdf.numPages

  for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const operators = await page.getOperatorList()

    for (let index = 0; index < operators.fnArray.length; index++) {
      const fn = operators.fnArray[index]
      const args = operators.argsArray[index] as unknown[]

      let source: unknown

      if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
        const id = args?.[0]
        if (typeof id !== 'string' || seen.has(id)) continue
        seen.add(id)
        source = await resolveImage(page, id)
      } else if (fn === OPS.paintInlineImageXObject) {
        source = args?.[0]
      } else {
        continue
      }

      const canvas = toCanvas(source)
      if (!canvas) continue
      if (canvas.width < 48 || canvas.height < 48) continue

      const blob = await toBlob(canvas)
      if (!blob) continue

      images.push({
        name: `image-${String(images.length + 1).padStart(2, '0')}.png`,
        blob,
        width: canvas.width,
        height: canvas.height,
      })
    }

    page.cleanup()
    onProgress?.(pageNumber, total)
  }

  return images
}

/** Упаковывает найденные изображения в один ZIP-архив. */
export async function imagesToZip(images: ExtractedImage[]): Promise<Blob> {
  const zip = new JSZip()
  for (const image of images) zip.file(image.name, image.blob)
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}
