import { Arrow } from '../components/ui'
import { Link, ROUTES } from '../lib/router'

const SECTIONS: Record<string, { patience: string; ask: string[]; reply: string }> = {
  ru: {
    patience: 'Уважаемое отношение к времени и вопросам — ответим на всё, что связано с сервисом.',
    ask: [
      'Вопросы по работе инструментов и обработке файлов.',
      'Ошибки или неточности в конвертации, редактировании или страницах.',
      'Предложения и пожелания по инструментам.',
      'Вопросы безопасности и обработки файлов.',
    ],
    reply: 'Ответим на все письма и постараемся помочь по существу. Технические вопросы разбираем быстрее — прикрепите пример файла (без личных данных) или опишите шаги, при которых возникла ошибка.',
  },
  uz: {
    patience: 'Vaqt va savollarga hurmatli munosabat — xizmat bilan bog‘liq hamma narsa savollariga javob beramiz.',
    ask: [
      'Vositalarning ishi va fayllarning qayta ishlanishi haqida savollar.',
      'Xato yahud noaniqliklar kon-versiyada, tahrirlashda yahud sahifalarda.',
      'Vositalar bo‘yicha takliflar va istaklar.',
      'Xavfsizlik va fayllarning qayta ishlanishi haqida savollar.',
    ],
    reply: 'Barcha xatlarga javob beramiz va mazmunan yordam berishga harakat qilamiz. Texnik savollar tezroq yechiladi — namuna faylni (shaxsiy ma’lumotlar bo‘lmagan) yuklang yahud xatoga olib kelgan qadamlarni tavsiflang.',
  },
  en: {
    patience: 'Respect for your time and questions — we answer everything that is related to the service.',
    ask: [
      'Questions about how the tools work and how files are processed.',
      'Errors or inaccuracies in conversion, editing or pages.',
      'Suggestions and wishes for the tools.',
      'Questions about security and file handling.',
    ],
    reply: 'We answer all emails and try to help in substance. Technical questions are resolved faster — attach a sample file (without personal data) or describe the steps that led to the error.',
  },
}

export function ContactsPage({ lang }: { lang: 'ru' | 'uz' | 'en' }) {
  const body = SECTIONS[lang]
  const emailLink = 'mailto:likedissdei@gmail.com'
  const emailText =
    lang === 'ru'
      ? 'likedissdei@gmail.com'
      : lang === 'uz'
      ? 'likedissdei@gmail.com'
      : 'likedissdei@gmail.com'

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Контакты</span>
        <h1>
          {lang === 'ru' ? 'Контакты' : lang === 'uz' ? 'Bog‘lanish' : 'Contacts'}
        </h1>
        <p>
          {lang === 'ru'
            ? 'Рабочая почта и информация по сервису, инструментам и обработке файлов.'
            : lang === 'uz'
            ? ' Ishtirok etiladigan pochta va xizmat, vositalar va fayllarning qayta ishlanishi haqida ma’lumot.'
            : 'Working email and information about the service, tools and file processing.'}
        </p>
      </section>

      <section className="tool">
        <div className="stack">
          <div className="page-card">
            <h3>{lang === 'ru' ? 'Рабочая почта' : lang === 'uz' ? ' Ishtirok etiladigan pochta' : 'Working email'}</h3>
            <p>
              {lang === 'ru'
                ? 'Вопросы по сервису, инструментам и обработке файлов сюда:'
                : lang === 'uz'
                ? 'Xizmat, vositalar va fayllarning qayta ishlanishi haqida savollar bu yerga:'
                : 'Questions about the service, tools and file processing go here:'}
            </p>
            <a className="btn btn-primary" href={emailLink}>
              {emailText}
            </a>
            <p className="panel-note" style={{ marginTop: 12 }}>
              {lang === 'ru'
                ? 'Это реальный ящик разработчика — письма читаются и отвечаются.'
                : lang === 'uz'
                ? 'Bu ruster muharriri hujjati — xatlar o‘qiladi va javob beriladi.'
                : 'This is the developer’s real mailbox — emails are read and replied to.'}
            </p>
          </div>

          <div className="page-card">
            <h3>{lang === 'ru' ? 'О чём можно написать' : lang === 'uz' ? 'Nima haqida yozish mumkin' : 'What you can write about'}</h3>
            <ul className="page-list">
              {body.ask.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="page-card">
            <h3>{lang === 'ru' ? 'Как ответят' : lang === 'uz' ? 'Javob qanday beriladi' : 'How we reply'}</h3>
            <p className="panel-note">{body.reply}</p>
          </div>

          <div className="page-card">
            <h3>{lang === 'ru' ? 'Сервис не требует регистрации' : lang === 'uz' ? 'Xizmat ro‘yxatdan o‘tirishni talab qilmaydi' : 'The service does not require sign-up'}</h3>
            <p>
              {lang === 'ru'
                ? 'Контакты нужны только для вопросов и связи — войти, зарегистрироваться или создавать профиль не обязательно. Инструменты работают сразу после открытия страницы.'
                : lang === 'uz'
                ? 'Kontaktlar faqat savollar va aloqa uchinda kerak — kirmaslik, ro‘yxatdan o‘tmagan yahud profil yaratmaslik shart emas. Vositalar sahifa ochilganidan keyin darhol ishlaydi.'
                : 'Contacts are needed only for questions and communication — you do not have to sign in, register or create a profile. The tools work right after opening the page.'}
            </p>
            <div className="form-actions" style={{ marginTop: 14 }}>
              <Link className="btn btn-soft" to={ROUTES.tools}>
                {lang === 'ru' ? 'Открыть инструменты' : lang === 'uz' ? 'Vositalarni ochish' : 'Open tools'}
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="section-head">
          <span className="eyebrow">Политика</span>
          <h2>
            {lang === 'ru' ? 'Отношение к обращениям' : lang === 'uz' ? 'Holatlarni qanday qabul qilamiz' : 'How we treat messages'}
          </h2>
        </div>
        <div className="faq-list">
          <details className="faq-item" open>
            <summary>
              <span>{lang === 'ru' ? body.patience : lang === 'uz' ? body.patience : body.patience}</span>
              <span className="faq-plus" aria-hidden="true" />
            </summary>
          </details>
        </div>
      </section>

      <footer className="page-hero">
        <span className="eyebrow">Связь</span>
        <div className="form-actions">
          <a className="btn btn-soft" href={emailLink}>
            {emailText}
          </a>
          <Link className="btn btn-quiet" to="/">
            {lang === 'ru' ? 'На главную' : lang === 'uz' ? 'Bosh sahifaga' : 'Home'}
          </Link>
        </div>
        <p className="panel-note" style={{ marginTop: 14 }}>
          {lang === 'ru'
            ? 'Все вопросы — в почту выше. Мы отвечаем и стараемся помочь по существу.'
            : lang === 'uz'
            ? 'Barcha savollar — yuqoridagi pochta. Biz javob beramiz va mazmunan yordam berishga harakat qilamiz.'
            : 'All questions — to the email above. We reply and try to help in substance.'}
        </p>
      </footer>
    </>
  )
}
