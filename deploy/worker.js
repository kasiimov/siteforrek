/**
 * Воркер сайта: отдаёт собранные файлы из dist и проксирует решения Drex (Nace).
 * Ключ NACE_API_KEY живёт только в окружении воркера — в браузер он не попадает.
 */

const DREX_ENDPOINT = 'https://console.nace.ai/v1/systemone'
const DREX_MODEL = 'drex-latest'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

/**
 * Один вызов Drex: состояние дела (state) и типизированные вопросы.
 * Ответ отдаём как есть — с вероятностями по каждому варианту.
 */
async function decide(request, env) {
  if (request.method !== 'POST') return json({ error: 'Только POST.' }, 405)

  const key = env.NACE_API_KEY
  if (!key) return json({ error: 'NACE_API_KEY не настроен на сервере.' }, 503)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Тело запроса должно быть JSON.' }, 400)
  }

  const state = body?.state
  const stateReady =
    typeof state === 'string'
      ? state.trim().length > 0
      : state !== null && typeof state === 'object' && Object.keys(state).length > 0
  if (!stateReady) return json({ error: 'Нужен state: текст или объект.' }, 400)

  const questions = body?.questions
  if (!questions || typeof questions !== 'object' || Array.isArray(questions) || !Object.keys(questions).length) {
    return json({ error: 'Нужен хотя бы один вопрос в questions.' }, 400)
  }

  const model = typeof body.model === 'string' && body.model ? body.model : DREX_MODEL

  let response
  try {
    response = await fetch(DREX_ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, state, questions }),
      signal: AbortSignal.timeout(60_000),
    })
  } catch (error) {
    return json({ error: `Drex недоступен: ${error instanceof Error ? error.message : 'сеть'}` }, 502)
  }

  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  for (const name of ['retry-after', 'retry-after-ms', 'x-request-id']) {
    const value = response.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new Response(await response.text(), { status: response.status, headers })
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname
    if (path === '/api/nace/decide') return decide(request, env)
    if (path.startsWith('/api/')) return json({ error: 'Неизвестный метод API.' }, 404)
    return env.ASSETS.fetch(request)
  },
}
