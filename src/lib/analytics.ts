import { loadPrefs } from './profile'

/**
 * Анонимная статистика: уходит только название инструмента, действие, путь и случайный
 * id посетителя. Ни файлов, ни имён, ни почты. Отключается в настройках.
 */
const ENDPOINT = 'https://rekpdf-admin-pwbv0q.freebuff.site/api/collect'
const OVERVIEW = 'https://rekpdf-admin-pwbv0q.freebuff.site/api/overview'
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

/** Публичный обезличенный свод из панели: сколько людей и событий на сайте. */
export type Overview = { people: number; today: number; week: number }

export async function fetchOverview(): Promise<Overview | null> {
  try {
    if (!analyticsEnabled()) return null
    const response = await fetch(OVERVIEW, { headers: { accept: 'application/json' } })
    if (!response.ok) return null
    const data = (await response.json()) as Partial<Overview>
    if (typeof data?.people !== 'number' || typeof data?.today !== 'number') return null
    return { people: data.people, today: data.today, week: typeof data.week === 'number' ? data.week : 0 }
  } catch {
    return null
  }
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
