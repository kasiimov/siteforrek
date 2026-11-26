/**
 * Авторамка: пользователь обводит блок «на глаз», а рамка сама встаёт ровно —
 * по краям содержимого с одинаковыми полями или по полям страницы.
 */

export type Rect = { x: number; y: number; width: number; height: number }

/** Объект страницы, вокруг которого можно поставить рамку. */
export type FrameTarget = Rect & { base?: boolean }

export type FrameSnap = 'content' | 'page' | 'grid'
export type FrameResult = Rect & { snap: FrameSnap }

const PAGE_EDGE = 2
const CONTENT_PAD = 10
const MIN_SIZE = 16
const GRID = 4

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Ровные края: целые координаты, чтобы рамка не «дрожала» при масштабе. */
function tidy(rect: Rect): Rect {
  const x = Math.round(rect.x)
  const y = Math.round(rect.y)
  return { x, y, width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)) }
}

/**
 * Подгоняет нарисованную рамку: сначала под содержимое внутри (или рядом),
 * потом под ровные поля страницы, и только в крайнем случае — по сетке.
 */
export function snapFrame(drawn: Rect, targets: FrameTarget[], page: { width: number; height: number }): FrameResult {
  const left = clamp(Math.min(drawn.x, drawn.x + drawn.width), 0, page.width)
  const top = clamp(Math.min(drawn.y, drawn.y + drawn.height), 0, page.height)
  const right = clamp(Math.max(drawn.x, drawn.x + drawn.width), 0, page.width)
  const bottom = clamp(Math.max(drawn.y, drawn.y + drawn.height), 0, page.height)

  const inside = targets.filter((target) => {
    if (target.base) return false
    if (!(target.width > 0) || !(target.height > 0)) return false
    const centerX = target.x + target.width / 2
    const centerY = target.y + target.height / 2
    return (
      centerX >= left - CONTENT_PAD &&
      centerX <= right + CONTENT_PAD &&
      centerY >= top - CONTENT_PAD &&
      centerY <= bottom + CONTENT_PAD
    )
  })

  if (inside.length) {
    const minX = Math.min(...inside.map((target) => target.x))
    const minY = Math.min(...inside.map((target) => target.y))
    const maxX = Math.max(...inside.map((target) => target.x + target.width))
    const maxY = Math.max(...inside.map((target) => target.y + target.height))

    const x = clamp(minX - CONTENT_PAD, PAGE_EDGE, page.width - MIN_SIZE)
    const y = clamp(minY - CONTENT_PAD, PAGE_EDGE, page.height - MIN_SIZE)
    return {
      ...tidy({
        x,
        y,
        width: clamp(maxX + CONTENT_PAD, x + MIN_SIZE, page.width - PAGE_EDGE) - x,
        height: clamp(maxY + CONTENT_PAD, y + MIN_SIZE, page.height - PAGE_EDGE) - y,
      }),
      snap: 'content',
    }
  }

  // Большая область — рамка по полям листа: все отступы одинаковые.
  const area = (right - left) * (bottom - top)
  if (area >= page.width * page.height * 0.55) {
    const margin = clamp(
      Math.min(left, page.width - right, top, page.height - bottom),
      8,
      Math.min(page.width, page.height) / 4,
    )
    return {
      ...tidy({
        x: margin,
        y: margin,
        width: page.width - margin * 2,
        height: page.height - margin * 2,
      }),
      snap: 'page',
    }
  }

  // Свободное место: выравниваем края по мелкой сетке — так рамка выглядит аккуратно.
  const gridLeft = clamp(Math.round(left / GRID) * GRID, 0, page.width - MIN_SIZE)
  const gridTop = clamp(Math.round(top / GRID) * GRID, 0, page.height - MIN_SIZE)
  const gridRight = clamp(Math.round(right / GRID) * GRID, gridLeft + MIN_SIZE, page.width)
  const gridBottom = clamp(Math.round(bottom / GRID) * GRID, gridTop + MIN_SIZE, page.height)
  return {
    ...tidy({ x: gridLeft, y: gridTop, width: gridRight - gridLeft, height: gridBottom - gridTop }),
    snap: 'grid',
  }
}
