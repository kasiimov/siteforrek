/**
 * Подробные тексты страниц инструментов: зачем нужен инструмент, как им
 * пользоваться, пример, подводные камни и вопросы. Отдельно от коротких
 * SEO-заголовков, чтобы страница была настоящей статьёй, а не пустой формой.
 */

import { RU } from './toolDetails.ru'
import { UZ } from './toolDetails.uz'
import { EN } from './toolDetails.en'
import type { SeoLang } from './seoToolPages'

export type ToolDetail = {
  /** вводные абзацы: что делает инструмент и почему так */
  intro: string[]
  /** когда пригодится */
  useCases: { title: string; text: string }[]
  /** подробная инструкция */
  steps: { title: string; text: string }[]
  /** разбор на конкретном примере */
  example?: { title: string; text: string }
  /** на что обратить внимание */
  tips?: { title: string; text: string }[]
  /** чего инструмент не делает */
  limits?: string
  /** вопросы именно про этот инструмент */
  faq: { q: string; a: string }[]
}

const BY_LANG: Record<SeoLang, Record<string, ToolDetail>> = { ru: RU, uz: UZ, en: EN }

export function toolDetail(slug: string, lang: SeoLang): ToolDetail | undefined {
  return BY_LANG[lang][slug]
}
