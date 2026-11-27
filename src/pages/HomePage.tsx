import { FaqJsonLd } from '../components/FaqJsonLd'
import { Tool } from '../components/Tool'
import { catalog } from '../components/toolCatalog'
import { Arrow } from '../components/ui'
import { Link } from '../lib/router'

const INSTRUMENTS = [
  {
    slug: 'pdf-to-word',
    title: { ru: 'PDF → Word', uz: 'PDF ➜ Word', en: 'PDF to Word' },
    what: {
      ru: 'Превращает PDF в редактируемый Word-документ (.docx). Текст, шрифты, колонки и таблицы переносятся в том числе — файл можно сразу открыть и дописать.',
      uz: 'PDF ni tahrirlanadigan Word hujjatiga (.docx) aylantiradi. Matn, shrift, ustunlar va jadvallar saqlanib qoladi — faylni darhol ochib yozish mumkin.',
      en: 'Turns a PDF into an editable Word document (.docx). Text, fonts, columns and tables are preserved — you can open and finish editing right away.',
    },
    steps: {
      ru: ['Добавьте PDF в окно инструмента «PDF → Word».', 'Дождитесь обработки — страницы строятся на вашем устройстве.', 'Скачайте готовый .docx и откройте его в Word.'],
      uz: ['PDF ni «PDF → Word» vositasiga qo‘ying.', 'Qayta ishlashni kuting — sahifalar qurilmangizda quriladi.', 'Tayyor .docx ni yuklab oling va Word da oching.'],
      en: ['Add a PDF to the “PDF to Word” tool.', 'Wait for processing — pages are built on your device.', 'Download the ready .docx and open it in Word.'],
    },
    note: {
      ru: 'Сложные вёрстки и сканы без текстового слоя могут перенестись как картинки — проверьте результат перед важными документами и сохраните оригинал.',
      uz: 'Murakkab sahifa tuzilishi va matnli qatlamsiz skanlar rasm sifatida ko‘chirilishi mumkin — muhim hujjatlar oldin natijani tekshirib, asl nusxani saqlang.',
      en: 'Complex layouts and scans without a text layer may be carried over as images — check the result before important documents and keep the original.',
    },
  },
  {
    slug: 'pdf-to-jpg',
    title: { ru: 'PDF в JPG', uz: 'PDF ➜ JPG', en: 'PDF to JPG' },
    what: {
      ru: 'Переводит страницы PDF в отдельные JPG-файлы. Каждая страница становится картинкой в выбранном разрешении — удобно, чтобы вставить отдельные листы в презентацию или отправить их по почте.',
      uz: 'PDF sahifalarini alohida JPG fayllariga o‘giradi. Har bir sahifa tanlangan yuksatdagi rasmga aylanadi — alohida sahifalarni prezentratsiyaga qo‘shish yoki pochta orqali yuborish uchun qulay.',
      en: 'Converts PDF pages into separate JPG files. Each page becomes an image at the resolution you choose — handy for inserting individual pages into a presentation or sending them by email.',
    },
    steps: {
      ru: ['Добавьте PDF в инструмент «PDF в JPG».', 'Выберите масштаб и качество (чем больше — тем чётче картинки).', 'Скачайте архив со всеми страницами.'],
      uz: ['PDF ni «PDF ➜ JPG» vositasiga qo‘ying.', 'Masshtab va sifatni tanlang (katta — rasmlar aniqroq).', 'Barcha sahifalar bilan arxiv yuklab oling.'],
      en: ['Add a PDF to the “PDF to JPG” tool.', 'Choose scale and quality (higher means sharper images).', 'Download the archive with all pages.'],
    },
    note: {
      ru: 'При сильном сжатии мелкий шрифт может стать менее читаемым — на текстовых документах берите качество поменьше, но не минимальное.',
      uz: 'Kuchli siqilishda soyabon shrift kamroq o‘qilishi mumkin — matnli hujjatlar uchun sifatni kam|zamanda kam, lekin minimal emasni tanlang.',
      en: 'Heavy compression can make small text less readable — on text documents, choose lower quality but not minimal.',
    },
  },
  {
    slug: 'jpg-to-pdf',
    title: { ru: 'JPG в PDF', uz: 'JPG ➜ PDF', en: 'JPG to PDF' },
    what: {
      ru: 'Собирает фотографии JPG и PNG в один PDF-файл. Каждая картинка становится отдельной страницей — удобно, чтобы отправить фото документов одним файлом.',
      uz: 'JPG va PNG fotoshoholarini bitta PDF faylga yig‘adi. Har bir rasm alohida sahifaga aylanadi — fotolarni bitta fayl bilan jo‘natish uchun qulay.',
      en: 'Assembles JPG and PNG photos into one PDF file. Each picture becomes a separate page — handy for sending document photos as a single file.',
    },
    steps: {
      ru: ['Добавьте одну или несколько фотографий в инструмент «JPG → PDF».', 'Выберите размер страницы и отступы, если нужно.', 'Скачайте готовый PDF — каждая фотография на своей странице.'],
      uz: ['Bir yahud o‘z vaqtida bir nechta fotoshoholarni «JPG ➜ PDF» vositasiga qo‘ying.', 'Agar kerak bo‘lsa, sahifa o‘lchami va chekkalarni tanlang.', 'Tayyor PDF ni yuklab oling — har bir rasm o‘z sahifasida.'],
      en: ['Add one or several photos to the “JPG to PDF” tool.', 'Choose page size and margins if needed.', 'Download the ready PDF — each photo on its own page.'],
    },
    note: {
      ru: 'Можно сразу добавить несколько файлов — каждый станет страницей. Размер страницы подбирайте под наиболее крупное фото.',
      uz: 'Bir vaqtning o‘zida bir nechta fayl qo‘shish mumkin — har biri sahifaga aylanadi. Sahifa o‘lchamini eng katta rasmga mosini tanlang.',
      en: 'You can add several files at once — each becomes a page. Match the page size to the largest photo.',
    },
  },
  {
    slug: 'compress-pdf',
    title: { ru: 'Сжатие PDF', uz: 'PDF ni siqish', en: 'Compress PDF' },
    what: {
      ru: 'Уменьшает вес PDF-файла за счёт пересборки страниц в JPEG. Текст остаётся читаемым, файл легче становится — удобно для отправки по почте или загрузки на сайты с лимитом веса.',
      uz: 'PDF fayl hukni sazrashtirish orqali yengillarashtiradi. Matn o‘qilmaydigan holatda qoladi, fayl yengillarashadi — pochta orqali yuborish yahud vazn cheklovlili saytlarga yuklash uchun qulay.',
      en: 'Reduces the weight of a PDF file by rebuilding the pages as JPEGs. Text stays readable and the file becomes lighter — handy for email or sites with size limits.',
    },
    steps: {
      ru: ['Добавьте PDF в инструмент «Сжать PDF».', 'Выберите масштаб и качество изображений.', 'Скачайте сжатый файл — его вес должен стать меньше.'],
      uz: ['PDF ni «PDF ni siqish» vositasiga qo‘ying.', 'Rasm masshtabi va sifatini tanlang.', 'Siqilgan faylni yuklab oling — uning vazni kamroq bo‘lishi kerak.'],
      en: ['Add a PDF to the “Compress PDF” tool.', 'Pick image scale and quality.', 'Download the compressed file — its size should be smaller.'],
    },
    note: {
      ru: 'Для документов с мелким шрифтом берите качество повыше — при минимальном сжатии текст может стать менее читаемым.',
      uz: 'So‘g‘ramik shriftli hujjatlar uchun sifatni yuqori tanlang — minimal siqilishda matn kamroq o‘qilishi mumkin.',
      en: 'For documents with small text, choose higher quality — at minimal compression the text can become less readable.',
    },
  },
  {
    slug: 'merge-pdf',
    title: { ru: 'Объединить PDF', uz: 'PDF ni birlashtirish', en: 'Merge PDF' },
    what: {
      ru: 'Собирает несколько PDF-файлов в один документ в выбранном порядке. Удобно, чтобы собрать куски документа, добавленные по отдельности.',
      uz: 'Bir nechta PDF fayllarini tanlang tug‘rida bitta hujjatga birlashtiradi. Qismlarini alohida qo‘shilgan hujjatni bitta qilish uchun foydali.',
      en: 'Combines several PDF files into one document in the order you choose. Handy for assembling a document made from separate pieces.',
    },
    steps: {
      ru: ['Добавьте несколько PDF в инструмент «Объединить PDF».', 'Перетащите их в нужном порядке — так они соберутся.', 'Скачайте один объединённый файл.'],
      uz: ['Bir nechta PDF ni «PDF ni birlashtirish» vositasiga qo‘ying.', 'Ulani kerakli tartibda tortishingiz mumkin — shunday yig‘iladi.', 'Bitta birlashtirilgan faylni yuklab oling.'],
      en: ['Add several PDFs to the “Merge PDF” tool.', 'Drag them into the right order — that’s how they will be combined.', 'Download the single merged file.'],
    },
    note: {
      ru: 'Порядок страниц в результате совпадает с порядком файлов — перетаскивайте их до с начала до конца.',
      uz: 'Natijadagi sahifalar tartibi fayllar tartibiga mos keladi — ularni boshidan oxirigacha torting.',
      en: 'The page order in the result matches the file order — drag them from first to last.',
    },
  },
  {
    slug: 'split-pdf',
    title: { ru: 'Разделить PDF', uz: 'PDF ni bo‘lish', en: 'Split PDF' },
    what: {
      ru: 'Разбивает один PDF на отдельные страницы или диапазоны страниц. Удобно, чтобы отправить коллеге только нужную часть документа.',
      uz: 'Bitta PDF ni alohida sahifalarga yahud sahifa diapazonalariga ajratadi. Foydali — nazarda tutilgan qismni faqat shu qismni yo‘naltirish uchun.',
      en: 'Splits one PDF into separate pages or page ranges. Handy for sending a colleague only the part of the document they need.',
    },
    steps: {
      ru: ['Добавьте PDF в инструмент «Разделить PDF».', 'Укажите, какие страницы нужны — отдельные или диапазон.', 'Скачайте результат — одно или несколько файлов.'],
      uz: ['PDF ni «PDF ni bo‘lish» vositasiga qo‘ying.', 'Qaysi sahifalar kerakligini ko‘rsating — alohida yahud diapazon.', 'Natijani yuklab oling — bitta yahud bir nechta fayl.'],
      en: ['Add a PDF to the “Split PDF” tool.', 'Say which pages you need — individual or a range.', 'Download the result — one or several files.'],
    },
    note: {
      ru: 'Можно выбрать несколько диапазонов — каждый станет отдельным файлом. Оригинал при этом не меняется.',
      uz: 'Bir nechta diapazonlarni tanlash mumkin — har biri alohida fayl bo‘ladi. Asl variant bunda o‘zgarmaydi.',
      en: 'You can choose several ranges — each becomes a separate file. The original is not changed.',
    },
  },
  {
    slug: 'pdf-editor',
    title: { ru: 'Редактор PDF', uz: 'PDF tahrirlovchi', en: 'PDF editor' },
    what: {
      ru: 'Открывает документ и даёт править его на месте: исправить текст, вставить фото или пустую страницу, стереть чужие комментарии и штампы. Исходный файл остаётся нетронутым, результат собирается в настоящий PDF.',
      uz: "Hujjatni ochib, joyida tahrirlash imkonini beradi: matnni tuzatish, rasm yoki bo'sh sahifa qo'shish, boshqalarning izoh va shtamplarini o'chirish. Asl fayl o'zgarmaydi.",
      en: 'Opens a document and lets you edit it in place: fix text, insert a photo or a blank page, erase other people’s comments and stamps. The source stays untouched and the result is a real PDF.',
    },
    steps: {
      ru: ['Откройте редактор и загрузите PDF.', 'Выберите текст, картинку или пометку и внесите правки.', 'Скачайте готовый PDF — страницы не пересжимаются.'],
      uz: ['Tahrirlovchini oching va PDF yuklang.', "Matn, rasm yoki izohni tanlab, o'zgartirish kiriting.", 'Tayyor PDF ni yuklab oling — sahifalar qayta siqilmaydi.'],
      en: ['Open the editor and upload a PDF.', 'Select text, a picture or a mark and make your edits.', 'Download the PDF — pages are not re-compressed.'],
    },
    note: {
      ru: 'В скане нет текстового слоя: «текст» там — картинка. Править его нельзя, но можно закрыть плашкой и написать поверх.',
      uz: "Skanda matn qatlami bo'lmaydi: u yerda «matn» — rasm. Uni tahrirlab bo'lmaydi, lekin plashka bilan yopib, ustiga yozish mumkin.",
      en: 'A scan has no text layer: its “text” is a picture. You cannot edit it, but you can cover it and type on top.',
    },
  },
  {
    slug: 'extract-images',
    title: { ru: 'Картинки из PDF', uz: 'PDF dan rasmlar', en: 'Images from PDF' },
    what: {
      ru: 'Достаёт все встроенные изображения из PDF в исходном разрешении и складывает в ZIP. Никаких скриншотов и пересжатия: ровно те файлы, что лежали внутри документа.',
      uz: "PDF ichidagi barcha rasmlarni asl o'lchamda chiqarib, ZIP ga yig'adi. Skrinshot va qayta siqish yo'q: hujjat ichida qanday bo'lsa, shunday.",
      en: 'Pulls every embedded image out of a PDF at its original resolution and packs them into a ZIP. No screenshots, no re-compression — exactly the files that were inside.',
    },
    steps: {
      ru: ['Добавьте PDF — один или сразу несколько.', 'Дождитесь поиска встроенных изображений.', 'Скачайте ZIP и заберите картинки.'],
      uz: ['PDF qo‘shing — bitta yoki bir nechta.', 'Ichki rasmlar qidirilishini kuting.', 'ZIP ni yuklab, rasmlarni oling.'],
      en: ['Add one PDF or several at once.', 'Wait while embedded images are collected.', 'Download the ZIP and take the images.'],
    },
    note: {
      ru: 'Если архив пустой, значит внутри только текст и векторная графика. Для изображений страниц используйте PDF → JPG.',
      uz: "Agar arxiv bo'sh bo'lsa, ichida faqat matn va vektor grafika bor. Sahifa rasmlari uchun PDF → JPG dan foydalaning.",
      en: 'An empty archive means the file holds only text and vector graphics. Use PDF to JPG for page images.',
    },
  },
]

