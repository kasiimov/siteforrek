import { Arrow } from './ui'
import { CONGIX_URL } from './PromoBanner'

/**
 * Рекламные места сайта.
 *
 * Каждый блок — отдельный слот с data-ad-slot / data-ad-format: сюда можно
 * подставить код рекламной сети, не трогая вёрстку страниц. Пока во всех
 * слотах крутится своя реклама — Congix.
 */

type AdProps = { slot: string }

/** Широкий баннер под шапкой: 970×90 на десктопе, во всю ширину на телефоне. */
export function AdLeaderboard({ slot }: AdProps) {
  return (
    <aside className="ad-leader" data-ad-slot={slot} data-ad-format="970x90" aria-label="Реклама">
      <span className="ad-tag">Реклама</span>
      <div className="ad-leader-body">
        <span className="ad-leader-logo" aria-hidden="true">
          C
        </span>
        <div className="ad-leader-copy">
          <b>Congix — ИИ-репетитор для школьников Узбекистана</b>
          <span>Разберёт задачу по шагам, объяснит тему и потренирует перед контрольной. RU / UZ.</span>
        </div>
        <a className="ad-cta" href={CONGIX_URL} target="_blank" rel="noopener">
          Попробовать
          <Arrow />
        </a>
      </div>
    </aside>
  )
}

/** Прямоугольник 300×250 — встраивается в текст или в боковую колонку. */
export function AdRect({ slot }: AdProps) {
  return (
    <aside className="ad-rect" data-ad-slot={slot} data-ad-format="300x250" aria-label="Реклама">
      <span className="ad-tag">Реклама</span>
      <span className="ad-rect-badge" aria-hidden="true">
        <strong>30</strong>
        <small>вопросов бесплатно</small>
      </span>
      <b className="ad-rect-title">Домашка не сдаётся. Сдаётся — Congix.</b>
      <p className="ad-rect-text">
        ИИ-репетитор: математика, физика, химия. Объясняет решение по шагам, без рекламы внутри.
      </p>
      <a className="ad-cta" href={CONGIX_URL} target="_blank" rel="noopener">
        Открыть Congix
        <Arrow />
      </a>
    </aside>
  )
}

/** Нижний баннер перед подвалом — на каждой странице. */
export function AdFooter({ slot }: AdProps) {
  return (
    <aside className="ad-footer" data-ad-slot={slot} data-ad-format="responsive" aria-label="Реклама">
      <span className="ad-tag">Реклама</span>
      <div className="ad-footer-copy">
        <b>Congix</b>
        <span>ИИ-репетитор для 5–11 класса: разбор задач, тренировка, подготовка к контрольной.</span>
      </div>
      <div className="ad-footer-actions">
        <a className="ad-cta" href={CONGIX_URL} target="_blank" rel="noopener">
          Попробовать бесплатно
          <Arrow />
        </a>
        <small>congix.uz · RU / UZ</small>
      </div>
    </aside>
  )
}

/** Компактная полоса для узких мест: панель редактора, карточки, сайдбар. */
export function AdMini({ slot }: AdProps) {
  return (
    <a
      className="ad-mini"
      href={CONGIX_URL}
      target="_blank"
      rel="noopener"
      data-ad-slot={slot}
      data-ad-format="300x100"
      aria-label="Реклама: Congix"
    >
      <span className="ad-mini-badge" aria-hidden="true">
        C
      </span>
      <span className="ad-mini-copy">
        <b>Congix</b>
        <small>ИИ-репетитор · 30 вопросов бесплатно</small>
      </span>
      <Arrow />
    </a>
  )
}
