import { describe, expect, it } from 'vitest'
import { snapFrame } from './frame'

const page = { width: 600, height: 800 }

describe('snapFrame', () => {
  it('встаёт по содержимому внутри обводки и добавляет ровные поля', () => {
    const frame = snapFrame(
      { x: 80, y: 90, width: 300, height: 200 },
      [
        { x: 100, y: 100, width: 120, height: 40 },
        { x: 250, y: 170, width: 100, height: 60 },
      ],
      page,
    )
    expect(frame.snap).toBe('content')
    expect(frame).toEqual({ x: 90, y: 90, width: 270, height: 150, snap: 'content' })
  })

  it('не берёт фото-подложку страницы за содержимое', () => {
    const frame = snapFrame(
      { x: 100, y: 100, width: 80, height: 80 },
      [{ x: 0, y: 0, width: 600, height: 800, base: true }],
      page,
    )
    expect(frame.snap).toBe('grid')
  })

  it('большую обводку превращает в рамку по полям листа', () => {
    const frame = snapFrame({ x: 20, y: 30, width: 560, height: 740 }, [], page)
    expect(frame.snap).toBe('page')
    expect(frame.x).toBe(frame.y)
    expect(frame.x).toBe(20)
    expect(frame.width).toBe(560)
    expect(frame.height).toBe(760)
  })

  it('свободную обводку выравнивает по сетке и держит внутри листа', () => {
    const frame = snapFrame({ x: 101, y: 203, width: 97, height: 54 }, [], page)
    expect(frame.snap).toBe('grid')
    expect(frame.x % 4).toBe(0)
    expect(frame.y % 4).toBe(0)
    expect(frame.x + frame.width).toBeLessThanOrEqual(page.width)
    expect(frame.y + frame.height).toBeLessThanOrEqual(page.height)
  })

  it('не выпускает рамку за край страницы', () => {
    const frame = snapFrame({ x: 560, y: 760, width: 200, height: 200 }, [], page)
    expect(frame.x).toBeGreaterThanOrEqual(0)
    expect(frame.y).toBeGreaterThanOrEqual(0)
    expect(frame.x + frame.width).toBeLessThanOrEqual(page.width)
    expect(frame.y + frame.height).toBeLessThanOrEqual(page.height)
  })
})
