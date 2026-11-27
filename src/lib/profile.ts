/**
 * Настройки, которые сервис держит в localStorage этого браузера.
 * Аккаунтов, имён, почты и истории действий мы не храним: сервер не участвует.
 */

export type Prefs = {
  /** анонимные счётчики использования — можно выключить в браузере */
  analytics: boolean
}

const PREFS_KEY = 'rekpdf.prefs'

export const DEFAULT_PREFS: Prefs = { analytics: true }

export function loadPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const saved = JSON.parse(raw) as Partial<Prefs>
    return { ...DEFAULT_PREFS, ...saved }
  } catch {
    return DEFAULT_PREFS
  }
}
