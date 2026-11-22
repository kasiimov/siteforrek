import { Packer, Document, PageBreak, Paragraph, TextRun } from 'docx'
import type { EditorPage } from './docEditor'

/** Экспорт того, что собрано в редакторе: Word, текст и чистый список строк. */

function hex(color: string): string {
  return /^[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : '111111'
}

function textObjects(page: EditorPage) {
  return page.objects
    .filter((object): object is Extract<typeof object, { kind: 'text' }> => object.kind === 'text')
    .filter((object) => object.text.trim().length > 0)
    .sort((a, b) => a.y - b.y || a.x - b.x)
}

export function pagesToText(pages: EditorPage[]): Blob {
  const body = pages
    .map((page) => textObjects(page).map((object) => object.text).join('\n\n'))
    .filter(Boolean)
    .join('\n\n')

  return new Blob([body || 'Документ пуст'], { type: 'text/plain;charset=utf-8' })
}

/** Собирает DOCX из текстовых блоков: размер и цвет сохраняются. */
export async function pagesToDocx(pages: EditorPage[]): Promise<Blob> {
  const children: Paragraph[] = []

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) children.push(new Paragraph({ children: [new PageBreak()] }))

    const objects = textObjects(page)
    if (!objects.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
      return
    }

    for (const object of objects) {
      for (const line of object.text.split('\n')) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: line,
                size: Math.max(12, Math.round(object.size * 2)),
                color: hex(object.color),
                font: 'Arial',
              }),
            ],
          }),
        )
      }
    }
  })

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBlob(doc)
}
