import { FaqJsonLd } from '../components/FaqJsonLd'
import { Tool } from '../components/Tool'
import { Link } from '../lib/router'
import { COMMON, PRIVACY_SLUG, SEO_TOOL_PAGES, toolPageBySlug } from '../lib/seoToolPages'
import { toolDetail } from '../lib/toolDetails'
import type { SeoLang } from '../lib/seoToolPages'

function prefix(lang: SeoLang) {
  return lang === 'ru' ? '' : '/' + lang
}

const LABELS: Record<
  SeoLang,
  {
    aboutEyebrow: string
    about: string
    useCases: string
    steps: string
    example: string
    tips: string
    limits: string
    faqExtra: string
  }
> = {
  ru: {
    aboutEyebrow: 'Подробно',
    about: 'Что это и зачем нужно',
    useCases: 'Когда пригодится',
    steps: 'Пошаговая инструкция',
    example: 'Пример',
    tips: 'На что обратить внимание',
    limits: 'Чего инструмент не делает',
    faqExtra: 'Вопросы об инструменте',
  },
  uz: {
    aboutEyebrow: 'Batafsil',
    about: 'Bu nima va nima uchun kerak',
    useCases: 'Qachon kerak bo‘ladi',
    steps: "Bosqichma-bosqich yo'riqnoma",
    example: 'Misol',
    tips: "Nimaga e'tibor berish kerak",
    limits: 'Vosita nima qilmaydi',
    faqExtra: 'Vosita haqida savollar',
  },
  en: {
    aboutEyebrow: 'In detail',
    about: 'What it does and why it matters',
    useCases: 'When you need it',
    steps: 'Step by step',
    example: 'Example',
    tips: 'What to watch out for',
    limits: 'What the tool does not do',
    faqExtra: 'Questions about this tool',
  },
}

/** Страница одного инструмента: рабочая зона, статья, инструкция, пример, советы, FAQ и перелинковка. */
export function ToolSeoPage({ slug, lang }: { slug: string; lang: SeoLang }) {
  const page = toolPageBySlug(slug)
  if (!page) return null

  const copy = page.copy[lang]
  const common = COMMON[lang]
  const labels = LABELS[lang]
  const detail = toolDetail(slug, lang)
  const base = prefix(lang)
  const others = SEO_TOOL_PAGES.filter((item) => item.slug !== slug)
  const steps = detail?.steps?.length ? detail.steps : common.steps
  const faqItems = [...(detail?.faq ?? []), ...common.faq]

  return (
    <>
      <FaqJsonLd items={faqItems} />

      <section className="page-hero">
        <span className="eyebrow">{common.toolLabel}</span>
        <h1>{copy.h1}</h1>
        <p>{copy.lead}</p>
      </section>

      <Tool key={page.toolId} only={page.toolId} />

      {detail && (
        <>
          <section className="page-hero">
            <span className="eyebrow">{labels.aboutEyebrow}</span>
            <h2>{labels.about}</h2>
            {detail.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </section>

          <div className="page-grid">
            {detail.useCases.map((item) => (
              <article className="page-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </>
      )}

      <section className="how" id="how">
        <div className="section-head">
          <span className="eyebrow">1 · 2 · 3 · 4</span>
          <h2>{detail ? labels.steps : common.howTitle}</h2>
        </div>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="step" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {detail?.example && (
        <div className="page-grid">
          <article className="page-card">
            <h3>{detail.example.title}</h3>
            <p>{detail.example.text}</p>
          </article>
        </div>
      )}

      {detail?.tips?.length || detail?.limits ? (
        <div className="page-grid">
          {detail?.tips?.length ? (
            <article className="page-card">
              <h3>{labels.tips}</h3>
              <ul className="page-list">
                {detail.tips.map((tip) => (
                  <li key={tip.title}>
                    <b>{tip.title}.</b> {tip.text}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
          {detail?.limits ? (
            <article className="page-card">
              <h3>{labels.limits}</h3>
              <p>{detail.limits}</p>
            </article>
          ) : null}
        </div>
      ) : null}

      <section className="features">
        <div className="section-head">
          <span className="eyebrow">PDF</span>
          <h2>{common.whyTitle}</h2>
          <p className="section-sub">{common.whyLead}</p>
        </div>
        <div className="feature-grid">
          {common.benefits.map((benefit, index) => (
            <article className="feature" key={benefit.title}>
              <span className="feature-index">0{index + 1}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>{detail ? labels.faqExtra : common.faqTitle}</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="tool">
        <div className="section-head">
          <h2>{common.otherTitle}</h2>
        </div>
        <div className="seo-tools">
          {others.map((item) => {
            const href = base + '/' + item.slug
            return (
              <Link className="seo-tool" to={href} key={item.slug}>
                <b>{item.copy[lang].name}</b>
                <span>{item.copy[lang].lead}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <p className="tool-footnote">
        <Link to={base + '/' + PRIVACY_SLUG}>{common.privacy}</Link>
      </p>
    </>
  )
}
