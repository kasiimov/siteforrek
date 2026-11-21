import { useState } from 'react'
import { Arrow } from '../components/ui'
import { Link } from '../lib/router'
import {
  clearHistory,
  formatDay,
  formatWhen,
  initials,
  loadHistory,
  loadPrefs,
  saveUser,
  useUser,
} from '../lib/profile'

type Note = { tone: 'ok' | 'error' | 'info'; text: string }

function check(name: string, email: string): string | null {
  if (name.trim().length < 2) return 'Как к вам обращаться? Введите имя — хотя бы две буквы.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Проверьте почту: похоже, там опечатка.'
  return null
}

export function ProfilePage() {
  const user = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState<Note | null>(null)

  const history = loadHistory()
  const uniqueTools = new Set(history.map((entry) => entry.tool)).size

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const problem = check(name, email)
    if (problem) {
      setNote({ tone: 'error', text: problem })
      return
    }

    saveUser({
      name: name.trim(),
      email: email.trim(),
      createdAt: user?.createdAt ?? Date.now(),
    })
    setEditing(false)
    setNote({ tone: 'ok', text: user ? 'Профиль обновлён.' : 'Профиль создан — он живёт в этом браузере.' })
  }

  if (!user) {
    return (
      <>
        <section className="page-hero">
          <span className="eyebrow">Профиль</span>
          <h1>Создайте профиль</h1>
          <p>
            Он нужен только для удобства: история действий и настройки будут под рукой. Данные
            остаются в этом браузере — пароля нет, на сервер ничего не уходит.
          </p>
        </section>

        <div className="stack">
          <form className="page-card form-card" onSubmit={submit}>
            <label className="form-row">
              <span className="field-label">Имя</span>
              <input
                className="field-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Как к вам обращаться"
                autoComplete="name"
              />
            </label>
            <label className="form-row">
              <span className="field-label">Почта</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Создать профиль
                <Arrow />
              </button>
              <Link className="btn btn-quiet" to="/tools">
                Продолжить без профиля
              </Link>
            </div>

            <p className="panel-note">
              Мы не храним пароль и не отправляем ваши данные никуда. Профиль можно удалить в любой
              момент — в настройках.
            </p>

            {note && <p className={`message message-${note.tone}`}>{note.text}</p>}
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Профиль</span>
        <h1>Привет, {user.name.split(' ')[0]}</h1>
        <p>Здесь история действий в сервисе и настройки. Всё хранится на этом устройстве.</p>
      </section>

      <div className="stack">
        <div className="page-card">
          <div className="profile-head">
            <span className="avatar big" aria-hidden="true">
              {initials(user.name)}
            </span>
            <div className="profile-meta">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>С нами с {formatDay(user.createdAt)}</span>
            </div>
            <div className="form-actions" style={{ marginLeft: 'auto' }}>
              <button
                className="btn btn-quiet"
                type="button"
                onClick={() => {
                  setName(user.name)
                  setEmail(user.email)
                  setEditing((current) => !current)
                }}
              >
                {editing ? 'Скрыть' : 'Изменить'}
              </button>
              <Link className="btn btn-soft" to="/settings">
                Настройки
              </Link>
            </div>
          </div>

          {editing && (
            <form className="form-card" onSubmit={submit} style={{ marginTop: 18 }}>
              <label className="form-row">
                <span className="field-label">Имя</span>
                <input className="field-input" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="form-row">
                <span className="field-label">Почта</span>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  Сохранить
                </button>
              </div>
            </form>
          )}

          {note && <p className={`message message-${note.tone}`}>{note.text}</p>}
        </div>

        <div className="stat-grid">
          <div className="stat">
            <b>{history.length}</b>
            <span>операций за всё время</span>
          </div>
          <div className="stat">
            <b>{uniqueTools}</b>
            <span>инструментов попробовано</span>
          </div>
          <div className="stat">
            <b>{history.length ? formatWhen(history[0].at) : '—'}</b>
            <span>последняя операция</span>
          </div>
        </div>

        <div className="page-card">
          <h3>История действий</h3>
          <p>
            {loadPrefs().keepHistory
              ? 'Названия файлов и инструменты. Сами документы нигде не сохраняются.'
              : 'История выключена в настройках — новые действия не записываются.'}
          </p>

          {history.length ? (
            <>
              <ul className="history-list">
                {history.slice(0, 12).map((entry) => (
                  <li className="history-item" key={entry.id}>
                    <b>{entry.tool}</b>
                    <span>{entry.fileName}</span>
                    <time>{formatWhen(entry.at)}</time>
                  </li>
                ))}
              </ul>
              <div className="form-actions">
                <button
                  className="btn btn-quiet"
                  type="button"
                  onClick={() => {
                    clearHistory()
                    setNote({ tone: 'info', text: 'История очищена.' })
                  }}
                >
                  Очистить историю
                </button>
              </div>
            </>
          ) : (
            <p className="empty-note">
              Пока пусто. Откройте инструменты и сконвертируйте первый документ — действия появятся
              здесь.
            </p>
          )}
        </div>

        <div className="page-card">
          <h3>Аккаунт</h3>
          <p>Профиль локальный: почта и имя не уходят с устройства, пароля нет.</p>
          <div className="form-actions">
            <Link className="btn btn-soft" to="/tools">
              Открыть инструменты
            </Link>
            <button
              className="btn btn-quiet btn-danger"
              type="button"
              onClick={() => {
                saveUser(null)
                setName('')
                setEmail('')
                setNote({ tone: 'info', text: 'Профиль удалён с этого устройства.' })
              }}
            >
              Выйти и удалить профиль
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
