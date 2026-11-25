/**
 * Drex от Nace: один вызов API отвечает на пачку вопросов о состоянии дела
 * (например, о тексте документа) и возвращает калиброванную вероятность
 * для каждого варианта ответа.
 *
 * Ключ NACE_API_KEY в браузере не нужен и не хранится: модуль зовёт свой
 * /api/nace/decide, а воркер deploy/worker.js уже добавляет ключ и обращается
 * к https://console.nace.ai/v1/systemone.
 *
 * Документация: https://console.nace.ai/docs/drex/quickstart
 */

export const DREX_MODEL = 'drex-latest'
const ENDPOINT = '/api/nace/decide'

/** Описание критерия: текст или null, если варианту пояснение не нужно. */
export type Criterion = string | null

export type NoulQuestion = {
  type: 'noul'
  instructions: string
  criteria?: { true?: Criterion; false?: Criterion }
}

export type ChoiceQuestion = {
  type: 'choice'
  instructions: string
  /** label -> что этот label значит; порядок вероятностей задаёт Drex. */
  criteria: Record<string, Criterion>
}

export type ScoreQuestion = {
  type: 'score'
  instructions: string
  /** уровни от низкого к высокому; индекс уровня — это и есть балл */
  criteria: Criterion[]
}

export type DrexQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion

/** Да или нет: вероятность «да» от 0 до 1. */
export function noul(instructions: string, criteria?: NoulQuestion['criteria']): NoulQuestion {
  return criteria ? { type: 'noul', instructions, criteria } : { type: 'noul', instructions }
}

/** Один label из набора без порядка. */
export function choice(instructions: string, criteria: Record<string, Criterion>): ChoiceQuestion {
  return { type: 'choice', instructions, criteria }
}

/** Позиция на упорядоченной шкале. */
export function score(instructions: string, criteria: Criterion[]): ScoreQuestion {
  return { type: 'score', instructions, criteria }
}

export type NoulAnswer = { type: 'noul'; noul: number; confidence: number }

export type ChoiceAnswer = {
  type: 'choice'
  choice: string
  confidence: number
  probabilities: Record<string, number>
}

export type ScoreAnswer = {
  type: 'score'
  score: number
  legend: string[]
  confidence: number
  probabilities: Record<string, number>
}

export type DrexAnswer = NoulAnswer | ChoiceAnswer | ScoreAnswer

export type DrexResponse = {
  answers: Record<string, DrexAnswer>
  usage?: { input_tokens?: number; output_tokens?: number }
  evaluation_time_ms?: number
  request_id?: string
}

export type AskDrexInput = {
  /** Текст или JSON-объект: что Drex должен понять перед ответом. */
  state: string | object
  questions: Record<string, DrexQuestion>
  model?: string
  signal?: AbortSignal
}

/** Ошибка Drex: `status` 0 — сеть не ответила. `requestId` помогает в поддержке. */
export class DrexError extends Error {
  readonly status: number
  readonly requestId?: string

  constructor(message: string, status: number, requestId?: string) {
    super(message)
    this.name = 'DrexError'
    this.status = status
    this.requestId = requestId
  }
}

/** Задаёт вопросы Drex и возвращает ответы с вероятностями. */
export async function askDrex(input: AskDrexInput): Promise<DrexResponse> {
  if (!input.questions || !Object.keys(input.questions).length) {
    throw new DrexError('Нужен хотя бы один вопрос.', 400)
  }

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: input.model ?? DREX_MODEL,
        state: input.state,
        questions: input.questions,
      }),
      signal: input.signal,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'сеть'
    throw new DrexError(`Drex недоступен: ${reason}`, 0)
  }

  const data = (await response.json().catch(() => null)) as
    | (Partial<DrexResponse> & { error?: string | { message?: string } })
    | null

  if (!response.ok) {
    const message =
      typeof data?.error === 'string' ? data.error : data?.error?.message ?? `Drex ответил ${response.status}`
    throw new DrexError(message, response.status, data?.request_id)
  }
  if (!data?.answers) throw new DrexError('Drex ответил без answers.', response.status, data?.request_id)

  return data as DrexResponse
}

/** Решение по вариантам: какой label выбираем и насколько он оторвался от второго. */
export type DrexDecision<T extends string = string> = {
  /** null — ни один вариант не дотянул до порога: отправляем на ручной разбор */
  option: T | null
  /** вероятность выбранного (или лучшего) варианта */
  probability: number
  /** отрыв лучшего варианта от второго по вероятности */
  margin: number
  probabilities: Record<string, number>
}

/**
 * Маршрутизация по вероятностям Drex. Порог поднимают, когда лишний «да»
 * дороже пропущенного случая; при `option === null` срабатывает запасной путь.
 */
export function decide<T extends string>(
  answer: ChoiceAnswer,
  options?: readonly T[],
  minProbability = 0.5,
): DrexDecision<T> {
  const probabilities = answer.probabilities ?? {}
  const labels = options?.length ? [...options] : (Object.keys(probabilities) as T[])
  const ranked = labels
    .filter((label) => typeof probabilities[label] === 'number')
    .sort((a, b) => probabilities[b] - probabilities[a])

  const best = ranked[0]
  if (best === undefined) return { option: null, probability: 0, margin: 0, probabilities }

  const probability = probabilities[best]
  const runnerUp = ranked.length > 1 ? probabilities[ranked[1]] : 0
  return {
    option: probability >= minProbability ? best : null,
    probability,
    margin: probability - runnerUp,
    probabilities,
  }
}

/** Простое «да/нет» по вероятности: по умолчанию порог 0.5. */
export function decideNoul(answer: NoulAnswer, threshold = 0.5): boolean {
  return answer.noul >= threshold
}

/** Позиция на шкале не ниже порога — например, «срочно» начиная с уровня 2. */
export function decideScore(answer: ScoreAnswer, minScore: number): boolean {
  return answer.score >= minScore
}
