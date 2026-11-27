import { Link, ROUTES } from '../lib/router'
import type { SeoLang } from '../lib/seoToolPages'

type PrivacyCopy = {
  title: string
  updated: string
  intro: string
  sections: { title: string; text: string[] }[]
  contactLabel: string
  back: string
}

const CONTENT: Record<SeoLang, PrivacyCopy> = {
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Обновлено 23 ноября 2026 года',
    intro:
      'Congix Docs — бесплатный сервис для работы с PDF. Ниже честно описано, какие данные обрабатываются и что с ними происходит.',
    sections: [
      {
        title: '1. Обработка и хранение файлов',
        text: [
          'Файлы PDF, JPG и PNG не загружаются на наш сервер. Документы читаются и собираются прямо в браузере на вашем устройстве, поэтому мы не получаем их содержимое, не просматриваем, не копируем и не передаём третьим лицам.',
          'Нам нечего удалять через час: файл никогда не попадает в наше хранилище. Соединение по HTTPS нужно только для загрузки страницы сайта.',
          'Для распознавания текста (OCR) браузер скачивает языковые модели с публичного CDN — jsDelivr и tessdata.projectnaptha.com. Уходит только запрос за моделью языка: сам документ, его страницы и распознанный текст никуда не отправляются и обрабатываются на вашем устройстве. Скачанные модели кешируются браузером, поэтому повторное распознавание идёт быстрее и без новой загрузки.',
        ],
      },
      {
        title: '2. Сбор персональных данных',
        text: [
          'Для работы с инструментами регистрация и аккаунт не нужны. Мы не просим имя, электронную почту или телефон и не создаём профили пользователей.',
          'Адрес электронной почты мы не запрашиваем и не сохраняем. Платная подписка на сайте отсутствует.',
        ],
      },
      {
        title: '3. Файлы cookie, статистика и реклама',
        text: [
          'Сайт использует localStorage только для настроек — эти данные остаются на вашем устройстве и удаляются в настройках браузера.',
          'Мы собираем анонимную статистику: название инструмента, действие, путь страницы и случайный идентификатор посетителя. Ни файлов, ни имён, ни почты в ней нет.',
          'Для показа рекламы могут использоваться сторонние рекламные сети, в том числе Google AdSense. Они применяют файлы cookie (включая cookie DoubleClick) и идентификаторы устройства, чтобы показывать объявления с учётом ваших интересов и предыдущих посещений сайтов. Персонализированную рекламу можно отключить в настройках рекламы Google (adssettings.google.com) или в настройках браузера. Правила Google описаны на policies.google.com/technologies/ads.',
        ],
      },
      {
        title: '4. Контакты',
        text: [
          'По вопросам безопасности данных и работы сервиса пишите на likedissdei@gmail.com. Мы отвечаем на письма и удаляем любые данные, если они у нас всё же окажутся.',
        ],
      },
    ],
    contactLabel: 'Написать на likedissdei@gmail.com',
    back: 'На главную',
  },
  uz: {
    title: 'Maxfiylik siyosati',
    updated: '2026-yil 23-noyabrda yangilandi',
    intro:
      "Congix Docs — PDF bilan ishlash uchun bepul xizmat. Quyida qanday ma'lumotlar qayta ishlanishi va ular bilan nima bo'lishi ochiq yozilgan.",
    sections: [
      {
        title: "1. Fayllarni qayta ishlash va saqlash",
        text: [
          "PDF, JPG va PNG fayllar bizning serverga yuklanmaydi. Hujjatlar to'g'ridan-to'g'ri brauzeringizda, qurilmangizda o'qiladi va yig'iladi — shuning uchun biz ularning mazmunini olmaymiz, ko'rmaymiz, nusxalamaymiz va uchinchi shaxslarga bermaymiz.",
          "Bir soatdan keyin o'chirishimiz shart emas: fayl bizning xotiraga umuman tushmaydi. HTTPS ulanish faqat sayt sahifasini yuklash uchun kerak.",
          "Matnni aniqlash (OCR) uchun brauzer til modellarini ochiq CDN — jsDelivr va tessdata.projectnaptha.com dan yuklab oladi. Faqat til modeli uchun so'rov ketadi: hujjatning o'zi, sahifalari va aniqlangan matn hech qayerga yuborilmaydi, hammasi qurilmangizda qayta ishlanadi. Yuklangan modellar brauzer keshida saqlanadi, shuning uchun keyingi aniqlash tezroq ishlaydi.",
        ],
      },
      {
        title: "2. Shaxsiy ma'lumotlar",
        text: [
          "Vositalardan foydalanish uchun ro'yxatdan o'tish va akkaunt kerak emas. Biz ism, elektron pochta yoki telefon so'ramaymiz va foydalanuvchi profillarini yaratmaymiz.",
          "Elektron pochta manzilini so'ramaymiz va saqlamaymiz. Saytda pullik obuna yo'q.",
        ],
      },
      {
        title: '3. Cookie fayllar, statistika va reklama',
        text: [
          "Sayt localStorage dan faqat sozlamalar uchun foydalanadi — bu ma'lumotlar qurilmangizda qoladi va brauzer sozlamalarida o'chiriladi.",
          "Biz anonim statistika yig'amiz: vosita nomi, amal, sahifa manzili va tasodifiy tashrif buyuruvchi identifikatori. Unda fayllar, ismlar va pochta yo'q.",
          "Reklama ko'rsatish uchun uchinchi tomon reklama tarmoqlari, jumladan Google AdSense ishlatilishi mumkin. Ular cookie fayllari (DoubleClick cookie ham) va qurilma identifikatorlaridan foydalanib, sizning qiziqishlaringiz va boshqa saytlarga tashriflaringizga mos e'lonlarni ko'rsatadi. Shaxsiylashtirilgan reklamani Google reklama sozlamalarida (adssettings.google.com) yoki brauzer sozlamalarida o'chirish mumkin. Google qoidalari policies.google.com/technologies/ads sahifasida yozilgan.",
        ],
      },
      {
        title: "4. Bog'lanish",
        text: [
          "Ma'lumotlar xavfsizligi va xizmat ishi bo'yicha savollarni likedissdei@gmail.com manziliga yuboring. Xatlarga javob beramiz va bizda qolgan bo'lsa, istalgan ma'lumotni o'chiramiz.",
        ],
      },
    ],
    contactLabel: 'likedissdei@gmail.com ga yozish',
    back: 'Bosh sahifa',
  },
  en: {
    title: 'Privacy policy',
    updated: 'Updated on 23 November 2026',
    intro:
      'Congix Docs is a free service for working with PDF files. Below is a plain description of what data is processed and what happens to it.',
    sections: [
      {
        title: '1. File processing and storage',
        text: [
          'PDF, JPG and PNG files are not uploaded to our server. Documents are read and rebuilt directly in your browser on your device, so we never receive their contents, never look at them, never copy them and never share them with third parties.',
          'There is nothing to delete after an hour: the file never reaches our storage. HTTPS is only needed to load the page itself.',
          'For text recognition (OCR) the browser downloads language models from a public CDN — jsDelivr and tessdata.projectnaptha.com. Only a request for the language model leaves your device: the document itself, its pages and the recognized text are never sent anywhere and are processed locally. Downloaded models are cached by the browser, so the next recognition runs faster.',
        ],
      },
      {
        title: '2. Personal data',
        text: [
          'No registration or account is required to use the tools. We do not ask for a name, email or phone number and do not create user profiles.',
          'We do not ask for or store an email address. The site has no paid subscription.',
        ],
      },
      {
        title: '3. Cookies, statistics and advertising',
        text: [
          'The site uses localStorage for preferences only — this data stays on your device and can be cleared in your browser settings.',
          'We collect anonymous statistics: tool name, action, page path and a random visitor identifier. It contains no files, names or emails.',
          'Advertising may be served by third-party ad networks, including Google AdSense. They use cookies (including the DoubleClick cookie) and device identifiers to show ads based on your interests and previous visits to other sites. You can turn off personalized advertising in Google Ads Settings (adssettings.google.com) or in your browser settings. Google data practices are described at policies.google.com/technologies/ads.',
        ],
      },
      {
        title: '4. Contact',
        text: [
          'For questions about data security or the service, write to likedissdei@gmail.com. We reply to emails and delete any data if it ever reaches us.',
        ],
      },
    ],
    contactLabel: 'Email likedissdei@gmail.com',
    back: 'Home',
  },
}

export function PrivacyPage({ lang }: { lang: SeoLang }) {
  const copy = CONTENT[lang]

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Congix Docs</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <p className="panel-note">{copy.updated}</p>
      </section>

      <section className="faq">
        <div className="faq-list">
          {copy.sections.map((section) => (
            <details className="faq-item" key={section.title} open>
              <summary>
                <span>{section.title}</span>
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              {section.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-inner">
          <h2>{copy.contactLabel}</h2>
          <div className="form-actions">
            <a className="btn btn-primary" href="mailto:likedissdei@gmail.com">
              likedissdei@gmail.com
            </a>
            <Link className="btn btn-quiet" to={ROUTES.home}>
              {copy.back}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
