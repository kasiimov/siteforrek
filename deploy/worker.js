/**
 * Воркер сайта: отдаёт собранные файлы из dist и проксирует решения Drex (Nace).
 * Ключ NACE_API_KEY живёт только в окружении воркера — в браузер он не попадает.
 */

const DREX_ENDPOINT = 'https://console.nace.ai/v1/systemone'
const DREX_MODEL = 'drex-latest'
const MAX_BODY = 256 * 1024
const RATE_LIMIT = 20
const RATE_WINDOW = 60 * 1000

const buckets = new Map()

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  })
}

function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local'
}

/** Счётчик в памяти изолята: ключ Drex платный, поэтому чужой флуд отсекаем. */
function allow(key, limit, windowMs) {
  const at = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.reset <= at) {
    if (buckets.size > 5000) buckets.clear()
    buckets.set(key, { count: 1, reset: at + windowMs })
    return true
  }
  bucket.count += 1
  return bucket.count <= limit
}

/** Только свой сайт: чужой Origin не должен тратить ключ. */
function sameOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

/**
 * Один вызов Drex: состояние дела (state) и типизированные вопросы.
 * Ответ отдаём как есть — с вероятностями по каждому варианту.
 */
async function decide(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (request.method !== 'POST') return json({ error: 'Только POST.' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Запрос с чужого источника отклонён.' }, 403)

  const key = env.NACE_API_KEY
  if (!key) return json({ error: 'NACE_API_KEY не настроен на сервере.' }, 503)

  if (!allow('decide:' + clientIp(request), RATE_LIMIT, RATE_WINDOW)) {
    return json({ error: 'Слишком много запросов. Подождите минуту.' }, 429, { 'retry-after': '60' })
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY) return json({ error: 'Слишком большое тело запроса.' }, 413)

  let body
  try {
    body = JSON.parse(raw)
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
