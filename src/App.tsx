import { lazy, Suspense, useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ServicesPage } from './pages/ServicesPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { SeoPage } from './pages/SeoPage'
import { ToolSeoPage } from './pages/ToolSeoPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AdFooter, AdLeaderboard } from './components/Ads'
import { applySeo } from './lib/seo'
import { resolvePath } from './lib/seoToolPages'
import { Link, ROUTES, isKnownRoute, usePath } from './lib/router'
import { initials, useUser } from './lib/profile'
import { fetchOverview, track, type Overview } from './lib/analytics'

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
  { to: ROUTES.profile, label: 'Профиль' },
  { to: ROUTES.settings, label: 'Настройки' },
  { to: ROUTES.uz, label: "O'zbekcha" },
  { to: ROUTES.en, label: 'English' },
  { to: '/privacy-policy', label: 'Конфиденциальность' },
]

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
  const user = useUser()
  const resolved = resolvePath(path)
  const known = resolved.kind === 'static' && isKnownRoute(resolved.path)
  const [live, setLive] = useState<Overview | null>(null)

  useEffect(() => {
    track('страница', 'view')
  }, [path])

  // Заголовок, описание и canonical под текущую страницу — для поиска.
  useEffect(() => {
    applySeo(path)
  }, [path])

  useEffect(() => {
    let alive = true
    void fetchOverview().then((data) => {
      if (alive) setLive(data)
    })
    return () => {
      alive = false
    }
  }, [])

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
          <Link className="nav-user" to={ROUTES.profile}>
            {user ? (
              <>
                <span className="avatar" aria-hidden="true">
                  {initials(user.name)}
                </span>
                {user.name.split(' ')[0]}
              </>
            ) : (
              'Войти'
            )}
          </Link>
          <Link className="btn btn-ghost nav-cta" to={ROUTES.tools}>
            Открыть PDF
          </Link>
        </div>
      </header>

      {/* верхний рекламный слот — на каждой странице сайта */}
      <div className="ad-rail">
        <AdLeaderboard slot="global-top" />
      </div>

      <main id="top" className="site-main">
        {(resolved.kind === 'notfound' || (resolved.kind === 'static' && !known)) && <NotFound path={path} />}
        {known && path === ROUTES.home && <HomePage />}
        {known && path === ROUTES.tools && <ToolsPage />}
        {known && path === ROUTES.services && <ServicesPage />}
        {known && path === ROUTES.profile && <ProfilePage />}
        {known && path === ROUTES.settings && <SettingsPage />}
        {resolved.kind === 'lang' && <SeoPage lang={resolved.lang} />}
        {resolved.kind === 'tool' && <ToolSeoPage slug={resolved.slug} lang={resolved.lang} />}
        {resolved.kind === 'privacy' && <PrivacyPage lang={resolved.lang} />}
      </main>

      {/* нижний рекламный слот перед подвалом — на каждой странице */}
      <AdFooter slot="global-bottom" />

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
          <span className="footer-badge" title="Анонимная статистика Congix Docs">
            <span className="footer-dot" aria-hidden="true" />
            {live ? `Пользователей: ${live.people} · сегодня ${live.today}` : 'Ноль загрузок'}
          </span>
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
        </div>
      </footer>
    </div>
  )
}
