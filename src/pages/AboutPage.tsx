import { Arrow } from '../components/ui'
import { Link, ROUTES } from '../lib/router'

const SECTIONS_RU = [
  {
    title: 'Что такое Congix Docs',
    text: [
      'Congix Docs — набор инструментов для работы с PDF, который открывается прямо в браузере. Никакой установки, регистрации или загрузки файлов на сервер: документ читается и собирается на вашем устройстве, и результат вы скачиваете у себя.',
      'Проект создан как бесплатная замена «открыл — пере-roчил — загрузил»: вы кладёте файл в окно, выбираете, что сделать, и забираете готовый файл минуту спустя. Никаких очередей, подписок и водяных знаков на результате.',
    ],
  },
  {
    title: 'Что умеет сервис',
    text: [
      'Конвертация: PDF → Word (.docx) с переносом текста, шрифтов, колонок и таблиц; PDF → JPG или PNG постранично; JPG → PDF (одна картинка — одна страница); извлечение всех встроенных изображений одним архивом; перевод PDF в текст (.txt).',
      'Редактор PDF: добавление и правка текста, вставка фото и логотипов, вставка пустых листов в нужное место, удаление пометок и подписей-аннотаций, поворот страниц. Готовый файл скачивается сразу.',
      'Страницы: объединение нескольких PDF в один документ, разделение по диапазонам, извлечение отдельных страниц, перестановка порядка, поворот и нумерация.',
      'Утилиты: сжатие сканов и фотографий с выбором качества, водяной знак «Черновик» и другие надписи, готовые файлы скачиваются сразу, без писем и ссылок.',
    ],
  },
  {
    title: 'Как работает обработка',
    text: [
      'При открытии файла браузер разбирает PDF библиотекой pdf.js, страницы строятся на вашем устройстве. Конвертация в Word, извлечение картинок, сжатие и редактирование — всё происходит внутри вкладки, без отправки файла куда-либо.',
      'Для распознавания текста (OCR) браузер может загрузить языковые модели с публичного CDN — при этом уходит только запрос за моделью, сам документ, его страницы и распознанный текст не покидают ваше устройство. Скачанные модели кешируются браузером, поэтому повторная обработка идёт быстрее.',
      'Соединение по HTTPS нужно только для загрузки самой страницы сайта. После этого работает полностью локально.',
    ],
  },
  {
    title: 'Кому подходит',
    text: [
      'Студентам: конспекты, методички, домашние задания в Word — можно открыть и дописать.',
      'Офису: счета, договоры, документы с подписями и водяными знаками, сжатие сканов перед отправкой.',
      'Фрилансерам и малому бизнесу: быстро поправить PDF для клиента, не отдавая оригинал посторонним.',
      'Всем, кто не хочет отдавать документы на чужой сервер: файл остаётся у вас от начала до конца.',
    ],
  },
  {
    title: 'Что получает пользователь',
    text: [
      'Редактируемый Word-документ, архив с изображениями, отредактированный PDF или сжатый файл — в зависимости от выбранного инструмента. Файлы скачиваются сразу, без ожидания «подготовки на сервере».',
      'Никаких ограничений по количеству обрабатываемых файлов в день. Единственный практический предел — память вашего устройства; для стабильной работы рекомендуем файлы до 100 МБ и пару сотен страниц.',
    ],
  },
  {
    title: 'Прозрачность и контакты',
    text: [
      'Мы публично описываем, какие данные обрабатываются и что с ними происходит, в политике конфиденциальности. Файлы не загружаются на сервер и не хранятся — подробности на странице конфиденциальности.',
      'Если инструмент не сработал или вы нашли неточность — напишите на likedissdei@gmail.com. Мы отвечаем на письма и стараемся помочь по существу, а при необходимости исправляем сервис.',
    ],
  },
]

