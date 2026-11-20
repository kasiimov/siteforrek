import { describe, expect, it } from 'vitest'
import {
  MAX_PAGES,
  batchPagesError,
  bigFileWarning,
  filesLabel,
  isAbortError,
  outputName,
  pagesLimitError,
  throwIfAborted,
  uniqueName,
  zipName,
} from './batch'

describe('filesLabel', () => {
  it('склоняет файлы', () => {
    expect(filesLabel(1)).toBe('1 файл')
    expect(filesLabel(3)).toBe('3 файла')
    expect(filesLabel(7)).toBe('7 файлов')
    expect(filesLabel(11)).toBe('11 файлов')
    expect(filesLabel(21)).toBe('21 файл')
  })
})

describe('лимит страниц', () => {
  it('пропускает документы в пределах лимита', () => {
    expect(pagesLimitError(1)).toBeNull()
    expect(pagesLimitError(MAX_PAGES)).toBeNull()
    expect(pagesLimitError(null)).toBeNull()
  })

  it('называет число страниц в ошибке', () => {
    expect(pagesLimitError(MAX_PAGES + 5)).toContain(`${MAX_PAGES + 5} страниц`)
  })

  it('в пачке указывает проблемный файл по имени', () => {
    const message = batchPagesError([
      { name: 'a.pdf', size: 10, pages: 2 },
      { name: 'b.pdf', size: 10, pages: MAX_PAGES + 1 },
    ])
    expect(message).toContain('b.pdf')
  })
})

describe('bigFileWarning', () => {
  it('молчит на маленьких файлах', () => {
    expect(bigFileWarning([{ name: 'a.pdf', size: 1024 * 1024, pages: 3 }])).toBeNull()
    expect(bigFileWarning([])).toBeNull()
  })

  it('предупреждает про большой размер', () => {
    const message = bigFileWarning([{ name: 'a.pdf', size: 40 * 1024 * 1024, pages: 5 }])
    expect(message).toContain('40.0 МБ')
    expect(message).toContain('Продолжаем')
  })

  it('предупреждает про много страниц', () => {
    expect(bigFileWarning([{ name: 'a.pdf', size: 1024, pages: 120 }])).toContain('120 страниц')
  })

  it('складывает размер и страницы всей пачки', () => {
    const message = bigFileWarning([
      { name: 'a.pdf', size: 9 * 1024 * 1024, pages: 20 },
      { name: 'b.pdf', size: 9 * 1024 * 1024, pages: 25 },
    ])
    expect(message).toContain('2 файла')
    expect(message).toContain('45 страниц')
  })
})

describe('имена файлов', () => {
  it('меняет расширение и сохраняет регистр имени', () => {
    expect(outputName('Отчёт 2024.PDF', 'docx')).toBe('Отчёт 2024.docx')
    expect(outputName('без-расширения', '.docx')).toBe('без-расширения.docx')
    expect(outputName('.hidden.pdf', 'docx')).toBe('.hidden.docx')
  })

  it('разводит одинаковые имена по суффиксу', () => {
    const taken = new Set<string>()
    const first = uniqueName('счёт.docx', taken)
    taken.add(first)
    const second = uniqueName('счёт.docx', taken)
    taken.add(second)
    expect(first).toBe('счёт.docx')
    expect(second).toBe('счёт-2.docx')
    expect(uniqueName('счёт.docx', taken)).toBe('счёт-3.docx')
  })

  it('строит имя архива', () => {
    expect(zipName('Счета 2024.pdf', 'word')).toBe('Счета 2024-word.zip')
  })
})

describe('отмена', () => {
  it('узнаёт AbortError и не путает с обычной ошибкой', () => {
    expect(isAbortError(new DOMException('стоп', 'AbortError'))).toBe(true)
    expect(isAbortError(new Error('стоп'))).toBe(false)
    expect(isAbortError(null)).toBe(false)
  })

  it('бросает ошибку только у отменённого сигнала', () => {
    expect(() => throwIfAborted(new AbortController().signal)).not.toThrow()

    const controller = new AbortController()
    controller.abort()
    expect(() => throwIfAborted(controller.signal)).toThrow(/отменена/)
    expect(() => throwIfAborted(controller.signal)).toThrow(expect.objectContaining({ name: 'AbortError' }))
  })
})
