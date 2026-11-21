import { PromoBanner } from '../components/PromoBanner'
import { Arrow } from '../components/ui'
import { Link } from '../lib/router'

const services = [
  {
    title: 'Редактирование PDF',
    text: 'Правки прямо в документе, без пересборки и потери вёрстки.',
    items: [
      'Текст в любом месте страницы: размер, цвет, перенос строк',
      'Фото и логотип: вставить, перетащить, изменить ширину',
      'Пустой лист в нужном месте документа',
      'Стереть пометки, штампы и подписи-аннотации',
    ],
  },
  {
    title: 'Страницы',
    text: 'Собрать документ из нескольких или разложить один на части.',
    items: [
      'Объединить несколько PDF в один',
      'Разделить по диапазонам, извлечь или удалить страницы',
      'Переставить страницы в нужном порядке',
      'Повернуть и пронумеровать',
    ],
  },
  {
    title: 'Конвертация',
    text: 'Из PDF в редактируемые форматы и обратно.',
    items: [
      'PDF → Word с вёрсткой, таблицами и ссылками',
      'PDF → JPG постранично, PDF → одна длинная картинка',
      'PDF → текст (.txt) без потерь',
      'JPG → PDF и извлечение всех картинок архивом',
    ],
  },
  {
    title: 'Утилиты',
    text: 'Чтобы файл доходил по почте и открывался на любом телефоне.',
    items: [
      'Сжатие сканов и фото с выбором качества',
      'Водяной знак «Черновик» и другие надписи',
      'Готовые файлы скачиваются сразу, без писем',
    ],
  },
]

export function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Услуги</span>
        <h1>Что делает RekPDF</h1>
        <p>
          Четыре направления работы с документами. Всё выполняется в браузере: ни файла на сервер, ни
          очереди, ни регистрации.
        </p>
      </section>

      <div className="page-grid">
        {services.map((service) => (
          <article className="page-card" key={service.title}>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <ul className="page-list">
              {service.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="page-hero">
        <span className="eyebrow">Сколько стоит</span>
        <h1>Бесплатно и без подписки</h1>
        <p>
          Никаких тарифов, лимитов в день и водяных знаков. Профиль в сервисе — необязательный: он
          хранится в вашем браузере и нужен только для истории действий.
        </p>
      </section>

      <div className="page-grid">
        <article className="page-card">
          <h3>Всё включено</h3>
          <ul className="page-list">
            <li>16 инструментов без ограничений</li>
            <li>Локальная обработка — файлы не покидают устройство</li>
            <li>Пакетная конвертация нескольких PDF в ZIP</li>
            <li>Без рекламных вставок в результат</li>
          </ul>
          <div className="form-actions">
            <Link className="btn btn-primary" to="/tools">
              Открыть инструменты
              <Arrow />
            </Link>
          </div>
        </article>

        <article className="page-card">
          <h3>Кому подходит</h3>
          <ul className="page-list">
            <li>Студентам: конспекты, методички, домашка в Word</li>
            <li>Офису: счета, договоры, подписи и водяные знаки</li>
            <li>Фрилансерам: быстро поправить PDF для клиента</li>
            <li>Всем, кто не хочет отдавать документы на чужой сервер</li>
          </ul>
          <div className="form-actions">
            <Link className="btn btn-soft" to="/services">
              Задать вопрос
            </Link>
          </div>
        </article>
      </div>

      <div className="promo-slot">
        <PromoBanner slot="services-page" size="inline" />
      </div>

      <section className="cta">
        <div className="cta-inner">
          <h2>Попробуйте на своём документе</h2>
          <p>Открывается в браузере, ставится ноль загрузок. Аккаунт не нужен.</p>
          <Link className="btn btn-primary" to="/tools">
            Перейти к инструментам
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  )
}
