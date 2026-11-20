import { baseName, formatSize } from './download'
import { pagesLabel } from './pages'

/** Лимиты и мелочи пакетной конвертации — чистые функции, без DOM. */
export const MAX_FILE_MB = 100
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
export const MAX_PAGES = 200
export const MAX_BATCH_FILES = 10
/** Порог, после которого честно предупреждаем, что браузер призадумается. */
export const WARN_FILE_MB = 15
export const WARN_BYTES = WARN_FILE_MB * 1024 * 1024
export const WARN_PAGES = 40

export type FileInfo = { name: string; size: number; pages: number | null }

/** «1 файл» / «3 файла» / «7 файлов». */
export function filesLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} файл`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} файла`
  return `${count} файлов`
}

export function pagesLimitError(pages: number | null, total = MAX_PAGES): string | null {
  if (!pages || pages <= total) return null
  return `В документе ${pages} страниц — больше ${total} браузер не осилит. Разбейте PDF на части и обработайте по очереди.`
}

/** Первый файл, который не влезает в лимит страниц, — и понятная причина. */
export function batchPagesError(files: FileInfo[], total = MAX_PAGES): string | null {
  for (const file of files) {
    if (!file.pages || file.pages <= total) continue
    if (files.length === 1) return pagesLimitError(file.pages, total)
    return `«${file.name}» — ${file.pages} страниц, больше ${total} браузер не осилит. Уберите его из списка или разбейте на части.`
  }
  return null
}

/** Предупреждение перед тяжёлой конвертацией: null — можно работать молча. */
export function bigFileWarning(files: FileInfo[]): string | null {
  if (!files.length) return null

  const bytes = files.reduce((sum, file) => sum + file.size, 0)
  const pages = files.reduce((sum, file) => sum + (file.pages ?? 0), 0)
  if (bytes <= WARN_BYTES && pages <= WARN_PAGES) return null

  const subject = files.length > 1 ? `${filesLabel(files.length)} на ${formatSize(bytes)}` : `Файл на ${formatSize(bytes)}`
  const tail = pages > 0 ? ` и ${pagesLabel(pages)}` : ''
  return `${subject}${tail} — обработка займёт время, вкладка может подтормозить. Продолжаем?`
}

/** «Отчёт 2024.PDF» + docx → «Отчёт 2024.docx». */
export function outputName(fileName: string, extension: string): string {
  return `${baseName(fileName)}.${extension.replace(/^\./, '')}`
}

/** Не даёт двум одноимённым PDF затереть друг друга в архиве. */
export function uniqueName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name

  const dot = name.lastIndexOf('.')
  const stem = dot > 0 ? name.slice(0, dot) : name
  const extension = dot > 0 ? name.slice(dot) : ''

  for (let index = 2; index < 1000; index++) {
    const candidate = `${stem}-${index}${extension}`
    if (!taken.has(candidate)) return candidate
  }

  return `${stem}-${taken.size + 1}${extension}`
}

/** Имя общего архива: «Счета-word.zip». */
export function zipName(fileName: string, kind: string): string {
  return `${baseName(fileName)}-${kind}.zip`
}

export function isAbortError(error: unknown): boolean {
  return !!error && typeof error === 'object' && (error as { name?: string }).name === 'AbortError'
}

/** Бросает AbortError, если пользователь нажал «Отменить». */
export function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return
  throw new DOMException('Обработка отменена', 'AbortError')
}
