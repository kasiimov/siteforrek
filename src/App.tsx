import { lazy, Suspense, useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ServicesPage } from './pages/ServicesPage'
import { SeoPage } from './pages/SeoPage'
import { ToolSeoPage } from './pages/ToolSeoPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AboutPage } from './pages/AboutPage'
import { ContactsPage } from './pages/ContactsPage'
import { applySeo } from './lib/seo'
import { resolvePath } from './lib/seoToolPages'
import { Link, ROUTES, isKnownRoute, usePath } from './lib/router'

// Редактор со своими библиотеками грузится только при переходе на /editor.
const EditorPage = lazy(() =>
  import('./pages/EditorPage').then((module) => ({ default: module.EditorPage })),
)

const NAV = [
  { to: ROUTES.home, label: 'Главная' },
  { to: ROUTES.tools, label: 'Инструменты' },
  { to: ROUTES.services, label: 'Услуги' },
]

const FOOTER_LINKS = [
  { to: ROUTES.home, label: 'Главная' },
  { to: ROUTES.tools, label: 'Инструменты' },
  { to: ROUTES.services, label: 'Услуги' },
  { to: ROUTES.uz, label: "O'zbekcha" },
  { to: ROUTES.en, label: 'English' },
  { to: '/about', label: 'О сервисе' },
  { to: '/terms', label: 'Условия использования' },
  { to: '/privacy-policy', label: 'Конфиденциальность' },
  { to: '/contacts', label: 'Контакты' },
]

const CONTACT_EMAIL = 'likedissdei@gmail.com'

function NotFound({ path }: { path: string }) {
  return (
    <section className="page-hero">
      <span className="eyebrow">404</span>
      <h1>Такой страницы нет</h1>
      <p>
        Адрес «{path}» не нашёлся. Возможно, ссылка устарела — начните с инструментов или главной.
      </p>
      <div className="form-actions" style={{ marginTop: 18 }}>
        <Link className="btn btn-primary" to={ROUTES.tools}>
          К инструментам
        </Link>
        <Link className="btn btn-quiet" to={ROUTES.home}>
          На главную
        </Link>
      </div>
    </section>
  )
}

export default function App() {
  const path = usePath()
  const resolved = resolvePath(path)
  const known = resolved.kind === 'static' && isKnownRoute(resolved.path)

  // Заголовок, описание и canonical под текущую страницу — для поиска.
  useEffect(() => {
    applySeo(path)
  }, [path])

  // Редактор — самостоятельное приложение: без шапки, футера и фонов сайта.
  if (known && path === ROUTES.editor) {
    return (
      <Suspense
        fallback={
          <section className="page-hero">
            <p>Загружаем редактор…</p>
          </section>
        }
      >
        <EditorPage />
      </Suspense>
    )
  }

  return (
    <div className="page">
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <header className="nav">
        <Link className="brand" to={ROUTES.home}>
          <span className="brand-mark">C</span>
          <span className="brand-name">
            Congix <span className="accent">Docs</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Разделы">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} aria-current={path === item.to ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-ghost nav-cta" to={ROUTES.tools}>
            Открыть PDF
          </Link>
        </div>
      </header>

      <main id="top" className="site-main">
        {(resolved.kind === 'notfound' || (resolved.kind === 'static' && !known)) && <NotFound path={path} />}
        {known && path === ROUTES.home && <HomePage />}
        {known && path === ROUTES.tools && <ToolsPage />}
        {known && path === ROUTES.services && <ServicesPage />}
        {'/about' === path && <AboutPage lang={path.startsWith('/en') ? 'en' : path.startsWith('/uz') ? 'uz' : 'ru'} />}
        {'/contacts' === path && <ContactsPage lang={path.startsWith('/en') ? 'en' : path.startsWith('/uz') ? 'uz' : 'ru'} />}
        {resolved.kind === 'lang' && <SeoPage lang={resolved.lang} />}
        {resolved.kind === 'tool' && <ToolSeoPage slug={resolved.slug} lang={resolved.lang} />}
        {resolved.kind === 'privacy' && <PrivacyPage lang={resolved.lang} />}
        {resolved.kind === 'terms' && <TermsPage lang={resolved.lang} />}
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="brand-mark small">C</span>
            <span>Congix Docs</span>
          </div>
          <p className="footer-note">
            PDF в Word, редактор PDF и все картинки из PDF — прямо в браузере. Файлы не покидают
            устройство.
          </p>
          <p className="footer-contact">
            Связь с нами:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        <nav className="footer-links" aria-label="Разделы сайта">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          <a href="#top">Наверх ↑</a>
        </nav>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Congix Docs</p>
          <p className="footer-stack">pdf.js · docx · pdf-lib — всё считается на вашем устройстве</p>
          <p className="footer-copy">
            <Link to="/terms">Условия</Link> · <Link to="/privacy-policy">Конфиденциальность</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
