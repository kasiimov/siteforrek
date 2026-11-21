/** Гиперссылки из аннотаций PDF → ссылки в Word. */

export type LinkSpec = {
  /** левый край от левого края страницы, в пунктах */
  left: number
  /** верхний край от верхнего края страницы, в пунктах */
  top: number
  width: number
  height: number
  url: string
}

export type LinkAnnotation = {
  subtype?: string
  url?: string
  rect?: number[]
}

const URL_SCHEME = /^(https?|mailto|ftp|tel):/i

/**
 * Аннотации страницы → прямоугольники ссылок в тех же координатах, что и строки:
 * X от левого края страницы, Y от верхнего. В PDF ось Y смотрит вверх, поэтому
 * верх считается как height − y.
 */
export function linksFromAnnotations(annotations: readonly LinkAnnotation[], view: readonly number[]): LinkSpec[] {
  const height = (view[3] ?? 0) - (view[1] ?? 0)
  const offsetX = view[0] ?? 0
  const links: LinkSpec[] = []

  for (const annotation of annotations) {
    if (annotation.subtype !== 'Link') continue

    const url = typeof annotation.url === 'string' ? annotation.url.trim() : ''
    // Внутренние переходы (dest) в Word-ссылку не превратить, берём только внешние адреса.
    if (!URL_SCHEME.test(url)) continue

    const rect = annotation.rect
    if (!rect || rect.length < 4) continue

    const [x1, y1, x2, y2] = rect.slice(0, 4).map(Number)
    if (![x1, y1, x2, y2].every(Number.isFinite)) continue

    const width = Math.abs(x2 - x1)
    const boxHeight = Math.abs(y2 - y1)
    if (width < 1 || boxHeight < 1) continue

    links.push({
      left: Math.min(x1, x2) - offsetX,
      top: height - Math.max(y1, y2),
      width,
      height: boxHeight,
      url,
    })
  }

  return links
}

export type RunPiece = { text: string; left: number; right: number }

export type LinkableRun = {
  text: string
  left?: number
  right?: number
  link?: string | null
  /** куски строки с их точными координатами — по ним режем текст без съезда на символ */
  pieces?: RunPiece[]
}

/**
 * Режет раны по прямоугольникам ссылок: ссылка часто занимает лишь часть строки
 * («смотрите сайт» внутри предложения), поэтому нужен кусок текста ровно под ней.
 */
export function splitRunsByLinks<R extends LinkableRun>(
  runs: readonly R[],
  links: readonly LinkSpec[],
  line: { top: number; bottom: number },
): R[] {
  if (!links.length || !runs.length) return [...runs]

  const inside = links.filter((link) => link.top < line.bottom - 0.5 && link.top + link.height > line.top + 0.5)
  if (!inside.length) return [...runs]

  const result: R[] = []

  for (const run of runs) {
    const { left, right } = run
    if (typeof left !== 'number' || typeof right !== 'number' || right - left <= 0.5) {
      result.push(run)
      continue
    }

    const cuts = new Set<number>([left, right])

    for (const link of inside) {
      const from = Math.max(left, link.left)
      const to = Math.min(right, link.left + link.width)
      // Ран задевает ссылку краем — без разреза не обойтись.
      if (to - from > 1.5) {
        cuts.add(from)
        cuts.add(to)
      }
    }

    const points = [...cuts].sort((a, b) => a - b)

    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1]
      const to = points[index]
      if (to - from < 0.5) continue

      let text = sliceRun(run, from, to)
      if (!text) continue

      const link = inside.find((candidate) => from >= candidate.left - 0.75 && to <= candidate.left + candidate.width + 0.75)
      const url = link?.url ?? null

      // Пробел на стыке кусков оставляем вне ссылки: иначе он подчеркнётся и посинеет.
      const lead = /^\s+/.exec(text)?.[0] ?? ''
      if (lead) {
        const previous = result[result.length - 1]
        const unlinked = previous !== undefined && previous.text.length > 0 && !previous.link
        const sameLink = previous !== undefined && (previous.link ?? null) === url
        if (unlinked || sameLink) {
          previous.text += lead
          text = text.slice(lead.length)
          if (!text) continue
        }
      }

      result.push(link ? { ...run, text, link: url } : { ...run, text, link: null })
    }
  }

  return result
}

/** Режет ран по координатам: если известны куски, границы ссылки попадают точно на слово. */
function sliceRun(run: LinkableRun, from: number, to: number): string {
  const pieces = run.pieces
  if (!pieces?.length || run.left === undefined || run.right === undefined) {
    const span = Math.max(0.001, (run.right ?? 0) - (run.left ?? 0))
    return sliceText(run.text, (from - (run.left ?? 0)) / span, (to - (run.left ?? 0)) / span)
  }

  let text = ''

  for (const piece of pieces) {
    const start = Math.max(from, piece.left)
    const end = Math.min(to, piece.right)
    const width = piece.right - piece.left
    if (end - start < 0.2 || width <= 0.2) continue
    text += sliceText(piece.text, (start - piece.left) / width, (end - piece.left) / width)
  }

  return text
}

/** Ширины букв в шрифте неизвестны — режем текст пропорционально его ширине. */
function sliceText(text: string, fromFraction: number, toFraction: number): string {
  if (fromFraction <= 0.001 && toFraction >= 0.999) return text

  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const from = Math.round(text.length * clamp(fromFraction))
  const to = Math.round(text.length * clamp(toFraction))

  return to > from ? text.slice(from, to) : ''
}
