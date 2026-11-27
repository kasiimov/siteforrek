/**
 * Подготовка растра к распознаванию.
 *
 * Tesseract любит крупный, ровный и контрастный чёрно-белый текст. Скан или фото
 * бумаги на столе такими не бывают: тени, блики, древесный фон, мелкий кегль.
 * Поэтому перед распознаванием переводим картинку в серое, растягиваем контраст
 * и делаем локальную бинаризацию: фон и тени уходят в белое, штрихи — в чёрное.
 * Размер не меняем, поэтому координаты слов остаются в той же системе.
 */

export type PreparedOcr = {
  canvas: HTMLCanvasElement
  /** во сколько раз подготовленный растр крупнее исходного */
  scale: number
  /** из координат подготовленного (выровненного) растра в координаты исходного */
  toSource: (x: number, y: number) => { x: number; y: number }
}

const MAX_WIDTH = 3000
const MAX_PIXELS = 12_000_000
const MAX_UPSCALE = 3

/** Бинаризация по локальному среднему: справляется с тенями и неровным светом. */
function binarize(gray: Uint8Array, width: number, height: number, darkCut: number): Uint8Array {
  const total = width * height
  const integral = new Uint32Array((width + 1) * (height + 1))
  for (let y = 0; y < height; y++) {
    let rowSum = 0
    const rowOffset = (y + 1) * (width + 1)
    const prevOffset = y * (width + 1)
    for (let x = 0; x < width; x++) {
      rowSum += gray[y * width + x]
      integral[rowOffset + x + 1] = integral[prevOffset + x + 1] + rowSum
    }
  }

  const window = Math.max(15, Math.round(width / 45) | 1)
  const radius = window >> 1
  const out = new Uint8Array(total)

  for (let y = 0; y < height; y++) {
    const top = Math.max(0, y - radius)
    const bottom = Math.min(height - 1, y + radius)
    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - radius)
      const right = Math.min(width - 1, x + radius)
      const sum =
        integral[(bottom + 1) * (width + 1) + right + 1] -
        integral[top * (width + 1) + right + 1] -
        integral[(bottom + 1) * (width + 1) + left] +
        integral[top * (width + 1) + left]
      const area = (right - left + 1) * (bottom - top + 1)
      const mean = sum / area
      const value = gray[y * width + x]
      // Совсем тёмное пятно — это фон (стол, тень), а не буквы.
      if (mean < darkCut) {
        out[y * width + x] = 255
        continue
      }
      out[y * width + x] = value < mean - Math.max(10, mean * 0.16) ? 0 : 255
    }
  }

  return out
}

export function prepareForOcr(source: HTMLCanvasElement): PreparedOcr {
  const sourcePixels = Math.max(1, source.width * source.height)
  let scale = Math.min(MAX_UPSCALE, Math.max(1, MAX_WIDTH / Math.max(1, source.width)))
  if (sourcePixels * scale * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / sourcePixels)
  if (!Number.isFinite(scale) || scale <= 0) scale = 1

  const width = Math.max(32, Math.round(source.width * scale))
  const height = Math.max(32, Math.round(source.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return { canvas: source, scale: 1, toSource: (x, y) => ({ x, y }) }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)

  const image = context.getImageData(0, 0, width, height)
  const data = image.data
  const total = width * height
  const gray = new Uint8Array(total)
  const histogram = new Uint32Array(256)
  for (let i = 0; i < total; i++) {
    const offset = i * 4
    // Яркость считаем сами: canvas filter в части браузеров не работает.
    const value = Math.round(0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2])
    gray[i] = value
    histogram[value] += 1
  }

  const percentile = (part: number) => {
    const target = total * part
    let seen = 0
    for (let value = 0; value < 256; value++) {
      seen += histogram[value]
      if (seen >= target) return value
    }
    return 255
  }

  const dark = percentile(0.02)
  const paper = percentile(0.85)
  const span = Math.max(24, paper - dark)
  const normalized = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    const value = Math.round(((gray[i] - dark) * 255) / span)
    normalized[i] = value < 0 ? 0 : value > 255 ? 255 : value
  }

  const binary = binarize(normalized, width, height, 60)

  for (let i = 0; i < total; i++) {
    const value = binary[i]
    const offset = i * 4
    data[offset] = value
    data[offset + 1] = value
    data[offset + 2] = value
    data[offset + 3] = 255
  }
  context.putImageData(image, 0, 0)

  // Снимок бумаги почти всегда чуть повёрнут, а Tesseract теряет строки уже
  // при наклоне в 5°. Выравниваем строки по горизонтали и запоминаем, как
  // вернуть координаты обратно на страницу.
  const angle = estimateSkew(canvas)
  if (Math.abs(angle) < 0.75) {
    return { canvas, scale, toSource: (x, y) => ({ x, y }) }
  }

  const rotated = rotateCanvas(canvas, angle)
  return {
    canvas: rotated.canvas,
    scale,
    toSource: (x, y) => {
      const dx = x - rotated.width / 2
      const dy = y - rotated.height / 2
      const cos = Math.cos(rotated.radians)
      const sin = Math.sin(rotated.radians)
      return {
        x: rotated.sourceWidth / 2 + dx * cos + dy * sin,
        y: rotated.sourceHeight / 2 - dx * sin + dy * cos,
      }
    },
  }
}

