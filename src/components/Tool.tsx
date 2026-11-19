import { useState } from 'react'
import { WordImagesTool } from './WordImagesTool'
import { PdfEditor } from './PdfEditor'
import { catalog } from './toolCatalog'

const BUILTIN_HINTS: Record<string, string> = {
  word: 'Готовый .docx с текстом, который можно править.',
  images: 'Все растровые изображения одним ZIP-архивом.',
}

export function Tool() {
  const [activeId, setActiveId] = useState(catalog[0].id)
  const active = catalog.find((tool) => tool.id === activeId) ?? catalog[0]
  const hint = BUILTIN_HINTS[active.id] ?? active.hint

  return (
    <section className="tool" id="tool">
      <div className="section-head">
        <span className="eyebrow">Все инструменты</span>
        <h2>PDF-мастерская прямо в браузере</h2>
        <p className="section-sub">
          Двенадцать инструментов: конвертация, склейка, разделение, поворот, нумерация, водяной знак
          и сжатие. Файлы открываются у вас на устройстве — загрузок на сервер нет.
        </p>
      </div>

      <div className="tool-grid" role="tablist" aria-label="Инструменты">
        {catalog.map((tool) => (
          <button
            key={tool.id}
            type="button"
            role="tab"
            aria-selected={tool.id === active.id}
            className={`tool-tile${tool.id === active.id ? ' is-active' : ''}`}
            onClick={() => setActiveId(tool.id)}
          >
            <span className="tool-tile-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {tool.icon}
              </svg>
            </span>
            <span className="tool-tile-name">{tool.name}</span>
          </button>
        ))}
      </div>

      <div className="tool-card">
        <div className="tool-active-head">
          <span className="tool-active-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {active.icon}
            </svg>
          </span>
          <div>
            <h3>{active.name}</h3>
            <p>{hint}</p>
          </div>
        </div>

        {active.builtin ? (
          <WordImagesTool key={active.id} mode={active.builtin} />
        ) : (
          <PdfEditor key={active.id} spec={active} />
        )}
      </div>

      <p className="tool-footnote">
        Вся обработка идёт локально в браузере. Мы не видим ваши документы и ничего не храним.
      </p>
    </section>
  )
}