const features = [
  {
    title: 'Ноль загрузок',
    text: 'Файл читается на вашем устройстве. Ни запросов на сервер, ни копий в чужом облаке — проверяется в devtools за пять секунд.',
    icon: (
      <path
        d="M12 3 5 6v5.5c0 4.3 2.8 8 7 9.5 4.2-1.5 7-5.2 7-9.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Текст и абзацы',
    text: 'Собираем строки по координатам, сохраняем размер шрифта, жирность и порядок — получается редактируемый документ, а не скриншот.',
    icon: (
      <path d="M6 5h12M6 9.5h12M6 14h8M6 18.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: 'Все картинки сразу',
    text: 'Достаём встроенные изображения в исходном разрешении и упаковываем в один ZIP. Не нужно ловить скриншоты с каждой страницы.',
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" />
        <path d="m5.5 17 4.2-4.4 3 3 2.4-2.3 3.4 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: 'Без регистрации',
    text: 'Ни аккаунта, ни почты, ни подписки. Открыли страницу — сделали дело — закрыли. Всё бесплатно и без водяных знаков.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8.5 12.2 2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: 'Без сервера',
    text: 'PDF разбирается браузером на вашем устройстве, результат скачивается сразу. Никаких очередей, подписок и водяных знаков на готовом файле.',
    icon: (
      <path d="M3 12h18M8 8l4-2 4 2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Редактор PDF',
    text: 'Правьте текст, вставляйте фото, добавляйте пустые листы, убирайте пометки — и скачивайте готовый документ прямо из браузера.',
    icon: (
      <path d="M5 5h14v14H5zM9 9h6v6H9zM5 5l5 5M19 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
]

const steps = [
  {
    number: '01',
    title: 'Добавьте PDF',
    text: 'Перетащите файл в окно или выберите с диска. Ничего не отправляется в интернет.',
  },
  {
    number: '02',
    title: 'Выберите результат',
    text: 'Word с текстом для правок, картинки архивом или отредактированный PDF.',
  },
  {
    number: '03',
    title: 'Забирайте файл',
    text: 'Готовый файл скачивается сразу. Никаких писем и ссылок, которые «сгорят».',
  },
]

const faq = [
  {
    q: 'Файлы правда никуда не загружаются?',
    a: 'Да. PDF разбирается библиотекой pdf.js внутри вкладки браузера, документ и отдельные страницы собираются на вашем устройстве. Сетевое соединение нужно только для загрузки самой страницы.',
  },
  {
    q: 'Что будет со сканами и фото-документами?',
    a: 'Если в PDF нет текстового слоя, страницы вставляются в Word как изображения — документ не превратится в пустой файл. Если текстовый слой есть, переносим именно текст.',
  },
  {
    q: 'Насколько точно сохраняется оформление?',
    a: 'Строки, размер шрифта, жирность, цвет и толщина линий таблиц, гиперссылки и порядок блоков переносятся. Универсально повторить любую полиграфию в Word невозможно, но мы стараемся.',
  },
  {
    q: 'Можно ли править PDF прямо здесь?',
    a: 'Да, в «Редакторе PDF»: добавьте текст, фото, пустой лист, уберите пометки и подписи-аннотации — и скачайте готовый файл.',
  },
  {
    q: 'Есть ли ограничение по размеру?',
    a: 'Жёсткого лимита нет — предел задаёт память вашего устройства. Для стабильной работы рекомендуем файлы до 100 МБ и пару сотен страниц.',
  },
  {
    q: 'Это бесплатно?',
    a: 'Полностью. Без регистрации, подписки, лимита файлов в день и водяных знаков на результате.',
  },
  {
    q: 'Как конвертировать PDF в Word онлайн бесплатно?',
    a: 'Откройте «Инструменты», выберите «PDF → Word» и добавьте файл. Текст, шрифты и таблицы переносятся в .docx, который сразу скачивается. Регистрация и оплата не нужны.',
  },
  {
    q: 'Как сжать PDF файл без потери качества?',
  a: 'В инструменте «Сжать PDF» выберите масштаб и качество: страницы пересобираются в JPEG, вес файла падает в разы, а текст остаётся читаемым. Для документов с мелким шрифтом берите качество повыше.',
  },
  {
    q: 'Как объединить PDF файлы в один?',
    a: 'Инструмент «Объединить PDF» принимает несколько файлов и собирает их в один документ в выбранном порядке. Всё происходит в браузере, файлы никуда не загружаются.',
  },
  {
    q: 'Как перевести фото JPG в PDF?',
    a: 'В «JPG → PDF» добавьте одну или несколько фотографий: каждая станет страницей PDF. Размер страницы и поля можно выбрать, готовый файл скачивается сразу.',
  },
  { q: 'Что такое Конгис Докс?',
    a: 'Congix Docs — бесплатный набор инструментов для работы с PDF прямо в браузере: конвертация, редактирование, работа со страницами и утилиты. Файлы не загружаются на сервер.',
  },
  { q: 'Можно ли редактировать PDF без регистрации?',
    a: 'Да. Редактор PDF, конвертация и все остальные инструменты доступны сразу после открытия страницы — регистрация и почта не требуются.',
  },
]

export function HomePage() {
  return (
    <>
      <FaqJsonLd items={faq} />

      <section className="hero">
        <div className="hero-copy">
          <span className="badge">
            <span className="badge-dot" />
            Работает локально — файлы остаются у вас
          </span>
          <h1>
            PDF → Word
            <br />
            <span className="grad">и все фото</span> из PDF
          </h1>
          <p className="lead">
            Конвертер и редактор, которые держат документы при себе: текст, размеры шрифта и
            изображения обрабатываются прямо в браузере. Бесплатно, без регистрации и без «загрузите
            файл на наш сервер».
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/tools">
              Открыть инструменты
              <Arrow />
            </Link>
            <Link className="btn btn-soft" to="/services">
              Что умеет сервис
            </Link>
          </div>
          <ul className="hero-points">
            <li>Word (.docx) с текстом</li>
            <li>Редактор PDF в браузере</li>
            <li>Ни байта на сервер</li>
          </ul>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-window">
            <div className="art-bar">
              <span className="art-dot" />
              <span className="art-dot" />
              <span className="art-dot" />
              <span className="art-url">congix docs · всё в браузере</span>
            </div>
            <div className="art-stage">
              <div className="art-card art-pdf">
                <span className="art-tag">PDF</span>
                <span className="art-line w-90" />
                <span className="art-line w-70" />
                <span className="art-line w-80" />
                <span className="art-line w-45" />
              </div>
              <div className="art-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h13m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="art-card art-doc">
                <span className="art-tag art-tag-alt">DOCX</span>
                <span className="art-line w-85" />
                <span className="art-line w-60" />
                <span className="art-line w-75" />
                <span className="art-line w-40" />
                <div className="art-photos">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <span className="art-chip chip-a">12 фото · ZIP</span>
              <span className="art-chip chip-b">текст редактируется</span>
            </div>
          </div>
          <span className="art-badge">
            <span className="art-badge-dot" />0 загрузок на сервер
          </span>
        </div>
      </section>

      <section className="tool" id="tools-preview">
        <div className="section-head">
          <span className="eyebrow">Инструменты</span>
          <h2>{catalog.length} инструментов для PDF</h2>
          <p className="section-sub">
            Редактор, страницы, конвертация и сжатие — всё в одном окне и без загрузки файлов на сервер.
          </p>
        </div>
        <Tool compact />
      </section>

      <section className="features" id="features">
        <div className="section-head">
          <span className="eyebrow">Почему Congix Docs</span>
          <h2>Инструмент, а не «сервис с подпиской»</h2>
          <p className="section-sub">
            Никаких аккаунтов, очередей и файлов, которые лежат на чужом диске месяцами.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature" key={feature.title}>
              <span className="feature-index">0{index + 1}</span>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  {feature.icon}
                </svg>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-head">
          <span className="eyebrow">Три шага</span>
          <h2>От PDF до результата — минута</h2>
        </div>
        <div className="step-grid">
          {steps.map((step) => (
            <article className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tool" id="instruments">
        <div className="section-head">
          <span className="eyebrow">Инструменты</span>
          <h2>Что делает каждый инструмент</h2>
          <p className="section-sub">
            Ниже — подробнее про каждый инструмент: что он делает, как им пользоваться и на что обратить внимание.
          </p>
        </div>
        <div className="instruments-list">
          {INSTRUMENTS.map((item) => (
            <article className="instrument" key={item.title.ru}>
              <div className="instrument-title">
                <h3>{item.title.ru}</h3>
                <div className="instrument-langs">
                  <span className="lang">UZ</span>
                  <span className="lang lang-en">EN</span>
                </div>
              </div>
              <div className="instrument-body">
                <p className="instrument-what">{item.what.ru}</p>
                <ol className="instrument-steps">
                  {item.steps.ru.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="instrument-note">{item.note.ru}</p>
              </div>
              <div className="instrument-action">
                <Link className="btn btn-soft" to={`/${item.slug}`}>
                  Инструкция
                  <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>Частые вопросы</h2>
        </div>
        <div className="faq-list">
          {faq.map((item) => (
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
          <h2>Держите документы при себе</h2>
          <p>Перетащите PDF и заберите Word или все картинки. Без регистрации и оплаты.</p>
          <div className="form-actions" style={{ justifyContent: 'center', gap: 12 }}>
            <Link className="btn btn-primary" to="/tools">
              Открыть инструменты
              <Arrow />
            </Link>
            <Link className="btn btn-soft" to="/services">
              Что умеет сервис
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
