import { loadPrefs } from './profile'

/**
 * Анонимная статистика: уходит название инструмента, действие, путь, случайные
 * id посетителя и сессии, источник перехода, язык, тип устройства, браузер, ОС,
 * размер экрана, страна (определяет Cloudflare) и текст ошибки. Ни файлов, ни имён,
 * ни почты. Отключается в настройках.
 */
const ENDPOINT = 'https://rekpdf-admin-pwbv0q.freebuff.site/api/collect'
const OVERVIEW = 'https://rekpdf-admin-pwbv0q.freebuff.site/api/overview'
const VISITOR_KEY = 'rekpdf.visitor'
const SESSION_KEY = 'rekpdf.session'

export type TrackAction = 'open' | 'done' | 'view' | 'error' | 'leave' | 'session'
export type TrackMeta = Record<string, string | number | boolean | undefined>

function makeId(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function visitorId(): string {
  try {
    const saved = window.localStorage.getItem(VISITOR_KEY)
    if (saved) return saved
    const made = makeId('v')
    window.localStorage.setItem(VISITOR_KEY, made)
    return made
  } catch {
    return 'anonymous'
  }
}

function sessionId(): string {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY)
    if (saved) return saved
    const made = makeId('s')
    window.sessionStorage.setItem(SESSION_KEY, made)
    return made
  } catch {
    return 'session'
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

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth || 0
  const touch = navigator.maxTouchPoints > 0
  if (/iPad|Tablet/i.test(navigator.userAgent)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) return width >= 720 && touch ? 'tablet' : 'mobile'
  return 'desktop'
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Other'
}

function detectOs(): string {
  const ua = navigator.userAgent
  if (/Windows/.test(ua)) return 'Windows'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Other'
}

type Source = { ref: string; source: string; medium: string; campaign: string }

function detectSource(): Source {
  try {
    const params = new URLSearchParams(window.location.search)
    let ref = ''
    if (document.referrer) {
      try {
        const url = new URL(document.referrer)
        if (url.origin !== window.location.origin) ref = url.hostname.replace(/^www\./, '')
      } catch {
        ref = document.referrer.slice(0, 120)
      }
    }
    const source = (params.get('utm_source') || ref || 'direct').slice(0, 120)
    const medium = (params.get('utm_medium') || (ref ? 'referral' : 'none')).slice(0, 120)
    const campaign = (params.get('utm_campaign') || '').slice(0, 120)
    return { ref, source, medium, campaign }
  } catch {
    return { ref: '', source: 'direct', medium: 'none', campaign: '' }
  }
}

let contextCache: Record<string, string> | null = null

function context(): Record<string, string> {
  if (contextCache) return contextCache
  const source = detectSource()
  let timezone = ''
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    timezone = ''
  }
  contextCache = {
    ...source,
    lang: (navigator.language || 'unknown').slice(0, 12),
    device: detectDevice(),
    browser: detectBrowser(),
    os: detectOs(),
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    tz: timezone,
  }
  return contextCache
}

let enteredAt = Date.now()
let leftPath = ''

function send(payload: Record<string, unknown>) {
  try {
    if (!analyticsEnabled()) return
    void fetch(ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...context(),
        visitor: visitorId(),
        session: sessionId(),
        path: window.location.pathname,
        ...payload,
      }),
    }).catch(() => {
      // Сборщик недоступен — молча живём дальше, конвертация важнее.
    })
  } catch {
    // Приватный режим и запрет сети не должны ломать сайт.
  }
}

/** Отправляет событие не блокируя интерфейс: статистика не должна мешать работе. */
export function track(name: string, action: TrackAction, meta?: TrackMeta, duration?: number) {
  if (action === 'view') {
    enteredAt = Date.now()
    leftPath = ''
  }
  send({
    name,
    action,
    meta: meta && Object.keys(meta).length ? meta : undefined,
    duration: Number.isFinite(duration) ? duration : undefined,
  })
}

function leavePage() {
  const seconds = Math.round((Date.now() - enteredAt) / 1000)
  const path = window.location.pathname
  if (seconds < 2 || leftPath === path) return
  leftPath = path
  track('страница', 'leave', { seconds }, seconds)
}

let errorCount = 0

function reportError(message: unknown, source?: string) {
  if (errorCount >= 5) return
  errorCount += 1
  track('ошибка', 'error', {
    message: String(message || 'Неизвестная ошибка').slice(0, 300),
    source: String(source || '').slice(0, 160),
  })
}

let initialized = false

/** Подключает фоновый сбор: старт сессии, уход со страницы и ошибки. */
export function initTracking() {
  if (initialized) return
  initialized = true
  if (!analyticsEnabled()) return

  track('сессия', 'session', {
    landing: window.location.pathname,
    ref: context().ref || 'direct',
  })

  window.addEventListener('pagehide', leavePage)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') leavePage()
  })
  window.addEventListener('error', (event) => {
    reportError(event.message, event.filename)
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    reportError(reason instanceof Error ? reason.message : reason, 'promise')
  })
}
