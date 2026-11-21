import { describe, expect, it } from 'vitest'
import { clampPosition, describeOrder, fitImage, insertBlankPage, objectSize, parsePageOrder } from './docEditor'
import type { EditorPage, TextObject } from './docEditor'

const box = { width: 595.28, height: 841.89 }

describe('parsePageOrder', () => {
  it('принимает новый порядок всех страниц', () => {
    expect(parsePageOrder('3, 1, 2', 3)).toEqual([3, 1, 2])
    expect(parsePageOrder(' 2 1 ', 2)).toEqual([2, 1])
  })

  it('падает, если страница потерялась или повторилась', () => {
    expect(() => parsePageOrder('1, 2', 3)).toThrow(/все страницы/)
    expect(() => parsePageOrder('1, 2, 2', 3)).toThrow(/дважды/)
    expect(() => parsePageOrder('1, 2, 4', 3)).toThrow(/от 1 до 3/)
  })

  it('падает на пустом вводе', () => {
    expect(() => parsePageOrder('   ', 3)).toThrow(/Укажите/)
  })
})

describe('describeOrder', () => {
  it('подсказывает, остался ли порядок прежним', () => {
    expect(describeOrder([1, 2, 3])).toBe('порядок не меняется')
    expect(describeOrder([3, 1, 2])).toBe('3 → 1 → 2')
  })
})

describe('clampPosition', () => {
  it('не выпускает объект за края страницы', () => {
    expect(clampPosition(box, -50, -10, 100, 40)).toEqual({ x: 0, y: 0 })
    expect(clampPosition(box, 900, 900, 100, 40)).toEqual({ x: 495.3, y: 801.9 })
  })

  it('объект крупнее страницы прижимается к верхнему левому углу', () => {
    expect(clampPosition(box, 40, 40, 700, 900)).toEqual({ x: 0, y: 0 })
  })
})

describe('objectSize', () => {
  it('считает высоту текста по числу строк', () => {
    const text: TextObject = { kind: 'text', id: 'a', x: 0, y: 0, text: 'раз\nдва', size: 12, color: '111111', width: 200 }
    expect(objectSize(text)).toEqual({ width: 200, height: 31.2 })
  })
})

describe('fitImage', () => {
  it('вписывает картинку в половину ширины страницы и держит пропорции', () => {
    expect(fitImage(box, 1000, 500)).toEqual({ width: 298, height: 149 })
  })
})

describe('insertBlankPage', () => {
  it('вставляет лист сразу после текущей страницы', () => {
    const pages: EditorPage[] = [
      { source: 0, box, objects: [] },
      { source: 1, box, objects: [] },
    ]
    const next = insertBlankPage(pages, 0, box)
    expect(next.map((page) => page.source)).toEqual([0, null, 1])
  })
})
