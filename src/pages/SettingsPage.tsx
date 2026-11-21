import { useState } from 'react'
import { Link } from '../lib/router'
import { clearEverything, clearHistory, loadHistory, loadPrefs, savePrefs, useUser } from '../lib/profile'

type Note = { tone: 'ok' | 'info' | 'error'; text: string }

export function SettingsPage() {
  const user = useUser()
  const [prefs, setPrefs] = useState(() => loadPrefs())
  const [note, setNote] = useState<Note | null>(null)
  const [confirm, setConfirm] = useState<'history' | 'all' | null>(null)

  const history = loadHistory()

  const update = (next: typeof prefs) => {
    setPrefs(next)
    savePrefs(next)
    setNote({ tone: 'ok', text: 'Настройка сохранена.' })
  }

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Настройки</span>
        <h1>Как работает сервис у вас</h1>
        <p>
          Настройки хранятся в этом браузере. Ни аккаунт, ни файлы на сервер не отправляются.
        </p>
      </section>

      <div className="stack">
        <div className="page-card">
          <h3>История и данные</h3>

          <label className="pref-row">
            <div>
              <b>Записывать историю действий</b>
              <span>
                Сохраняем название файла, инструмент и время — только на этом устройстве. Сами
                документы не сохраняются никогда.
              </span>
            </div>
            <input
              type="checkbox"
              className="pref-switch"
              checked={prefs.keepHistory}
              onChange={(event) => update({ ...prefs, keepHistory: event.target.checked })}
              aria-label="Записывать историю действий"
            />
          </label>

          <div className="pref-row" style={{ marginTop: 12 }}>
            <div>
              <b>Очистить историю</b>
              <span>Сейчас записей: {history.length}. Файлы при этом не затрагиваются.</span>
            </div>
            <button
              className="btn btn-quiet"
              type="button"
              disabled={!history.length}
              onClick={() => {
                if (confirm !== 'history') {
                  setConfirm('history')
                  setNote({ tone: 'info', text: 'Нажмите ещё раз, чтобы подтвердить.' })
                  return
                }
                clearHistory()
                setConfirm(null)
                setNote({ tone: 'ok', text: 'История очищена.' })
              }}
            >
              {confirm === 'history' ? 'Точно очистить' : 'Очистить'}
            </button>
          </div>
        </div>

        <div className="page-card">
          <h3>Профиль</h3>
          <p>
            {user
              ? `Вы вошли как ${user.name} (${user.email}). Профиль хранится в браузере.`
              : 'Профиль не создан — сервис работает и без него.'}
          </p>
          <div className="form-actions">
            <Link className="btn btn-soft" to="/profile">
              {user ? 'Открыть профиль' : 'Создать профиль'}
            </Link>
          </div>
        </div>

        <div className="page-card danger-zone">
          <h3>Удалить всё с устройства</h3>
          <p>
            Стирает профиль, историю и настройки из этого браузера. Документы и скачанные файлы
            остаются у вас — мы их не хранили.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-quiet btn-danger"
              type="button"
              onClick={() => {
                if (confirm !== 'all') {
                  setConfirm('all')
                  setNote({ tone: 'info', text: 'Это удалит профиль и настройки. Нажмите ещё раз, чтобы подтвердить.' })
                  return
                }
                clearEverything()
                setPrefs(loadPrefs())
                setConfirm(null)
                setNote({ tone: 'ok', text: 'Всё локальное стёрто. Сервис как после первого визита.' })
              }}
            >
              {confirm === 'all' ? 'Точно удалить всё' : 'Удалить данные'}
            </button>
          </div>
        </div>

        <div className="page-card">
          <h3>О сервисе</h3>
          <ul className="page-list">
            <li>RekPDF 1.0 — конвертер и редактор PDF в браузере</li>
            <li>pdf.js · pdf-lib · docx — всё считается на вашем устройстве</li>
            <li>Файлы не загружаются на сервер и не хранятся</li>
            <li>Без регистрации, подписки и водяных знаков</li>
          </ul>
        </div>

        {note && <p className={`message message-${note.tone}`}>{note.text}</p>}
      </div>
    </>
  )
}
