import { useState } from 'react'
import { WordImagesTool } from './WordImagesTool'
import { PdfRedactor } from './PdfRedactor'
import { PdfEditor } from './PdfEditor'
import { catalog } from './toolCatalog'
import { GROUP_LABELS } from './toolTypes'
import type { ToolGroup } from './toolTypes'
import { track } from '../lib/analytics'

const BUILTIN_HINTS: Record<string, string> = {
  word: 'Готовый .docx с текстом, который можно править.',
  images: 'Все растровые изображения одним ZIP-архивом.',
}

const GROUPS = Object.keys(GROUP_LABELS) as ToolGroup[]

export function Tool({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState(catalog[0].id)
  const active = catalog.find((tool) => tool.id === activeId) ?? catalog[0]
  const hint = BUILTIN_HINTS[active.id] ?? active.hint

  return (
    <section className="tool" id="tool">
      {!compact && (
        <div className="section-head">
          <span className="eyebrow">Инструменты</span>
          <h2>Выберите, что сделать с файлом</h2>
          <p className="section-sub">
            {catalog.length} инструментов, разложенных по задачам: править, собирать страницы,
            конвертировать. Всё считается в браузере — файлы не уходят на сервер.
          </p>
        </div>
      )}

      {GROUPS.map((group) => {
        const tools = catalog.filter((tool) => tool.group === group)
        if (!tools.length) return null

        return (
          <div className="tool-group" key={group}>
            <div className="tool-group-head">
              <h3>{GROUP_LABELS[group].title}</h3>
              <p>{GROUP_LABELS[group].note}</p>
            </div>

            <div className="tool-grid" role="group" aria-label={GROUP_LABELS[group].title}>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={tool.id === active.id}
                  className={`tool-tile${tool.id === active.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setActiveId(tool.id)
                    track(tool.name, 'open')
                    document.getElementById('tool-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }}
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
          </div>
        )
      })}

      <div className="tool-card" id="tool-card">
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

        {active.builtin === 'redactor' ? (
          <PdfRedactor key={active.id} />
        ) : active.builtin ? (
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