const SECTIONS_UZ = [
  {
    title: 'Congix Docs nima',
    text: [
      'Congix Docs — PDF bilan ishlash uchun vositalar to‘plami, yangi brauzerda ochiladi. Hech qanday o‘rnatish, ro‘yxatdan o‘tish yoki fayllarni serverga yuklash yo‘q: hujjat qurilmangizda o‘qiladi va yig‘iladi, natija siz ushlaysiz.',
      'Loyiha «ochdim — o‘zkardim — yukladim»ga bepul alohida variant sifatida yaratlangan: faylni oynaga qo‘ydingiz, nima qilishni tanladingiz va yir minutda tayyor faylni ushlaysiz. Hech qanday navbat, obuna va natijada suv belgilari yo‘q.',
    ],
  },
  {
    title: 'Xizmat nima qiladi',
    text: [
      'Konversiya: PDF → Word (.docx), matn, shrift, ustunlar va jadvallar saqlanadi; PDF → JPG yoki PNG sahifalar bo‘yicha; JPG → PDF (bir rasm — bir sahifa); barcha ichki tasvirlar bitta arxivda; PDF ni matnga (.txt) o‘girish.',
      'PDF muharriri: matn qo‘shish va tahrirlash, rasm va logotip kiritish, kerakli joyga bo‘sh sahifa qo‘shish, belgilar va imzo-annotatsiyalarni olib tashlash, sahifalarni aylantirish. Tayyor fayl darhol yuklanadi.',
      'Sahifalar: bir nechta PDF ni bitta hujjatga birlashtirish, diapazonlarga ajratish, alohida sahifalarni ajratib olish, tartibni o‘zgartirish, burish va raqamlan-tirish.',
      'Asboblar: skanlarni va fotoshonialarni sifat tanlash bilan siqish, «Ch Reviziyasi» suv belgisi va boshqa yozuvlar, tayyor fayllar darhol yuklanadi, xatlar va havolalar yo‘q.',
    ],
  },
  {
    title: 'Qayta ishlash qanday ishlaydi',
    text: [
      'Fayl ochilganda brauzer pdf.js kutubxati orqali PDF ni tahlil qiladi, sahifalar qurilmangizda quriladi. Word ga konversiya, rasmlarni ajratib olish, siqish va tahrirlash — hammasi sangat ichida, faylni qayerga yuborishsiz holdsa ham amalga oshiriladi.',
      'Matnni tan olish (OCR) uchun brauzer ochiq CDN dan til modellarini yuklab olishi mumkin — faqat til modeli uchun so‘rov ketadi, hujjatning o‘zi, uning sahifalari va tan olingan matn sizning qurilmangizdan chiqmaydi. Yuklangan modellar brauzerda saqlanadi, shuning uchun takroriy qayta ishlash tezroq boradi.',
      'HTTPS ulanish sahifa-ni yuklash uchun raised. Keyin to‘liq mahalliy ishlaydi.',
    ],
  },
  {
    title: 'Kimlar uchun mo‘ljallangan',
    text: [
      'Talabega: kon-spektlar, metodikalar, uy-javoblari Word da — ochib yozish mumkin.',
      'Ofisga: hisobotlar, shartnomalar, imzo va suv-belgilar bilan hujjatlar, jo‘natishdan oldin skanlarni siqish.',
      'Fridayneserlar va kichik biznes: mijosiga PDF ni tez o‘zgartirish, asl variantni boshqalarga bermasdan.',
      'Hujjatlarni boshqa serverga bermoqchiman odamlar uchun: fayl boshidan oxirigacha sizda qoladi.',
    ],
  },
  {
    title: 'Foydalanuvchi nima oladi',
    text: [
      'Tahrirlanadigan Word hujjati, tasvirlar arxivi, tahrirlangan PDF yoki siqilgan fayl — tanlangan vositaga qarab. Fayllar darhol yuklanadi, «serverda tayyorlanmo-diki» kutishsiz.',
      'Kuniga qayta ishlangan fayllar soniga cheklovlar yoki yo‘q. Ammo amaldagi cheklov — qurilmangizning xotirasidir; barqaror ishlash uchun 100 MB gacha va yuzlar sahifalarni tavsiya qilamiz.',
    ],
  },
  {
    title: 'Shaffoflik va aloqa',
    text: [
      'Qanday ma’lumotlar qayta ishlanadi va ular bilan nima bo‘lishini maxfiylik siyosatida jonli yozilgan. Fayllar serverga yuklanmaydi va saqlanmaydi — tafsilotlar maxfiylik sahifasida.',
      'Agar vosita ishlamasa yoki noaniqlik topilsa — likedissdei@gmail.com ga yozing. Xatlarga javob beramiz va mazmunan yordam berishga harakat qilamiz, keraksiza servisni tuzatamiz.',
    ],
  },
]

