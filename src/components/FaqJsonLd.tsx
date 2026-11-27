import { useEffect } from 'react'

const SCRIPT_ID = 'faq-jsonld'

export type FaqEntry = { q: string; a: string }

/**
 * Кладёт в <head> разметку Schema.org FAQPage по тем же вопросам, что открыты
 * на странице. Поисковики получают структуру «вопрос — ответ» без обхода
 * раскрытых блоков, а пользователь видит именно то, что описано в разметке.
 */
export function FaqJsonLd({ items }: { items: FaqEntry[] }) {
  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }).replace(/</g, '\\u003c')

  useEffect(() => {
    let tag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!tag) {
      tag = document.createElement('script')
      tag.id = SCRIPT_ID
      tag.type = 'application/ld+json'
      document.head.appendChild(tag)
    }
    tag.textContent = json

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [json])

  return null
}