/**
 * Угол наклона строк в градусах: перебираем углы и ищем тот, при котором
 * строки текста дают самые реские пики в профиле по горизонтали.
 */
function estimateSkew(canvas: HTMLCanvasElement): number {
  const sampleWidth = 600
  const ratio = Math.min(1, sampleWidth / Math.max(1, canvas.width))
  const width = Math.max(32, Math.round(canvas.width * ratio))
  const height = Math.max(32, Math.round(canvas.height * ratio))
  const sample = document.createElement('canvas')
  sample.width = width
  sample.height = height
  const sampleContext = sample.getContext('2d', { willReadFrequently: true })
  if (!sampleContext) return 0
  sampleContext.fillStyle = '#ffffff'
  sampleContext.fillRect(0, 0, width, height)
  sampleContext.imageSmoothingEnabled = true
  sampleContext.drawImage(canvas, 0, 0, width, height)

  const probe = document.createElement('canvas')
  const probeContext = probe.getContext('2d', { willReadFrequently: true })
  if (!probeContext) return 0

  const score = (angle: number): number => {
    probe.width = width
    probe.height = height
    probeContext.fillStyle = '#ffffff'
    probeContext.fillRect(0, 0, width, height)
    probeContext.translate(width / 2, height / 2)
    probeContext.rotate((angle * Math.PI) / 180)
    probeContext.drawImage(sample, -width / 2, -height / 2)
    probeContext.setTransform(1, 0, 0, 1, 0, 0)
    const pixels = probeContext.getImageData(0, 0, width, height).data
    const rows = new Float64Array(height)
    for (let y = 0; y < height; y++) {
      let dark = 0
      const offset = y * width * 4
      for (let x = 0; x < width; x++) if (pixels[offset + x * 4] < 128) dark += 1
      rows[y] = dark
    }
    let total = 0
    for (let y = 0; y < height; y++) total += rows[y] * rows[y]
    return total
  }

  let bestAngle = 0
  let bestScore = -1
  for (let angle = -12; angle <= 12; angle += 2) {
    const value = score(angle)
    if (value > bestScore) {
      bestScore = value
      bestAngle = angle
    }
  }
  for (let angle = bestAngle - 1.5; angle <= bestAngle + 1.5; angle += 0.5) {
    const value = score(angle)
    if (value > bestScore) {
      bestScore = value
      bestAngle = angle
    }
  }
  return Math.round(bestAngle * 10) / 10
}

/** Поворачивает растр так, чтобы строки встали ровно; поля добиваются белым. */
function rotateCanvas(source: HTMLCanvasElement, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const width = Math.ceil(source.width * cos + source.height * sin)
  const height = Math.ceil(source.width * sin + source.height * cos)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return { canvas: source, width: source.width, height: source.height, radians: 0, sourceWidth: source.width, sourceHeight: source.height }
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.translate(width / 2, height / 2)
  context.rotate(radians)
  context.drawImage(source, -source.width / 2, -source.height / 2)
  return { canvas, width, height, radians, sourceWidth: source.width, sourceHeight: source.height }
}
