import { describe, expect, it } from 'vitest'
import {
  clampPosition,
  describeOrder,
  fitImage,
  fontStackFor,
  insertBlankPage,
  objectSize,
  parsePageOrder,
  rotateEditorPage,
} from './docEditor'
import type { EditorPage, EditorObject, TextObject } from './docEditor'

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

describe('fontStackFor', () => {
  it('даёт свой стек на каждое семейство', () => {
    expect(fontStackFor(undefined)).toContain('PT Sans')
    expect(fontStackFor('sans')).toContain('PT Sans')
    expect(fontStackFor('serif')).toContain('PT Serif')
    expect(fontStackFor('mono')).toContain('Courier New')
  })
})

describe('rotateEditorPage', () => {
  const pageBox = { width: 200, height: 100 }
  const makePage = (objects: EditorObject[], extra: Partial<EditorPage> = {}): EditorPage => ({
    source: 0,
    box: pageBox,
    objects,
    ...extra,
  })

  it('меняет стороны листа местами и крутит угол', () => {
    const next = rotateEditorPage(makePage([]), true)
    expect(next.box).toEqual({ width: 100, height: 200 })
    expect(next.rotate).toBe(90)

    const twice = rotateEditorPage(next, true)
    expect(twice.rotate).toBe(180)

    expect(rotateEditorPage(makePage([]), false).rotate).toBe(270)
  })

  it('переносит текстовый блок, сохраняя кегль, шрифт и отметку о ручной правке', () => {
    const text: TextObject = {
      kind: 'text',
      id: 't1',
      x: 10,
      y: 20,
      text: 'раз',
      size: 10,
      color: 'C81E1E',
      width: 80,
      family: 'serif',
      ocr: true,
      edited: true,
    }
    const [moved] = rotateEditorPage(makePage([text]), true).objects
    expect(moved).toMatchObject({
      kind: 'text',
      // точка (10, 20) ушла в (100 - 20, 10), правый нижний угол — в (67, 90)
      x: 67,
      y: 10,
      // после поворота блок снова разворачивается до минимальной ширины 40
      width: 40,
      size: 10,
      color: 'C81E1E',
      family: 'serif',
      edited: true,
    })
  })

  it('переносит текст против часовой стрелки', () => {
    const text: TextObject = { kind: 'text', id: 't1', x: 10, y: 20, text: 'раз', size: 10, color: '111111', width: 80 }
    const [moved] = rotateEditorPage(makePage([text]), false).objects
    expect(moved).toMatchObject({ x: 20, y: 110, width: 40 })
  })

  it('переносит картинку с размером', () => {
    const image: EditorObject = {
      kind: 'image',
      id: 'i1',
      x: 10,
      y: 20,
      width: 40,
      height: 30,
      data: new Uint8Array(),
      type: 'png',
      base: true,
    }
    const [moved] = rotateEditorPage(makePage([image]), true).objects
    expect(moved).toMatchObject({ x: 50, y: 10, width: 30, height: 40, base: true })
  })

  it('переносит рамку и выделение', () => {
    for (const mark of ['rect', 'highlight', 'check', 'cross'] as const) {
      const object: EditorObject = {
        kind: 'mark',
        id: `m-${mark}`,
        mark,
        x: 10,
        y: 20,
        width: 40,
        height: 30,
        color: 'FFC000',
        stroke: 2,
      }
      const [moved] = rotateEditorPage(makePage([object]), true).objects
      expect(moved).toMatchObject({ x: 50, y: 10, width: 30, height: 40, color: 'FFC000', stroke: 2 })
    }
  })

  it('разворачивает линию и стрелку', () => {
    const object: EditorObject = {
      kind: 'mark',
      id: 'l1',
      mark: 'arrow',
      x: 10,
      y: 20,
      width: 40,
      height: 30,
      color: '111111',
      stroke: 1,
      flipX: true,
    }
    const [moved] = rotateEditorPage(makePage([object]), true).objects
    expect(moved).toMatchObject({ x: 50, y: 10, width: 30, height: 40, flipX: true, flipY: true })
  })

  it('переносит каждую точку карандаша', () => {
    const object: EditorObject = {
      kind: 'mark',
      id: 'ink1',
      mark: 'ink',
      x: 10,
      y: 20,
      width: 20,
      height: 20,
      color: '111111',
      stroke: 2,
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
    }
    const [moved] = rotateEditorPage(makePage([object]), true).objects
    expect(moved).toMatchObject({ x: 60, y: 10, width: 20, height: 20 })
    expect(moved.kind === 'mark' ? moved.points : []).toEqual([
      { x: 80, y: 10 },
      { x: 60, y: 30 },
    ])
  })

  it('переносит пятна и не теряет их владельца и цвет', () => {
    const page = makePage([], {
      covers: [{ x: 0, y: 0, width: 50, height: 10, owner: 't1', color: 'EEF1F5' }],
    })
    expect(rotateEditorPage(page, true).covers).toEqual([
      { x: 90, y: 0, width: 10, height: 50, owner: 't1', color: 'EEF1F5' },
    ])
  })

  it('не считает угол у пустого листа и сохраняет исходник', () => {
    const blank = rotateEditorPage({ source: null, box: pageBox, objects: [] }, true)
    expect(blank.rotate).toBeUndefined()
    expect(blank.box).toEqual({ width: 100, height: 200 })
    expect(blank.source).toBeNull()

    const fromPdf = rotateEditorPage(makePage([], { rotate: 90 }), false)
    expect(fromPdf.rotate).toBe(0)
    expect(fromPdf.source).toBe(0)
  })
})
