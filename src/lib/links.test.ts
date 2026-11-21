import { describe, expect, it } from 'vitest'
import { linksFromAnnotations, splitRunsByLinks } from './links'
import type { LinkableRun } from './links'

const view = [0, 0, 600, 800]

describe('linksFromAnnotations', () => {
  it('переводит прямоугольник ссылки в координаты страницы', () => {
    const links = linksFromAnnotations([{ subtype: 'Link', url: 'https://congix.uz', rect: [72, 700, 222, 712] }], view)
    expect(links).toEqual([{ left: 72, top: 88, width: 150, height: 12, url: 'https://congix.uz' }])
  })

  it('терпит перевёрнутый прямоугольник и обрезает пробелы в адресе', () => {
    const links = linksFromAnnotations([{ subtype: 'Link', url: ' mailto:hi@congix.uz ', rect: [222, 712, 72, 700] }], view)
    expect(links).toEqual([{ left: 72, top: 88, width: 150, height: 12, url: 'mailto:hi@congix.uz' }])
  })

  it('пропускает не-ссылки, внутренние переходы и пустые адреса', () => {
    const links = linksFromAnnotations(
      [
        { subtype: 'Widget', url: 'https://congix.uz', rect: [0, 0, 10, 10] },
        { subtype: 'Link', rect: [0, 0, 10, 10] },
        { subtype: 'Link', url: '#page=2', rect: [0, 0, 10, 10] },
        { subtype: 'Link', url: 'https://congix.uz', rect: [0, 0, 0, 10] },
      ],
      view,
    )
    expect(links).toEqual([])
  })
})

describe('splitRunsByLinks', () => {
  const line = { top: 100, bottom: 112 }

  it('отдаёт ран как есть, если ссылок нет', () => {
    const runs: LinkableRun[] = [{ text: 'Привет', left: 10, right: 60 }]
    expect(splitRunsByLinks(runs, [], line)).toEqual(runs)
  })

  it('помечает ран целиком, если он весь под ссылкой', () => {
    const runs: LinkableRun[] = [{ text: 'congix.uz', left: 100, right: 160 }]
    const links = [{ left: 98, top: 100, width: 64, height: 12, url: 'https://congix.uz' }]
    expect(splitRunsByLinks(runs, links, line)).toEqual([{ text: 'congix.uz', left: 100, right: 160, link: 'https://congix.uz' }])
  })

  it('делит строку на часть до ссылки и саму ссылку', () => {
    const runs: LinkableRun[] = [{ text: 'Заказ на congix.uz сегодня', left: 0, right: 240 }]
    const links = [{ left: 80, top: 100, width: 80, height: 12, url: 'https://congix.uz' }]
    const result = splitRunsByLinks(runs, links, line)
    expect(result.map((run) => run.text).join('')).toBe('Заказ на congix.uz сегодня')
    const linked = result.filter((run) => run.link)
    expect(linked).toHaveLength(1)
    // Ширины букв неизвестны, поэтому кусок под ссылкой — пропорциональная доля строки.
    expect(linked[0].text.startsWith('congix')).toBe(true)
    // Пробел на стыке остаётся обычным текстом, а не частью ссылки.
    expect(/^\s/.test(linked[0].text)).toBe(false)
    expect(result.every((run) => run.link !== undefined)).toBe(true)
  })

  it('режет по кускам строки, когда их координаты известны', () => {
    const runs: LinkableRun[] = [
      {
        text: 'Read more on congix.uz - prices',
        left: 0,
        right: 240,
        pieces: [
          { text: 'Read more on', left: 0, right: 80 },
          { text: ' congix.uz', left: 80, right: 134 },
          { text: ' - prices', left: 134, right: 240 },
        ],
      },
    ]
    const links = [{ left: 83, top: 100, width: 51, height: 12, url: 'https://congix.uz' }]
    const result = splitRunsByLinks(runs, links, line)

    // Соседние куски не попадают в ссылку: адрес нужно подсветить ровно целиком.
    expect(result.find((run) => run.link)?.text).toBe('congix.uz')
    expect(result.map((run) => run.text).join('')).toBe('Read more on congix.uz - prices')
  })

  it('не трогает строки, которые ссылка не задевает по вертикали', () => {
    const runs: LinkableRun[] = [{ text: 'Сноска', left: 0, right: 60 }]
    const links = [{ left: 0, top: 40, width: 60, height: 12, url: 'https://congix.uz' }]
    expect(splitRunsByLinks(runs, links, line)).toEqual(runs)
  })
})
