import { Link, ROUTES } from '../lib/router'
import type { SeoLang } from '../lib/seoToolPages'

type TermsCopy = {
  title: string
  updated: string
  intro: string
  sections: { title: string; text: string[] }[]
  contactLabel: string
  back: string
}

const CONTENT: Record<SeoLang, TermsCopy> = {
  ru: {
    title: 'Условия использования',
    updated: 'Обновлено 26 ноября 2026 года',
    intro:
      'Congix Docs — бесплатный веб-сервис для работы с PDF прямо в браузере. Ниже — простые правила, по которым он работает. Пользуясь сайтом, вы с ними соглашаетесь.',
    sections: [
      {
        title: '1. Что делает сервис',
        text: [
          'Congix Docs конвертирует PDF в Word, сжимает, объединяет, разделяет и поворачивает файлы, переводит JPG в PDF и обратно, а также открывает встроенный редактор PDF. Все инструменты бесплатны, регистрация и оплата не требуются.',
          'Сайт не обещает гарантированный результат: сложные вёрстки, сканы низкого качества и защищённые паролем файлы могут обработаться неточно. Перед важными документами сохраняйте оригинал и проверяйте готовый файл.',
        ],
      },
      {
        title: '2. Файлы и данные',
        text: [
          'Документы обрабатываются на вашем устройстве и не загружаются на сервер — подробности в политике конфиденциальности.',
          'Ответственность за содержание документов и за наличие резервной копии лежит на вас. Мы не имеем доступа к файлам и не можем их восстановить.',
        ],
      },
      {
        title: '3. Допустимое использование',
        text: [
          'Сервисом можно пользоваться только для законных целей и только с документами, на которые у вас есть права. Нельзя обрабатывать материалы, нарушающие закон или права третьих лиц.',
          'Запрещено нагружать сайт автоматическими запросами, пытаться обойти ограничения, вмешиваться в работу сервиса или использовать его для рассылки вредоносных файлов.',
        ],
      },
      {
        title: '4. Внешние ссылки',
        text: [
          'На страницах могут быть ссылки на сторонние сайты — у них свои правила и политика конфиденциальности. Мы не отвечаем за их содержание и работу.',
        ],
      },
      {
        title: '5. Отказ от гарантий и ответственность',
        text: [
          'Сервис предоставляется «как есть», без гарантий пригодности для конкретной задачи. В пределах, разрешённых законом, мы не отвечаем за потерю данных, упущенную выгоду или иной ущерб, связанный с использованием сайта.',
          'Если инструмент не сработал, напишите на почту ниже — мы разберёмся и по возможности исправим.',
        ],
      },
      {
        title: '6. Изменения условий',
        text: [
          'Условия могут обновляться вместе с сервисом; актуальная версия всегда на этой странице с датой обновления. Продолжая пользоваться сайтом после изменений, вы принимаете новую версию.',
        ],
      },
      {
        title: '7. Контакты',
        text: [
          'Вопросы по работе сервиса и этим условиям: likedissdei@gmail.com. Отвечаем на письма и стараемся помочь по существу.',
        ],
      },
    ],
    contactLabel: 'Написать на likedissdei@gmail.com',
    back: 'На главную',
  },
  uz: {
    title: "Foydalanish shartlari",
    updated: '2026-yil 26-noyabrda yangilandi',
    intro:
      "Congix Docs — PDF bilan brauzerda ishlash uchun bepul veb-xizmat. Quyida u qanday qoidalar asosida ishlashi oddiy tilda yozilgan. Saytdan foydalanib, siz ularga rozilik bildirasiz.",
    sections: [
      {
        title: '1. Xizmat nima qiladi',
        text: [
          "Congix Docs PDF ni Word ga o'giradi, fayllarni siqadi, birlashtiradi, bo'ladi va aylantiradi, JPG ni PDF ga va teskarisiga o'giradi, shuningdek ichki PDF muharririni ochadi. Barcha vositalar bepul, ro'yxatdan o'tish va to'lov talab qilinmaydi.",
          "Sayt kafolatlangan natija va'da qilmaydi: murakkab sahifa tuzilishi, sifatsiz skanlar va parol bilan himoyalangan fayllar noto'g'ri qayta ishlanishi mumkin. Muhim hujjatlardan oldin asl nusxani saqlang va tayyor faylni tekshiring.",
        ],
      },
      {
        title: "2. Fayllar va ma'lumotlar",
        text: [
          "Hujjatlar qurilmangizda qayta ishlanadi va serverga yuklanmaydi — tafsilotlar maxfiylik siyosatida.",
          "Hujjat mazmuni va zaxira nusxasi uchun javobgarlik sizda. Biz fayllarga kira olmaymiz va ularni tiklay olmaymiz.",
        ],
      },
      {
        title: '3. Ruxsat etilgan foydalanish',
        text: [
          "Xizmatdan faqat qonuniy maqsadlarda va huquqlaringiz bo'lgan hujjatlar bilan foydalanish mumkin. Qonunni yoki uchinchi shaxslar huquqlarini buzuvchi materiallarni qayta ishlash mumkin emas.",
          "Saytga avtomatik so'rovlar yuborish, cheklovlarni chetlab o'tish, xizmat ishiga aralashish yoki zararli fayllarni tarqatish taqiqlanadi.",
        ],
      },
      {
        title: '4. Tashqi havolalar',
        text: [
          "Sahifalarda uchinchi saytlarga havolalar bo'lishi mumkin: ularning o'z qoidalari va maxfiylik siyosati mavjud, biz ularning mazmuni va ishi uchun javob bermaymiz.",
        ],
      },
      {
        title: '5. Kafolatlar va javobgarlik',
        text: [
          "Xizmat «bor holicha» taqdim etiladi, muayyan vazifa uchun yaroqliligi kafolatlanmaydi. Qonun ruxsat bergan doirada biz saytdan foydalanish bilan bog'liq ma'lumot yo'qolishi, foyda yo'qotilishi yoki boshqa zarar uchun javob bermaymiz.",
          "Agar vosita ishlamasa, quyidagi manzilga yozing — ko'rib chiqamiz va imkon bo'lsa tuzatamiz.",
        ],
      },
      {
        title: "6. Shartlarning o'zgarishi",
        text: [
          "Shartlar xizmat bilan birga yangilanishi mumkin; joriy versiya har doim shu sahifada yangilanish sanasi bilan turadi. O'zgarishlardan keyin saytdan foydalanishni davom ettirsangiz, yangi versiyani qabul qilgan hisoblanasiz.",
        ],
      },
      {
        title: "7. Bog'lanish",
        text: [
          "Xizmat va ushbu shartlar bo'yicha savollar: likedissdei@gmail.com. Xatlarga javob beramiz va mazmunan yordam berishga harakat qilamiz.",
        ],
      },
    ],
    contactLabel: 'likedissdei@gmail.com ga yozish',
    back: 'Bosh sahifa',
  },
  en: {
    title: 'Terms of use',
    updated: 'Updated on 26 November 2026',
    intro:
      'Congix Docs is a free web service for working with PDF files directly in your browser. These are the simple rules it runs by. By using the site you agree to them.',
    sections: [
      {
        title: '1. What the service does',
        text: [
          'Congix Docs converts PDF to Word, compresses, merges, splits and rotates files, converts JPG to PDF and back, and opens its built-in PDF editor. All tools are free; no registration or payment is required.',
          'The site does not promise a guaranteed result: complex layouts, low-quality scans and password-protected files may be processed inaccurately. Keep the original and check the output before using important documents.',
        ],
      },
      {
        title: '2. Files and data',
        text: [
          'Documents are processed on your device and are never uploaded to our server — see the privacy policy for details.',
          'You are responsible for the content of your documents and for keeping a backup copy. We have no access to your files and cannot restore them.',
        ],
      },
      {
        title: '3. Acceptable use',
        text: [
          'Use the service only for lawful purposes and only with documents you have the rights to. Do not process material that violates the law or the rights of third parties.',
          'Do not flood the site with automated requests, attempt to bypass limits, interfere with the service, or use it to distribute malicious files.',
        ],
      },
      {
        title: '4. External links',
        text: [
          'Pages may contain links to third-party sites with their own terms and privacy policies; we are not responsible for their content or operation.',
        ],
      },
      {
        title: '5. Disclaimer and liability',
        text: [
          'The service is provided “as is”, without warranty of fitness for a particular purpose. To the extent permitted by law, we are not liable for data loss, lost profits or other damage related to the use of the site.',
          'If a tool fails, email us at the address below — we will look into it and fix it where possible.',
        ],
      },
      {
        title: '6. Changes to these terms',
        text: [
          'These terms may be updated together with the service; the current version is always on this page with an update date. Continuing to use the site after changes means you accept the new version.',
        ],
      },
      {
        title: '7. Contact',
        text: [
          'Questions about the service and these terms: likedissdei@gmail.com. We reply to emails and try to help in substance.',
        ],
      },
    ],
    contactLabel: 'Email likedissdei@gmail.com',
    back: 'Home',
  },
}

export function TermsPage({ lang }: { lang: SeoLang }) {
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
