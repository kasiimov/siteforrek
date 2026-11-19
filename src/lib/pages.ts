/** Разбор строк вида «1-3, 5, 8-10» в список номеров страниц (нумерация с 1). */
export function parsePageList(input: string, total: number): number[] {
  const text = input.trim()
  if (!text) throw new Error('Укажите страницы. Например: 1-3, 5, 8')

  const pages: number[] = []

  for (const chunk of text.split(/[,;]+/)) {
    const part = chunk.trim()
    if (!part) continue

    const range = /^(\d+)\s*[-–—]\s*(\d+)$/.exec(part)
    if (range) {
      let from = Number(range[1])
      let to = Number(range[2])
      if (from > to) [from, to] = [to, from]
      if (from < 1 || to > total) {
        throw new Error(`Страницы ${from}-${to} выходят за пределы документа (всего ${total}).`)
      }
      for (let page = from; page <= to; page++) pages.push(page)
      continue
    }

    if (/^\d+$/.test(part)) {
      const page = Number(part)
      if (page < 1 || page > total) {
        throw new Error(`Страницы ${page} нет — в документе ${total}.`)
      }
      pages.push(page)
      continue
    }

    throw new Error(`Не понял «${part}». Пишите так: 1-3, 5, 8-10`)
  }

  if (!pages.length) throw new Error('Не выбрано ни одной страницы')
  return [...new Set(pages)].sort((a, b) => a - b)
}

/** Разбор строки в набор групп: каждая группа — отдельный будущий PDF. */
export function parseRangeGroups(input: string, total: number): number[][] {
  const groups: number[][] = []
  for (const chunk of input.split(/[,;]+/)) {
    const part = chunk.trim()
    if (!part) continue
    groups.push(parsePageList(part, total))
  }
  if (!groups.length) throw new Error('Укажите диапазоны. Например: 1-2, 3-5, 6')
  return groups
}

/** «5 страниц» / «1 страница» — для подписей. */
export function pagesLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} страница`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} страницы`
  return `${count} страниц`
}
