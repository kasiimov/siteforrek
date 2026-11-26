import { Arrow } from './ui'

export const CONGIX_URL = 'https://congix.uz'

/** Реклама проекта автора: компактная полоса-купон в редакторе. */
export function PromoBanner({ slot }: { slot: string }) {
  return (
    <a
      className="ed-strip"
      href={CONGIX_URL}
      target="_blank"
      rel="noopener"
      data-ad-slot={slot}
      data-ad-format="300x100"
      aria-label="Реклама: Congix — ИИ-репетитор"
    >
      <span className="ed-strip-tag">Реклама · проект автора</span>
      <span className="ed-strip-dot" aria-hidden="true" />

      <div className="ed-strip-badge" aria-hidden="true">
        <strong>30</strong>
        <small>вопросов бесплатно</small>
      </div>

      <div className="ed-strip-body">
        <b className="ed-strip-title">Домашка не сдаётся.</b>
        <span className="ed-strip-line">
          Congix — ИИ-репетитор для школьников. Разберёт задачу по шагам и объяснит тему.
        </span>
        <span className="ed-strip-solve">
          <span className="ed-strip-solve-prev">2x + 5 = 17</span>
          <span className="ed-strip-solve-next">x = 6 ✓</span>
        </span>
      </div>

      <span className="ed-strip-cta">
        Попробовать бесплатно
        <Arrow />
      </span>
    </a>
  )
}
