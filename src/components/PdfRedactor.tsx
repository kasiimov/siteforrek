import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { openPdf } from '../lib/pdf'
import { baseName, download, formatSize } from '../lib/download'
import { addHistory } from '../lib/profile'
import { track } from '../lib/analytics'
import { Link, ROUTES } from '../lib/router'
import {
  TEXT_COLORS,
  clampPosition,
  composePdf,
  fitImage,
  insertBlankPage,
  objectSize,
} from '../lib/docEditor'
import type { CoverRect, EditorObject, EditorPage, ImageObject, TextObject, ToPdfPoint } from '../lib/docEditor'
import { readPageRuns, renderPageRaster } from '../lib/pdfText'
import type { TextRun } from '../lib/pdfText'
import { OCR_LANGS, recognizeImage } from '../lib/ocr'
import type { OcrLang } from '../lib/ocr'
import {
  A4_BOX,
  detectKind,
  DOC_LABELS,
  OPEN_ACCEPT,
  imageToPage,
  readDocumentText,
  textToPages,
  unsupportedMessage,
} from '../lib/openDoc'
import type { DocKind } from '../lib/openDoc'
import { pagesToDocx, pagesToText } from '../lib/exportDoc'
import { AdMini } from './Ads'

type Tool = 'select' | 'text' | 'erase'
type TextMode = 'flow' | 'free'
type Message = { tone: 'ok' | 'error' | 'info'; text: string }

const MAX_FILE_MB = 100
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

const HINTS: Record<Tool, string> = {
  select: 'Щёлкните объект, чтобы выбрать. Тащите мышкой или пальцем, а за уголок меняйте размер.',
  text: 'Нажмите на готовую строку — её текст откроется справа и его можно править. Пустое место — новый текст.',
  erase: 'Проведите по странице рамкой — эта область станет белой. Так убирают старый текст, фото и штампы.',
}

const IMAGE_HINT = 'Фото встанет на страницу. Тащите его мышкой или пальцем, а за уголок справа снизу меняйте размер.'

const TEXT_HINTS: Record<TextMode, string> = {
  flow: 'По линии: щёлкните строку — правите её как в Word, текст переносится по ширине полей. Щелчок по пустому месту — новый абзац под этой строкой.',
  free: 'Свободно: текст встаёт точно туда, куда щёлкнули, и его можно перетаскивать по странице.',
}

/** Поля абзаца для режима «по линии»: текст идёт от края до края, как в Word. */
function pageMargin(width: number): number {
  return Math.min(56, Math.max(16, Math.round(width * 0.09)))
}

const uid = () => Math.random().toString(36).slice(2, 10)

const iconStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...iconStroke} d={d} />
    </svg>
  )
}

const ICONS = {
  cursor: 'M6 4l12 7.5-5.2 1.3 3 5.2-2.2 1.3-3-5.3L6 18z',
  text: 'M5 6h14M9 6v12M15 6v12',
  image: 'M4 5h16v14H4zM4 15l4.5-4 3 3 3-2.5L20 16M9 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  erase: 'M7 17 4 14l9-9 5 5-6 6M9 21h11',
  page: 'M7 3h10v18H7zM10 8h4M10 12h4',
  copy: 'M9 9h11v12H9zM5 15H4V3h11v1',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  undo: 'M9 7 4 12l5 5M4 12h9a6 6 0 0 1 6 6',
  redo: 'M15 7l5 5-5 5M20 12h-9a6 6 0 0 0-6 6',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M5 20h14',
  folder: 'M3 6h6l2 2h9v11H3zM3 10h17',
  panel: 'M4 5h16v14H4zM14 5v14',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  close: 'M6 6l12 12M18 6 6 18',
  pages: 'M8 3h8v4H8zM6 7h12v14H6zM9 11h6M9 15h6',
  scan: 'M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3M7 12h10',
  word: 'M4 4h16v16H4zM8 8l1.4 8L12 9l2.6 7L16 8',
  txt: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
}

