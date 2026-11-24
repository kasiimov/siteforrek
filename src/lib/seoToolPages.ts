/**
 * Отдельные SEO-страницы под каждый инструмент.
 * Один и тот же slug живёт в трёх языках: /pdf-to-word, /uz/pdf-to-word, /en/pdf-to-word.
 */

export type SeoLang = 'ru' | 'uz' | 'en'

export type ToolCopy = {
  /** короткое имя для перелинковки */
  name: string
  /** H1 и <title> */
  h1: string
  title: string
  description: string
  lead: string
}

export type CommonCopy = {
  howTitle: string
  steps: { title: string; text: string }[]
  whyTitle: string
  whyLead: string
  benefits: { title: string; text: string }[]
  faqTitle: string
  faq: { q: string; a: string }[]
  otherTitle: string
  privacy: string
  openTool: string
  toolLabel: string
}

export type SeoToolPage = {
  slug: string
  toolId: string
  copy: Record<SeoLang, ToolCopy>
}

export const SEO_TOOL_PAGES: SeoToolPage[] = [
  {
    slug: 'pdf-to-word',
    toolId: 'word',
    copy: {
      ru: {
        name: 'PDF в Word',
        h1: 'Конвертировать PDF в Word онлайн бесплатно',
        title: 'Конвертировать PDF в Word онлайн бесплатно — Congix Docs',
        description:
          'Переведите PDF в редактируемый Word (.docx) прямо в браузере: текст, шрифты, колонки и таблицы. Бесплатно, без регистрации, файл не загружается на сервер.',
        lead:
          'Получите редактируемый .docx: текст, размеры шрифта, колонки и таблицы переносятся. Файл обрабатывается в браузере и никуда не отправляется.',
      },
      uz: {
        name: "PDF ni Word ga o'tkazish",
        h1: "PDF ni Word ga o'tkazish — bepul va onlayn",
        title: "PDF ni Word ga o'tkazish bepul — Congix Docs",
        description:
          "PDF ni tahrirlanadigan Word (.docx) faylga aylantiring: matn, shrift va jadvallar saqlanadi. Bepul, ro'yxatdan o'tishsiz, fayl serverga yuklanmaydi.",
        lead:
          "Tahrirlanadigan .docx oling: matn, shrift o‘lchami, ustunlar va jadvallar saqlanadi. Fayl brauzerda qayta ishlanadi va hech qayerga yuborilmaydi.",
      },
      en: {
        name: 'PDF to Word',
        h1: 'Convert PDF to Word online free',
        title: 'Convert PDF to Word online free — Congix Docs',
        description:
          'Turn a PDF into an editable Word (.docx) right in your browser: text, fonts, columns and tables are kept. Free, no sign-up, the file is never uploaded.',
        lead:
          'Get an editable .docx with text, font sizes, columns and tables preserved. The file is processed inside your browser and never sent anywhere.',
      },
    },
  },
  {
    slug: 'compress-pdf',
    toolId: 'compress',
    copy: {
      ru: {
        name: 'Сжать PDF',
        h1: 'Сжать PDF файл онлайн без потери качества',
        title: 'Сжать PDF файл онлайн без потери качества — Congix Docs',
        description:
          'Уменьшите вес PDF в браузере: выберите масштаб и качество, страницы пересобираются в JPEG, текст остаётся читаемым. Бесплатно и без загрузки на сервер.',
        lead:
          'Уменьшите размер файла в разы: настройте масштаб и качество, а страницы пересоберутся в компактный JPEG. Всё происходит на вашем устройстве.',
      },
      uz: {
        name: 'PDF hajmini kichraytirish',
        h1: 'PDF hajmini kichraytirish — bepul va onlayn',
        title: 'PDF hajmini kichraytirish onlayn — Congix Docs',
        description:
          "PDF fayl hajmini brauzerda kamaytiring: masshtab va sifatni tanlang, sahifalar JPEG ga qayta yig'iladi, matn o'qiladigan bo'lib qoladi. Bepul va serverga yuklamasdan.",
        lead:
          "Fayl hajmini bir necha barobar kamaytiring: masshtab va sifatni tanlang — sahifalar ixcham JPEG ga aylanadi. Hammasi sizning qurilmangizda bajariladi.",
      },
      en: {
        name: 'Compress PDF',
        h1: 'Compress PDF file size online',
        title: 'Compress PDF file size online free — Congix Docs',
        description:
          'Reduce PDF file size in your browser: pick scale and quality, pages are rebuilt as compact JPEGs and stay readable. Free, no upload to a server.',
        lead:
          'Cut the file size by several times: choose scale and quality and the pages are rebuilt as compact JPEGs. Everything runs on your device.',
      },
    },
  },
  {
    slug: 'merge-pdf',
    toolId: 'merge',
    copy: {
      ru: {
        name: 'Объединить PDF',
        h1: 'Объединить PDF файлы в один онлайн',
        title: 'Объединить PDF файлы в один онлайн — Congix Docs',
        description:
          'Соберите несколько PDF в один документ в нужном порядке прямо в браузере. Бесплатно, без регистрации, файлы не загружаются на сервер.',
        lead:
          'Добавьте несколько PDF и соберите их в один документ в нужном порядке. Файлы не покидают устройство, регистрация не нужна.',
      },
      uz: {
        name: 'PDF fayllarni birlashtirish',
        h1: 'PDF fayllarni birlashtirish — bepul va onlayn',
        title: 'PDF fayllarni birlashtirish onlayn — Congix Docs',
        description:
          "Bir nechta PDF ni kerakli tartibda bitta faylga birlashtiring. Bepul, ro'yxatdan o'tishsiz, fayllar serverga yuklanmaydi.",
        lead:
          "Bir nechta PDF qo'shing va ularni kerakli tartibda bitta hujjatga birlashtiring. Fayllar qurilmangizdan chiqmaydi.",
      },
      en: {
        name: 'Merge PDF',
        h1: 'Merge PDF files online',
        title: 'Merge PDF files online free — Congix Docs',
        description:
          'Combine several PDFs into one document in the order you choose, right in the browser. Free, no sign-up, files are not uploaded.',
        lead:
          'Add several PDFs and combine them into a single document in the right order. Files never leave your device and no account is needed.',
      },
    },
  },
  {
    slug: 'split-pdf',
    toolId: 'split',
    copy: {
      ru: {
        name: 'Разделить PDF',
        h1: 'Разделить PDF на страницы онлайн',
        title: 'Разделить PDF на страницы онлайн — Congix Docs',
        description:
          'Разделите PDF на отдельные страницы или диапазоны и скачайте результат в браузере. Бесплатно, без регистрации, файлы остаются на устройстве.',
        lead:
          'Разбейте документ на отдельные страницы или диапазоны и заберите готовые файлы. Всё локально, без регистрации и лимитов.',
      },
      uz: {
        name: "PDF ni bo'lish",
        h1: "PDF ni bo'lish — sahifalarga ajratish onlayn",
        title: "PDF ni sahifalarga bo'lish onlayn — Congix Docs",
        description:
          "PDF ni alohida sahifalarga yoki diapazonlarga ajrating va natijani yuklab oling. Bepul, ro'yxatdan o'tishsiz, fayllar qurilmada qoladi.",
        lead:
          "Hujjatni alohida sahifalar yoki diapazonlarga ajrating va tayyor fayllarni yuklab oling. Hammasi lokal, ro'yxatdan o'tishsiz.",
      },
      en: {
        name: 'Split PDF',
        h1: 'Split PDF pages online',
        title: 'Split PDF pages online free — Congix Docs',
        description:
          'Split a PDF into separate pages or ranges and download the result in your browser. Free, no sign-up, files stay on your device.',
        lead:
          'Break a document into separate pages or ranges and download the ready files. Everything is local, with no account and no limits.',
      },
    },
  },
  {
    slug: 'jpg-to-pdf',
    toolId: 'images-to-pdf',
    copy: {
      ru: {
        name: 'JPG в PDF',
        h1: 'Перевести фото (JPG) в PDF онлайн',
        title: 'Перевести фото JPG в PDF онлайн — Congix Docs',
        description:
          'Соберите фото JPG и PNG в один PDF: одна картинка — одна страница. Выберите размер страницы и поля, скачайте файл. Бесплатно, без загрузки на сервер.',
        lead:
          'Добавьте фотографии JPG или PNG — каждая станет страницей PDF. Выберите размер страницы и поля, готовый файл скачается сразу.',
      },
      uz: {
        name: 'Rasmni PDF qilish',
        h1: 'Rasmni PDF qilish (JPG dan PDF ga) — bepul',
        title: 'Rasmni PDF qilish onlayn — Congix Docs',
        description:
          "JPG va PNG rasmlarni bitta PDF ga aylantiring: bitta rasm — bitta sahifa. Sahifa o'lchami va chekkalarni tanlang, faylni yuklab oling. Bepul.",
        lead:
          "JPG yoki PNG rasmlarni qo'shing — har biri PDF sahifasiga aylanadi. Sahifa o'lchami va chekkalarni tanlab, tayyor faylni darhol yuklab oling.",
      },
      en: {
        name: 'JPG to PDF',
        h1: 'Convert JPG to PDF online',
        title: 'Convert JPG to PDF online free — Congix Docs',
        description:
          'Turn JPG and PNG photos into one PDF: one image per page. Choose page size and margins and download. Free, no upload to a server.',
        lead:
          'Add JPG or PNG photos and each one becomes a PDF page. Pick page size and margins, then download the ready file instantly.',
      },
    },
  },
  {
    slug: 'pdf-to-jpg',
    toolId: 'pdf-to-jpg',
    copy: {
      ru: {
        name: 'PDF в JPG',
        h1: 'Конвертировать PDF в JPG высокого качества',
        title: 'Конвертировать PDF в JPG высокого качества — Congix Docs',
        description:
          'Переведите страницы PDF в JPG в выбранном масштабе и качестве. Скачайте архивом, без регистрации и загрузки файла на сервер.',
        lead:
          'Каждая страница станет отдельным JPG в выбранном разрешении. Заберите все изображения одним архивом — файл никуда не загружается.',
      },
      uz: {
        name: 'PDF ni rasmga aylantirish',
        h1: 'PDF ni rasmga aylantirish (JPG) — bepul',
        title: 'PDF ni JPG ga aylantirish onlayn — Congix Docs',
        description:
          "PDF sahifalarini tanlangan masshtab va sifatda JPG ga aylantiring. Arxiv qilib yuklab oling — ro'yxatdan o'tishsiz va serverga yuklamasdan.",
        lead:
          "Har bir sahifa alohida JPG bo'ladi. Barcha rasmlarni bitta arxivda yuklab oling — fayl hech qayerga yuklanmaydi.",
      },
      en: {
        name: 'PDF to JPG',
        h1: 'Convert PDF to JPG high quality',
        title: 'Convert PDF to JPG high quality online — Congix Docs',
        description:
          'Convert PDF pages to JPG at the scale and quality you choose. Download all images as an archive, free and without uploading the file.',
        lead:
          'Every page becomes a separate JPG in the resolution you choose. Grab all images in one archive — the file is never uploaded.',
      },
    },
  },
]

