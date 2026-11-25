import { describe, expect, it } from 'vitest'
import { detectDocumentBox, otsuThreshold } from './autocrop'

function scene(
  width: number,
  height: number,
  background: number,
  paper: { x: number; y: number; width: number; height: number },
  paperTone = 235,
) {
  const data = new Uint8ClampedArray(width * height).fill(background)
  for (let y = paper.y; y < paper.y + paper.height; y++) {
    for (let x = paper.x; x < paper.x + paper.width; x++) {
      data[y * width + x] = paperTone
    }
  }
  // Несколько тёмных «строк» внутри листа: настоящий документ никогда не бывает
  // идеально белым, и детектор должен это принимать.
  for (let y = paper.y + 8; y < paper.y + paper.height - 8; y += 12) {
    for (let x = paper.x + 10; x < paper.x + paper.width - 14; x++) {
      data[y * width + x] = 30
    }
  }
  return { data, width, height }
}

describe('otsuThreshold', () => {
  it('делит тёмный фон и светлую бумагу', () => {
    const data = new Uint8ClampedArray(1000)
    for (let index = 0; index < 700; index++) data[index] = 30
    for (let index = 700; index < 1000; index++) data[index] = 230
    const threshold = otsuThreshold(data)
    expect(threshold).toBeGreaterThanOrEqual(30)
    expect(threshold).toBeLessThan(230)
  })
})

describe('detectDocumentBox', () => {
  it('находит лист на тёмном столе', () => {
    const image = scene(400, 300, 40, { x: 60, y: 40, width: 280, height: 220 })
    const box = detectDocumentBox(image)
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThan(50)
    expect(box!.x).toBeLessThan(70)
    expect(box!.y).toBeGreaterThan(30)
    expect(box!.y).toBeLessThan(50)
    expect(box!.width).toBeGreaterThan(260)
    expect(box!.width).toBeLessThan(300)
    expect(box!.coverage).toBeGreaterThan(0.3)
  })

  it('не трогает тёмный кадр без документа', () => {
    const image = { data: new Uint8ClampedArray(400 * 300).fill(20), width: 400, height: 300 }
    expect(detectDocumentBox(image)).toBeNull()
  })

  it('не трогает почти белый кадр', () => {
    const image = { data: new Uint8ClampedArray(400 * 300).fill(250), width: 400, height: 300 }
    expect(detectDocumentBox(image)).toBeNull()
  })

  it('не считает документом круглое светлое пятно без текста', () => {
    const width = 400
    const height = 300
    const data = new Uint8ClampedArray(width * height).fill(100)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x - 200) ** 2 + (y - 150) ** 2 < 110 ** 2) data[y * width + x] = 220
      }
    }
    expect(detectDocumentBox({ data, width, height })).toBeNull()
  })

  it('не считает документом маленькое пятно', () => {
    const image = scene(400, 300, 40, { x: 180, y: 130, width: 40, height: 40 })
    expect(detectDocumentBox(image)).toBeNull()
  })

  it('не обрезает скан, который уже занимает весь кадр', () => {
    const image = scene(400, 300, 40, { x: 0, y: 0, width: 400, height: 300 })
    expect(detectDocumentBox(image)).toBeNull()
  })
})
