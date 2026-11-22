import { Tool } from '../components/Tool'
import { catalog } from '../components/toolCatalog'
import { AdRect } from '../components/Ads'
import { PromoBanner } from '../components/PromoBanner'
import { Arrow } from '../components/ui'
import { Link } from '../lib/router'

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
      <path d="M6 5h12M6 9.5h12M6 14h8M6 18.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    text: 'Ни аккаунта, ни почты, ни подписки. Открыли страницу — сделали дело — закрыли. Всё бесплатно и без водяных знаков.',
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
    text: 'Word с текстом для правок, картинки архивом или отредактированный PDF.',
  },
  {
    number: '03',
    title: 'Забирайте файл',
    text: 'Готовый файл скачивается сразу. Никаких писем и ссылок, которые «сгорят».',
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
    a: 'Строки, размер шрифта, жирность, цвет и толщина линий таблиц, гиперссылки и порядок блоков переносятся. Универсально повторить любую полиграфию в Word невозможно, но мы стараемся.',
  },
  {
    q: 'Можно ли править PDF прямо здесь?',
    a: 'Да, в «Редакторе PDF»: добавьте текст, фото, пустой лист, уберите пометки и подписи-аннотации — и скачайте готовый файл.',
  },
  {
    q: 'Есть ли ограничение по размеру?',
    a: 'Жёсткого лимита нет — предел задаёт память вашего устройства. Для стабильной работы рекомендуем файлы до 100 МБ и пару сотен страниц.',
  },
  {
    q: 'Это бесплатно?',
    a: 'Полностью. Без регистрации, подписки, лимита файлов в день и водяных знаков на результате.',
  },
  {
    q: 'Как конвертировать PDF в Word онлайн бесплатно?',
    a: 'Откройте «Инструменты», выберите «PDF → Word» и добавьте файл. Текст, шрифты и таблицы переносятся в .docx, который сразу скачивается. Регистрация и оплата не нужны.',
  },
  {
    q: 'Как сжать PDF файл без потери качества?',
    a: 'В инструменте «Сжать PDF» выберите масштаб и качество: страницы пересобираются в JPEG, вес файла падает в разы, а текст остаётся читаемым. Для документов с мелким шрифтом берите качество повыше.',
  },
  {
    q: 'Как объединить PDF файлы в один?',
    a: 'Инструмент «Объединить PDF» принимает несколько файлов и собирает их в один документ в выбранном порядке. Всё происходит в браузере, файлы никуда не загружаются.',
  },
  {
    q: 'Как перевести фото JPG в PDF?',
    a: 'В «JPG → PDF» добавьте одну или несколько фотографий: каждая станет страницей PDF. Размер страницы и поля можно выбрать, готовый файл скачивается сразу.',
  },
]

export function HomePage() {
  return (
    <>
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
            Конвертер и редактор, которые держат документы при себе: текст, размеры шрифта и
            изображения обрабатываются прямо в браузере. Бесплатно, без регистрации и без «загрузите
            файл на наш сервер».
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/tools">
              Открыть инструменты
              <Arrow />
            </Link>
            <Link className="btn btn-soft" to="/services">
              Что умеет сервис
            </Link>
          </div>
          <ul className="hero-points">
            <li>Word (.docx) с текстом</li>
            <li>Редактор PDF в браузере</li>
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

      <section className="tool" id="tools-preview">
        <div className="section-head">
          <span className="eyebrow">Инструменты</span>
          <h2>{catalog.length} инструментов для PDF</h2>
          <p className="section-sub">
            Редактор, страницы, конвертация и сжатие — всё в одном окне и без загрузки файлов на сервер.
          </p>
        </div>
        <Tool compact />
        <div className="promo-slot">
          <PromoBanner slot="after-tool" size="inline" />
        </div>
      </section>

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

      <div className="promo-slot">
        <AdRect slot="home-mid" />
      </div>

      <PromoBanner slot="before-faq" />

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
          <Link className="btn btn-primary" to="/tools">
            Открыть инструменты
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}