export const COMMON: Record<SeoLang, CommonCopy> = {
  ru: {
    howTitle: 'Как это работает',
    steps: [
      { title: 'Добавьте файл', text: 'Перетащите PDF в окно или нажмите и выберите на диске. Файл остаётся на устройстве.' },
      { title: 'Подождите пару секунд', text: 'Документ обрабатывается прямо в браузере — без очередей и загрузки на сервер.' },
      { title: 'Скачайте результат', text: 'Готовый файл сохраняется сразу. Регистрация, почта и оплата не нужны.' },
    ],
    whyTitle: 'Почему Congix Docs',
    whyLead: 'Инструмент, который держит документы при себе.',
    benefits: [
      { title: 'Скорость', text: 'Никакой отправки файла на сервер и ожидания в очереди — всё считается на вашем устройстве.' },
      { title: 'Форматирование', text: 'Шрифты, колонки, таблицы и картинки по возможности остаются на своих местах.' },
      { title: 'Без регистрации', text: 'Ни аккаунта, ни подписки, ни дневных лимитов. Открыли — сделали — закрыли.' },
      { title: 'Безопасность', text: 'Файл не загружается в интернет и не хранится у нас: мы его физически не получаем.' },
    ],
    faqTitle: 'Частые вопросы',
    faq: [
      { q: 'Безопасно ли обрабатывать документы здесь?', a: 'Да. PDF читается и собирается в вашем браузере: файл не отправляется на сервер, поэтому его нельзя перехватить или забыть удалить.' },
      { q: 'Сохранится ли оформление после конвертации?', a: 'Для PDF → Word переносятся текст, шрифты, колонки и таблицы. Для сжатия и картинок страницы пересобираются как изображения, поэтому сложная вёрстка упрощается.' },
      { q: 'Работает ли сервис на телефоне?', a: 'Да. Сайт работает в мобильном браузере: можно выбрать файл, дождаться результата и скачать его.' },
    ],
    otherTitle: 'Другие инструменты',
    privacy: 'Политика конфиденциальности',
    openTool: 'Открыть инструмент',
    toolLabel: 'Инструмент',
  },
  uz: {
    howTitle: 'Bu qanday ishlaydi',
    steps: [
      { title: "Faylni qo'shing", text: "PDF ni oynaga tashlang yoki bosib qurilmadan tanlang. Fayl qurilmada qoladi." },
      { title: "Bir necha soniya kuting", text: "Hujjat brauzerda qayta ishlanadi — navbat va serverga yuklash yo'q." },
      { title: 'Natijani yuklab oling', text: "Tayyor fayl darhol saqlanadi. Ro'yxatdan o'tish, pochta va to'lov kerak emas." },
    ],
    whyTitle: 'Nega Congix Docs',
    whyLead: "Hujjatlaringiz o'zingizda qoladigan vosita.",
    benefits: [
      { title: 'Tezlik', text: "Faylni serverga yuborish va navbatda kutish yo'q — hammasi qurilmangizda hisoblanadi." },
      { title: 'Formatlash', text: "Shriftlar, ustunlar, jadvallar va rasmlar imkon qadar o'z joyida qoladi." },
      { title: "Ro'yxatdan o'tishsiz", text: "Akkaunt, obuna va kunlik limit yo'q. Ochdingiz — bajardingiz — yopdingiz." },
      { title: 'Xavfsizlik', text: "Fayl internetga yuklanmaydi va bizda saqlanmaydi: biz uni umuman olmaymiz." },
    ],
    faqTitle: "Ko'p beriladigan savollar",
    faq: [
      { q: 'Hujjatlarni bu yerda qayta ishlash xavfsizmi?', a: "Ha. PDF brauzeringizda o'qiladi va yig'iladi: fayl serverga yuborilmaydi, shuning uchun uni ushlab qolish yoki unutib qoldirish mumkin emas." },
      { q: 'Formatlash saqlanadimi?', a: "PDF → Word da matn, shriftlar, ustunlar va jadvallar saqlanadi. Siqish va rasmlarda sahifalar rasm sifatida qayta yig'iladi." },
      { q: 'Telefon orqali ishlaydimi?', a: "Ha. Sayt mobil brauzerda ishlaydi: faylni tanlang, natijani kuting va yuklab oling." },
    ],
    otherTitle: 'Boshqa vositalar',
    privacy: 'Maxfiylik siyosati',
    openTool: 'Vositani ochish',
    toolLabel: 'Vosita',
  },
  en: {
    howTitle: 'How it works',
    steps: [
      { title: 'Add a file', text: 'Drag a PDF into the window or click to pick one from your disk. The file stays on your device.' },
      { title: 'Wait a couple of seconds', text: 'The document is processed right in the browser — no queues and no server upload.' },
      { title: 'Download the result', text: 'The ready file is saved immediately. No account, email or payment required.' },
    ],
    whyTitle: 'Why Congix Docs',
    whyLead: 'A tool that keeps your documents to yourself.',
    benefits: [
      { title: 'Speed', text: 'Nothing is sent to a server and nobody queues — everything runs on your device.' },
      { title: 'Formatting', text: 'Fonts, columns, tables and images stay in place wherever possible.' },
      { title: 'No sign-up', text: 'No account, no subscription, no daily limits. Open it, do the job, close it.' },
      { title: 'Privacy', text: 'The file is never uploaded and never stored by us: we simply do not receive it.' },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'Is it safe to process documents here?', a: 'Yes. The PDF is read and rebuilt in your browser: the file is not sent to a server, so it cannot be intercepted or left behind.' },
      { q: 'Will the layout survive conversion?', a: 'PDF to Word keeps text, fonts, columns and tables. Compression and images rebuild the pages as pictures, so complex layouts become simpler.' },
      { q: 'Does it work on a phone?', a: 'Yes. The site works in a mobile browser: pick a file, wait for the result and download it.' },
    ],
    otherTitle: 'Other tools',
    privacy: 'Privacy policy',
    openTool: 'Open the tool',
    toolLabel: 'Tool',
  },
}

