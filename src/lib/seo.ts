import { ROUTES } from './router'
import { resolvePath, toolPageBySlug } from './seoToolPages'
import type { SeoLang } from './seoToolPages'

/** Базовый адрес прод-сайта: нужен для canonical, og:url и карты сайта. */
export const SITE_URL = 'https://rekpdf-ircn71.freebuff.site'

type PageMeta = {
  title: string
  description: string
  keywords: string
  lang: string
}

/**
 * Заголовки и описания под поисковые запросы.
 * Русский — основной рынок, узбекский и английский — отдельные страницы /uz и /en.
 */
const PAGES: Record<string, PageMeta> = {
  [ROUTES.home]: {
    title: 'Конвертировать PDF в Word онлайн бесплатно — Congix Docs',
    description:
      'Конвертируйте PDF в Word, сжимайте PDF без потери качества, объединяйте и разделяйте PDF файлы, переводите JPG в PDF и PDF в JPG. Бесплатно, без регистрации — файлы остаются в браузере.',
    keywords:
      'конвертировать PDF в Word онлайн, PDF в Word бесплатно, сжать PDF файл онлайн, объединить PDF файлы в один, разделить PDF на страницы, перевести JPG в PDF, конвертировать PDF в JPG',
    lang: 'ru',
  },
  [ROUTES.tools]: {
    title: 'Инструменты PDF: Word, JPG, сжатие и страницы — Congix Docs',
    description:
      'Все инструменты для PDF в одном окне: PDF в Word, PDF в JPG, JPG в PDF, сжать PDF, объединить, разделить, повернуть и переставить страницы. Бесплатно и без загрузки файлов на сервер.',
    keywords:
      'PDF в Word, PDF в JPG, JPG в PDF, сжать PDF, объединить PDF, разделить PDF, повернуть PDF, извлечь страницы PDF',
    lang: 'ru',
  },
  [ROUTES.services]: {
    title: 'Что умеет Congix Docs — конвертация и редактор PDF онлайн',
    description:
      'Редактор PDF, конвертация PDF в Word и изображения, сжатие, объединение и разделение файлов. Всё работает в браузере: документы не загружаются на сервер.',
    keywords: 'редактор PDF онлайн, конвертер PDF, работа с PDF в браузере',
    lang: 'ru',
  },
  [ROUTES.editor]: {
    title: 'Редактор PDF онлайн — добавляйте текст и фото в PDF',
    description:
      'Редактируйте PDF прямо в браузере: текст, фото, пустые листы, удаление пометок. Скачайте готовый PDF без регистрации и загрузки на сервер.',
    keywords: 'редактор PDF онлайн, редактировать PDF, добавить текст в PDF, добавить фото в PDF',
    lang: 'ru',
  },
  '/about': {
    title: 'О сервисе — Congix Docs',
    description:
      'Congix Docs — бесплатные инструменты для PDF в браузере: конвертация, редактирование, страницы и утилиты. Файлы не загружаются на сервер.',
    keywords: 'Congix Docs о сервисе, PDF инструменты бесплатно, конвертер PDF онлайн, редактор PDF, обработка файлов в браузере',
    lang: 'ru',
  },
  '/contacts': {
    title: 'Контакты — Congix Docs',
    description:
      'Связь с разработчиками Congix Docs: рабочая почта и вопросы по сервису, инструментам и обработке файлов.',
    keywords: 'Congix Docs контакты, связь с разработчиком, вопросы по PDF инструментам, email разработчика',
    lang: 'ru',
  },
  [ROUTES.uz]: {
    title: "PDF ni Word ga o'tkazish va PDF bilan ishlash onlayn — Congix Docs",
    description:
      "PDF ni Word ga o'tkazish, Word ni PDF qilish, PDF hajmini kichraytirish, PDF fayllarni birlashtirish va bo'lish, rasmni PDF qilish, PDF ni rasmga aylantirish — bepul, onlayn, telefon orqali. Fayllar brauzerda qoladi.",
    keywords:
      "PDF ni Word ga o'tkazish, Word ni PDF qilish, PDF hajmini kichraytirish, PDF fayllarni birlashtirish, PDF ni bo'lish, rasmni PDF qilish, PDF ni rasmga aylantirish, bepul, onlayn, telefon orqali",
    lang: 'uz',
  },
  [ROUTES.en]: {
    title: 'Convert PDF to Word online free — Congix Docs',
    description:
      'Convert PDF to Word, compress PDF file size online, merge and split PDF files, convert JPG to PDF and PDF to JPG. Free, no sign-up, files stay in your browser.',
    keywords:
      'convert PDF to Word online free, convert Word to PDF online, compress PDF file size online, merge PDF files online, split PDF pages online, convert JPG to PDF online, convert PDF to JPG high quality',
    lang: 'en',
  },
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const PRIVACY_META: Record<SeoLang, PageMeta> = {
  ru: {
    title: 'Политика конфиденциальности — Congix Docs',
    description:
      'Как Congix Docs обращается с файлами и данными: документы не загружаются на сервер, статистика анонимная, рекламных блоков нет.',
    keywords: 'политика конфиденциальности Congix Docs, обработка файлов, cookie, аналитика',
    lang: 'ru',
  },
  uz: {
    title: 'Maxfiylik siyosati — Congix Docs',
    description:
      "Congix Docs fayllar va ma'lumotlar bilan qanday ishlaydi: hujjatlar serverga yuklanmaydi, statistika anonim, reklama bloklari yo'q.",
    keywords: 'maxfiylik siyosati, PDF fayllar, cookie, statistika',
    lang: 'uz',
  },
  en: {
    title: 'Privacy policy — Congix Docs',
    description:
      'How Congix Docs handles files and data: documents are never uploaded, statistics are anonymous and there are no ad blocks.',
    keywords: 'privacy policy, PDF files, cookies, analytics',
    lang: 'en',
  },
}

const TERMS_META: Record<SeoLang, PageMeta> = {
  ru: {
    title: 'Условия использования — Congix Docs',
    description:
      'Условия использования Congix Docs: бесплатные инструменты для PDF, обработка файлов в браузере, допустимое использование, реклама и контакты.',
    keywords: 'условия использования Congix Docs, правила сервиса, PDF онлайн',
    lang: 'ru',
  },
  uz: {
    title: 'Foydalanish shartlari — Congix Docs',
    description:
      "Congix Docs foydalanish shartlari: bepul PDF vositalar, fayllar brauzerda qayta ishlanadi, ruxsat etilgan foydalanish, reklama va bog'lanish.",
    keywords: "foydalanish shartlari, PDF onlayn, xizmat qoidalari",
    lang: 'uz',
  },
  en: {
    title: 'Terms of use — Congix Docs',
    description:
      'Congix Docs terms of use: free PDF tools with in-browser processing, acceptable use, advertising and contact details.',
    keywords: 'terms of use, PDF online, service rules',
    lang: 'en',
  },
}

/** Подставляет заголовок, описание и canonical под текущий маршрут. */
export function applySeo(path: string) {
  const resolved = resolvePath(path)

  if (resolved.kind === 'privacy') {
    publish(PRIVACY_META[resolved.lang], path)
    return
  }

  if (resolved.kind === 'terms') {
    publish(TERMS_META[resolved.lang], path)
    return
  }

  if (resolved.kind === 'tool') {
    const page = toolPageBySlug(resolved.slug)
    if (page) {
      const copy = page.copy[resolved.lang]
      publish(
        {
          title: copy.title,
          description: copy.description,
          keywords: copy.h1,
          lang: resolved.lang,
        },
        path,
      )
      return
    }
  }

  if (path === '/about' || path === '/contacts') {
    publish(PAGES[path], path)
    return
  }

  publish(PAGES[path] ?? PAGES[ROUTES.home], path)
}

function publish(meta: PageMeta, path: string) {
  const url = `${SITE_URL}${path === ROUTES.home ? '/' : path}`

  document.title = meta.title
  document.documentElement.lang = meta.lang
  setMeta('name', 'description', meta.description)
  setMeta('name', 'keywords', meta.keywords)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', url)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url
}
