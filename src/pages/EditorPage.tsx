import { PdfRedactor } from '../components/PdfRedactor'

/** Редактор живёт отдельной страницей: своя шапка, панели и статус-бар, без обвязки сайта. */
export function EditorPage() {
  return <PdfRedactor />
}