export const TOOL_SLUGS = new Set(SEO_TOOL_PAGES.map((page) => page.slug))

export function toolPageBySlug(slug: string): SeoToolPage | undefined {
  return SEO_TOOL_PAGES.find((page) => page.slug === slug)
}

export const PRIVACY_SLUG = 'privacy-policy'

export type ResolvedPath =
  | { kind: 'static'; path: string }
  | { kind: 'lang'; lang: 'uz' | 'en' }
  | { kind: 'tool'; slug: string; lang: SeoLang }
  | { kind: 'privacy'; lang: SeoLang }
  | { kind: 'notfound'; path: string }

/** Разбирает адрес: язык в первом сегменте, дальше slug инструмента или политика. */
export function resolvePath(path: string): ResolvedPath {
  const segments = path.split('/').filter(Boolean)
  const [first, ...rest] = segments

  if (!first) return { kind: 'static', path: '/' }

  if (first === 'uz' || first === 'en') {
    const lang = first
    const next = rest.join('/')
    if (!next) return { kind: 'lang', lang }
    if (next === PRIVACY_SLUG) return { kind: 'privacy', lang }
    if (TOOL_SLUGS.has(next)) return { kind: 'tool', slug: next, lang }
    return { kind: 'notfound', path }
  }

  if (first === PRIVACY_SLUG) return { kind: 'privacy', lang: 'ru' }
  if (TOOL_SLUGS.has(first) && !rest.length) return { kind: 'tool', slug: first, lang: 'ru' }

  return { kind: 'static', path }
}
