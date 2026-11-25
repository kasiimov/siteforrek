/**
 * Автообрезка фото документа.
 *
 * Фотографию документа легко узнать по светлому листу на более тёмном фоне.
 * Мы ищем границы листа по яркости, обрезаем поля вокруг него и, если лист
 * упирается в край кадра, дорисовываем недостающую бумагу цветом самого листа.
 * Обычные фото (пейзаж, человек, скриншот) не трогаем: без найденного листа
 * функция возвращает null.
 */

export type GrayImage = { data: Uint8ClampedArray | Uint8Array; width: number; height: number }
export type DocumentBox = { x: number; y: number; width: number; height: number; coverage: number }
export type CropResult = {
  bytes: Uint8Array
  type: 'png' | 'jpg'
  /** границы листа в пикселях исходного фото */
  box: DocumentBox
  /** сколько пикселей бумаги пришлось дорисовать */
  padded: { left: number; top: number; right: number; bottom: number }
}

/** Порог Оцу: делит яркости на «фон» и «бумагу» по гистограмме. */
export function otsuThreshold(data: ArrayLike<number>): number {
  const histogram = new Array<number>(256).fill(0)
  for (let index = 0; index < data.length; index++) histogram[data[index] & 255] += 1
  const total = data.length
  if (!total) return 128

  let sum = 0
  for (let value = 0; value < 256; value++) sum += value * histogram[value]

  let sumBackground = 0
  let weightBackground = 0
  let best = -1
  let threshold = 128
  for (let value = 0; value < 256; value++) {
    weightBackground += histogram[value]
    if (!weightBackground) continue
    const weightForeground = total - weightBackground
    if (!weightForeground) break
    sumBackground += value * histogram[value]
    const meanBackground = sumBackground / weightBackground
    const meanForeground = (sum - sumBackground) / weightForeground
    const between = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2
    if (between > best) {
      best = between
      threshold = value
    }
  }
  return threshold
}

/** Сглаживание профиля: одиночные пиксели шума не должны двигать границы листа. */
function smoothProfile(profile: Float32Array): Float32Array {
  const out = new Float32Array(profile.length)
  for (let index = 0; index < profile.length; index++) {
    let sum = 0
    let count = 0
    for (let offset = -2; offset <= 2; offset++) {
      const at = index + offset
      if (at < 0 || at >= profile.length) continue
      sum += profile[at]
      count += 1
    }
    out[index] = sum / Math.max(1, count)
  }
  return out
}

function bounds(profile: Float32Array, threshold: number): { from: number; to: number } | null {
  let from = -1
  let to = -1
  for (let index = 0; index < profile.length; index++) {
    if (profile[index] >= threshold) {
      if (from < 0) from = index
      to = index
    }
  }
  return from < 0 ? null : { from, to }
}

function brightShare(
  data: GrayImage['data'],
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  threshold: number,
): number {
  let bright = 0
  let total = 0
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      if (data[row * width + column] > threshold) bright += 1
      total += 1
    }
  }
  return total ? bright / total : 0
}

/**
 * Ищет лист документа на снимке. Возвращает координаты листа или null,
 * если это не похоже на фото документа.
 */
export function detectDocumentBox(image: GrayImage): DocumentBox | null {
  const { data, width, height } = image
  if (width < 60 || height < 60) return null

  const threshold = otsuThreshold(data)
  const columns = new Float32Array(width)
  const rows = new Float32Array(height)
  let brightTotal = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] > threshold) {
        columns[x] += 1
        rows[y] += 1
        brightTotal += 1
      }
    }
  }

  const brightShareAll = brightTotal / (width * height)
  // Совсем тёмный кадр или почти белый лист без границ — не наш случай.
  if (brightShareAll < 0.06 || brightShareAll > 0.94) return null

  const columnProfile = smoothProfile(columns)
  const rowProfile = smoothProfile(rows)
  const columnBounds = bounds(columnProfile, Math.max(3, height * 0.14))
  const rowBounds = bounds(rowProfile, Math.max(3, width * 0.14))
  if (!columnBounds || !rowBounds) return null

  const box: DocumentBox = {
    x: columnBounds.from,
    y: rowBounds.from,
    width: columnBounds.to - columnBounds.from + 1,
    height: rowBounds.to - rowBounds.from + 1,
    coverage: 0,
  }

  const areaShare = (box.width * box.height) / (width * height)
  if (areaShare < 0.12) return null

  // Лист занимает почти весь кадр: либо это уже ровный скан, либо фон слился с бумагой.
  if (box.width > width * 0.97 && box.height > height * 0.97) return null

  const ratio = box.width / box.height
  if (ratio < 0.28 || ratio > 3.6) return null

  const inside = brightShare(data, width, box.x, box.y, box.width, box.height, threshold)
  if (inside < 0.5) return null

  // Внутри листа должны быть тёмные буквы. Смотрим на середину листа, чтобы
  // тёмные углы вокруг наклонной страницы не выдавались за текст.
  const marginX = Math.round(box.width * 0.25)
  const marginY = Math.round(box.height * 0.25)
  const innerWidth = box.width - marginX * 2
  const innerHeight = box.height - marginY * 2
  if (innerWidth < 8 || innerHeight < 8) return null
  const innerBright = brightShare(
    data,
    width,
    box.x + marginX,
    box.y + marginY,
    innerWidth,
    innerHeight,
    threshold,
  )
  const ink = 1 - innerBright
  // Пустое цветное пятно (шар, лампа, небо) — не документ: на бумаге всегда есть текст.
  if (ink < 0.015 || ink > 0.45) return null

  box.coverage = Math.round(areaShare * 1000) / 1000
  return box
}