export function PdfRedactor() {
  const [kind, setKind] = useState<DocKind>('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [docName, setDocName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pages, setPages] = useState<EditorPage[]>([])
  const [index, setIndex] = useState(0)
  const [fitScale, setFitScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<Tool>('select')
  const [textMode, setTextMode] = useState<TextMode>('flow')
  const [selected, setSelected] = useState<string | null>(null)
  const [eraseAnnotations, setEraseAnnotations] = useState(false)
  const [history, setHistory] = useState<EditorPage[][]>([])
  const [future, setFuture] = useState<EditorPage[][]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)
  const [panelOpen, setPanelOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth > 900))
  const [thumbsOpen, setThumbsOpen] = useState(true)
  const [runs, setRuns] = useState<Record<number, TextRun[]>>({})
  const [ocrLang, setOcrLang] = useState<OcrLang>('rus+eng')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [focusToken, setFocusToken] = useState(0)
  const [erasePreview, setErasePreview] = useState<CoverRect | null>(null)

  const docRef = useRef<PDFDocumentProxy | null>(null)
  const pageCache = useRef(new Map<number, PDFPageProxy>())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pagesRef = useRef<EditorPage[]>([])
  const runsRef = useRef<Record<number, TextRun[]>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const stageWrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const resizeRef = useRef<{ id: string; startX: number; originWidth: number; ratio: number; moved: boolean } | null>(null)
  const eraseRef = useRef<{ x: number; y: number } | null>(null)
  const indexRef = useRef(0)
  const ocrBusyRef = useRef(false)
  const recognizeRef = useRef<(target?: EditorPage, targetIndex?: number) => Promise<void>>(async () => {})

  pagesRef.current = pages
  indexRef.current = index
  ocrBusyRef.current = ocrBusy

  const page = pages[index] ?? null
  const boxWidth = page?.box.width ?? 0
  const scale = fitScale * zoom
  const selectedObject = page?.objects.find((object) => object.id === selected) ?? null
  const zoomPercent = Math.round(zoom * 100)
  const pageRuns = page && page.source !== null ? (runs[page.source] ?? []) : []
  const covers = page?.covers ?? []
  const textCount = page ? page.objects.filter((object) => object.kind === 'text').length : 0
  const imageCount = page ? page.objects.filter((object) => object.kind === 'image').length : 0
  const hasDoc = Boolean(page)

  useEffect(() => {
    return () => {
      void docRef.current?.destroy()
    }
  }, [])

  const loadRuns = useCallback(async (model: EditorPage) => {
    if (model.source === null || runsRef.current[model.source]) return
    const proxy =
      pageCache.current.get(model.source) ??
      (docRef.current ? await docRef.current.getPage(model.source + 1) : null)
    if (!proxy) return
    pageCache.current.set(model.source, proxy)
    try {
      const list = await readPageRuns(proxy)
      if (runsRef.current[model.source]) return
      runsRef.current = { ...runsRef.current, [model.source]: list }
      setRuns(runsRef.current)
    } catch {
      runsRef.current = { ...runsRef.current, [model.source]: [] }
      setRuns(runsRef.current)
    }
  }, [])

  useEffect(() => {
    if (page) void loadRuns(page)
  }, [loadRuns, page])

  const resetDoc = () => {
    void docRef.current?.destroy()
    docRef.current = null
    pageCache.current.clear()
    runsRef.current = {}
    setRuns({})
    setPdf(null)
    setPages([])
    setFile(null)
    setIndex(0)
    setSelected(null)
    setHistory([])
    setFuture([])
    setZoom(1)
    setMessage(null)
    setErasePreview(null)
  }

  const openFile = useCallback(async (next: File) => {
    const nextKind = detectKind(next)
    if (!nextKind) {
      setMessage({ tone: 'error', text: unsupportedMessage(next.name) })
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      setMessage({ tone: 'error', text: `«${next.name}» больше ${MAX_FILE_MB} МБ` })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      resetDoc()
      setKind(nextKind)
      setDocName(baseName(next.name))
      setFile(next)

      if (nextKind === 'pdf') {
        const doc = await openPdf(next)
        docRef.current = doc
        setPdf(doc)

        const models: EditorPage[] = []
        for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
          const proxy = await doc.getPage(pageNumber)
          const viewport = proxy.getViewport({ scale: 1 })
          pageCache.current.set(pageNumber - 1, proxy)
          models.push({
            source: pageNumber - 1,
            box: { width: viewport.width, height: viewport.height },
            objects: [],
          })
        }
        setPages(models)
      } else if (nextKind === 'image') {
        const bytes = new Uint8Array(await next.arrayBuffer())
        const isPng = next.type === 'image/png' || /\.png$/i.test(next.name)
        const bitmap = await createImageBitmap(new Blob([bytes], { type: isPng ? 'image/png' : 'image/jpeg' }))
        const photoPage = imageToPage(bytes, isPng ? 'png' : 'jpg', bitmap.width, bitmap.height, A4_BOX)
        setPages([photoPage])
        bitmap.close()
        // Текст на фото распознаём сразу: дальше его правим как обычный документ.
        window.setTimeout(() => void recognizeRef.current(photoPage, 0), 350)
      } else {
        const text = await readDocumentText(next, nextKind)
        if (!text.trim()) throw new Error('В файле нет текста — открывать нечего.')
        setPages(textToPages(text, A4_BOX))
      }

      setIndex(0)
      setSelected(null)
      setZoom(1)
      setTool('select')
      track('Редактор PDF', 'open')
    } catch (error) {
      console.error(error)
      setMessage({
        tone: 'error',
        text: error instanceof Error && error.message ? error.message : 'Не получилось открыть файл.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Лист всегда по ширине рабочей области; зум умножается поверх этого размера.
  useEffect(() => {
    const wrap = stageWrapRef.current
    if (!wrap || !boxWidth) return

    const fit = () => {
      const styles = getComputedStyle(wrap)
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const available = wrap.clientWidth - padding - 2
      if (available < 40) return
      setFitScale(Math.min(1.5, Math.max(0.2, available / boxWidth)))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [boxWidth, panelOpen, thumbsOpen])

  // Рисуем текущую страницу. Зависимости намеренные: объекты не должны перерисовывать canvas.
  useEffect(() => {
    const model = pagesRef.current[index]
    const canvas = canvasRef.current
    if (!model || !canvas) return

    let cancelled = false
    const width = Math.max(1, Math.round(model.box.width * scale))
    const height = Math.max(1, Math.round(model.box.height * scale))
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    if (model.source === null) return

    const doc = docRef.current
    if (!doc) return

    const draw = async () => {
      let proxy = pageCache.current.get(model.source as number)
      if (!proxy) {
        proxy = await doc.getPage((model.source as number) + 1)
        pageCache.current.set(model.source as number, proxy)
      }
      if (cancelled) return
      const viewport = proxy.getViewport({ scale })
      await proxy.render({ canvas, canvasContext: context, viewport }).promise
    }

    draw().catch(() => {
      // Страницу не отрисовали — остаётся белый лист, работать всё равно можно.
    })

    return () => {
      cancelled = true
    }
  }, [index, scale, pages.length, file])

  const mutate = useCallback((updater: (current: EditorPage[]) => EditorPage[]) => {
    setHistory((previous) => [...previous.slice(-40), pagesRef.current])
    setFuture([])
    setPages((previous) => updater(previous))
  }, [])

  const updateObject = useCallback(
    (id: string, patch: Partial<EditorObject>) => {
      setPages((previous) =>
        previous.map((item, itemIndex) =>
          itemIndex !== index
            ? item
            : {
                ...item,
                objects: item.objects.map((object) => (object.id === id ? ({ ...object, ...patch } as EditorObject) : object)),
              },
        ),
      )
    },
    [index],
  )

  const addPageObject = (objects: EditorObject[], newCovers: CoverRect[] = []) => {
    mutate((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, objects: [...item.objects, ...objects], covers: [...(item.covers ?? []), ...newCovers] }
          : item,
      ),
    )
  }

  const addText = (x: number, y: number, width?: number) => {
    if (!page) return
    const object: TextObject = {
      kind: 'text',
      id: uid(),
      x,
      y,
      text: '',
      size: 14,
      color: TEXT_COLORS[0].value,
      width: width ?? Math.max(80, Math.min(260, page.box.width - x - 24)),
    }
    addPageObject([object])
    setSelected(object.id)
    setPanelOpen(true)
    setFocusToken((value) => value + 1)
  }

  /**
   * Режим «по линии»: новый текст не висит где попало, а встаёт абзацем
   * под строкой, по которой щёлкнули, и тянется от поля до поля.
   */
  const addFlowText = (x: number, y: number) => {
    if (!page) return
    const margin = pageMargin(page.box.width)
    const anchors: { x: number; y: number; height: number }[] = [
      ...pageRuns
        .filter(
          (run) =>
            !(page.covers ?? []).some((cover) => {
              const cx = run.x + run.width / 2
              const cy = run.y + run.height / 2
              return cx >= cover.x && cx <= cover.x + cover.width && cy >= cover.y && cy <= cover.y + cover.height
            }),
        )
        .map((run) => ({ x: run.x, y: run.y, height: run.height })),
      ...page.objects
        .filter((object): object is TextObject => object.kind === 'text')
        .map((object) => ({ x: object.x, y: object.y, height: objectSize(object).height })),
    ].sort((a, b) => a.y - b.y)

    const above = anchors.filter((anchor) => anchor.y + anchor.height <= y + 6)
    const last = above[above.length - 1]
    const top = last
      ? Math.min(page.box.height - 18, last.y + Math.max(last.height, 12) + 4)
      : Math.max(0, Math.min(y, page.box.height - 24))
    const left = last
      ? Math.max(margin, Math.min(last.x, page.box.width - margin - 80))
      : Math.max(0, Math.min(x, page.box.width - margin - 80))
    const width = Math.max(80, page.box.width - left - margin)
    addText(left, top, width)
  }

  /** Готовая строка PDF → редактируемый текст: исходник закрываем белым пятном. */
  const editRun = (run: TextRun) => {
    if (!page) return
    // В режиме «по линии» блок сразу получает ширину абзаца: длинный текст переносится,
    // как в Word, а не уезжает одной строкой за край листа.
    const paragraph = Math.min(page.box.width - run.x - 6, page.box.width - run.x - pageMargin(page.box.width))
    const width =
      textMode === 'flow'
        ? Math.max(120, paragraph)
        : Math.min(page.box.width - run.x - 6, Math.max(run.width + 12, 60))
    const object: TextObject = {
      kind: 'text',
      id: uid(),
      x: run.x,
      y: run.y,
      text: run.text,
      size: Math.max(6, Math.min(48, Math.round(run.size * 10) / 10)),
      color: TEXT_COLORS[0].value,
      width,
    }
    const cover: CoverRect = {
      x: Math.max(0, run.x - 1.5),
      y: Math.max(0, run.y - 1.5),
      width: Math.min(run.width + 3, page.box.width - Math.max(0, run.x - 1.5)),
      height: run.height + 3,
    }
    addPageObject([object], [cover])
    setSelected(object.id)
    setPanelOpen(true)
    setFocusToken((value) => value + 1)
  }

  useEffect(() => {
    if (!focusToken) return
    const timer = window.setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 60)
    return () => window.clearTimeout(timer)
  }, [focusToken])

  const addImageFile = async (next: File) => {
    if (!page) return
    try {
      const bytes = new Uint8Array(await next.arrayBuffer())
      const type = /png/i.test(next.type) || /\.png$/i.test(next.name) ? 'png' : 'jpg'
      const mime = type === 'png' ? 'image/png' : 'image/jpeg'
      const bitmap = await createImageBitmap(new Blob([bytes], { type: mime }))
      const size = fitImage(page.box, bitmap.width, bitmap.height)
      const position = clampPosition(
        page.box,
        Math.round((page.box.width - size.width) / 2),
        Math.round(page.box.height * 0.18),
        size.width,
        size.height,
      )
      const object: ImageObject = {
        kind: 'image',
        id: uid(),
        ...position,
        width: size.width,
        height: size.height,
        data: bytes,
        type,
      }
      bitmap.close()
      addPageObject([object])
      setSelected(object.id)
      setTool('select')
      setMessage({ tone: 'ok', text: 'Фото добавлено и уже выделено — тащите его по странице или за уголок меняйте размер.' })
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось прочитать картинку. Подойдут PNG и JPG.' })
    }
  }

  const addBlankPage = () => {
    if (!page) return
    mutate((current) => insertBlankPage(current, index, page.box))
    setIndex(index + 1)
    setSelected(null)
    setMessage({ tone: 'info', text: 'Пустой лист вставлен сразу после текущей страницы.' })
  }

  const duplicatePage = () => {
    if (!page) return
    const clone: EditorPage = {
      ...page,
      box: { ...page.box },
      objects: page.objects.map((object) => ({ ...object, id: uid() })),
      covers: [...(page.covers ?? [])],
    }
    mutate((current) => {
      const next = [...current]
      next.splice(index + 1, 0, clone)
      return next
    })
    setIndex(index + 1)
    setSelected(null)
    setMessage({ tone: 'info', text: 'Страница скопирована — она идёт сразу после текущей.' })
  }

  const removePage = () => {
    if (pages.length <= 1) {
      setMessage({ tone: 'error', text: 'В документе должна остаться хотя бы одна страница.' })
      return
    }
    mutate((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setIndex((current) => Math.max(0, Math.min(current, pages.length - 2)))
    setSelected(null)
    setMessage({ tone: 'info', text: 'Страница удалена. Ctrl+Z вернёт её.' })
  }

  const removeSelected = useCallback(() => {
    if (!selected) return
    mutate((current) =>
      current.map((item, itemIndex) =>
        itemIndex !== index ? item : { ...item, objects: item.objects.filter((object) => object.id !== selected) },
      ),
    )
    setSelected(null)
  }, [index, mutate, selected])

  const clearCovers = () => {
    if (!page?.covers?.length) return
    mutate((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, covers: [] } : item)),
    )
    setMessage({ tone: 'info', text: 'Белые пятна убраны — исходное содержимое страницы снова видно.' })
  }

  const undo = useCallback(() => {
    setHistory((previous) => {
      const last = previous[previous.length - 1]
      if (!last) return previous
      setFuture((next) => [...next, pagesRef.current])
      setPages(last)
      return previous.slice(0, -1)
    })
    setSelected(null)
  }, [])

  const redo = useCallback(() => {
    setFuture((previous) => {
      const last = previous[previous.length - 1]
      if (!last) return previous
      setHistory((next) => [...next, pagesRef.current])
      setPages(last)
      return previous.slice(0, -1)
    })
    setSelected(null)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if (typing) return
      if ((event.key === 'Delete' || event.key === 'Backspace') && selected) {
        event.preventDefault()
        removeSelected()
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [redo, removeSelected, selected, undo])

  // Один снимок на жест: Ctrl+Z должен возвращать объект на место, а не удалять его.
  const snapshot = () => {
    setHistory((previous) => [...previous.slice(-40), pagesRef.current])
    setFuture([])
  }

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const model = pagesRef.current[index]
      if (!model) return

      if (eraseRef.current) {
        const rect = event.currentTarget === null ? null : null
        void rect
        const stage = canvasRef.current?.getBoundingClientRect()
        if (!stage) return
        const x = Math.max(0, Math.min((event.clientX - stage.left) / scale, model.box.width))
        const y = Math.max(0, Math.min((event.clientY - stage.top) / scale, model.box.height))
        const start = eraseRef.current
        setErasePreview({
          x: Math.min(start.x, x),
          y: Math.min(start.y, y),
          width: Math.abs(x - start.x),
          height: Math.abs(y - start.y),
        })
        return
      }

      const resize = resizeRef.current
      if (resize) {
        const object = model.objects.find((item) => item.id === resize.id)
        if (!object || object.kind !== 'image' || !resize.ratio) return
        if (!resize.moved) {
          resize.moved = true
          snapshot()
        }
        const maxWidth = Math.min(model.box.width - object.x, (model.box.height - object.y) / resize.ratio)
        const width = Math.min(maxWidth, Math.max(24, resize.originWidth + (event.clientX - resize.startX) / scale))
        updateObject(object.id, { width: Math.round(width), height: Math.round(width * resize.ratio) })
        return
      }

      const drag = dragRef.current
      if (!drag) return
      const object = model.objects.find((item) => item.id === drag.id)
      if (!object) return
      if (!drag.moved) {
        drag.moved = true
        snapshot()
      }
      const size = objectSize(object)
      const next = clampPosition(
        model.box,
        drag.originX + (event.clientX - drag.startX) / scale,
        drag.originY + (event.clientY - drag.startY) / scale,
        size.width,
        size.height,
      )
      updateObject(drag.id, next)
    }

    const up = () => {
      const start = eraseRef.current
      const preview = erasePreview
      eraseRef.current = null
      if (start && preview && preview.width > 2 && preview.height > 1) {
        mutate((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index
              ? { ...item, covers: [...(item.covers ?? []), { ...preview, width: Math.max(3, preview.width), height: Math.max(2, preview.height) }] }
              : item,
          ),
        )
        setMessage({ tone: 'ok', text: 'Область стёрта — на её месте белое поле. Ctrl+Z вернёт как было.' })
      }
      setErasePreview(null)
      dragRef.current = null
      resizeRef.current = null
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [erasePreview, index, mutate, scale, updateObject])

  const onStageDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!page) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / scale
    const y = (event.clientY - rect.top) / scale

    if (tool === 'erase') {
      event.preventDefault()
      eraseRef.current = { x, y }
      setErasePreview({ x, y, width: 0, height: 0 })
      return
    }

    if (tool === 'text') {
      // Ищем готовую строку под курсором: правки начинаются с её текста.
      const hit = pageRuns.find(
        (run) => x >= run.x - 3 && x <= run.x + run.width + 3 && y >= run.y - 3 && y <= run.y + run.height + 3,
      )
      if (hit) {
        editRun(hit)
        return
      }
      if (!pageRuns.length && page.source !== null) {
        setMessage({
          tone: 'info',
          text: 'На этой странице нет текстового слоя — скорее всего, это скан или фото. Нажмите «Распознать».',
        })
      }
      if (textMode === 'flow') addFlowText(x, y)
      else addText(Math.max(0, Math.min(x, page.box.width - 60)), Math.max(0, Math.min(y, page.box.height - 24)))
      return
    }

    setSelected(null)
  }

  const rasterPage = async (model: EditorPage): Promise<{ canvas: HTMLCanvasElement; scale: number }> => {
    if (model.source !== null && docRef.current) {
      const proxy =
        pageCache.current.get(model.source) ?? (await docRef.current.getPage(model.source + 1))
      pageCache.current.set(model.source, proxy)
      return renderPageRaster(proxy, 1600)
    }

    const ratio = Math.min(3, Math.max(1.2, 1600 / Math.max(1, model.box.width)))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(model.box.width * ratio)
    canvas.height = Math.round(model.box.height * ratio)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas недоступен в этом браузере')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    for (const object of model.objects) {
      if (object.kind !== 'image') continue
      const bitmap = await createImageBitmap(
        new Blob([object.data as BlobPart], { type: object.type === 'png' ? 'image/png' : 'image/jpeg' }),
      )
      context.drawImage(bitmap, object.x * ratio, object.y * ratio, object.width * ratio, object.height * ratio)
      bitmap.close()
    }

    return { canvas, scale: ratio }
  }

  const recognizePage = async (target?: EditorPage, targetIndex?: number) => {
    const model = target ?? page
    const at = targetIndex ?? indexRef.current
    if (!model || ocrBusyRef.current) return
    ocrBusyRef.current = true
    setOcrBusy(true)
    setOcrProgress(0)
    setMessage({ tone: 'info', text: 'Распознаём текст на странице — первый запуск скачивает языковые данные.' })
    setPanelOpen(true)

    try {
      const { canvas, scale: rasterScale } = await rasterPage(model)
      const lines = await recognizeImage(canvas, ocrLang, (progress) => setOcrProgress(progress), rasterScale)
      canvas.width = 0
      canvas.height = 0

      if (!lines.length) {
        setMessage({
          tone: 'error',
          text: 'Текст не распознан. Попробуйте снимок крупнее и ровнее или другой язык распознавания.',
        })
        return
      }

      const objects: TextObject[] = []
      const newCovers: CoverRect[] = []

      for (const line of lines) {
        const size = Math.max(6, Math.min(48, Math.round(line.height * 0.78 * 10) / 10))
        objects.push({
          kind: 'text',
          id: uid(),
          x: Math.round(line.x * 10) / 10,
          y: Math.round(line.y * 10) / 10,
          text: line.text,
          size,
          color: TEXT_COLORS[0].value,
          width: Math.min(model.box.width - line.x - 4, Math.max(line.width + 10, 40)),
        })
        newCovers.push({
          x: Math.max(0, line.x - 1),
          y: Math.max(0, line.y - 1),
          width: Math.min(line.width + 2, model.box.width - line.x + 1),
          height: line.height + 2,
        })
      }

      mutate((current) =>
        current.map((item, itemIndex) =>
          itemIndex === at
            ? { ...item, objects: [...item.objects, ...objects], covers: [...(item.covers ?? []), ...newCovers] }
            : item,
        ),
      )
      // Фото и сканы после распознавания ведём сразу в правку текста.
      setTool('text')
      setMessage({
        tone: 'ok',
        text: `Распознано строк: ${lines.length}. Текст стал редактируемым — щёлкните по нему и правьте справа.`,
      })
      track('Редактор PDF', 'done')
    } catch (error) {
      console.error(error)
      setMessage({
        tone: 'error',
        text: 'Распознавание не запустилось. Нужен интернет для языковых данных — попробуйте ещё раз.',
      })
    } finally {
      ocrBusyRef.current = false
      setOcrBusy(false)
      setOcrProgress(0)
    }
  }

  recognizeRef.current = recognizePage

  const save = async () => {
    if (!pages.length) return
    setBusy(true)
    setMessage(null)

    try {
      const doc = docRef.current
      const converters: ToPdfPoint[] = []

      for (const model of pages) {
        if (model.source === null) {
          const height = model.box.height
          converters.push((x, y) => [x, height - y])
          continue
        }
        let proxy = pageCache.current.get(model.source)
        if (!proxy) {
          if (!doc) throw new Error('Документ закрыт — откройте файл заново')
          proxy = await doc.getPage(model.source + 1)
          pageCache.current.set(model.source, proxy)
        }
        const viewport = proxy.getViewport({ scale: 1 })
        converters.push((x, y) => viewport.convertToPdfPoint(x, y) as [number, number])
      }

      const result = await composePdf({
        source: kind === 'pdf' ? file : null,
        pages,
        toPdf: (pageIndex, x, y) => converters[pageIndex](x, y),
        eraseAnnotations,
      })

      const name = (docName || 'document').replace(/[\\/:*?"<>|]+/g, '-')
      download(result.blob, `${name}-edited.pdf`)
      track('Редактор PDF', 'done')
      addHistory({ tool: 'Редактор PDF', fileName: name, result: `объектов: ${result.objects}` })
      setMessage({ tone: 'ok', text: `Готово — PDF скачивается: ${result.pages} страниц(ы), объектов ${result.objects}.` })
    } catch (error) {
      console.error(error)
      setMessage({
        tone: 'error',
        text: error instanceof Error && error.message ? error.message : 'Не получилось собрать PDF.',
      })
    } finally {
      setBusy(false)
    }
  }

  const saveWord = async () => {
    if (!pages.length) return
    setBusy(true)
    try {
      const blob = await pagesToDocx(pages)
      download(blob, `${(docName || 'document').replace(/[\\/:*?"<>|]+/g, '-')}.docx`)
      setMessage({ tone: 'ok', text: 'DOCX скачивается — открывается в Word, Google Docs и LibreOffice.' })
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось собрать DOCX.' })
    } finally {
      setBusy(false)
    }
  }

  const saveText = () => {
    if (!pages.length) return
    download(pagesToText(pages), `${(docName || 'document').replace(/[\\/:*?"<>|]+/g, '-')}.txt`)
    setMessage({ tone: 'ok', text: 'Текст скачивается одним .txt.' })
  }

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) void openFile(dropped)
  }

  const changeZoom = (next: number) => {
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100)))
  }

  const openAnotherFile = () => {
    resetDoc()
    setDocName('')
    window.setTimeout(() => inputRef.current?.click(), 30)
  }

  const coveredBy = (run: TextRun): boolean =>
    covers.some((cover) => {
      const cx = run.x + run.width / 2
      const cy = run.y + run.height / 2
      return cx >= cover.x && cx <= cover.x + cover.width && cy >= cover.y && cy <= cover.y + cover.height
    })

  return (
    <div className={`editor-app${hasDoc && thumbsOpen ? ' show-thumbs' : ''}${panelOpen ? ' show-panel' : ''}`}>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={OPEN_ACCEPT}
        onChange={(event) => {
          const next = event.target.files?.[0]
          if (next) void openFile(next)
          event.target.value = ''
        }}
      />
      <input
        ref={imageInputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        onChange={(event) => {
          const next = event.target.files?.[0]
          if (next) void addImageFile(next)
          event.target.value = ''
        }}
      />

      <header className="ed-top">
        <Link className="ed-brand" to={ROUTES.tools} aria-label="RekPDF — к инструментам">
          <span className="ed-brand-mark">R</span>
          <span className="ed-brand-name">
            RekPDF <small>Редактор</small>
          </span>
        </Link>

        <div className="ed-doc">
          {hasDoc ? (
            <>
              <span className="ed-doc-badge">{DOC_LABELS[kind]}</span>
              {renaming ? (
                <input
                  className="ed-doc-input"
                  autoFocus
                  value={docName}
                  onChange={(event) => setDocName(event.target.value)}
                  onBlur={() => {
                    setRenaming(false)
                    if (!docName.trim()) setDocName(baseName(file?.name ?? 'document'))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                      setRenaming(false)
                      if (!docName.trim()) setDocName(baseName(file?.name ?? 'document'))
                    }
                  }}
                  aria-label="Название документа"
                />
              ) : (
                <button type="button" className="ed-doc-name ed-doc-rename" title="Нажмите, чтобы переименовать" onClick={() => setRenaming(true)}>
                  {docName || baseName(file?.name ?? 'document')}
                </button>
              )}
              <span className="ed-doc-meta">
                {file ? `${formatSize(file.size)} · ` : ''}
                {pages.length} стр.
              </span>
              {!renaming && (
                <button type="button" className="ed-save-mark" onClick={save} disabled={busy} title="Скачать PDF">
                  <Icon d={ICONS.download} />
                </button>
              )}
            </>
          ) : (
            <span className="ed-doc-name">Новый документ</span>
          )}
        </div>

        <div className="ed-top-actions">
          {hasDoc && (
            <button type="button" className="ed-primary" onClick={() => void save()} disabled={busy} aria-label="Скачать PDF">
              <Icon d={ICONS.download} />
              <span className="ed-primary-text">{busy ? 'Собираем…' : 'Скачать PDF'}</span>
            </button>
          )}

          <Link className="ed-close" to={ROUTES.tools}>
            <Icon d={ICONS.close} />
            <span>Закрыть</span>
          </Link>
        </div>
      </header>

      {hasDoc && (
        <div className="ed-ribbon">
          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={openAnotherFile} title="Открыть другой файл">
                <Icon d={ICONS.folder} />
                <span>Открыть</span>
              </button>
              <button type="button" className="ed-tool" onClick={() => void saveWord()} disabled={busy}>
                <Icon d={ICONS.word} />
                <span>Word</span>
              </button>
              <button type="button" className="ed-tool" onClick={saveText} disabled={busy} title="Скачать текст">
                <Icon d={ICONS.txt} />
                <span>TXT</span>
              </button>
            </div>
            <span className="ed-group-label">Файл</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button
                type="button"
                className={`ed-tool${tool === 'select' ? ' is-active' : ''}`}
                aria-pressed={tool === 'select'}
                onClick={() => setTool('select')}
              >
                <Icon d={ICONS.cursor} />
                <span>Выбор</span>
              </button>
              <button
                type="button"
                className={`ed-tool${tool === 'text' ? ' is-active' : ''}`}
                aria-pressed={tool === 'text'}
                aria-label="Правка текста"
                onClick={() => setTool('text')}
              >
                <Icon d={ICONS.text} />
                <span>Текст</span>
              </button>
              <button
                type="button"
                className="ed-tool"
                onClick={() => {
                  setTool('select')
                  imageInputRef.current?.click()
                }}
              >
                <Icon d={ICONS.image} />
                <span>Фото</span>
              </button>
              <button
                type="button"
                className={`ed-tool${tool === 'erase' ? ' is-active' : ''}`}
                aria-pressed={tool === 'erase'}
                onClick={() => setTool('erase')}
              >
                <Icon d={ICONS.erase} />
                <span>Стереть</span>
              </button>
            </div>
            <div className="ed-mode-row" role="group" aria-label="Режим ввода текста">
              <button
                type="button"
                className={`ed-mode${textMode === 'flow' ? ' is-active' : ''}`}
                aria-pressed={textMode === 'flow'}
                onClick={() => {
                  setTextMode('flow')
                  setTool('text')
                }}
                title="Текст идёт по строке и переносится по полям, как в Word"
              >
                По линии
              </button>
              <button
                type="button"
                className={`ed-mode${textMode === 'free' ? ' is-active' : ''}`}
                aria-pressed={textMode === 'free'}
                onClick={() => {
                  setTextMode('free')
                  setTool('text')
                }}
                title="Текст встаёт точно туда, куда щёлкнули, и его можно перетаскивать"
              >
                Свободно
              </button>
            </div>
            <span className="ed-group-label">Правка текста</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={undo} disabled={!history.length || busy}>
                <Icon d={ICONS.undo} />
                <span>Отменить</span>
              </button>
              <button type="button" className="ed-tool" onClick={redo} disabled={!future.length || busy}>
                <Icon d={ICONS.redo} />
                <span>Вернуть</span>
              </button>
            </div>
            <span className="ed-group-label">История</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={addBlankPage} title="Вставить пустой лист после текущего">
                <Icon d={ICONS.page} />
                <span>Лист</span>
              </button>
              <button type="button" className="ed-tool" onClick={duplicatePage} title="Скопировать страницу">
                <Icon d={ICONS.copy} />
                <span>Копия</span>
              </button>
              <button type="button" className="ed-tool" onClick={removePage} disabled={pages.length <= 1} title="Удалить страницу">
                <Icon d={ICONS.trash} />
                <span>Удалить</span>
              </button>
            </div>
            <span className="ed-group-label">Страницы</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button
                type="button"
                className={`ed-tool${ocrBusy ? ' is-active' : ''}`}
                onClick={() => void recognizePage()}
                disabled={ocrBusy || loading}
                title="Распознать текст на странице (OCR)"
              >
                <Icon d={ICONS.scan} />
                <span>{ocrBusy ? `${Math.round(ocrProgress * 100)}%` : 'Распознать'}</span>
              </button>
              <select
                className="ed-select"
                value={ocrLang}
                onChange={(event) => setOcrLang(event.target.value as OcrLang)}
                aria-label="Язык распознавания"
              >
                {OCR_LANGS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="ed-group-label">Распознавание</span>
          </div>

          <p className="ed-hint">
            {selectedObject?.kind === 'image' ? IMAGE_HINT : tool === 'text' ? TEXT_HINTS[textMode] : HINTS[tool]}
          </p>
        </div>
      )}

      <div className="ed-work">
        <nav className="ed-rail" aria-label="Панели редактора">
          <button
            type="button"
            className={`ed-rail-btn ed-rail-pages${hasDoc && thumbsOpen ? ' is-active' : ''}`}
            title={thumbsOpen ? 'Скрыть страницы' : 'Показать страницы'}
            aria-pressed={hasDoc && thumbsOpen}
            onClick={() => setThumbsOpen((value) => !value)}
            disabled={!hasDoc}
          >
            <Icon d={ICONS.pages} />
          </button>
          <button
            type="button"
            className={`ed-rail-btn ed-rail-end${panelOpen ? ' is-active' : ''}`}
            title="Свойства"
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen((value) => !value)}
          >
            <Icon d={ICONS.panel} />
          </button>
        </nav>

        {hasDoc && thumbsOpen && (
          <aside className="ed-thumbs" aria-label="Страницы документа">
            <p className="ed-thumbs-head">
              <span>Страницы</span>
              <span className="ed-thumbs-count">{pages.length}</span>
            </p>
            <div className="ed-thumbs-list">
              {pages.map((item, pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  className={`ed-thumb${pageIndex === index ? ' is-active' : ''}`}
                  onClick={() => {
                    setIndex(pageIndex)
                    setSelected(null)
                  }}
                  aria-label={`Страница ${pageIndex + 1}`}
                >
                  <span className="ed-thumb-page" style={{ aspectRatio: item.box.width / item.box.height }}>
                    {item.source === null ? (
                      <ThumbPreview page={item} />
                    ) : (
                      <PageThumb pdf={pdf} source={item.source} ratio={item.box.width / item.box.height} />
                    )}
                  </span>
                  <span>{pageIndex + 1}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        <div className="ed-canvas-area" ref={stageWrapRef}>
          {page ? (
            <div
              className={`redactor-stage tool-${tool}`}
              style={{ width: Math.floor(page.box.width * scale), height: Math.floor(page.box.height * scale) }}
              onPointerDown={onStageDown}
            >
              <canvas ref={canvasRef} className="redactor-canvas" />

              {covers.map((cover, coverIndex) => (
                <span
                  key={`cover-${coverIndex}`}
                  className={`redactor-cover${tool === 'erase' ? ' is-visible' : ''}`}
                  style={{
                    left: Math.round(cover.x * scale),
                    top: Math.round(cover.y * scale),
                    width: Math.round(cover.width * scale),
                    height: Math.round(cover.height * scale),
                  }}
                />
              ))}

              {tool === 'text' &&
                pageRuns
                  .filter((run) => !coveredBy(run))
                  .slice(0, 600)
                  .map((run, runIndex) => (
                    <span
                      key={`run-${runIndex}`}
                      className="redactor-run"
                      style={{
                        left: Math.round(run.x * scale),
                        top: Math.round(run.y * scale),
                        width: Math.round(run.width * scale),
                        height: Math.round(run.height * scale),
                      }}
                    />
                  ))}

              {page.objects.map((object) => {
                const size = objectSize(object)
                const isSelected = object.id === selected
                return (
                  <div
                    key={object.id}
                    className={`redactor-object${isSelected ? ' is-selected' : ''}`}
                    style={{
                      left: Math.round(object.x * scale),
                      top: Math.round(object.y * scale),
                      width: Math.round(size.width * scale),
                      ...(object.kind === 'text'
                        ? { minHeight: Math.round(size.height * scale) }
                        : { height: Math.round(size.height * scale) }),
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      if (tool === 'erase') return
                      event.preventDefault()
                      if (tool === 'text' && object.kind === 'text') {
                        setSelected(object.id)
                        setPanelOpen(true)
                        setFocusToken((value) => value + 1)
                        return
                      }
                      setSelected(object.id)
                      setPanelOpen(true)
                      resizeRef.current = null
                      dragRef.current = {
                        id: object.id,
                        startX: event.clientX,
                        startY: event.clientY,
                        originX: object.x,
                        originY: object.y,
                        moved: false,
                      }
                    }}
                  >
                    {object.kind === 'text' ? (
                      <span
                        className={`redactor-text${object.text ? '' : ' is-placeholder'}`}
                        style={{
                          fontSize: Math.max(4, object.size * scale),
                          lineHeight: 1.3,
                          color: `#${object.color}`,
                        }}
                      >
                        {object.text || 'Введите текст'}
                      </span>
                    ) : (
                      <>
                        <img className="redactor-image" src={imageUrl(object)} alt="" draggable={false} />
                        {isSelected && (
                          <span
                            className="redactor-handle"
                            title="Потяните, чтобы изменить размер"
                            onPointerDown={(event) => {
                              event.stopPropagation()
                              event.preventDefault()
                              setSelected(object.id)
                              dragRef.current = null
                              resizeRef.current = {
                                id: object.id,
                                startX: event.clientX,
                                originWidth: size.width,
                                ratio: size.width ? size.height / size.width : 1,
                                moved: false,
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                )
              })}

              {erasePreview && erasePreview.width > 0 && (
                <span
                  className="redactor-erase"
                  style={{
                    left: Math.round(erasePreview.x * scale),
                    top: Math.round(erasePreview.y * scale),
                    width: Math.round(erasePreview.width * scale),
                    height: Math.round(erasePreview.height * scale),
                  }}
                />
              )}
            </div>
          ) : (
            <div className="ed-empty">
              <div
                className={`dropzone ed-dropzone${dragging ? ' is-dragging' : ''}${loading ? ' is-loading' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <div className="dropzone-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path d="M9 13h6M12 10v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="dropzone-title">Откройте документ</p>
                <p className="dropzone-hint">PDF, DOCX, MD, TXT и фото документа — перетащите или нажмите</p>
                <span className="dropzone-note">до {MAX_FILE_MB} МБ · файл остаётся в браузере</span>
              </div>

              <div className="ed-quick">
                <p className="ed-quick-title">Что можно сделать в редакторе</p>
                <div className="ed-quick-grid">
                  <div className="ed-quick-item">
                    <Icon d={ICONS.text} />
                    <b>Править готовый текст</b>
                    <span>Нажмите «Текст» и щёлкните строку PDF — её можно изменить или удалить.</span>
                  </div>
                  <div className="ed-quick-item">
                    <Icon d={ICONS.scan} />
                    <b>Распознать скан</b>
                    <span>Фото документа или скан PDF → «Распознать», и текст станет редактируемым.</span>
                  </div>
                  <div className="ed-quick-item">
                    <Icon d={ICONS.image} />
                    <b>Фото и печати</b>
                    <span>PNG или JPG встанет на лист, тащите и тяните за уголок.</span>
                  </div>
                  <div className="ed-quick-item">
                    <Icon d={ICONS.erase} />
                    <b>Стереть лишнее</b>
                    <span>Рамкой «Стереть» убираются старый текст, картинки и штампы.</span>
                  </div>
                </div>
                <AdMini slot="editor-empty" />
              </div>
            </div>
          )}

          {message && (
            <p className={`message message-${message.tone}`} role="status">
              {message.text}
            </p>
          )}
        </div>

        <aside className="ed-panel" aria-label="Свойства">
          <div className="ed-panel-head">
            <h4 className="panel-title">{selectedObject ? 'Выбранный объект' : 'Свойства'}</h4>
            <button type="button" className="ed-icon-btn ed-panel-close" onClick={() => setPanelOpen(false)} aria-label="Закрыть свойства">
              <Icon d={ICONS.close} />
            </button>
          </div>

          {selectedObject ? (
            <>
              {selectedObject.kind === 'text' ? (
                <>
                  <label className="field">
                    <span className="field-label">Текст</span>
                    <textarea
                      ref={textareaRef}
                      className="field-input panel-textarea"
                      value={selectedObject.text}
                      rows={5}
                      placeholder="Напишите что-нибудь"
                      onChange={(event) => updateObject(selectedObject.id, { text: event.target.value })}
                    />
                  </label>

                  <div className="field">
                    <span className="field-label">Размер</span>
                    <div className="chip-row">
                      {[10, 12, 14, 18, 24, 32].map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`chip${Math.round(selectedObject.size) === size ? ' is-active' : ''}`}
                          onClick={() => updateObject(selectedObject.id, { size })}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">Ширина блока</span>
                    <input
                      className="field-input"
                      type="range"
                      min={40}
                      max={Math.max(60, Math.floor((page?.box.width ?? 500) - selectedObject.x))}
                      value={Math.round(selectedObject.width)}
                      onChange={(event) => updateObject(selectedObject.id, { width: Number(event.target.value) })}
                      aria-label="Ширина текстового блока"
                    />
                  </div>

                  <div className="field">
                    <span className="field-label">Цвет</span>
                    <div className="chip-row">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`swatch${selectedObject.color === color.value ? ' is-active' : ''}`}
                          style={{ background: `#${color.value}` }}
                          onClick={() => updateObject(selectedObject.id, { color: color.value })}
                          aria-label={color.label}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <label className="field">
                  <span className="field-label">Ширина</span>
                  <input
                    className="field-input"
                    type="range"
                    min={40}
                    max={Math.max(
                      40,
                      Math.floor(
                        Math.min(
                          (page?.box.width ?? 500) - selectedObject.x,
                          ((page?.box.height ?? 700) - selectedObject.y) / (selectedObject.height / selectedObject.width || 1),
                        ),
                      ),
                    )}
                    value={Math.round(selectedObject.width)}
                    onChange={(event) => {
                      const width = Number(event.target.value)
                      const ratio = selectedObject.width ? selectedObject.height / selectedObject.width : 1
                      updateObject(selectedObject.id, { width, height: Math.round(width * ratio) })
                    }}
                  />
                  <span className="panel-note">{Math.round(selectedObject.width)} pt по ширине страницы</span>
                </label>
              )}

              <div className="ed-panel-actions">
                <button type="button" className="btn btn-quiet panel-remove" onClick={removeSelected}>
                  Удалить объект
                </button>
              </div>
            </>
          ) : (
            <div className="panel-empty">
              {hasDoc ? (
                <>
                  <div className="ed-doc-card">
                    <span className="ed-doc-card-badge">{DOC_LABELS[kind]}</span>
                    <span className="ed-doc-card-body">
                      <b className="ed-doc-card-name" title={docName}>
                        {docName || 'Документ'}
                      </b>
                      <span className="ed-doc-card-meta">
                        стр. {index + 1} из {pages.length}
                        {file ? ` · ${formatSize(file.size)}` : ''}
                      </span>
                    </span>
                    <span className="ed-doc-card-tag">локально</span>
                  </div>

                  <p className="ed-panel-label">Страница</p>
                  <dl className="ed-props">
                    <div>
                      <dt>Номер</dt>
                      <dd>
                        {index + 1} / {pages.length}
                      </dd>
                    </div>
                    <div>
                      <dt>Размер</dt>
                      <dd>
                        {page
                          ? `${Math.round((page.box.width * 25.4) / 72)} × ${Math.round((page.box.height * 25.4) / 72)} мм`
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt>Объекты</dt>
                      <dd>
                        {textCount} текст · {imageCount} фото
                      </dd>
                    </div>
                    <div>
                      <dt>Стёрто областей</dt>
                      <dd>{covers.length}</dd>
                    </div>
                  </dl>

                  <div className="ed-panel-row">
                    <button type="button" className="btn btn-quiet" onClick={() => void recognizePage()} disabled={ocrBusy}>
                      <Icon d={ICONS.scan} />
                      Распознать текст
                    </button>
                    {covers.length > 0 && (
                      <button type="button" className="btn btn-quiet" onClick={clearCovers}>
                        Убрать белые пятна
                      </button>
                    )}
                  </div>

                  <p className="ed-panel-label">Быстро</p>
                  <div className="ed-panel-row">
                    <button type="button" className="btn btn-quiet" onClick={addBlankPage}>
                      Пустой лист
                    </button>
                    <button type="button" className="btn btn-quiet" onClick={duplicatePage}>
                      Копия страницы
                    </button>
                  </div>

                  <ul className="ed-keys">
                    <li>
                      <kbd>Ctrl</kbd> + <kbd>Z</kbd> шаг назад, <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> вперёд
                    </li>
                    <li>
                      <kbd>Delete</kbd> убрать выбранный объект
                    </li>
                    <li>«Текст» → щелчок по строке PDF — правка существующего текста</li>
                    <li>«Стереть» → рамка по области — старый текст и фото исчезают</li>
                  </ul>

                  <AdMini slot="editor-panel" />
                </>
              ) : (
                <>
                  <div className="ed-hero">
                    <span className="ed-hero-icon">
                      <Icon d={ICONS.folder} />
                    </span>
                    <b>Начните с документа</b>
                    <span>PDF, DOCX, MD, TXT или фото. Файл не загружается на сервер — он весь у вас в браузере.</span>
                    <button type="button" onClick={openAnotherFile}>
                      Открыть файл
                    </button>
                  </div>
                  <ul className="ed-facts">
                    <li>
                      <b>100 МБ</b>
                      <span>на файл</span>
                    </li>
                    <li>
                      <b>0 загрузок</b>
                      <span>в интернет</span>
                    </li>
                    <li>
                      <b>OCR</b>
                      <span>в браузере</span>
                    </li>
                  </ul>
                  <AdMini slot="editor-panel-empty" />
                </>
              )}
            </div>
          )}

          <label className="toggle">
            <input
              type="checkbox"
              checked={eraseAnnotations}
              onChange={(event) => setEraseAnnotations(event.target.checked)}
            />
            <span>
              <b>Убрать пометки и подписи</b>
              <small>Удаляет комментарии, штампы и подписи-аннотации. Сами страницы не меняются.</small>
            </span>
          </label>

          {hasDoc && (
            <div className="ed-panel-actions">
              <button type="button" className="btn btn-quiet" onClick={resetDoc}>
                Закрыть документ
              </button>
            </div>
          )}
        </aside>
      </div>

      <footer className="ed-status">
        <div className="ed-status-group">
          <button
            type="button"
            className="ed-nav-btn"
            onClick={() => {
              setIndex((current) => Math.max(0, current - 1))
              setSelected(null)
            }}
            disabled={!hasDoc || index === 0}
            aria-label="Предыдущая страница"
          >
            ←
          </button>
          <span>{hasDoc ? `Страница ${index + 1} из ${pages.length}` : 'Файл не открыт'}</span>
          <button
            type="button"
            className="ed-nav-btn"
            onClick={() => {
              setIndex((current) => Math.min(pages.length - 1, current + 1))
              setSelected(null)
            }}
            disabled={!hasDoc || index >= pages.length - 1}
            aria-label="Следующая страница"
          >
            →
          </button>
        </div>

        {hasDoc && (
          <div className="ed-status-group ed-status-zoom">
            <button
              type="button"
              className="ed-icon-btn"
              onClick={() => changeZoom(zoom - 0.1)}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Уменьшить масштаб"
            >
              <Icon d={ICONS.minus} />
            </button>
            <input
              className="ed-zoom-range"
              type="range"
              min={ZOOM_MIN * 100}
              max={ZOOM_MAX * 100}
              step={5}
              value={zoomPercent}
              onChange={(event) => changeZoom(Number(event.target.value) / 100)}
              aria-label="Масштаб"
            />
            <button
              type="button"
              className="ed-icon-btn"
              onClick={() => changeZoom(zoom + 0.1)}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Увеличить масштаб"
            >
              <Icon d={ICONS.plus} />
            </button>
            <span className="ed-zoom-value">{zoomPercent}%</span>
          </div>
        )}

        <div className="ed-status-group ed-status-right">
          <button
            type="button"
            className="ed-panel-toggle"
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen((value) => !value)}
          >
            <Icon d={ICONS.panel} />
            Свойства
          </button>
          <span className="ed-status-note">Всё локально в браузере</span>
        </div>
      </footer>
    </div>
  )
}

/** Миниатюра страницы: pdf.js рисует её только когда она подъехала к экрану. */
function PageThumb({ pdf, source, ratio }: { pdf: PDFDocumentProxy | null; source: number; ratio: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '260px 0px' },
    )
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !pdf) return
    let cancelled = false

    const draw = async () => {
      const proxy = await pdf.getPage(source + 1)
      if (cancelled) return
      const sourceWidth = proxy.getViewport({ scale: 1 }).width || 1
      const viewport = proxy.getViewport({ scale: 128 / sourceWidth })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const context = canvas.getContext('2d')
      if (!context) return
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      await proxy.render({ canvas, canvasContext: context, viewport }).promise
    }

    draw().catch(() => {
      // Миниатюра не нарисовалась — останется белый лист с номером.
    })

    return () => {
      cancelled = true
    }
  }, [visible, pdf, source])

  return <canvas ref={canvasRef} style={{ aspectRatio: ratio }} />
}

/** Миниатюра страницы, у которой нет исходного PDF: фото и текст из DOCX/MD/TXT. */
function ThumbPreview({ page }: { page: EditorPage }) {
  const image = page.objects.find((object) => object.kind === 'image')
  const text = page.objects.find((object) => object.kind === 'text')

  if (image && image.kind === 'image') {
    return <img src={imageUrl(image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  }

  return (
    <span className="ed-thumb-text" aria-hidden="true">
      {(text && text.kind === 'text' ? text.text : '').slice(0, 240)}
    </span>
  )
}

/** Картинку в редакторе показываем прямо из байтов, без файлов на диске. */
const imageUrls = new Map<string, string>()

function imageUrl(object: EditorObject): string {
  if (object.kind !== 'image') return ''
  const cached = imageUrls.get(object.id)
  if (cached) return cached
  // image/jpg браузеры понимают не все — правильный MIME для JPEG это image/jpeg.
  const blob = new Blob([object.data as BlobPart], { type: object.type === 'png' ? 'image/png' : 'image/jpeg' })
  const url = URL.createObjectURL(blob)
  imageUrls.set(object.id, url)
  return url
}
