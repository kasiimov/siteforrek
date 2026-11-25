import { afterEach, describe, expect, it, vi } from 'vitest'
import { askDrex, choice, decide, decideNoul, decideScore, DrexError, noul } from './nace'

const teamAnswer = {
  type: 'choice' as const,
  choice: 'payments',
  confidence: 0.88,
  probabilities: { payments: 0.72, support: 0.2, engineering: 0.08 },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('askDrex', () => {
  it('шлёт состояние и вопросы на свой прокси с моделью Drex', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ answers: { team: teamAnswer }, request_id: 'req_1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await askDrex({
      state: 'Payouts failing for 3 days',
      questions: { team: choice('Which team?', { payments: 'Payouts', support: 'How-to' }) },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/nace/decide')
    expect(init?.method).toBe('POST')
    const body = JSON.parse(String(init?.body)) as { model: string; state: string; questions: object }
    expect(body.model).toBe('drex-latest')
    expect(body.state).toBe('Payouts failing for 3 days')
    expect(Object.keys(body.questions)).toEqual(['team'])
    expect(result.answers.team).toEqual(teamAnswer)
  })

  it('передаёт ошибку Drex вместе с request_id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: { type: 'invalid_request_error', message: 'choice needs at least 1 option' }, request_id: 'req_2' }),
          { status: 422, headers: { 'content-type': 'application/json' } },
        ),
      ),
    )

    await expect(askDrex({ state: 'x', questions: { team: choice('Which?', { a: null }) } })).rejects.toMatchObject({
      name: 'DrexError',
      status: 422,
      message: 'choice needs at least 1 option',
      requestId: 'req_2',
    })
    expect(new DrexError('нет сети', 0).status).toBe(0)
  })

  it('не отправляет пустой набор вопросов', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
    await expect(askDrex({ state: 'x', questions: {} })).rejects.toThrow(/хотя бы один вопрос/)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('решения по вероятностям', () => {
  it('выбирает вариант с наибольшей вероятностью', () => {
    expect(decide(teamAnswer, ['payments', 'support', 'engineering'])).toEqual({
      option: 'payments',
      probability: 0.72,
      margin: 0.52,
      probabilities: teamAnswer.probabilities,
    })
  })

  it('оставляет решение человеку, если порог не взят', () => {
    expect(decide(teamAnswer, ['payments', 'support'], 0.9).option).toBeNull()
  })

  it('считает варианты из ответа, если список не передан', () => {
    expect(decide(teamAnswer).option).toBe('payments')
  })

  it('порог для «да/нет» и шкалы', () => {
    expect(decideNoul({ type: 'noul', noul: 0.84, confidence: 0.84 })).toBe(true)
    expect(decideNoul({ type: 'noul', noul: 0.84, confidence: 0.84 }, 0.9)).toBe(false)
    expect(
      decideScore({ type: 'score', score: 1.9, legend: ['Low', 'High'], confidence: 0.7, probabilities: {} }, 2),
    ).toBe(false)
  })

  it('собирает типизированные вопросы', () => {
    expect(noul('Urgent?')).toEqual({ type: 'noul', instructions: 'Urgent?' })
  })
})
