import { loadPrefs } from './profile'

/**
 * Анонимная статистика: уходит только название инструмента, действие, путь и случайный
 * id посетителя. Ни файлов, ни имён, ни почты. Отключается в настройках.
 */
const ENDPOINT = 'https://rekpdf-admin-pwbv0q.freebuff.site/api/collect'
const VISITOR_KEY = 'rekpdf.visitor'

export type TrackAction = 'open' | 'done' | 'view'

function visitorId(): string {
  try {
    const saved = window.localStorage.getItem(VISITOR_KEY)
    if (saved) return saved
    const made = `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
    window.localStorage.setItem(VISITOR_KEY, made)
    return made
  } catch {
    return 'anonymous'
  }
}

export function analyticsEnabled(): boolean {
  return loadPrefs().analytics !== false
}

/** Отправляет событие не блокируя интерфейс: статистика не должна мешать работе. */
export function track(name: string, action: TrackAction) {
  try {
    if (!analyticsEnabled()) return
    void fetch(ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, action, path: window.location.pathname, visitor: visitorId() }),
    }).catch(() => {
      // Сборщик недоступен — молча живём дальше, конвертация важнее.
    })
  } catch {
    // Приватный режим и запрет сети не должны ломать сайт.
  }
}
