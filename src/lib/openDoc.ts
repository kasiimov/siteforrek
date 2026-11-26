import { fitImage } from './docEditor'
import type { EditorPage, ImageObject, TextObject } from './docEditor'

/** Открытие документов в редактор: PDF, DOCX, Markdown, TXT и фото документа. */

export const A4_BOX = { width: 595.28, height: 841.89 }

export type DocKind = 'pdf' | 'docx' | 'md' | 'txt' | 'image'

export const DOC_LABELS: Record<DocKind, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  md: 'MD',
  txt: 'TXT',
  image: 'ФОТО',
}

export const OPEN_ACCEPT = '.pdf,.docx,.md,.markdown,.txt,.png,.jpg,.jpeg,.webp'

export function detectKind(file: File): DocKind | null {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) return 'docx'
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md'
  if (name.endsWith('.txt') || file.type.startsWith('text/')) return 'txt'
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(name)) return 'image'
  return null
}

export function unsupportedMessage(name: string): string {
  if (/\.doc$/i.test(name)) {
    return 'Старый формат .doc не открывается — сохраните файл как .docx в Word или Google Docs.'
  }
  return `«${name}» не открывается. Подойдут PDF, DOCX, MD, TXT, JPG и PNG.`
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
}

async function readDocx(file: File): Promise<string> {
  // jszip нужен только для DOCX — не грузим его вместе с редактором.
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('Внутри DOCX нет документа — файл повреждён или это не Word.')

  const xml = await entry.async('string')
  const text = xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')

  return decodeEntities(text).replace(/\n{3,}/g, '\n\n').trim()
}

/** Markdown без разметки: заголовки, списки и ссылки читаемы в обычном тексте. */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?/g, ''))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(`{1,2})(.*?)\1/g, '$2')
    .replace(/^\s*([-*_]\s*){3,}$/gm, '— — —')
    .trim()
}

export async function readDocumentText(file: File, kind: DocKind): Promise<string> {
  if (kind === 'docx') return readDocx(file)
  const text = await new Response(file).text()
  return kind === 'md' ? cleanMarkdown(text) : text
}

const TEXT_SIZE = 12
const LINE_HEIGHT = 18
const MARGIN = 56
const MAX_PAGES = 300

function wrapParagraph(paragraph: string, perLine: number): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    if (!line) {
      line = word
      continue
    }
    if ((line + ' ' + word).length <= perLine) {
      line += ' ' + word
      continue
    }
    lines.push(line)
    line = word
  }
  if (line) lines.push(line)
  return lines
}

/** Текст документа → страницы A4 с обычными текстовыми блоками, которые можно править. */
export function textToPages(text: string, box = A4_BOX): EditorPage[] {
  const usableWidth = box.width - MARGIN * 2
  const perLine = Math.max(16, Math.floor(usableWidth / (TEXT_SIZE * 0.52)))
  const perPage = Math.max(10, Math.floor((box.height - MARGIN * 2) / LINE_HEIGHT))

  const lines: string[] = []
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    lines.push(...wrapParagraph(paragraph, perLine))
  }

  const pages: EditorPage[] = []
  for (let start = 0; start < lines.length && pages.length < MAX_PAGES; start += perPage) {
    const chunk = lines.slice(start, start + perPage)
    const object: TextObject = {
      kind: 'text',
      id: `text-${pages.length}`,
      x: MARGIN,
      y: MARGIN,
      text: chunk.join('\n').replace(/\s+$/, ''),
      size: TEXT_SIZE,
      color: '111111',
      width: usableWidth,
    }
    pages.push({ source: null, box: { ...box }, objects: [object] })
  }

  if (!pages.length) {
    pages.push({ source: null, box: { ...box }, objects: [] })
  }

  return pages
}

/** Фото документа становится страницей: сверху можно сразу распознать текст. */
export function imageToPage(
  data: Uint8Array,
  type: 'png' | 'jpg',
  bitmapWidth: number,
  bitmapHeight: number,
  box = A4_BOX,
): EditorPage {
  const size = fitImage(box, bitmapWidth, bitmapHeight, 0.94)
  const object: ImageObject = {
    kind: 'image',
    id: `image-${Date.now()}`,
    x: Math.round((box.width - size.width) / 2),
    y: Math.round((box.height - size.height) / 2),
    width: size.width,
    height: size.height,
    data,
    type,
    // Это фон страницы: пятна и правки должны ложиться сверху него.
    base: true,
  }
  return { source: null, box: { ...box }, objects: [object] }
}
