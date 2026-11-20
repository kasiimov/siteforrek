import { describe, expect, it } from 'vitest'
import { pagesLabel, parsePageList, parseRangeGroups } from './pages'

describe('parsePageList', () => {
  it('разбирает страницы и диапазоны', () => {
    expect(parsePageList('1-3, 5, 8', 10)).toEqual([1, 2, 3, 5, 8])
  })

  it('терпит пробелы, разные тире и точку с запятой', () => {
    expect(parsePageList(' 1 – 2 ;4—5 ', 10)).toEqual([1, 2, 4, 5])
  })

  it('переворачивает обратный диапазон', () => {
    expect(parsePageList('5-2', 10)).toEqual([2, 3, 4, 5])
  })

  it('убирает повторы и сортирует', () => {
    expect(parsePageList('3, 1, 3, 2', 5)).toEqual([1, 2, 3])
  })

  it('падает на выходе за пределы документа', () => {
    expect(() => parsePageList('1-11', 10)).toThrow(/выходят за пределы/)
    expect(() => parsePageList('0', 10)).toThrow(/нет/)
  })

  it('падает на пустом вводе и мусоре', () => {
    expect(() => parsePageList('   ', 10)).toThrow(/Укажите страницы/)
    expect(() => parsePageList('первая', 10)).toThrow(/Не понял/)
  })
})

describe('parseRangeGroups', () => {
  it('делит строку на отдельные документы', () => {
    expect(parseRangeGroups('1-2, 3-5, 6', 10)).toEqual([
      [1, 2],
      [3, 4, 5],
      [6],
    ])
  })

  it('падает на пустом вводе', () => {
    expect(() => parseRangeGroups(' , ; ', 10)).toThrow(/Укажите диапазоны/)
  })
})

describe('pagesLabel', () => {
  it('склоняет как в интерфейсе', () => {
    expect(pagesLabel(1)).toBe('1 страница')
    expect(pagesLabel(2)).toBe('2 страницы')
    expect(pagesLabel(5)).toBe('5 страниц')
    expect(pagesLabel(11)).toBe('11 страниц')
    expect(pagesLabel(21)).toBe('21 страница')
    expect(pagesLabel(22)).toBe('22 страницы')
    expect(pagesLabel(111)).toBe('111 страниц')
  })
})
