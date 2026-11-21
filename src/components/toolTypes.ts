import type { ReactNode } from 'react'
import type { Output } from '../lib/download'

export type OptionSpec =
  | {
      kind: 'text'
      key: string
      label: string
      initial: string
      placeholder?: string
    }
  | {
      kind: 'select'
      key: string
      label: string
      initial: string
      choices: { value: string; label: string }[]
    }

export type Values = Record<string, string>
export type RunProgress = (done: number, total: number) => void

/** Результат инструмента: файлы и необязательное пояснение к ним. */
export type RunResult = { outputs: Output[]; note?: string }

/** Разделы каталога: сгруппированные по смыслу инструменты. */
export type ToolGroup = 'edit' | 'pages' | 'convert' | 'utility'

export const GROUP_LABELS: Record<ToolGroup, { title: string; note: string }> = {
  edit: { title: 'Редактировать', note: 'Правки прямо в документе — текст, фото, листы, пометки' },
  pages: { title: 'Страницы', note: 'Собрать, разложить, повернуть и пронумеровать' },
  convert: { title: 'Конвертация', note: 'PDF → Word, картинки, текст и обратно' },
  utility: { title: 'Утилиты', note: 'Сжать, чтобы файл доходил и открывался' },
}

export type ToolSpec = {
  id: string
  group: ToolGroup
  name: string
  hint: string
  accept: string
  acceptLabel: string
  multiple: boolean
  cta: string
  icon: ReactNode
  options: OptionSpec[]
  builtin?: 'word' | 'images' | 'redactor'
  run?: (files: File[], values: Values, onProgress: RunProgress) => Promise<Output[] | RunResult>
}