function grayFromImageData(pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(width * height)
  for (let index = 0; index < gray.length; index++) {
    const at = index * 4
    gray[index] = Math.round(0.299 * pixels[at] + 0.587 * pixels[at + 1] + 0.114 * pixels[at + 2])
  }
  return gray
}

/**
 * Обрезает фото документа: находит лист, убирает стол/фон и дорисовывает
 * недостающую бумагу, если лист вышел за край кадра.
 * Возвращает null, если документа на фото не видно.
 */
export async function autoCropDocument(bytes: Uint8Array, type: 'png' | 'jpg'): Promise<CropResult | null> {
  const source = new Blob([bytes as BlobPart], { type: type === 'png' ? 'image/png' : 'image/jpeg' })
  const bitmap = await createImageBitmap(source)
  try {
    const maxSide = 520
    const sampleScale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const sampleWidth = Math.max(1, Math.round(bitmap.width * sampleScale))
    const sampleHeight = Math.max(1, Math.round(bitmap.height * sampleScale))

    const sample = document.createElement('canvas')
    sample.width = sampleWidth
    sample.height = sampleHeight
    const sampleContext = sample.getContext('2d', { willReadFrequently: true })
    if (!sampleContext) return null
    sampleContext.drawImage(bitmap, 0, 0, sampleWidth, sampleHeight)
    const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data
    const gray = grayFromImageData(pixels, sampleWidth, sampleHeight)
    const found = detectDocumentBox({ data: gray, width: sampleWidth, height: sampleHeight })
    if (!found) return null

    // Границы листа в исходном разрешении.
    const left = Math.max(0, Math.floor(found.x / sampleScale))
    const top = Math.max(0, Math.floor(found.y / sampleScale))
    const right = Math.min(bitmap.width, Math.ceil((found.x + found.width) / sampleScale))
    const bottom = Math.min(bitmap.height, Math.ceil((found.y + found.height) / sampleScale))
    const cropWidth = right - left
    const cropHeight = bottom - top
    if (cropWidth < 24 || cropHeight < 24) return null

    // Цвет бумаги: средний цвет светлых пикселей внутри листа.
    const threshold = otsuThreshold(gray)
    let red = 0
    let green = 0
    let blue = 0
    let count = 0
    for (let y = found.y; y < found.y + found.height; y += 2) {
      for (let x = found.x; x < found.x + found.width; x += 2) {
        const grayAt = y * sampleWidth + x
        if (gray[grayAt] <= threshold) continue
        const at = grayAt * 4
        red += pixels[at]
        green += pixels[at + 1]
        blue += pixels[at + 2]
        count += 1
      }
    }
    const paper = count
      ? { r: Math.round(red / count), g: Math.round(green / count), b: Math.round(blue / count) }
      : { r: 255, g: 255, b: 255 }

    // Лист упёрся в край кадра — дорисовываем бумагу с этой стороны.
    const touch = Math.max(2, Math.round(Math.min(bitmap.width, bitmap.height) * 0.004))
    const padSide = Math.round(Math.min(cropWidth, cropHeight) * 0.025)
    const padded = {
      left: left <= touch ? padSide : 0,
      top: top <= touch ? padSide : 0,
      right: right >= bitmap.width - touch ? padSide : 0,
      bottom: bottom >= bitmap.height - touch ? padSide : 0,
    }

    const output = document.createElement('canvas')
    output.width = cropWidth + padded.left + padded.right
    output.height = cropHeight + padded.top + padded.bottom
    const context = output.getContext('2d')
    if (!context) return null
    context.fillStyle = `rgb(${paper.r}, ${paper.g}, ${paper.b})`
    context.fillRect(0, 0, output.width, output.height)
    context.drawImage(bitmap, left, top, cropWidth, cropHeight, padded.left, padded.top, cropWidth, cropHeight)

    const outputType = type === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, outputType, 0.93))
    if (!blob) return null
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      type,
      box: {
        x: left,
        y: top,
        width: cropWidth,
        height: cropHeight,
        coverage: found.coverage,
      },
      padded,
    }
  } finally {
    bitmap.close()
  }
}
