/** Разбор нового порядка страниц без pdf-lib и fontkit — чтобы инструмент не тянул 1,1 МБ. */
export function parsePageOrder(input: string, total: number): number[] {
  const tokens = input
    .split(/[^\d]+/)
    .filter(Boolean)
    .map(Number)

  if (!tokens.length) throw new Error('Укажите новый порядок страниц, например: 3, 1, 2')
  if (tokens.some((page) => !Number.isInteger(page) || page < 1 || page > total)) {
    throw new Error(`Страницы должны быть от 1 до ${total}`)
  }
  if (new Set(tokens).size !== tokens.length) throw new Error('Одна и та же страница указана дважды')
  if (tokens.length !== total) {
    throw new Error(`Нужно перечислить все страницы: их ${total}, а в списке ${tokens.length}`)
  }

  return tokens
}
