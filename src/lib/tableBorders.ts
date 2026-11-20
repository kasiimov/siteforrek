/** Цвета и толщины линий из PDF → границы ячеек Word. */

/**
 * pdf.js приводит RG, G и CMYK к одному оператору и отдаёт цвет строкой «#rrggbb»,
 * поэтому других форматов здесь быть не должно — незнакомое значение просто игнорируем.
 */
export function strokeColorHex(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim())
  return match ? match[1].toUpperCase() : null
}

/** Белая линия в PDF — это невидимая линия, в Word её рисовать не надо. */
export function isInvisible(color: string): boolean {
  const value = color.replace('#', '').toUpperCase()
  return value === 'FFFFFF' || value === 'FFF'
}

/** Толщина линии PDF в пунктах → размер границы Word в 1/8 pt (чётный, 2..48). */
export function docxBorderSize(widthPt: number): number {
  const eighths = Math.round(Math.min(6, Math.max(0, widthPt)) * 8)
  return Math.min(48, Math.max(2, eighths % 2 === 0 ? eighths : eighths + 1))
}
