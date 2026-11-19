import { Tool } from './components/Tool'

const CONGIX_URL = 'https://congix.uz'

function PromoBanner({ slot, size = 'banner' }: { slot: string; size?: 'banner' | 'inline' }) {
  if (size === 'inline') {
    return (
      <aside className="promo-strip" data-ad-slot={slot} aria-label="Реклама проектов автора">
        <span className="promo-strip-tag">Реклама</span>
        <span className="promo-strip-word">Congix</span>
        <p className="promo-strip-line">
          Репетитор, который объясняет <em>по шагам</em>, а не выдаёт ответ
        </p>
        <a className="promo-strip-cta" href={CONGIX_URL} target="_blank" rel="noopener">
          30 вопросов бесплатно
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

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12h13m0 0-5-5m5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const features = [
  {
    title: 'Ноль загрузок',
    text: 'Файл читается на вашем устройстве. Ни запросов на сервер, ни копий в чужом облаке — проверяется в devtools за пять секунд.',
    icon: (
      <path
        d="M12 3 5 6v5.5c0 4.3 2.8 8 7 9.5 4.2-1.5 7-5.2 7-9.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Текст и абзацы',
    text: 'Собираем строки по координатам, сохраняем размер шрифта, жирность и порядок — получается редактируемый документ, а не скриншот.',
    icon: (
      <>
        <path d="M6 5h12M6 9.5h12M6 14h8M6 18.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Все картинки сразу',
    text: 'Достаём встроенные изображения в исходном разрешении и упаковываем в один ZIP. Не нужно ловить скриншоты с каждой страницы.',
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" />
        <path d="m5.5 17 4.2-4.4 3 3 2.4-2.3 3.4 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: 'Без регистрации',
    text: 'Ни аккаунта, ни почты, ни подписки. Открыли страницу — сконвертировали — закрыли. Всё бесплатно и без водяных знаков.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8.5 12.2 2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]

const steps = [
  {
    number: '01',
    title: 'Добавьте PDF',
    text: 'Перетащите файл в окно или выберите с диска. Ничего не отправляется в интернет.',
  },
  {
    number: '02',
    title: 'Выберите результат',
    text: 'Word с текстом для правок — или все изображения архивом для дизайна и презентаций.',
  },
  {
    number: '03',
    title: 'Забирайте файл',
    text: 'Готовый .docx или .zip скачивается сразу. Никаких писем и ссылок, которые «сгорят».',
  },
]

const faq = [
  {
    q: 'Файлы правда никуда не загружаются?',
    a: 'Да. PDF разбирается библиотекой pdf.js внутри вкладки браузера, документ и отдельные страницы собираются на вашем устройстве. Сетевое соединение нужно только для загрузки самой страницы.',
  },
  {
    q: 'Что будет со сканами и фото-документами?',
    a: 'Если в PDF нет текстового слоя, страницы вставляются в Word как изображения — документ не превратится в пустой файл. Если текстовый слой есть, переносим именно текст.',
  },
  {
    q: 'Насколько точно сохраняется оформление?',
    a: 'Строки, размер шрифта, жирность и порядок блоков переносятся. Сложная вёрстка — таблицы, колонки, многослойные макеты — упрощается до линейного текста: универсально повторить любую полиграфию в Word невозможно.',
  },
  {
    q: 'В каком формате приходят изображения?',
    a: 'PNG в исходном разрешении, по одному файлу на картинку, всё в одном ZIP-архиве. Изображения, которые рисуются вектором или маской, пропускаются.',
  },
  {
    q: 'Есть ли ограничение по размеру?',
    a: 'Жёсткого лимита нет — предел задаёт память вашего устройства. Для стабильной работы рекомендуем файлы до 100 МБ и пару сотен страниц.',
  },
  {
    q: 'Это бесплатно?',
    a: 'Полностью. Без регистрации, подписки, лимита файлов в день и водяных знаков на результате.',
  },
]

export default function App() {
  return (
    <div className="page">
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top">
          <span className="brand-mark">R</span>
          <span className="brand-name">
            Rek<span className="accent">PDF</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="Разделы">
          <a href="#tool">Инструменты</a>
          <a href="#how">Как это работает</a>
          <a href="#faq">Вопросы</a>
        </nav>
        <a className="btn btn-ghost nav-cta" href="#tool">
          Открыть PDF
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="badge">
              <span className="badge-dot" />
              Работает локально — файлы остаются у вас
            </span>
            <h1>
              PDF → Word
              <br />
              <span className="grad">и все фото</span> из PDF
            </h1>
            <p className="lead">
              Конвертер, который держит документы при себе: текст, размеры шрифта и изображения
              извлекаются прямо в браузере. Бесплатно, без регистрации и без «загрузите файл на наш
              сервер».
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#tool">
                Конвертировать PDF
                <Arrow />
              </a>
              <a className="btn btn-soft" href="#how">
                Как это работает
              </a>
            </div>
            <ul className="hero-points">
              <li>Word (.docx) с текстом</li>
              <li>Картинки в PNG архивом</li>
              <li>Ни байта на сервер</li>
            </ul>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-window">
              <div className="art-bar">
                <span className="art-dot" />
                <span className="art-dot" />
                <span className="art-dot" />
                <span className="art-url">rekpdf · всё в браузере</span>
              </div>
              <div className="art-stage">
                <div className="art-card art-pdf">
                  <span className="art-tag">PDF</span>
                  <span className="art-line w-90" />
                  <span className="art-line w-70" />
                  <span className="art-line w-80" />
                  <span className="art-line w-45" />
                </div>
                <div className="art-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h13m0 0-5-5m5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="art-card art-doc">
                  <span className="art-tag art-tag-alt">DOCX</span>
                  <span className="art-line w-85" />
                  <span className="art-line w-60" />
                  <span className="art-line w-75" />
                  <span className="art-line w-40" />
                  <div className="art-photos">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <span className="art-chip chip-a">12 фото · ZIP</span>
                <span className="art-chip chip-b">текст редактируется</span>
              </div>
            </div>
            <span className="art-badge">
              <span className="art-badge-dot" />0 загрузок на сервер
            </span>
          </div>
        </section>

        <Tool />

        <PromoBanner slot="after-tool" />

        <section className="features" id="features">
          <div className="section-head">
            <span className="eyebrow">Почему RekPDF</span>
            <h2>Инструмент, а не «сервис с подпиской»</h2>
            <p className="section-sub">
              Никаких аккаунтов, очередей и файлов, которые лежат на чужом диске месяцами.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article className="feature" key={feature.title}>
                <span className="feature-index">0{index + 1}</span>
                <span className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    {feature.icon}
                  </svg>
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="how" id="how">
          <div className="section-head">
            <span className="eyebrow">Три шага</span>
            <h2>От PDF до результата — минута</h2>
          </div>
          <div className="step-grid">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <PromoBanner slot="before-faq" size="inline" />

        <section className="faq" id="faq">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Частые вопросы</h2>
          </div>
          <div className="faq-list">
            {faq.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>
                  <span>{item.q}</span>
                  <span className="faq-plus" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta">
          <div className="cta-inner">
            <h2>Держите документы при себе</h2>
            <p>Перетащите PDF и заберите Word или все картинки. Без регистрации и оплаты.</p>
            <a className="btn btn-primary" href="#tool">
              Открыть конвертер
              <Arrow />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark small">R</span>
          <span>RekPDF</span>
        </div>
        <p className="footer-note">
          PDF в Word и извлечение изображений в браузере. Работает на pdf.js и docx.
        </p>
        <p className="footer-copy">© {new Date().getFullYear()} RekPDF</p>
      </footer>
    </div>
  )
}
