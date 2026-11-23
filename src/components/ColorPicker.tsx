import { useEffect, useRef, useState } from 'react'

/**
 * Выбор цвета как в Microsoft Word: сетка оттенков темы (10 колонок, от светлого
 * к тёмному), ряд стандартных цветов и «Другие цвета» с любым HEX.
 */

type ThemeColor = { base: string; name: string }

const THEME_COLORS: ThemeColor[] = [
  { base: '000000', name: 'Чёрный' },
  { base: '44546A', name: 'Тёмно-синий' },
  { base: '4472C4', name: 'Синий' },
  { base: 'ED7D31', name: 'Оранжевый' },
  { base: 'A5A5A5', name: 'Серый' },
  { base: 'FFC000', name: 'Золотой' },
  { base: '5B9BD5', name: 'Голубой' },
  { base: '70AD47', name: 'Зелёный' },
  { base: '0563C1', name: 'Гиперссылка' },
  { base: '954F72', name: 'Просмотренная ссылка' },
]

/** Ряды оттенков сверху вниз: светлее 80/60/40 %, чистый цвет, темнее 25/50 %. */
const SHADE_ROWS: { mix: string; ratio: number; label: string }[] = [
  { mix: 'FFFFFF', ratio: 0.8, label: 'светлее 80 %' },
  { mix: 'FFFFFF', ratio: 0.6, label: 'светлее 60 %' },
  { mix: 'FFFFFF', ratio: 0.4, label: 'светлее 40 %' },
  { mix: '', ratio: 0, label: 'основной' },
  { mix: '000000', ratio: 0.25, label: 'темнее 25 %' },
  { mix: '000000', ratio: 0.5, label: 'темнее 50 %' },
]

const STANDARD_COLORS = [
  { value: 'C00000', label: 'Тёмно-красный' },
  { value: 'FF0000', label: 'Красный' },
  { value: 'FFC000', label: 'Оранжевый' },
  { value: 'FFFF00', label: 'Жёлтый' },
  { value: '92D050', label: 'Салатовый' },
  { value: '00B050', label: 'Зелёный' },
  { value: '00B0F0', label: 'Голубой' },
  { value: '0070C0', label: 'Синий' },
  { value: '002060', label: 'Тёмно-синий' },
  { value: '7030A0', label: 'Фиолетовый' },
]

function channels(hex: string): [number, number, number] {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? '000000'
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

function toHex(values: number[]): string {
  return values
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

function mixToward(base: string, target: string, ratio: number): string {
  if (!ratio) return base.toUpperCase()
  const from = channels(base)
  const to = channels(target)
  return toHex(from.map((value, index) => value + (to[index] - value) * ratio))
}

/** Нормализует то, что человек вписал в поле: «#0a0», «0a0a0a», «fff». */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return raw
      .split('')
      .map((symbol) => symbol + symbol)
      .join('')
      .toUpperCase()
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase()
  return null
}

type ColorPickerProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
}

export function ColorPicker({ value, onChange, label = 'Цвет', disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (next: string) => {
    onChange(next.toUpperCase())
    setOpen(false)
  }

  const commitDraft = () => {
    const next = normalizeHex(draft)
    if (!next) {
      setDraft(value)
      return
    }
    setDraft(next)
    onChange(next)
  }

  return (
    <div className="ed-color" ref={rootRef}>
      <button
        type="button"
        className="ed-color-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label={`${label}: #${value}`}
        aria-expanded={open}
        title={`#${value}`}
        disabled={disabled}
      >
        <span className="ed-color-swatch" style={{ background: `#${value}` }} />
        <svg viewBox="0 0 12 12" aria-hidden="true" className="ed-color-caret">
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="ed-color-pop" role="dialog" aria-label="Выбор цвета">
          <div className="ed-color-grid">
            {THEME_COLORS.map((theme) =>
              SHADE_ROWS.map((row) => {
                const hex = row.mix ? mixToward(theme.base, row.mix, row.ratio) : theme.base.toUpperCase()
                return (
                  <button
                    key={`${theme.base}-${row.label}`}
                    type="button"
                    className={`ed-color-cell${hex === value.toUpperCase() ? ' is-active' : ''}`}
                    style={{ background: `#${hex}` }}
                    onClick={() => pick(hex)}
                    aria-label={`${theme.name}, ${row.label}`}
                    title={`${theme.name}, ${row.label} — #${hex}`}
                  />
                )
              }),
            )}
          </div>

          <div className="ed-color-row">
            {STANDARD_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`ed-color-cell${color.value === value.toUpperCase() ? ' is-active' : ''}`}
                style={{ background: `#${color.value}` }}
                onClick={() => pick(color.value)}
                aria-label={color.label}
                title={`${color.label} — #${color.value}`}
              />
            ))}
          </div>

          <div className="ed-color-custom">
            <label className="ed-color-hex">
              <span>Другие цвета</span>
              <input
                type="text"
                inputMode="text"
                spellCheck={false}
                value={draft}
                onChange={(event) => setDraft(event.target.value.toUpperCase())}
                onBlur={commitDraft}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitDraft()
                    setOpen(false)
                  }
                }}
                aria-label="Цвет в HEX"
                placeholder="1A56DB"
              />
            </label>
            <input
              className="ed-color-native"
              type="color"
              value={`#${normalizeHex(draft) ?? value}`}
              onChange={(event) => {
                const next = normalizeHex(event.target.value)
                if (!next) return
                setDraft(next)
                onChange(next)
              }}
              aria-label="Палитра браузера"
            />
          </div>
        </div>
      )}
    </div>
  )
}
