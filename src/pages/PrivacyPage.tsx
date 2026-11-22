import { AdRect } from '../components/Ads'
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
    updated: 'Обновлено 22 ноября 2026 года',
    intro:
      'RekPDF — бесплатный сервис для работы с PDF. Ниже честно описано, какие данные обрабатываются и что с ними происходит.',
    sections: [
      {
        title: '1. Обработка и хранение файлов',
        text: [
          'Файлы PDF, JPG и PNG не загружаются на наш сервер. Документы читаются и собираются прямо в браузере на вашем устройстве, поэтому мы не получаем их содержимое, не просматриваем, не копируем и не передаём третьим лицам.',
          'Нам нечего удалять через час: файл никогда не попадает в наше хранилище. Соединение по HTTPS нужно только для загрузки страницы сайта.',
        ],
      },
      {
        title: '2. Сбор персональных данных',
        text: [
          'Для работы с инструментами регистрация не требуется. Имя, которое вы указываете в профиле, хранится только в памяти браузера (localStorage) и никуда не отправляется.',
          'Адрес электронной почты мы не запрашиваем и не сохраняем. Платная подписка на сайте отсутствует.',
        ],
      },
      {
        title: '3. Файлы cookie, статистика и реклама',
        text: [
          'Сайт использует localStorage для настроек и истории обработки — эти данные остаются на вашем устройстве и удаляются в настройках браузера.',
          'Мы собираем анонимную статистику: название инструмента, действие, путь страницы и случайный идентификатор посетителя. Ни файлов, ни имён, ни почты в ней нет. Сбор можно отключить в разделе «Настройки».',
          'В рекламном блоке показываются объявления congix.uz. Рекламная сеть может использовать собственные cookie — их правила описаны на сайте congix.uz.',
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
    updated: '2026-yil 22-noyabrda yangilandi',
    intro:
      "RekPDF — PDF bilan ishlash uchun bepul xizmat. Quyida qanday ma'lumotlar qayta ishlanishi va ular bilan nima bo'lishi ochiq yozilgan.",
    sections: [
      {
        title: "1. Fayllarni qayta ishlash va saqlash",
        text: [
          "PDF, JPG va PNG fayllar bizning serverga yuklanmaydi. Hujjatlar to'g'ridan-to'g'ri brauzeringizda, qurilmangizda o'qiladi va yig'iladi — shuning uchun biz ularning mazmunini olmaymiz, ko'rmaymiz, nusxalamaymiz va uchinchi shaxslarga bermaymiz.",
          "Bir soatdan keyin o'chirishimiz shart emas: fayl bizning xotiraga umuman tushmaydi. HTTPS ulanish faqat sayt sahifasini yuklash uchun kerak.",
        ],
      },
      {
        title: "2. Shaxsiy ma'lumotlar",
        text: [
          "Vositalardan foydalanish uchun ro'yxatdan o'tish kerak emas. Profilda ko'rsatilgan ism faqat brauzer xotirasida (localStorage) saqlanadi va hech qayerga yuborilmaydi.",
          "Elektron pochta manzilini so'ramaymiz va saqlamaymiz. Saytda pullik obuna yo'q.",
        ],
      },
      {
        title: '3. Cookie fayllar, statistika va reklama',
        text: [
          "Sayt sozlamalar va ishlash tarixi uchun localStorage dan foydalanadi — bu ma'lumotlar qurilmangizda qoladi va brauzer sozlamalarida o'chiriladi.",
          "Biz anonim statistika yig'amiz: vosita nomi, amal, sahifa manzili va tasodifiy tashrif buyuruvchi identifikatori. Unda fayllar, ismlar va pochta yo'q. Yig'ishni «Sozlamalar» bo'limida o'chirish mumkin.",
          "Reklama blokida congix.uz e'lonlari ko'rsatiladi. Reklama tarmog'i o'z cookie fayllaridan foydalanishi mumkin — qoidalari congix.uz saytida yozilgan.",
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
    updated: 'Updated on 22 November 2026',
    intro:
      'RekPDF is a free service for working with PDF files. Below is a plain description of what data is processed and what happens to it.',
    sections: [
      {
        title: '1. File processing and storage',
        text: [
          'PDF, JPG and PNG files are not uploaded to our server. Documents are read and rebuilt directly in your browser on your device, so we never receive their contents, never look at them, never copy them and never share them with third parties.',
          'There is nothing to delete after an hour: the file never reaches our storage. HTTPS is only needed to load the page itself.',
        ],
      },
      {
        title: '2. Personal data',
        text: [
          'No registration is required to use the tools. The name you enter in the profile is kept in your browser storage (localStorage) and is not sent anywhere.',
          'We do not ask for or store an email address. The site has no paid subscription.',
        ],
      },
      {
        title: '3. Cookies, statistics and advertising',
        text: [
          'The site uses localStorage for preferences and processing history — this data stays on your device and can be cleared in your browser settings.',
          'We collect anonymous statistics: tool name, action, page path and a random visitor identifier. It contains no files, names or emails. Collection can be disabled in Settings.',
          'The ad slot shows congix.uz advertisements. The ad network may use its own cookies, described on congix.uz.',
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
        <span className="eyebrow">RekPDF</span>
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

      <div className="promo-slot">
        <AdRect slot={`privacy-${lang}`} />
      </div>

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
