import { AdRect } from '../components/Ads'
import { Tool } from '../components/Tool'
import { PromoBanner } from '../components/PromoBanner'
import { Arrow } from '../components/ui'
import { Link } from '../lib/router'

export function ToolsPage() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Инструменты</span>
        <h1>Всё для PDF в одном окне</h1>
        <p>
          Выберите задачу: править документ, переставлять и собирать страницы, конвертировать или
          сжать. Файлы открываются у вас на устройстве — загрузок на сервер нет.
        </p>
      </section>

      <Tool compact />

      <div className="promo-slot">
        <PromoBanner slot="tools-page" size="inline" />
      </div>

      <div className="promo-slot">
        <AdRect slot="tools-grid" />
      </div>

      <section className="cta">
        <div className="cta-inner">
          <h2>Нужен другой результат?</h2>
          <p>Посмотрите, что умеет сервис целиком — от редактора до пакетной конвертации.</p>
          <Link className="btn btn-primary" to="/services">
            Что умеет сервис
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}
