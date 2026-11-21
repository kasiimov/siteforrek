import { Arrow } from './ui'

export const CONGIX_URL = 'https://congix.uz'

/** Реклама проекта автора: большая карточка и компактная полоса. */
export function PromoBanner({ slot, size = 'banner' }: { slot: string; size?: 'banner' | 'inline' }) {
  if (size === 'inline') {
    return (
      <aside className="promo-strip" data-ad-slot={slot} aria-label="Реклама проектов автора">
        <span className="promo-strip-tag">Реклама · проект автора</span>

        <div className="promo-strip-badge" aria-hidden="true">
          <strong>30</strong>
          <small>
            вопросов
            <br />
            бесплатно
          </small>
        </div>

        <div className="promo-strip-body">
          <p className="promo-strip-title">
            Домашка не сдаётся. <em>Сдаётся — Congix.</em>
          </p>
          <p className="promo-strip-line">
            ИИ-репетитор для школьников Узбекистана: разберёт задачу по шагам и объяснит тему.
          </p>
          <div className="promo-strip-solve" aria-hidden="true">
            <span>2x + 5 = 17</span>
            <i />
            <span className="is-answer">x = 6 ✓</span>
          </div>
        </div>

        <span className="promo-strip-cut" aria-hidden="true" />

        <a className="promo-strip-cta" href={CONGIX_URL} target="_blank" rel="noopener">
          Попробовать бесплатно
          <Arrow />
        </a>
      </aside>
    )
  }

  return (
    <aside className="promo" data-ad-slot={slot} aria-label="Реклама проектов автора">
      <div className="promo-copy">
        <span className="promo-kicker">
          <span className="promo-dot" aria-hidden="true" />
          Реклама · проект автора
        </span>
        <h3 className="promo-headline">
          Домашка не сдаётся.
          <br />
          <span>Сдаётся — Congix.</span>
        </h3>
        <p className="promo-sub">
          ИИ-репетитор для школьников Узбекистана: разберёт задачу по шагам, объяснит тему и
          потренирует перед контрольной.
        </p>
        <ul className="promo-chips">
          <li>математика</li>
          <li>физика</li>
          <li>химия</li>
          <li>RU / UZ</li>
        </ul>
        <div className="promo-actions">
          <a className="promo-btn" href={CONGIX_URL} target="_blank" rel="noopener">
            Попробовать бесплатно
            <Arrow />
          </a>
          <span className="promo-foot">~30 вопросов каждые 8 часов · без рекламы внутри</span>
        </div>
      </div>

      <div className="promo-demo" aria-hidden="true">
        <div className="promo-chat">
          <div className="promo-chat-top">
            <span className="promo-chat-logo">C</span>
            <span className="promo-chat-name">
              Congix
              <small>онлайн · объясняет</small>
            </span>
          </div>
          <p className="bubble bubble-user">Откуда взялось 6 в 2x + 5 = 17?</p>
          <div className="bubble bubble-bot">
            <span className="bubble-step">Шаг 1 · переносим 5</span>
            2x = 17 − 5 = 12
            <span className="bubble-step">Шаг 2 · делим на 2</span>
            x = 6 ✓
          </div>
          <div className="promo-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
        <span className="promo-sticker">
          <strong>30</strong>
          вопросов бесплатно
        </span>
      </div>
    </aside>
  )
}
