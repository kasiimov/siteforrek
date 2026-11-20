/** Цвета и толщины линий из PDF → границы ячеек Word. */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function hexPart(value: number): string {
  return clamp(Math.round(clamp(value, 0, 1) * 255), 0, 255).toString(16).padStart(2, '0').toUpperCase()
}

/** Компоненты PDF задаёт в 0..1, Word ждёт RRGGBB без решётки. */
export function rgbToHex(r: number, g: number, b: number): string {
  return `${hexPart(r)}${hexPart(g)}${hexPart(b)}`
}

export function grayToHex(gray: number): string {
  return rgbToHex(gray, gray, gray)
}

export function cmykToHex(c: number, m: number, y: number, k: number): string {
  const ink = (value: number) => clamp(value, 0, 1)
  const black = ink(k)
  return rgbToHex(
    1 - Math.min(1, ink(c) + black),
    1 - Math.min(1, ink(m) + black),
    1 - Math.min(1, ink(y) + black),
  )
}

/** Белая линия в PDF — это невидимая линия, в Word её рисовать не надо. */
export function isInvisible(color: string): boolean {
  const value = color.replace('#', '').toUpperCase()
  return value === 'FFFFFF' || value === 'FFF'
}

/** Толщина линии PDF в пунктах → размер границы Word в 1/8 pt (чётный, 2..48). */
export function docxBorderSize(widthPt: number): number {
  const eighths = Math.round(clamp(widthPt, 0, 6) * 8)
  return clamp(eighths % 2 === 0 ? eighths : eighths + 1, 2, 48)
}
