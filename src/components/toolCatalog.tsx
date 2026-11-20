import { parsePageList, parseRangeGroups } from '../lib/pages'
import type { ToolSpec, Values } from './toolTypes'

/** pdf-lib и fontkit грузятся только когда пользователь запустил инструмент. */
const loadPdfEdit = () => import('../lib/pdfEdit')

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const pdfFile = async (file: File) => (await loadPdfEdit()).countPages(file)

export const catalog: ToolSpec[] = [
  {
    id: 'word',
    name: 'PDF → Word',
    hint: 'Готовый .docx с текстом, который можно править.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: '',
    builtin: 'word',
    icon: (
      <path
        {...stroke}
        d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h5M9.5 15.5h5"
      />
    ),
    options: [],
  },
  {
    id: 'images',
    name: 'Картинки из PDF',
    hint: 'Все растровые изображения одним ZIP-архивом.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: '',
    builtin: 'images',
    icon: <path {...stroke} d="M4 5h16v14H4zM4 15l4.5-4 3 3 3-2.5L20 16M9 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />,
    options: [],
  },
  {
    id: 'merge',
    name: 'Объединить PDF',
    hint: 'Склейте несколько документов в один — порядок как в списке.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: true,
    cta: 'Объединить в один PDF',
    icon: <path {...stroke} d="M8 3h8l3 3v9M8 3v4h4M4 9h9v12H4zM7 13h3M7 16.5h3" />,
    options: [],
    run: async (files, _values, onProgress) => (await loadPdfEdit()).mergePdfs(files, onProgress),
  },
  {
    id: 'split',
    name: 'Разделить PDF',
    hint: 'Каждый диапазон — отдельный файл, всё скачается архивом.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Разделить по диапазонам',
    icon: <path {...stroke} d="M12 3v6m0 6v6M4 12h16M9 6l3 3 3-3M9 18l3-3 3 3" />,
    options: [
      {
        kind: 'text',
        key: 'ranges',
        label: 'Диапазоны через запятую',
        initial: '1-2, 3-4',
        placeholder: '1-2, 3-4, 5',
      },
    ],
    run: async (files, values, onProgress) => {
      const total = await pdfFile(files[0])
      const groups = parseRangeGroups(values.ranges, total)
      return (await loadPdfEdit()).splitPdf(files[0], groups, onProgress)
    },
  },
  {
    id: 'extract',
    name: 'Извлечь страницы',
    hint: 'Оставьте нужные страницы и скачайте новый PDF.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Оставить эти страницы',
    icon: <path {...stroke} d="M4 8V5h5M20 8V5h-5M4 16v3h5M20 16v3h-5" />,
    options: [
      { kind: 'text', key: 'pages', label: 'Какие страницы оставить', initial: '1', placeholder: '1-3, 5' },
    ],
    run: async (files, values, onProgress) => {
      const total = await pdfFile(files[0])
      onProgress?.(1, 1)
      return (await loadPdfEdit()).keepPages(files[0], parsePageList(values.pages, total))
    },
  },
  {
    id: 'remove',
    name: 'Удалить страницы',
    hint: 'Выбросьте лишние страницы, остальные останутся на месте.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Удалить страницы',
    icon: <path {...stroke} d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M11 11v5M13 11v5" />,
    options: [
      { kind: 'text', key: 'pages', label: 'Какие страницы удалить', initial: '1', placeholder: '1, 4-6' },
    ],
    run: async (files, values, onProgress) => {
      const total = await pdfFile(files[0])
      onProgress?.(1, 1)
      return (await loadPdfEdit()).removePages(files[0], parsePageList(values.pages, total))
    },
  },
  {
    id: 'rotate',
    name: 'Повернуть PDF',
    hint: 'Разверните все страницы или только выбранные.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Повернуть',
    icon: <path {...stroke} d="M4 10a8 8 0 0 1 13.5-4.5L20 8M20 4v4h-4M20 14a8 8 0 0 1-13.5 4.5L4 16M4 20v-4h4" />,
    options: [
      {
        kind: 'select',
        key: 'angle',
        label: 'На сколько',
        initial: '90',
        choices: [
          { value: '90', label: '90° вправо' },
          { value: '180', label: '180°' },
          { value: '270', label: '90° влево' },
        ],
      },
      {
        kind: 'text',
        key: 'pages',
        label: 'Страницы (пусто — все)',
        initial: '',
        placeholder: 'все',
      },
    ],
    run: async (files, values, onProgress) => {
      const total = await pdfFile(files[0])
      const pages = values.pages.trim() ? parsePageList(values.pages, total) : null
      onProgress?.(1, 1)
      return (await loadPdfEdit()).rotatePdf(files[0], pages, Number(values.angle))
    },
  },
  {
    id: 'numbers',
    name: 'Номера страниц',
    hint: 'Аккуратная нумерация внизу или сверху документа.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Пронумеровать',
    icon: <path {...stroke} d="M5 4h14v16H5zM9 9h1v6M13 9h2l-2 6h2" />,
    options: [
      {
        kind: 'select',
        key: 'position',
        label: 'Где поставить',
        initial: 'bottom-center',
        choices: [
          { value: 'bottom-center', label: 'Снизу по центру' },
          { value: 'bottom-right', label: 'Снизу справа' },
          { value: 'top-right', label: 'Сверху справа' },
        ],
      },
      { kind: 'text', key: 'start', label: 'Начать с номера', initial: '1' },
    ],
    run: async (files, values, onProgress) => {
      onProgress?.(1, 1)
      return (await loadPdfEdit()).addPageNumbers(files[0], {
        position: values.position as 'bottom-center' | 'bottom-right' | 'top-right',
        start: Math.max(1, Number(values.start) || 1),
      })
    },
  },
  {
    id: 'watermark',
    name: 'Водяной знак',
    hint: 'Диагональная подпись поверх каждой страницы.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Поставить водяной знак',
    icon: <path {...stroke} d="M12 3 3 8l9 5 9-5-9-5ZM3 14l9 5 9-5" />,
    options: [
      { kind: 'text', key: 'text', label: 'Текст', initial: 'Черновик', placeholder: 'Черновик' },
      {
        kind: 'select',
        key: 'size',
        label: 'Размер',
        initial: '42',
        choices: [
          { value: '28', label: 'Мелкий' },
          { value: '42', label: 'Средний' },
          { value: '60', label: 'Крупный' },
        ],
      },
      {
        kind: 'select',
        key: 'opacity',
        label: 'Прозрачность',
        initial: '15',
        choices: [
          { value: '8', label: 'Еле заметный' },
          { value: '15', label: 'Средний' },
          { value: '30', label: 'Заметный' },
        ],
      },
    ],
    run: async (files, values, onProgress) => {
      onProgress?.(1, 1)
      return (await loadPdfEdit()).addWatermark(files[0], {
        text: values.text,
        size: Number(values.size),
        opacity: Number(values.opacity) / 100,
      })
    },
  },
  {
    id: 'images-to-pdf',
    name: 'JPG → PDF',
    hint: 'Фотографии и сканы в один аккуратный PDF.',
    accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
    acceptLabel: 'JPG или PNG',
    multiple: true,
    cta: 'Собрать PDF',
    icon: <path {...stroke} d="M4 5h16v14H4zM4 15l4.5-4 3 3 3-2.5L20 16M9 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />,
    options: [
      {
        kind: 'select',
        key: 'page',
        label: 'Размер страницы',
        initial: 'a4',
        choices: [
          { value: 'a4', label: 'A4' },
          { value: 'letter', label: 'Letter' },
          { value: 'fit', label: 'По размеру картинки' },
        ],
      },
    ],
    run: async (files, values, onProgress) =>
      (await loadPdfEdit()).imagesToPdf(
        files,
        { page: values.page as 'a4' | 'letter' | 'fit', margin: values.page === 'fit' ? 0 : 24 },
        onProgress,
      ),
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF → JPG',
    hint: 'Каждая страница отдельной картинкой, всё в ZIP.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Скачать картинки',
    icon: <path {...stroke} d="M7 3h7l4 4v14H7zM14 3v4h4M9.5 17l2-3 1.5 1.5 1.5-2 1.5 3.5" />,
    options: [
      {
        kind: 'select',
        key: 'scale',
        label: 'Качество',
        initial: '2',
        choices: [
          { value: '1.5', label: 'Компактно' },
          { value: '2', label: 'Обычное' },
          { value: '3', label: 'Максимум' },
        ],
      },
    ],
    run: async (files, values, onProgress) =>
      (await loadPdfEdit()).pdfToJpgs(files[0], { scale: Number(values.scale), quality: 0.92 }, onProgress),
  },
  {
    id: 'compress',
    name: 'Сжать PDF',
    hint: 'Уменьшает вес сканов и фото — страницы пересобираются в JPEG. Если итог выйдет больше исходника, отдадим оригинал без изменений.',
    accept: 'application/pdf,.pdf',
    acceptLabel: 'PDF',
    multiple: false,
    cta: 'Сжать документ',
    icon: <path {...stroke} d="M12 3v6m0 0 3-3m-3 3L9 6M12 21v-6m0 0 3 3m-3 3-3-3M4 4h16v16H4z" />,
    options: [
      {
        kind: 'select',
        key: 'mode',
        label: 'Насколько',
        initial: 'balanced',
        choices: [
          { value: 'screen', label: 'Сильно — для экрана' },
          { value: 'balanced', label: 'Средне' },
          { value: 'print', label: 'Бережно — для печати' },
        ],
      },
    ],
    run: async (files, values, onProgress) => {
      const preset =
        values.mode === 'screen'
          ? { scale: 1.3, quality: 0.55 }
          : values.mode === 'print'
            ? { scale: 2.2, quality: 0.85 }
            : { scale: 1.8, quality: 0.7 }
      return (await loadPdfEdit()).compressPdf(files[0], preset, onProgress)
    },
  },
]

export const initialValues = (values: Values, options: ToolSpec['options']): Values => {
  const result: Values = {}
  for (const option of options) result[option.key] = option.initial
  return { ...result, ...values }
}
