import { Arrow } from '../components/ui'
import { AdRect } from '../components/Ads'
import { Link, ROUTES } from '../lib/router'

type Lang = 'uz' | 'en'

type Text = {
  eyebrow: string
  title: string
  lead: string
  cta: string
  back: string
  toolsTitle: string
  toolsHeading: string
  tools: { title: string; text: string; slug?: string }[]
  faqHeading: string
  faq: { q: string; a: string }[]
  ctaTitle: string
  ctaText: string
}

const CONTENT: Record<Lang, Text> = {
  uz: {
    eyebrow: "O'zbekcha · bepul va onlayn",
    title: "PDF ni Word ga o'tkazish — bepul va onlayn",
    lead:
      "PDF ni Word ga o'tkazish, Word ni PDF qilish, PDF hajmini kichraytirish, PDF fayllarni birlashtirish yoki bo'lish, rasmni PDF qilish va PDF ni rasmga aylantirish. Hammasi onlayn, bepul va telefon orqali — ro'yxatdan o'tish kerak emas.",
    cta: 'PDF bilan ishlashni boshlash',
    back: 'Bosh sahifa',
    toolsTitle: 'Vositalar',
    toolsHeading: 'PDF bilan nima qilish mumkin',
    tools: [
      { title: "PDF ni Word ga o'tkazish", text: "Matn, shrift va jadvallar saqlanadi — Word faylini tahrirlash mumkin.", slug: 'pdf-to-word' },
      { title: 'PDF hajmini kichraytirish', text: 'PDF faylni siqish: hajmi kamayadi, matn o‘qiladigan bo‘lib qoladi.', slug: 'compress-pdf' },
      { title: 'PDF fayllarni birlashtirish', text: "Bir nechta PDF ni bitta faylga birlashtiring.", slug: 'merge-pdf' },
      { title: "PDF ni bo'lish", text: 'PDF ni sahifalarga ajratib, kerakli qismini yuklab oling.', slug: 'split-pdf' },
      { title: 'Rasmni PDF qilish', text: 'JPG yoki PNG rasmlarni bitta PDF ga aylantiring.', slug: 'jpg-to-pdf' },
      { title: 'PDF ni rasmga aylantirish', text: 'PDF sahifalarini JPG yoki PNG rasm sifatida saqlang.', slug: 'pdf-to-jpg' },
    ],
    faqHeading: 'Ko‘p beriladigan savollar',
    faq: [
      {
        q: "PDF ni Word ga o'tkazish bepulmi?",
        a: "Ha, bepul. Ro'yxatdan o'tish, obuna va kunlik limit yo'q. Fayl brauzeringizda qayta ishlanadi.",
      },
      {
        q: 'Onlayn ishlash uchun dastur kerakmi?',
        a: "Yo'q. Sayt telefon orqali ham ishlaydi: brauzerni oching, faylni tanlang va natijani yuklab oling.",
      },
      {
        q: 'Fayllarim serverga yuklanadimi?',
        a: "Yo'q. PDF va rasmlar serverga yuborilmaydi — hammasi sizning qurilmangizda hisoblanadi. Internet faqat sahifani ochish uchun kerak.",
      },
      {
        q: 'Qaysi formatlar qo‘llanadi?',
        a: "PDF, JPG va PNG. Word fayli .docx ko'rinishida, rasmlar ZIP arxivda yuklab olinadi.",
      },
    ],
    ctaTitle: 'Hujjatlaringiz o‘zingizda qolsin',
    ctaText: "PDF ni tanlang va Word, rasm yoki tahrirlangan PDF ni oling. Bepul, onlayn, telefon orqali.",
  },
  en: {
    eyebrow: 'English · free and online',
    title: 'Convert PDF to Word online free',
    lead:
      'Convert PDF to Word, convert Word to PDF, compress PDF file size, merge and split PDF files, convert JPG to PDF and PDF to JPG. Everything runs online, free, on your phone — no sign-up needed.',
    cta: 'Start working with PDF',
    back: 'Home',
    toolsTitle: 'Tools',
    toolsHeading: 'What you can do with a PDF',
    tools: [
      { title: 'PDF to Word', text: 'Text, fonts and tables are kept, so the .docx stays editable.', slug: 'pdf-to-word' },
      { title: 'Compress PDF', text: 'Reduce PDF file size online while keeping the pages readable.', slug: 'compress-pdf' },
      { title: 'Merge PDF', text: 'Combine several PDF files into one document.', slug: 'merge-pdf' },
      { title: 'Split PDF', text: 'Split PDF pages and download only the part you need.', slug: 'split-pdf' },
      { title: 'JPG to PDF', text: 'Turn JPG or PNG photos into a single PDF file.', slug: 'jpg-to-pdf' },
      { title: 'PDF to JPG', text: 'Save PDF pages as high quality JPG or PNG images.', slug: 'pdf-to-jpg' },
    ],
    faqHeading: 'Frequently asked questions',
    faq: [
      {
        q: 'Is it really free to convert PDF to Word?',
        a: 'Yes. No account, no subscription and no daily limit. The file is processed inside your browser.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No. The site works on a phone as well: open the page, pick a file and download the result.',
      },
      {
        q: 'Are my files uploaded to a server?',
        a: 'No. PDFs and images never leave your device — the whole conversion runs locally. The network is only used to load the page.',
      },
      {
        q: 'Which formats are supported?',
        a: 'PDF, JPG and PNG. Word documents are downloaded as .docx, images as a ZIP archive.',
      },
    ],
    ctaTitle: 'Keep your documents to yourself',
    ctaText: 'Pick a PDF and get Word, images or an edited PDF. Free, online, on any device.',
  },
}

export function SeoPage({ lang }: { lang: Lang }) {
  const text = CONTENT[lang]

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">{text.eyebrow}</span>
        <h1>{text.title}</h1>
        <p>{text.lead}</p>
        <div className="form-actions" style={{ marginTop: 18 }}>
          <Link className="btn btn-primary" to={ROUTES.tools}>
            {text.cta}
            <Arrow />
          </Link>
          <Link className="btn btn-quiet" to={ROUTES.home}>
            {text.back}
          </Link>
        </div>
      </section>

      <div className="promo-slot">
        <AdRect slot={`lang-${lang}`} />
      </div>

      <section className="tool">
        <div className="section-head">
          <span className="eyebrow">{text.toolsTitle}</span>
          <h2>{text.toolsHeading}</h2>
        </div>
        <div className="seo-tools">
          {text.tools.map((tool) => (
            <Link
              className="seo-tool"
              to={tool.slug ? `/${lang}/${tool.slug}` : ROUTES.tools}
              key={tool.title}
            >
              <b>{tool.title}</b>
              <span>{tool.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="faq">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>{text.faqHeading}</h2>
        </div>
        <div className="faq-list">
          {text.faq.map((item) => (
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

      <section className="cta">
        <div className="cta-inner">
          <h2>{text.ctaTitle}</h2>
          <p>{text.ctaText}</p>
          <Link className="btn btn-primary" to={ROUTES.tools}>
            {text.cta}
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}
