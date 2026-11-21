import { useEffect, useState } from 'react'

/**
 * Локальный профиль: всё живёт в localStorage этого браузера.
 * Сервер не участвует, пароли не хранятся — аккаунт нужен только для удобства.
 */

export type LocalUser = {
  name: string
  email: string
  createdAt: number
}

export type HistoryEntry = {
  id: string
  tool: string
  fileName: string
  result: string
  at: number
}

export type Prefs = {
  keepHistory: boolean
}

const USER_KEY = 'rekpdf.user'
const HISTORY_KEY = 'rekpdf.history'
const PREFS_KEY = 'rekpdf.prefs'
const USER_EVENT = 'rekpdf:user'
export const HISTORY_LIMIT = 30

export const DEFAULT_PREFS: Prefs = { keepHistory: true }

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Приватный режим или переполненное хранилище — просто живём без сохранения.
  }
}

export function loadUser(): LocalUser | null {
  const user = read<LocalUser>(USER_KEY)
  if (!user || typeof user.name !== 'string' || typeof user.email !== 'string') return null
  return user
}

export function saveUser(user: LocalUser | null) {
  if (user) write(USER_KEY, user)
  else window.localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event(USER_EVENT))
}

export function loadPrefs(): Prefs {
  const prefs = read<Partial<Prefs>>(PREFS_KEY)
  return { ...DEFAULT_PREFS, ...(prefs ?? {}) }
}

export function savePrefs(prefs: Prefs) {
  write(PREFS_KEY, prefs)
}

export function loadHistory(): HistoryEntry[] {
  const history = read<HistoryEntry[]>(HISTORY_KEY)
  if (!Array.isArray(history)) return []
  return history.filter((entry) => entry && typeof entry.tool === 'string' && typeof entry.fileName === 'string')
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY)
  } catch {
    // ничего не поделать — истории и так нет
  }
}

/** Обрезает историю до лимита: свежие записи сверху. */
export function trimHistory(entries: HistoryEntry[], limit = HISTORY_LIMIT): HistoryEntry[] {
  return [...entries].sort((a, b) => b.at - a.at).slice(0, Math.max(0, limit))
}

/** Записывает действие пользователя, если история включена в настройках. */
export function addHistory(entry: Omit<HistoryEntry, 'id' | 'at'>): void {
  if (!loadPrefs().keepHistory || !loadUser()) return
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
  }
  write(HISTORY_KEY, trimHistory([next, ...loadHistory()]))
}

/** Чистит всё, что сервис хранит на устройстве. */
export function clearEverything() {
  try {
    window.localStorage.removeItem(USER_KEY)
    window.localStorage.removeItem(HISTORY_KEY)
    window.localStorage.removeItem(PREFS_KEY)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(USER_EVENT))
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'R'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function formatWhen(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
      new Date(timestamp),
    )
  } catch {
    return new Date(timestamp).toLocaleString()
  }
}

export function formatDay(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(timestamp))
  } catch {
    return new Date(timestamp).toDateString()
  }
}

/** Подписка на изменения профиля — хедер обновляется без перезагрузки. */
export function useUser(): LocalUser | null {
  const [user, setUser] = useState<LocalUser | null>(() => loadUser())

  useEffect(() => {
    const update = () => setUser(loadUser())
    window.addEventListener(USER_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(USER_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return user
}