const SECTIONS_EN = [
  {
    title: 'What Congix Docs is',
    text: [
      'Congix Docs is a set of PDF tools that open directly in your browser. No installation, no sign-up and no upload to a server: the document is read and built on your device, and you download the result on your own machine.',
      'The project is a free replacement for the “open it — tweak it — upload it” loop: you drop a file into the window, pick what to do, and grab the ready file a minute later. No queues, no subscriptions and no watermarks on the output.',
    ],
  },
  {
    title: 'What the service does',
    text: [
      'Conversion: PDF → Word (.docx) with text, fonts, columns and tables preserved; PDF → JPG or PNG per page; JPG → PDF (one image becomes one page); extracting all embedded images as one archive; PDF to plain text (.txt).',
      'PDF editor: adding and editing text, inserting photos and logos, putting a blank page where you need it, removing notes and signature annotations, rotating pages. The finished file downloads immediately.',
      'Pages: merging several PDFs into one document, splitting by ranges, extracting individual pages, reordering, rotating and numbering pages.',
      'Utilities: compressing scans and photos with a quality choice, a “Draft” watermark and other stamps, ready files download right away, no emails or links.',
    ],
  },
  {
    title: 'How the processing works',
    text: [
      'When you open a file, the browser parses the PDF with the pdf.js library and builds the pages on your device. Conversion to Word, image extraction, compression and editing all happen inside the tab, without the file ever leaving your machine.',
      'For text recognition (OCR), the browser may download language models from a public CDN — only a request for the model leaves your device; the document itself, its pages and the recognized text never leave your machine. Downloaded models are cached by the browser, so a second pass runs faster.',
      'HTTPS is needed only to load the page itself. After that, everything works locally.',
    ],
  },
  {
    title: 'Who it is for',
    text: [
      'Students: lecture notes, methodical materials, homework in Word — open and finish writing.',
      'Office: invoices, contracts, documents with signatures and watermarks, compressing scans before sending.',
      'Freelancers and small businesses: quickly fix a PDF for a client without handing over the original to outsiders.',
      'Anyone who does not want to give documents to another server: the file stays on your side from start to finish.',
    ],
  },
  {
    title: 'What the user gets',
    text: [
      'An editable Word document, an archive with images, an edited PDF or a compressed file — depending on the chosen tool. Files download immediately, with no waiting for “server preparation”.',
      'No daily limits on the number of files you process. The only practical limit is your device’s memory; for stable work we recommend files up to 100 MB and a few hundred pages.',
    ],
  },
  {
    title: 'Transparency and contacts',
    text: [
      'We describe publicly which data is processed and what happens to it in the privacy policy. Files are never uploaded to a server and never stored — the details are on the privacy page.',
      'If a tool fails or you spot an inaccuracy — write to likedissdei@gmail.com. We reply to emails and try to help in substance, and where needed we fix the service.',
    ],
  },
]

const CONTENT: Record<string, typeof SECTIONS_RU> = {
  ru: SECTIONS_RU,
  uz: SECTIONS_UZ,
  en: SECTIONS_EN,
}

export function AboutPage({ lang }: { lang: 'ru' | 'uz' | 'en' }) {
  const sections = CONTENT[lang]
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">О сервисе</span>
        <h1>
          {lang === 'ru' ? 'О сервисе Congix Docs' :
            lang === 'uz' ? 'Congix Docs haqida' :
            'About Congix Docs'}
        </h1>
        <p>
          {lang === 'ru'
            ? 'Бесплатные инструменты для PDF в браузере: конвертация, редактирование, страницы и утилиты. Файлы остаются у вас.'
            : lang === 'uz'
            ? 'PDF uchun bepul vositalar brauzerda: kon-versiya, tahrirlash, sahifalar va asboblar. Fayl sizda qoladi.'
            : 'Free PDF tools in the browser: conversion, editing, pages and utilities. Files stay with you.'}
        </p>
      </section>

      <section className="tool">
        <div className="faq-list">
          {sections.map((section) => (
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
          <h2>
            {lang === 'ru'
              ? 'Попробуйте на своём документе'
              : lang === 'uz'
              ? "O'zingizning hujjatida sinang'"
              : 'Try it on your own document'}
          </h2>
          <p>
            {lang === 'ru'
              ? 'Откройте инструменты и загрузите PDF — результат скачается сразу.'
              : lang === 'uz'
              ? 'Vositalarni oching va PDF yuklang — natija darhol yuklanadi.'
              : 'Open the tools and load a PDF — the result downloads right away.'}
          </p>
                      <div className="form-actions" style={{ marginTop: 18 }}>
                          <Link className="btn btn-primary" to={ROUTES.tools}>
              {lang === 'ru' ? 'Открыть инструменты' : lang === 'uz' ? 'Vositalarni ochish' : 'Open tools'}
              <Arrow />
            </Link>
              <Link className="btn btn-quiet" to={ROUTES.home}>
                {lang === 'ru' ? 'Назад к инструментам' : lang === 'uz' ? 'Back to tools' : 'Back to tools'}
              </Link>
            </div>
        </div>
      </section>
    </>
  )
}
