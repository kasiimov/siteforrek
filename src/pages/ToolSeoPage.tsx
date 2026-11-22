import { AdRect } from '../components/Ads'
import { Tool } from '../components/Tool'
import { Link } from '../lib/router'
import { COMMON, PRIVACY_SLUG, SEO_TOOL_PAGES, toolPageBySlug } from '../lib/seoToolPages'
import type { SeoLang } from '../lib/seoToolPages'

function prefix(lang: SeoLang) {
  return lang === 'ru' ? '' : '/' + lang
}

/** Страница одного инструмента: рабочая зона, инструкция, преимущества, FAQ и перелинковка. */
export function ToolSeoPage({ slug, lang }: { slug: string; lang: SeoLang }) {
  const page = toolPageBySlug(slug)
  if (!page) return null

  const copy = page.copy[lang]
  const common = COMMON[lang]
  const base = prefix(lang)
  const others = SEO_TOOL_PAGES.filter((item) => item.slug !== slug)

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">{common.toolLabel}</span>
        <h1>{copy.h1}</h1>
        <p>{copy.lead}</p>
      </section>

      <Tool key={page.toolId} only={page.toolId} />

      <div className="promo-slot">
        <AdRect slot={`tool-${slug}`} />
      </div>

      <section className="how" id="how">
        <div className="section-head">
          <span className="eyebrow">1 · 2 · 3</span>
          <h2>{common.howTitle}</h2>
        </div>
        <div className="step-grid">
          {common.steps.map((step, index) => (
            <article className="step" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

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
          <h2>{common.faqTitle}</h2>
        </div>
        <div className="faq-list">
          {common.faq.map((item) => (
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
