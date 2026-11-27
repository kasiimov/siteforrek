import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { baseName, download, formatSize } from '../lib/download'
import { track } from '../lib/analytics'
import { Link, ROUTES } from '../lib/router'
import {
  FONT_SIZES,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  TEXT_COLORS,
  TEXT_FONTS,
  clampPosition,
  composePdf,
  fitImage,
  fontStackFor,
  insertBlankPage,
  lineHeightOf,
  objectSize,
  pickBackgroundColor,
  rotateEditorPage,
} from '../lib/docEditor'
import type {
  CoverRect,
  EditorObject,
  EditorPage,
  ImageObject,
  MarkObject,
  TextAlign,
  TextFamily,
  TextObject,
  ToPdfPoint,
} from '../lib/docEditor'
import { ColorPicker } from './ColorPicker'
import type { TextRun } from '../lib/pdfText'
import { OCR_LANGS, recognizeImage } from '../lib/ocr'
import { prepareForOcr } from '../lib/ocrImage'
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
import { snapFrame } from '../lib/frame'

type Tool =
  | 'select'
  | 'text'
  | 'erase'
  | 'highlight'
  | 'ink'
  | 'rect'
  | 'frame'
  | 'line'
  | 'arrow'
  | 'check'
  | 'cross'
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
  highlight: 'Проведите как карандашом — маркер ляжет полупрозрачным штрихом по тексту. Цвет и толщину — справа.',
  frame: 'Обведите блок — рамка сама встанет по его краям с ровными полями. Цвет и толщину — справа.',
  ink: 'Рисуйте от руки мышкой или пальцем. Толщина и цвет пера — справа.',
  rect: 'Растяните рамку вокруг важного места.',
  line: 'Проведите линию: подчеркнуть или зачеркнуть.',
  arrow: 'Растяните стрелку — покажет, где ошибка.',
  check: 'Щёлкните по листу — поставится галочка. Размер ставится справа.',
  cross: 'Щёлкните по листу — поставится крестик. Размер ставится справа.',
}

/** Одиночные штампы: один тап ставит готовую отметку. */
const STAMP_TOOLS: Tool[] = ['check', 'cross']
/** Фигуры рисуются протяжкой рамки. */
const DRAG_TOOLS: Tool[] = ['highlight', 'frame', 'rect', 'line', 'arrow', 'ink']

/** Что сейчас делает распознавание: на телефоне загрузка языка — самое долгое место. */
const OCR_STATUS_LABELS: Record<string, string> = {
  'loading tesseract core': 'Движок…',
  'initializing tesseract': 'Старт…',
  'loading language traineddata': 'Язык…',
  'initializing api': 'Словарь…',
  'recognizing text': 'Текст…',
}

const IMAGE_HINT = 'Фото встанет на страницу. Тащите его мышкой или пальцем, а за уголок справа снизу меняйте размер.'

const TEXT_HINTS: Record<TextMode, string> = {
  flow: 'По линии: щёлкните строку — правите её как в Word, длинный текст переносится по ширине этой строки. Ширину можно менять ползунком справа. Щелчок по пустому месту — новый абзац от поля до поля.',
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

/** Группа ленты: кнопки сверху, подпись снизу — как в WPS и Word. */
function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ed-group">
      {children}
      <span className="ed-group-label">{label}</span>
    </div>
  )
}

function RibbonBtn({
  icon,
  label,
  active,
  disabled,
  onClick,
  title,
}: {
  icon?: string
  label: ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      className={`ed-tool${active ? ' is-active' : ''}`}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onClick={onClick}
      title={title ?? (typeof label === 'string' ? label : undefined)}
    >
      {icon ? <Icon d={icon} /> : null}
      <span className="ed-tool-label">{label}</span>
    </button>
  )
}

/** Вкладки ленты: как в WPS — Главная, Вставка, Разметка и остальные. */
type RibbonTab = 'home' | 'insert' | 'layout' | 'review' | 'view' | 'tools'

const RIBBON_TABS: { value: RibbonTab; label: string }[] = [
  { value: 'home', label: 'Главная' },
  { value: 'insert', label: 'Вставка' },
  { value: 'layout', label: 'Разметка страницы' },
  { value: 'review', label: 'Рецензирование' },
  { value: 'view', label: 'Вид' },
  { value: 'tools', label: 'Инструмент' },
]

/** Что запомнили в «Параметрах»: шрифт нового текста и видимость панелей. */
type EditorSettings = {
  fontFamily: TextFamily
  fontSize: number
  lineHeight: number
  showThumbs: boolean
  showPanel: boolean
  showHints: boolean
}

const SETTINGS_KEY = 'congix-editor-settings'

const DEFAULT_SETTINGS: EditorSettings = {
  fontFamily: 'sans',
  fontSize: 14,
  lineHeight: 1.3,
  showThumbs: true,
  showPanel: true,
  showHints: true,
}

function loadSettings(): EditorSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<EditorSettings>
    return {
      fontFamily: parsed.fontFamily === 'serif' || parsed.fontFamily === 'mono' ? parsed.fontFamily : 'sans',
      fontSize:
        typeof parsed.fontSize === 'number' && Number.isFinite(parsed.fontSize)
          ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, parsed.fontSize))
          : DEFAULT_SETTINGS.fontSize,
      lineHeight:
        typeof parsed.lineHeight === 'number' && Number.isFinite(parsed.lineHeight)
          ? Math.min(3, Math.max(1, parsed.lineHeight))
          : DEFAULT_SETTINGS.lineHeight,
      showThumbs: parsed.showThumbs !== false,
      showPanel: parsed.showPanel !== false,
      showHints: parsed.showHints !== false,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

type TextStyleDefaults = {
  family: TextFamily
  size: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  align: TextAlign
  lineHeight: number
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
  marker: 'M5 19l3-1 9-9-3-3-9 9-1 3zM14 5l3 3',
  pen: 'M4 20l3.5-.8L19 7.7l-2.7-2.7L4.8 16.5zM15 4.5l3 3',
  rect: 'M4 5h16v14H4z',
  frame: 'M4 5h16v14H4zM7 8h10v8H7z',
  line: 'M5 19L19 5',
  arrow: 'M5 19L19 5M19 5h-6M19 5v6',
  check: 'M5 13l4 4L19 7',
  cross: 'M6 6l12 12M18 6L6 18',
  sign: 'M3 16c3.5 0 5-9 8-9s1.5 7 4 7 2-4 6-4',
  rotate: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5',
  word: 'M4 4h16v16H4zM8 8l1.4 8L12 9l2.6 7L16 8',
  txt: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.5H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.5 3H10a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3',
  alignLeft: 'M4 6h16M4 10h10M4 14h16M4 18h10',
  alignCenter: 'M4 6h16M7 10h10M4 14h16M7 18h10',
  alignRight: 'M4 6h16M10 10h10M4 14h16M10 18h10',
  justify: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  calendar: 'M4 6h16v14H4zM4 10h16M8 4v4M16 4v4',
  caret: 'M6 9l6 6 6-6',
  crop: 'M6 3v15h15M3 6h15v15M6 21V6h15',
}

/**
 * Размер шрифта как в Word: можно выбрать готовое значение из списка
 * или вписать любое своё число.
 */
function FontSizeField({ value, onChange }: { value: number; onChange: (size: number) => void }) {
  const [draft, setDraft] = useState(String(Math.round(value * 10) / 10))
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => setDraft(String(Math.round(value * 10) / 10)), [value])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(',', '.').trim())
    if (!raw.trim() || !Number.isFinite(parsed)) {
      setDraft(String(Math.round(value * 10) / 10))
      return
    }
    const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(parsed * 10) / 10))
    setDraft(String(next))
    if (next !== Math.round(value * 10) / 10) onChange(next)
  }

  return (
    <span className="ed-size" ref={rootRef}>
      <input
        className="field-input ed-size-input"
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit((event.target as HTMLInputElement).value)
            setOpen(false)
          }
          if (event.key === 'Escape') setOpen(false)
        }}
        aria-label="Размер шрифта, можно вписать своё число"
      />
      <button
        type="button"
        className="ed-size-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Готовые размеры шрифта"
        title="Выбрать из списка"
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <span className="ed-size-menu" role="listbox" aria-label="Размеры шрифта">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={Math.round(value) === size}
              className={`ed-size-option${Math.round(value) === size ? ' is-active' : ''}`}
              onClick={() => {
                setDraft(String(size))
                onChange(size)
                setOpen(false)
              }}
            >
              {size}
            </button>
          ))}
        </span>
      )}
    </span>
  )
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
  const [history, setHistory] = useState<EditorPage[][]>([])
  const [future, setFuture] = useState<EditorPage[][]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tab, setTab] = useState<RibbonTab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) return false
    return loadSettings().showPanel
  })
  const [thumbsOpen, setThumbsOpen] = useState(() => loadSettings().showThumbs)
  const [textStyle, setTextStyle] = useState<TextStyleDefaults>(() => {
    const saved = loadSettings()
    return {
      family: saved.fontFamily,
      size: saved.fontSize,
      color: TEXT_COLORS[0].value,
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      align: 'left',
      lineHeight: saved.lineHeight,
    }
  })
  const [runs, setRuns] = useState<Record<number, TextRun[]>>({})
  const [ocrLang, setOcrLang] = useState<OcrLang>('rus+eng')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState('')
  const [dropPage, setDropPage] = useState<number | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [erasePreview, setErasePreview] = useState<CoverRect | null>(null)
  const [selectedCover, setSelectedCover] = useState<number | null>(null)
  const [dragPage, setDragPage] = useState<number | null>(null)
  const [markColor, setMarkColor] = useState('FDE047')
  const [penColor, setPenColor] = useState('111111')
  const [penWidth, setPenWidth] = useState(2)
  const [markWidth, setMarkWidth] = useState(12)
  const [stampSize, setStampSize] = useState(32)
  const [drawing, setDrawing] = useState<MarkObject | null>(null)
  const [signOpen, setSignOpen] = useState(false)

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
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const recognizeRef = useRef<(target?: EditorPage, targetIndex?: number) => Promise<void>>(async () => {})
  const pressRef = useRef<{ index: number; x: number; y: number; active: boolean } | null>(null)
  const dropRef = useRef<number | null>(null)
  const movedRef = useRef(false)
  const markRef = useRef<{ tool: Tool; start: { x: number; y: number }; points: { x: number; y: number }[] } | null>(null)
  const drawingRef = useRef<MarkObject | null>(null)
  const buildMarkRef = useRef<(tool: Tool, start: { x: number; y: number }, end: { x: number; y: number }, points: { x: number; y: number }[], id: string) => MarkObject>(() => {
    throw new Error('not ready')
  })

  pagesRef.current = pages
  indexRef.current = index
  ocrBusyRef.current = ocrBusy

  const page = pages[index] ?? null
  const boxWidth = page?.box.width ?? 0
  const scale = fitScale * zoom
  const selectedObject = page?.objects.find((object) => object.id === selected) ?? null
  const selectedText = selectedObject?.kind === 'text' ? selectedObject : null
  // Лента показывает стиль выделенного текста, а без выделения — стиль нового текста.
  const activeStyle: TextStyleDefaults = selectedText
    ? {
        family: selectedText.family ?? textStyle.family,
        size: selectedText.size,
        color: selectedText.color,
        bold: Boolean(selectedText.bold),
        italic: Boolean(selectedText.italic),
        underline: Boolean(selectedText.underline),
        strike: Boolean(selectedText.strike),
        align: selectedText.align ?? 'left',
        lineHeight: lineHeightOf(selectedText),
      }
    : textStyle
  const coverList = page?.covers ?? []
  const selectedCoverRect = selectedCover !== null ? (coverList[selectedCover] ?? null) : null
  const zoomPercent = Math.round(zoom * 100)
  const ocrLabel =
    ocrStatus === 'recognizing text'
      ? `${Math.round(ocrProgress * 100)}%`
      : (OCR_STATUS_LABELS[ocrStatus] ?? 'Готовим…')
  // Пипетка для заплаток: берём цвет фона из того же растра, что видит пользователь.
  const sampleCoverColor = (x: number, y: number, width: number, height: number) => {
    // На странице-фото лист рисуется картинкой, поэтому цвет берём из неё.
    const base = page?.objects.find((object): object is ImageObject => object.kind === 'image' && Boolean(object.base))
    if (page?.source === null && base && baseCanvasRef.current) {
      return pickBackgroundColor(baseCanvasRef.current, { x, y, width, height }, 1)
    }
    return pickBackgroundColor(canvasRef.current, { x, y, width, height }, scale)
  }
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

  // Меню закрывается щелчком мимо и по Esc, как обычное меню на сайте.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (event: MouseEvent) => {
      if (!(event.target as Element | null)?.closest('.ed-menu-wrap')) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const loadRuns = useCallback(async (model: EditorPage) => {
    if (model.source === null || runsRef.current[model.source]) return
    const proxy =
      pageCache.current.get(model.source) ??
      (docRef.current ? await docRef.current.getPage(model.source + 1) : null)
    if (!proxy) return
    pageCache.current.set(model.source, proxy)
    try {
      const list = await (await import('../lib/pdfText')).readPageRuns(proxy)
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

  // Копия фото-подложки в памяти: нужна пипетке для цвета заплаток.
  const baseImage = page?.objects.find((object): object is ImageObject => object.kind === 'image' && Boolean(object.base))
  const baseImageId = baseImage?.id ?? null
  const baseBoxWidth = page?.box.width ?? 0
  const baseBoxHeight = page?.box.height ?? 0

  useEffect(() => {
    baseCanvasRef.current = null
    if (!baseImage) return
    let cancelled = false
    void createImageBitmap(
      new Blob([baseImage.data as BlobPart], { type: baseImage.type === 'png' ? 'image/png' : 'image/jpeg' }),
    )
      .then((bitmap) => {
        if (cancelled) return
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(baseBoxWidth))
        canvas.height = Math.max(1, Math.round(baseBoxHeight))
        canvas.getContext('2d')?.drawImage(bitmap, baseImage.x, baseImage.y, baseImage.width, baseImage.height)
        bitmap.close()
        baseCanvasRef.current = canvas
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImageId, baseBoxWidth, baseBoxHeight])

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
        // pdf.js (406 КБ) подключается только когда файл уже выбран.
        const { openPdf } = await import('../lib/pdf')
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
      // Поля считаем у внутренней обёртки: на телефоне они меньше.
      const inner = wrap.firstElementChild
      const styles = getComputedStyle(inner ?? wrap)
      const padding = inner ? parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) : 0
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
      const viewport = proxy.getViewport({ scale, rotation: (proxy.rotate + (model.rotate ?? 0)) % 360 })
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
                objects: item.objects.map((object) => {
                  if (object.id !== id) return object
                  const next = { ...object, ...patch } as EditorObject
                  // Распознанную строку тронули руками — значит, она теперь своя:
                  // повторное «Распознать» не имеет права её перезаписать.
                  if (next.kind === 'text' && next.ocr && !next.edited) return { ...next, edited: true }
                  return next
                }),
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
      size: textStyle.size,
      color: textStyle.color,
      family: textStyle.family,
      align: textStyle.align,
      lineHeight: textStyle.lineHeight,
      bold: textStyle.bold || undefined,
      italic: textStyle.italic || undefined,
      underline: textStyle.underline || undefined,
      strike: textStyle.strike || undefined,
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
    // Блок по умолчанию держит ширину исходной строки: длинный текст переносится внутри неё
    // и не наезжает на соседние строки. Расширить можно ползунком «Ширина блока».
    const maxWidth = Math.max(60, page.box.width - run.x - 6)
    const width = Math.min(maxWidth, Math.max(run.width + (textMode === 'flow' ? 0 : 12), 60))
    const object: TextObject = {
      kind: 'text',
      id: uid(),
      x: run.x,
      y: run.y,
      text: run.text,
      size: Math.max(6, Math.min(48, Math.round(run.size * 10) / 10)),
      color: textStyle.color,
      width,
    }
    // Пятно принадлежит этому тексту: удалишь текст — уйдёт и пятно.
    const cover: CoverRect = {
      x: Math.max(0, run.x - 1.5),
      y: Math.max(0, run.y - 1.5),
      width: Math.min(run.width + 3, page.box.width - Math.max(0, run.x - 1.5)),
      height: run.height + 3,
      owner: object.id,
      color: sampleCoverColor(run.x - 1.5, run.y - 1.5, run.width + 3, run.height + 3),
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
      const data: Uint8Array = bytes
      const mime = type === 'png' ? 'image/png' : 'image/jpeg'
      const bitmap = await createImageBitmap(new Blob([data as BlobPart], { type: mime }))
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
        data,
        type,
      }
      bitmap.close()
      addPageObject([object])
      setSelected(object.id)
      setTool('select')
      setMessage({
        tone: 'ok',
        text: 'Фото добавлено и уже выделено — тащите его по странице или за уголок меняйте размер.',
      })
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

  const removePageAt = (target: number) => {
    if (pages.length <= 1) {
      setMessage({ tone: 'error', text: 'В документе должна остаться хотя бы одна страница.' })
      return
    }
    mutate((current) => current.filter((_, itemIndex) => itemIndex !== target))
    setIndex((current) => Math.max(0, Math.min(current > target ? current - 1 : current, pages.length - 2)))
    setSelected(null)
    setSelectedCover(null)
    setMessage({ tone: 'info', text: `Страница ${target + 1} удалена. Ctrl+Z вернёт её на место.` })
  }

  const removePage = () => removePageAt(index)

  /** Перетащили миниатюру: страницы меняются местами, номера пересчитываются сами. */
  const movePage = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= pages.length || to >= pages.length) return
    mutate((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setIndex(to)
    setSelected(null)
    setSelectedCover(null)
    setMessage({ tone: 'info', text: `Страница ${from + 1} теперь на месте ${to + 1}.` })
  }

  const removeSelected = useCallback(() => {
    if (!selected) return
    mutate((current) =>
      current.map((item, itemIndex) =>
        itemIndex !== index
          ? item
          : {
              ...item,
              objects: item.objects.filter((object) => object.id !== selected),
              // Белое пятно уходит вместе со своим текстом — иначе на листе остаётся дырка.
              covers: (item.covers ?? []).filter((cover) => cover.owner !== selected),
            },
      ),
    )
    setSelected(null)
    setSelectedCover(null)
  }, [index, mutate, selected])

  /** Убрать конкретное белое пятно, не трогая остальные. */
  const removeCover = useCallback(
    (coverIndex: number) => {
      mutate((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, covers: (item.covers ?? []).filter((_, position) => position !== coverIndex) }
            : item,
        ),
      )
      setSelectedCover(null)
      setMessage({ tone: 'ok', text: 'Белое пятно убрано — под ним снова видно исходное содержимое.' })
    },
    [index, mutate],
  )

  const setDrawPreview = (value: MarkObject | null) => {
    drawingRef.current = value
    setDrawing(value)
  }

  /** Собирает пометку по протяжке мыши: маркер, рамка, линия, стрелка, карандаш. */
  const buildMark = (
    tool: Tool,
    start: { x: number; y: number },
    end: { x: number; y: number },
    points: { x: number; y: number }[],
    id: string,
  ): MarkObject => {
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    if (tool === 'ink' || tool === 'highlight') {
      const xs = points.map((point) => point.x)
      const ys = points.map((point) => point.y)
      const left = Math.min(...xs)
      const top = Math.min(...ys)
      const marker = tool === 'highlight'
      const thickness = marker ? Math.max(6, markWidth) : penWidth
      // Штрих маркера толще пера — расширяем его рамку на половину толщины,
      // иначе тонкая горизонтальная полоса превратится в точку.
      const half = marker ? thickness / 2 : 0
      const boxLeft = Math.max(0, left - half)
      const boxTop = Math.max(0, top - half)
      return {
        kind: 'mark',
        mark: marker ? 'highlight' : 'ink',
        id,
        x: boxLeft,
        y: boxTop,
        width: Math.max(0.5, Math.max(...xs) + half - boxLeft),
        height: Math.max(0.5, Math.max(...ys) + half - boxTop),
        color: marker ? markColor : penColor,
        stroke: thickness,
        opacity: marker ? 0.35 : undefined,
        points,
      }
    }

    if (tool === 'rect') {
      return { kind: 'mark', mark: 'rect', id, x, y, width, height, color: penColor, stroke: penWidth }
    }

    if (tool === 'frame') {
      // Края подгонит snapFrame в момент отпускания — здесь только черновик.
      return {
        kind: 'mark',
        mark: 'frame',
        id,
        x,
        y,
        width: Math.max(8, width),
        height: Math.max(8, height),
        color: penColor,
        stroke: penWidth,
      }
    }

    // Линия и стрелка: направление задаётся тем, куда тянули.
    return {
      kind: 'mark',
      mark: tool === 'arrow' ? 'arrow' : 'line',
      id,
      x,
      y,
      width: Math.max(1, width),
      height: Math.max(1, height),
      color: penColor,
      stroke: penWidth,
      flipX: end.x < start.x,
      flipY: end.y < start.y,
    }
  }

  buildMarkRef.current = buildMark

  const addMark = (object: MarkObject) => {
    addPageObject([object])
    setSelected(object.id)
    setSelectedCover(null)
    setPanelOpen(true)
  }

  const stampMark = (tool: Tool, x: number, y: number) => {
    if (!page) return
    const size = Math.max(14, Math.min(120, stampSize))
    addMark({
      kind: 'mark',
      mark: tool === 'check' ? 'check' : 'cross',
      id: uid(),
      x: Math.max(0, Math.min(x - size / 2, page.box.width - size)),
      y: Math.max(0, Math.min(y - size / 2, page.box.height - size)),
      width: size,
      height: size,
      color: penColor === '111111' ? '0F7B4F' : penColor,
      stroke: Math.max(1.4, size / 11),
    })
  }

  /** Поворот страницы: у PDF крутим саму страницу, у фото — перерисовываем снимок. */
  const rotatePageBy = async (delta: number) => {
    if (!page) return

    // Всё содержимое едет вместе с листом: текст, подписи, пятна и пометки.
    const rotated = rotateEditorPage(page, delta > 0)

    if (page.source === null) {
      const base = page.objects.find((object): object is ImageObject => object.kind === 'image' && Boolean(object.base))
      if (!base) return
      try {
        const bitmap = await createImageBitmap(
          new Blob([base.data as BlobPart], { type: base.type === 'png' ? 'image/png' : 'image/jpeg' }),
        )
        const canvas = document.createElement('canvas')
        canvas.width = rotated.box.width
        canvas.height = rotated.box.height
        const context = canvas.getContext('2d')
        if (!context) return
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate(delta > 0 ? Math.PI / 2 : -Math.PI / 2)
        context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
        bitmap.close()
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
        if (!blob) return
        const bytes = new Uint8Array(await blob.arrayBuffer())
        const nextPage: EditorPage = {
          ...rotated,
          objects: rotated.objects.map((object) =>
            object.kind === 'image' && object.base
              ? { ...object, data: bytes, type: 'png' as const, x: 0, y: 0, width: rotated.box.width, height: rotated.box.height }
              : object,
          ),
        }
        mutate((current) => current.map((item, itemIndex) => (itemIndex === index ? nextPage : item)))
        setSelected(null)
        setSelectedCover(null)
        setMessage({ tone: 'info', text: 'Фото и всё, что на нём было, повёрнуто вместе со страницей.' })
      } catch {
        setMessage({ tone: 'error', text: 'Не получилось повернуть фото — попробуйте другой файл.' })
      }
      return
    }

    mutate((current) => current.map((item, itemIndex) => (itemIndex === index ? rotated : item)))
    setSelected(null)
    setSelectedCover(null)
    setMessage({ tone: 'info', text: 'Страница повёрнута вместе с текстом и пометками.' })
  }

  /** Подпись из модального окна встаёт картинкой по центру листа. */
  const insertSignature = async (bytes: Uint8Array) => {
    if (!page) return
    try {
      const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: 'image/png' }))
      const size = fitImage(page.box, bitmap.width, bitmap.height, 0.42)
      const position = clampPosition(
        page.box,
        Math.round((page.box.width - size.width) / 2),
        Math.round(page.box.height * 0.6),
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
        type: 'png',
      }
      bitmap.close()
      addPageObject([object])
      setSelected(object.id)
      setPanelOpen(true)
      setSignOpen(false)
      setMessage({ tone: 'ok', text: 'Подпись поставлена. Тащите её мышкой или пальцем и меняйте размер за уголок.' })
    } catch {
      setMessage({ tone: 'error', text: 'Не получилось вставить подпись.' })
    }
  }

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
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedCover !== null) {
        event.preventDefault()
        removeCover(selectedCover)
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
  }, [redo, removeCover, removeSelected, selected, selectedCover, undo])

  // Уведомление снизу не должно висеть вечно: ошибки держим дольше, остальное
  // убираем само. Повторное сообщение перезапускает таймер.
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), message.tone === 'error' ? 9000 : 4500)
    return () => window.clearTimeout(timer)
  }, [message])

  // Один снимок на жест: Ctrl+Z должен возвращать объект на место, а не удалять его.
  const snapshot = () => {
    setHistory((previous) => [...previous.slice(-40), pagesRef.current])
    setFuture([])
  }

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const model = pagesRef.current[index]
      if (!model) return

      if (markRef.current) {
        const stage = canvasRef.current?.getBoundingClientRect()
        if (!stage) return
        const x = Math.max(0, Math.min((event.clientX - stage.left) / scale, model.box.width))
        const y = Math.max(0, Math.min((event.clientY - stage.top) / scale, model.box.height))
        const current = markRef.current
        if (current.tool === 'ink' || current.tool === 'highlight') {
          const last = current.points[current.points.length - 1]
          if (!last || Math.hypot(x - last.x, y - last.y) > 0.7) current.points.push({ x, y })
        }
        setDrawPreview(buildMarkRef.current(current.tool, current.start, { x, y }, current.points, 'preview'))
        return
      }

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
      const markStart = markRef.current
      markRef.current = null
      if (markStart) {
        const preview = drawingRef.current
        setDrawPreview(null)
        if (preview) {
          const inked = (preview.points?.length ?? 0) > 1
          const drawn = preview.width > 2 || preview.height > 2
          const keep = preview.points ? inked : drawn
          if (keep) {
            if (preview.mark === 'frame') {
              const model = pagesRef.current[index]
              if (model) {
                const targets = model.objects
                  .filter((object) => !(object.kind === 'image' && object.base))
                  .map((object) => ({
                    x: object.x,
                    y: object.y,
                    width: object.width,
                    height: object.kind === 'text' ? object.size * 1.5 : object.height,
                  }))
                const snapped = snapFrame(preview, targets, model.box)
                addMark({
                  ...preview,
                  x: snapped.x,
                  y: snapped.y,
                  width: snapped.width,
                  height: snapped.height,
                  id: uid(),
                })
                setMessage({
                  tone: 'ok',
                  text:
                    snapped.snap === 'content'
                      ? 'Рамка встала по краям содержимого — поля ровные.'
                      : snapped.snap === 'page'
                        ? 'Рамка встала по полям листа — отступы со всех сторон одинаковые.'
                        : 'Рамка выровнена по сетке. Её можно перетащить за край.',
                })
              }
            } else {
              addMark({ ...preview, id: uid() })
            }
          }
        }
      }

      const start = eraseRef.current
      const preview = erasePreview
      eraseRef.current = null
      if (start && preview && preview.width > 2 && preview.height > 1) {
        mutate((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  covers: [
                    ...(item.covers ?? []),
                    {
                      ...preview,
                      width: Math.max(3, preview.width),
                      height: Math.max(2, preview.height),
                      color: sampleCoverColor(preview.x, preview.y, preview.width, preview.height),
                    },
                  ],
                }
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

    if (STAMP_TOOLS.includes(tool)) {
      event.preventDefault()
      stampMark(tool, x, y)
      return
    }

    if (DRAG_TOOLS.includes(tool)) {
      event.preventDefault()
      markRef.current = { tool, start: { x, y }, points: [{ x, y }] }
      setDrawPreview(buildMarkRef.current(tool, { x, y }, { x, y }, [{ x, y }], 'preview'))
      return
    }

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
      const { renderPageRaster } = await import('../lib/pdfText')
      return renderPageRaster(proxy, 2400)
    }

    const ratio = Math.min(4, Math.max(1.2, 2400 / Math.max(1, model.box.width)))
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
      // Распознаём по подготовленной копии: крупнее, серым и без теней. Цвет фона
      // для заплаток берём из исходного растра, поэтому его не трогаем.
      const prepared = prepareForOcr(canvas)
      const lines = await recognizeImage(
        prepared.canvas,
        ocrLang,
        (progress, status) => {
          setOcrProgress(progress)
          setOcrStatus(status ?? '')
        },
        rasterScale * prepared.scale,
        prepared.toSource,
      )
      // Растр ещё нужен: из него берём цвет фона для заплаток.

      if (!lines.length) {
        setMessage({
          tone: 'error',
          text: 'Текст не распознан. Попробуйте снимок крупнее и ровнее или другой язык распознавания.',
        })
        return
      }

      const objects: TextObject[] = []
      const newCovers: CoverRect[] = []

      // Строки, которые человек уже поправил руками, остаются как есть: OCR заменяет
      // только нетронутые. Новые строки на месте поправленных пропускаем, иначе
      // поверх ручной правки лёг бы второй текст.
      const handwritten = model.objects.filter(
        (object): object is TextObject => object.kind === 'text' && Boolean(object.ocr && object.edited),
      )
      const previousOcr = new Set(
        model.objects
          .filter((object) => object.kind === 'text' && object.ocr && !object.edited)
          .map((object) => object.id),
      )
      // Пятна, которые останутся после распознавания: замазка (пятна без хозяина)
      // и пятна правленых строк. Всё, что человек закрыл, OCR не возвращает обратно.
      const keptCovers = (model.covers ?? []).filter((cover) => !cover.owner || !previousOcr.has(cover.owner))
      const coversLine = (line: { x: number; y: number; width: number; height: number }) => {
        const centerX = line.x + line.width / 2
        const centerY = line.y + line.height / 2
        return keptCovers.some(
          (cover) =>
            centerX >= cover.x &&
            centerX <= cover.x + cover.width &&
            centerY >= cover.y &&
            centerY <= cover.y + cover.height,
        )
      }

      let skipped = 0
      for (const line of lines) {
        if (coversLine(line)) {
          skipped += 1
          continue
        }
        const size = Math.max(6, Math.min(48, Math.round(line.height * 0.78 * 10) / 10))
        const object: TextObject = {
          kind: 'text',
          id: uid(),
          x: Math.round(line.x * 10) / 10,
          y: Math.round(line.y * 10) / 10,
          text: line.text,
          size,
          color: TEXT_COLORS[0].value,
          width: Math.min(model.box.width - line.x - 4, Math.max(line.width + 10, 40)),
          ocr: true,
        }
        objects.push(object)
        newCovers.push({
          x: Math.max(0, line.x - 1),
          y: Math.max(0, line.y - 1),
          width: Math.min(line.width + 2, model.box.width - line.x + 1),
          height: line.height + 2,
          owner: object.id,
          color: pickBackgroundColor(canvas, { x: line.x, y: line.y, width: line.width, height: line.height }, rasterScale),
        })
      }

      // Повторное распознавание заменяет только нетронутые строки: поправленные
      // руками остаются на своих местах вместе со своими пятнами.
      mutate((current) =>
        current.map((item, itemIndex) =>
          itemIndex === at
            ? {
                ...item,
                objects: [...item.objects.filter((object) => !previousOcr.has(object.id)), ...objects],
                covers: [
                  ...(item.covers ?? []).filter((cover) => !cover.owner || !previousOcr.has(cover.owner)),
                  ...newCovers,
                ],
              }
            : item,
        ),
      )
      // Фото и сканы после распознавания ведём сразу в правку текста.
      setTool('text')
      setMessage({
        tone: 'ok',
        text: `Распознано строк: ${objects.length}.${
          handwritten.length ? ` Ваши правки сохранены: ${handwritten.length}.` : ''
        }${skipped ? ` Закрытых областей пропущено: ${skipped}.` : ''} Текст стал редактируемым — щёлкните по нему и правьте справа.`,
      })
      track('Редактор PDF', 'done')
    } catch (error) {
      console.error(error)
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      setMessage({
        tone: 'error',
        text: offline
          ? 'Нет интернета: языковые данные распознавания скачиваются при первом запуске. Подключитесь к сети и нажмите «Распознать» ещё раз.'
          : 'Не удалось загрузить языковые данные распознавания. Проверьте интернет и нажмите «Распознать» ещё раз — скачанный язык сохранится, и следующий запуск будет быстрым.',
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
        const viewport = proxy.getViewport({
          scale: 1,
          rotation: (proxy.rotate + (model.rotate ?? 0)) % 360,
        })
        converters.push((x, y) => viewport.convertToPdfPoint(x, y) as [number, number])
      }

      const result = await composePdf({
        source: kind === 'pdf' ? file : null,
        pages,
        toPdf: (pageIndex, x, y) => converters[pageIndex](x, y),
        eraseAnnotations: false,
      })

      const name = (docName || 'document').replace(/[\\/:*?"<>|]+/g, '-')
      download(result.blob, `${name}-edited.pdf`)
      track('Редактор PDF', 'done')
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

  /** Параметры редактора: применяем сразу и запоминаем в браузере. */
  const changeSettings = (patch: Partial<EditorSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      // Приватный режим может запрещать хранилище — настройки просто не запомнятся.
    }
    if (patch.fontFamily) setTextStyle((current) => ({ ...current, family: patch.fontFamily as TextFamily }))
    if (patch.fontSize) setTextStyle((current) => ({ ...current, size: patch.fontSize as number }))
    if (patch.lineHeight) setTextStyle((current) => ({ ...current, lineHeight: patch.lineHeight as number }))
    if (patch.showThumbs !== undefined) setThumbsOpen(patch.showThumbs)
    if (patch.showPanel !== undefined) setPanelOpen(patch.showPanel)
  }

  const toggleThumbs = () => changeSettings({ showThumbs: !thumbsOpen })
  const togglePanel = () => changeSettings({ showPanel: !panelOpen })

  /** Форматирование: применяем к выделенному тексту и запоминаем как стиль нового. */
  const applyTextStyle = (patch: Partial<TextObject>) => {
    setTextStyle((current) => ({ ...current, ...patch }) as TextStyleDefaults)
    if (selectedText) updateObject(selectedText.id, patch)
  }

  const stepFontSize = (direction: 1 | -1) => {
    const sizes = FONT_SIZES as readonly number[]
    const current = activeStyle.size
    if (direction > 0) {
      applyTextStyle({ size: sizes.find((size) => size > current) ?? Math.min(MAX_FONT_SIZE, Math.round(current + 2)) })
    } else {
      applyTextStyle({ size: [...sizes].reverse().find((size) => size < current) ?? Math.max(MIN_FONT_SIZE, Math.round(current - 1)) })
    }
  }

  /** Дата в документе — обычный текст, без серверов и шаблонов. */
  const insertDate = () => {
    if (!page) return
    const margin = pageMargin(page.box.width)
    const text = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
    const object: TextObject = {
      kind: 'text',
      id: uid(),
      x: margin,
      y: margin,
      text,
      size: textStyle.size,
      color: textStyle.color,
      family: textStyle.family,
      align: 'left',
      lineHeight: textStyle.lineHeight,
      width: Math.max(120, page.box.width - margin * 2),
    }
    addPageObject([object])
    setSelected(object.id)
    setTool('select')
    setPanelOpen(true)
    setMessage({ tone: 'ok', text: 'Дата вставлена вверху страницы — перетащите или правьте справа.' })
  }

  const setOrientation = (landscape: boolean) => {
    if (!page) return
    const isLandscape = page.box.width > page.box.height
    if (isLandscape === landscape) {
      setMessage({ tone: 'info', text: landscape ? 'Страница уже альбомная.' : 'Страница уже книжная.' })
      return
    }
    void rotatePageBy(90)
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
        <Link className="ed-brand" to={ROUTES.tools} aria-label="Congix Docs — к инструментам">
          <span className="ed-brand-mark">C</span>
          <span className="ed-brand-name">
            Congix Docs <small>Редактор</small>
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
            </>
          ) : (
            <span className="ed-doc-name">Новый документ</span>
          )}
        </div>

        <div className="ed-top-actions">
          <Link className="ed-close" to={ROUTES.tools}>
            <Icon d={ICONS.close} />
            <span>Закрыть</span>
          </Link>
        </div>
      </header>

      <div className="ed-tabs">
        <div className="ed-menu-wrap">
          <button
            type="button"
            className={`ed-menu-btn${menuOpen ? ' is-active' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Icon d={ICONS.menu} />
            <span>Меню</span>
            <svg className="ed-menu-caret" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="ed-menu" role="menu" aria-label="Меню документа">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  openAnotherFile()
                }}
              >
                <Icon d={ICONS.folder} />
                <span>Открыть файл…</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!hasDoc || busy}
                onClick={() => {
                  setMenuOpen(false)
                  void save()
                }}
              >
                <Icon d={ICONS.download} />
                <span>Скачать PDF</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!hasDoc || busy}
                onClick={() => {
                  setMenuOpen(false)
                  void saveWord()
                }}
              >
                <Icon d={ICONS.word} />
                <span>Скачать Word (.docx)</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!hasDoc || busy}
                onClick={() => {
                  setMenuOpen(false)
                  saveText()
                }}
              >
                <Icon d={ICONS.txt} />
                <span>Скачать текст (.txt)</span>
              </button>
              <span className="ed-menu-sep" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setSettingsOpen(true)
                }}
              >
                <Icon d={ICONS.gear} />
                <span>Параметры</span>
              </button>
              <Link to={ROUTES.tools} className="ed-menu-link" role="menuitem">
                <Icon d={ICONS.close} />
                <span>Закрыть редактор</span>
              </Link>
            </div>
          )}
        </div>

        <nav className="ed-tab-list" role="tablist" aria-label="Лента редактора">
          {RIBBON_TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              className={`ed-tab${tab === item.value ? ' is-active' : ''}`}
              disabled={!hasDoc}
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="ed-settings-btn"
          onClick={() => setSettingsOpen(true)}
          title="Параметры редактора"
        >
          <Icon d={ICONS.gear} />
          <span>Параметры</span>
        </button>
      </div>

      {hasDoc && (
        <div className="ed-ribbon" role="tabpanel" aria-label={RIBBON_TABS.find((item) => item.value === tab)?.label}>
          {tab === 'home' && (
            <>
              <RibbonGroup label="Шрифт">
                <div className="ed-group-row ed-font-row">
                  <select
                    className="ed-select ed-font-select"
                    value={activeStyle.family}
                    onChange={(event) => applyTextStyle({ family: event.target.value as TextFamily })}
                    aria-label="Шрифт"
                    title="Шрифт текста"
                  >
                    {TEXT_FONTS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <FontSizeField value={activeStyle.size} onChange={(size) => applyTextStyle({ size })} />
                  <div className="ed-step-col">
                    <button type="button" className="ed-step" onClick={() => stepFontSize(1)} title="Крупнее шрифт">
                      A+
                    </button>
                    <button type="button" className="ed-step" onClick={() => stepFontSize(-1)} title="Мельче шрифт">
                      A−
                    </button>
                  </div>
                </div>
                <div className="ed-group-row ed-format-row">
                  <button
                    type="button"
                    className={`ed-fmt${activeStyle.bold ? ' is-active' : ''}`}
                    aria-pressed={activeStyle.bold}
                    title="Полужирный"
                    onClick={() => applyTextStyle({ bold: !activeStyle.bold })}
                  >
                    <b>B</b>
                  </button>
                  <button
                    type="button"
                    className={`ed-fmt${activeStyle.italic ? ' is-active' : ''}`}
                    aria-pressed={activeStyle.italic}
                    title="Курсив"
                    onClick={() => applyTextStyle({ italic: !activeStyle.italic })}
                  >
                    <i>I</i>
                  </button>
                  <button
                    type="button"
                    className={`ed-fmt${activeStyle.underline ? ' is-active' : ''}`}
                    aria-pressed={activeStyle.underline}
                    title="Подчёркнутый"
                    onClick={() => applyTextStyle({ underline: !activeStyle.underline })}
                  >
                    <u>U</u>
                  </button>
                  <button
                    type="button"
                    className={`ed-fmt${activeStyle.strike ? ' is-active' : ''}`}
                    aria-pressed={activeStyle.strike}
                    title="Зачёркнутый"
                    onClick={() => applyTextStyle({ strike: !activeStyle.strike })}
                  >
                    <s>S</s>
                  </button>
                  <span className="ed-color-item">
                    <ColorPicker
                      value={activeStyle.color}
                      onChange={(color) => applyTextStyle({ color })}
                      label="Цвет текста"
                    />
                    <small>Цвет</small>
                  </span>
                  <span className="ed-color-item">
                    <ColorPicker value={markColor} onChange={setMarkColor} label="Цвет маркера" />
                    <small>Маркер</small>
                  </span>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Абзац">
                <div className="ed-group-row">
                  {(
                    [
                      ['left', 'По левому краю', ICONS.alignLeft],
                      ['center', 'По центру', ICONS.alignCenter],
                      ['right', 'По правому краю', ICONS.alignRight],
                      ['justify', 'По ширине', ICONS.justify],
                    ] as [TextAlign, string, string][]
                  ).map(([value, label, icon]) => (
                    <button
                      key={value}
                      type="button"
                      className={`ed-fmt${activeStyle.align === value ? ' is-active' : ''}`}
                      aria-pressed={activeStyle.align === value}
                      title={label}
                      onClick={() => applyTextStyle({ align: value })}
                    >
                      <Icon d={icon} />
                    </button>
                  ))}
                </div>
                <div className="ed-group-row ed-para-row">
                  <select
                    className="ed-select ed-spacing"
                    value={String(activeStyle.lineHeight)}
                    onChange={(event) => applyTextStyle({ lineHeight: Number(event.target.value) })}
                    aria-label="Межстрочный интервал"
                    title="Межстрочный интервал"
                  >
                    {[1, 1.15, 1.3, 1.5, 2].map((value) => (
                      <option key={value} value={String(value)}>
                        Интервал {value.toFixed(2).replace(/\.?0+$/, '')}
                      </option>
                    ))}
                  </select>
                </div>
              </RibbonGroup>

              <RibbonGroup label="Вставка">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.text}
                    label="Текст"
                    active={tool === 'text'}
                    onClick={() => setTool('text')}
                  />
                  <RibbonBtn
                    icon={ICONS.image}
                    label="Фото"
                    onClick={() => {
                      setTool('select')
                      imageInputRef.current?.click()
                    }}
                  />
                  <RibbonBtn
                    icon={ICONS.sign}
                    label="Подпись"
                    active={signOpen}
                    onClick={() => {
                      setTool('select')
                      setSignOpen(true)
                    }}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Пометки">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.marker}
                    label="Маркер"
                    active={tool === 'highlight'}
                    onClick={() => setTool('highlight')}
                  />
                  <RibbonBtn
                    icon={ICONS.pen}
                    label="Карандаш"
                    active={tool === 'ink'}
                    onClick={() => setTool('ink')}
                  />
                  <RibbonBtn
                    icon={ICONS.erase}
                    label="Замазка"
                    active={tool === 'erase'}
                    onClick={() => setTool('erase')}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="История">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.undo}
                    label="Отменить"
                    onClick={undo}
                    disabled={!history.length || busy}
                  />
                  <RibbonBtn icon={ICONS.redo} label="Вернуть" onClick={redo} disabled={!future.length || busy} />
                </div>
              </RibbonGroup>
            </>
          )}

          {tab === 'insert' && (
            <>
              <RibbonGroup label="Объекты">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.text}
                    label="Текст"
                    active={tool === 'text'}
                    onClick={() => setTool('text')}
                  />
                  <RibbonBtn
                    icon={ICONS.image}
                    label="Фото"
                    onClick={() => {
                      setTool('select')
                      imageInputRef.current?.click()
                    }}
                  />
                  <RibbonBtn
                    icon={ICONS.sign}
                    label="Подпись"
                    active={signOpen}
                    onClick={() => {
                      setTool('select')
                      setSignOpen(true)
                    }}
                  />
                  <RibbonBtn icon={ICONS.calendar} label="Дата" onClick={insertDate} />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Фигуры">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.rect}
                    label="Рамка"
                    active={tool === 'rect'}
                    onClick={() => setTool('rect')}
                  />
                  <RibbonBtn
                    icon={ICONS.frame}
                    label="Авторамка"
                    active={tool === 'frame'}
                    onClick={() => setTool('frame')}
                  />
                  <RibbonBtn
                    icon={ICONS.line}
                    label="Линия"
                    active={tool === 'line'}
                    onClick={() => setTool('line')}
                  />
                  <RibbonBtn
                    icon={ICONS.arrow}
                    label="Стрелка"
                    active={tool === 'arrow'}
                    onClick={() => setTool('arrow')}
                  />
                  <RibbonBtn
                    icon={ICONS.check}
                    label="Галочка"
                    active={tool === 'check'}
                    onClick={() => setTool('check')}
                  />
                  <RibbonBtn
                    icon={ICONS.cross}
                    label="Крестик"
                    active={tool === 'cross'}
                    onClick={() => setTool('cross')}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Пометки">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.marker}
                    label="Маркер"
                    active={tool === 'highlight'}
                    onClick={() => setTool('highlight')}
                  />
                  <RibbonBtn
                    icon={ICONS.pen}
                    label="Карандаш"
                    active={tool === 'ink'}
                    onClick={() => setTool('ink')}
                  />
                  <RibbonBtn
                    icon={ICONS.erase}
                    label="Замазка"
                    active={tool === 'erase'}
                    onClick={() => setTool('erase')}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Страницы">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.page}
                    label="Пустой лист"
                    onClick={addBlankPage}
                    title="Вставить пустой лист после текущего"
                  />
                </div>
              </RibbonGroup>
            </>
          )}

          {tab === 'layout' && (
            <>
              <RibbonGroup label="Ориентация">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.page}
                    label="Книжная"
                    active={Boolean(page && page.box.width <= page.box.height)}
                    onClick={() => setOrientation(false)}
                    title="Вертикальная страница"
                  />
                  <RibbonBtn
                    icon={ICONS.rotate}
                    label="Альбомная"
                    active={Boolean(page && page.box.width > page.box.height)}
                    onClick={() => setOrientation(true)}
                    title="Горизонтальная страница"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Поворот">
                <div className="ed-group-row">
                  <RibbonBtn
                    label={
                      <span className="ed-flip">
                        <Icon d={ICONS.rotate} />
                      </span>
                    }
                    onClick={() => void rotatePageBy(-90)}
                    title="Повернуть страницу влево"
                  />
                  <RibbonBtn
                    icon={ICONS.rotate}
                    label="Вправо"
                    onClick={() => void rotatePageBy(90)}
                    title="Повернуть страницу вправо"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Страницы">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.page}
                    label="Лист"
                    onClick={addBlankPage}
                    title="Вставить пустой лист"
                  />
                  <RibbonBtn icon={ICONS.copy} label="Копия" onClick={duplicatePage} title="Скопировать страницу" />
                  <RibbonBtn
                    icon={ICONS.trash}
                    label="Удалить"
                    onClick={removePage}
                    disabled={pages.length <= 1}
                    title="Удалить страницу"
                  />
                  <RibbonBtn
                    icon={ICONS.undo}
                    label="Выше"
                    onClick={() => movePage(index, index - 1)}
                    disabled={index === 0}
                    title="Поднять страницу выше"
                  />
                  <RibbonBtn
                    icon={ICONS.redo}
                    label="Ниже"
                    onClick={() => movePage(index, index + 1)}
                    disabled={index >= pages.length - 1}
                    title="Опустить страницу ниже"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Размер страницы">
                <p className="ed-info">
                  {page ? `${Math.round((page.box.width * 25.4) / 72)} × ${Math.round((page.box.height * 25.4) / 72)} мм` : '—'}
                  <small>Страница {index + 1} из {pages.length}</small>
                </p>
              </RibbonGroup>
            </>
          )}

          {tab === 'review' && (
            <>
              <RibbonGroup label="Распознавание">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.scan}
                    label={ocrBusy ? ocrLabel : 'Распознать'}
                    active={ocrBusy}
                    onClick={() => void recognizePage()}
                    disabled={ocrBusy || loading}
                    title="Распознать текст на странице (OCR)"
                  />
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
              </RibbonGroup>

              <RibbonGroup label="Правки">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.erase}
                    label="Убрать пятна"
                    onClick={clearCovers}
                    disabled={!covers.length}
                    title="Удалить все белые пятна на странице"
                  />
                </div>
              </RibbonGroup>

            </>
          )}

          {tab === 'view' && (
            <>
              <RibbonGroup label="Масштаб">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.minus}
                    label="Мельче"
                    onClick={() => changeZoom(zoom - 0.1)}
                    disabled={zoom <= ZOOM_MIN}
                  />
                  <RibbonBtn
                    icon={ICONS.plus}
                    label="Крупнее"
                    onClick={() => changeZoom(zoom + 0.1)}
                    disabled={zoom >= ZOOM_MAX}
                  />
                  <RibbonBtn
                    icon={ICONS.eye}
                    label="По ширине"
                    active={Math.abs(zoom - 1) < 0.001}
                    onClick={() => changeZoom(1)}
                    title="Вся ширина страницы в окне"
                  />
                  <RibbonBtn
                    icon={ICONS.page}
                    label="100%"
                    active={Math.abs(zoom - 1 / fitScale) < 0.01}
                    onClick={() => changeZoom(1 / fitScale)}
                    title="Настоящий размер страницы"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Панели">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.pages}
                    label="Страницы"
                    active={thumbsOpen}
                    onClick={toggleThumbs}
                    title="Показать или скрыть миниатюры"
                  />
                  <RibbonBtn
                    icon={ICONS.panel}
                    label="Свойства"
                    active={panelOpen}
                    onClick={togglePanel}
                    title="Показать или скрыть панель свойств"
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Подсказки">
                <label className="ed-check">
                  <input
                    type="checkbox"
                    checked={settings.showHints}
                    onChange={(event) => changeSettings({ showHints: event.target.checked })}
                  />
                  <span>Показывать подсказки под лентой</span>
                </label>
              </RibbonGroup>
            </>
          )}

          {tab === 'tools' && (
            <>
              <RibbonGroup label="Режим">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.cursor}
                    label="Выбор"
                    active={tool === 'select'}
                    onClick={() => setTool('select')}
                  />
                  <RibbonBtn
                    icon={ICONS.text}
                    label="Текст"
                    active={tool === 'text'}
                    onClick={() => setTool('text')}
                  />
                  <RibbonBtn
                    icon={ICONS.erase}
                    label="Замазка"
                    active={tool === 'erase'}
                    onClick={() => setTool('erase')}
                  />
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
              </RibbonGroup>

              <RibbonGroup label="Рисование">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.marker}
                    label="Маркер"
                    active={tool === 'highlight'}
                    onClick={() => setTool('highlight')}
                  />
                  <RibbonBtn
                    icon={ICONS.pen}
                    label="Карандаш"
                    active={tool === 'ink'}
                    onClick={() => setTool('ink')}
                  />
                  <RibbonBtn
                    icon={ICONS.rect}
                    label="Рамка"
                    active={tool === 'rect'}
                    onClick={() => setTool('rect')}
                  />
                  <RibbonBtn
                    icon={ICONS.frame}
                    label="Авторамка"
                    active={tool === 'frame'}
                    onClick={() => setTool('frame')}
                  />
                  <RibbonBtn
                    icon={ICONS.line}
                    label="Линия"
                    active={tool === 'line'}
                    onClick={() => setTool('line')}
                  />
                  <RibbonBtn
                    icon={ICONS.arrow}
                    label="Стрелка"
                    active={tool === 'arrow'}
                    onClick={() => setTool('arrow')}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="Штампы">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.check}
                    label="Галочка"
                    active={tool === 'check'}
                    onClick={() => setTool('check')}
                  />
                  <RibbonBtn
                    icon={ICONS.cross}
                    label="Крестик"
                    active={tool === 'cross'}
                    onClick={() => setTool('cross')}
                  />
                </div>
              </RibbonGroup>

              <RibbonGroup label="История">
                <div className="ed-group-row">
                  <RibbonBtn
                    icon={ICONS.undo}
                    label="Отменить"
                    onClick={undo}
                    disabled={!history.length || busy}
                  />
                  <RibbonBtn icon={ICONS.redo} label="Вернуть" onClick={redo} disabled={!future.length || busy} />
                </div>
              </RibbonGroup>
            </>
          )}

          {settings.showHints && (
            <p className="ed-hint">
              {selectedObject?.kind === 'image' ? IMAGE_HINT : tool === 'text' ? TEXT_HINTS[textMode] : HINTS[tool]}
            </p>
          )}
        </div>
      )}

      <div className="ed-work">
        <nav className="ed-rail" aria-label="Панели редактора">
          <button
            type="button"
            className={`ed-rail-btn ed-rail-pages${hasDoc && thumbsOpen ? ' is-active' : ''}`}
            title={thumbsOpen ? 'Скрыть страницы' : 'Показать страницы'}
            aria-pressed={hasDoc && thumbsOpen}
            onClick={toggleThumbs}
            disabled={!hasDoc}
          >
            <Icon d={ICONS.pages} />
          </button>
          <button
            type="button"
            className={`ed-rail-btn ed-rail-end${panelOpen ? ' is-active' : ''}`}
            title="Свойства"
            aria-pressed={panelOpen}
            onClick={togglePanel}
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
                <div
                  key={pageIndex}
                  className={`ed-thumb-wrap${dragPage === pageIndex ? ' is-dragging' : ''}${
                    dropPage === pageIndex && dragPage !== pageIndex ? ' is-drop' : ''
                  }`}
                  data-page-index={pageIndex}
                  onPointerDown={(event) => {
                    // Кнопки страницы живут внутри миниатюры: им не мешаем — иначе
                    // захват указателя уводит их клик на контейнер и кнопки молчат.
                    if ((event.target as Element).closest('.ed-thumb-tools')) return
                    movedRef.current = false
                    pressRef.current = { index: pageIndex, x: event.clientX, y: event.clientY, active: false }
                  }}
                  onPointerMove={(event) => {
                    const press = pressRef.current
                    if (!press || press.index !== pageIndex) return
                    if (!press.active) {
                      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < 12) return
                      press.active = true
                      // Захват нужен только на время перетаскивания: обычный тап
                      // по миниатюре остаётся кликом по кнопке страницы.
                      try {
                        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
                      } catch {
                        // Синтетические события и старые браузеры не умеют захват — не страшно.
                      }
                      setDragPage(press.index)
                    }
                    // Ищем миниатюру под пальцем: на неё и встанет страница.
                    const under = document.elementFromPoint(event.clientX, event.clientY)
                    const tile = under instanceof Element ? under.closest('[data-page-index]') : null
                    const target = tile ? Number(tile.getAttribute('data-page-index')) : null
                    dropRef.current = target
                    setDropPage(target)
                  }}
                  onPointerUp={() => {
                    const press = pressRef.current
                    pressRef.current = null
                    const target = dropRef.current
                    dropRef.current = null
                    setDragPage(null)
                    setDropPage(null)
                    if (press?.active && target !== null && target !== press.index) {
                      movedRef.current = true
                      movePage(press.index, target)
                    }
                  }}
                  onPointerCancel={() => {
                    pressRef.current = null
                    dropRef.current = null
                    setDragPage(null)
                    setDropPage(null)
                  }}
                >
                  <button
                    type="button"
                    className={`ed-thumb${pageIndex === index ? ' is-active' : ''}`}
                    onClick={() => {
                      if (movedRef.current) {
                        movedRef.current = false
                        return
                      }
                      setIndex(pageIndex)
                      setSelected(null)
                      setSelectedCover(null)
                    }}
                    aria-label={`Страница ${pageIndex + 1}. Перетащите, чтобы поменять порядок.`}
                  >
                    <span className="ed-thumb-page" style={{ aspectRatio: item.box.width / item.box.height }}>
                      {item.source === null ? (
                        <ThumbPreview page={item} />
                      ) : (
                        <PageThumb
                        pdf={pdf}
                        source={item.source}
                        ratio={item.box.width / item.box.height}
                        rotate={item.rotate ?? 0}
                      />
                      )}
                    </span>
                    <span>{pageIndex + 1}</span>
                  </button>

                  <div className="ed-thumb-tools">
                    <button
                      type="button"
                      onClick={() => movePage(pageIndex, pageIndex - 1)}
                      disabled={pageIndex === 0}
                      aria-label="Поднять страницу выше"
                      title="Выше"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(pageIndex, pageIndex + 1)}
                      disabled={pageIndex === pages.length - 1}
                      aria-label="Опустить страницу ниже"
                      title="Ниже"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => removePageAt(pageIndex)}
                      disabled={pages.length <= 1}
                      aria-label={`Удалить страницу ${pageIndex + 1}`}
                      title="Удалить страницу"
                    >
                      <Icon d={ICONS.trash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="ed-canvas-holder">
          <div className="ed-canvas-area" ref={stageWrapRef}>
            <div className="ed-canvas-inner">
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
                    className={`redactor-cover${tool === 'erase' ? ' is-visible' : ''}${
                      tool === 'erase' || tool === 'select' ? ' is-clickable' : ''
                    }${selectedCover === coverIndex ? ' is-selected' : ''}`}
                    title="Белое пятно: закрывает старый текст. Щёлкните, чтобы убрать (Delete)."
                    style={{
                      left: Math.round(cover.x * scale),
                      top: Math.round(cover.y * scale),
                      width: Math.round(cover.width * scale),
                      height: Math.round(cover.height * scale),
                      background: cover.color ? `#${cover.color}` : undefined,
                    }}
                    onPointerDown={(event) => {
                      if (tool !== 'erase' && tool !== 'select') return
                      event.stopPropagation()
                      event.preventDefault()
                      setSelected(null)
                      setSelectedCover(coverIndex)
                      setPanelOpen(true)
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
                      className={`redactor-object${isSelected ? ' is-selected' : ''}${
                        object.kind === 'image' && object.base ? ' is-base' : ''
                      }`}
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
                        setSelectedCover(null)
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
                            lineHeight: lineHeightOf(object),
                            color: `#${object.color}`,
                            fontFamily: fontStackFor(object.family),
                            fontWeight: object.bold ? 700 : 400,
                            fontStyle: object.italic ? 'italic' : 'normal',
                            textAlign: object.align ?? 'left',
                            textDecoration: [object.underline ? 'underline' : '', object.strike ? 'line-through' : '']
                              .filter(Boolean)
                              .join(' ') || 'none',
                          }}
                        >
                          {object.text || 'Введите текст'}
                        </span>
                      ) : object.kind === 'mark' ? (
                        <MarkView object={object} />
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

                {drawing && (
                  <div
                    className="redactor-object redactor-mark"
                    style={{
                      left: Math.round(drawing.x * scale),
                      top: Math.round(drawing.y * scale),
                      width: Math.max(1, Math.round(drawing.width * scale)),
                      height: Math.max(1, Math.round(drawing.height * scale)),
                    }}
                  >
                    <MarkView object={drawing} />
                  </div>
                )}

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
                
                </div>
              </div>
            )}
            </div>
          </div>

          {page && (
            <div className="ed-zoom-float" role="group" aria-label="Масштаб документа">
              <button
                type="button"
                onClick={() => changeZoom(zoom - 0.1)}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Уменьшить масштаб"
              >
                <Icon d={ICONS.minus} />
              </button>
              <button
                type="button"
                className="ed-zoom-float-value"
                onClick={() => changeZoom(1)}
                title="Сбросить масштаб"
              >
                {zoomPercent}%
              </button>
              <button
                type="button"
                onClick={() => changeZoom(zoom + 0.1)}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Увеличить масштаб"
              >
                <Icon d={ICONS.plus} />
              </button>
            </div>
          )}

          {message && (
            <p
              className={`message message-${message.tone}`}
              role="status"
              title="Нажмите, чтобы скрыть"
              onClick={() => setMessage(null)}
            >
              {message.text}
            </p>
          )}
        </div>

        <aside className="ed-panel" aria-label="Свойства">
          <div className="ed-panel-head">
            <h4 className="panel-title">
              {selectedCoverRect ? 'Белое пятно' : selectedObject ? 'Выбранный объект' : 'Свойства'}
            </h4>
            <button type="button" className="ed-icon-btn ed-panel-close" onClick={() => changeSettings({ showPanel: false })} aria-label="Закрыть свойства">
              <Icon d={ICONS.close} />
            </button>
          </div>

          {selectedCoverRect ? (
            <>
              <p className="panel-note">
                Пятно закрывает старый текст на фото или в PDF. Появляется при распознавании и правке строки —
                чтобы под новым текстом не просвечивал старый.
              </p>
              <dl className="ed-props">
                <div>
                  <dt>Размер</dt>
                  <dd>
                    {Math.round(selectedCoverRect.width)} × {Math.round(selectedCoverRect.height)} pt
                  </dd>
                </div>
              </dl>
              <button type="button" className="btn btn-quiet" onClick={() => removeCover(selectedCover as number)}>
                Удалить пятно
              </button>
            </>
          ) : selectedObject ? (
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
                    <span className="field-label">Шрифт</span>
                    <select
                      className="field-input"
                      value={selectedObject.family ?? 'sans'}
                      onChange={(event) =>
                        updateObject(selectedObject.id, { family: event.target.value as TextFamily })
                      }
                      aria-label="Шрифт текста"
                    >
                      {TEXT_FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label} — {font.hint}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <span className="field-label">Размер</span>
                    <FontSizeField
                      value={selectedObject.size}
                      onChange={(size) => updateObject(selectedObject.id, { size })}
                    />
                  </div>

                  <div className="field">
                    <span className="field-label">Начертание</span>
                    <div className="chip-row">
                      <button
                        type="button"
                        className={`chip${selectedObject.bold ? ' is-active' : ''}`}
                        aria-pressed={Boolean(selectedObject.bold)}
                        onClick={() => updateObject(selectedObject.id, { bold: !selectedObject.bold })}
                        title="Жирный"
                      >
                        <b>Ж</b>
                      </button>
                      <button
                        type="button"
                        className={`chip${selectedObject.italic ? ' is-active' : ''}`}
                        aria-pressed={Boolean(selectedObject.italic)}
                        onClick={() => updateObject(selectedObject.id, { italic: !selectedObject.italic })}
                        title="Курсив"
                      >
                        <i>К</i>
                      </button>
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
                    <ColorPicker
                      value={selectedObject.color}
                      onChange={(color) => updateObject(selectedObject.id, { color })}
                      label="Цвет текста"
                    />
                  </div>
                </>
              ) : selectedObject.kind === 'mark' ? (
                <>
                  <p className="panel-note">
                    {selectedObject.mark === 'highlight'
                      ? 'Полупрозрачный штрих маркера поверх текста — сам текст остаётся виден и не меняется.'
                      : selectedObject.mark === 'frame'
                        ? 'Рамка стоит по краям содержимого с ровными полями и попадает в готовый PDF.'
                        : 'Пометка лежит поверх содержимого страницы и попадает в готовый PDF.'}
                  </p>

                  <div className="field">
                    <span className="field-label">Цвет</span>
                    <ColorPicker
                      value={selectedObject.color}
                      onChange={(color) => updateObject(selectedObject.id, { color })}
                      label="Цвет пометки"
                    />
                  </div>

                  <div className="field">
                    <span className="field-label">Толщина</span>
                    <input
                      className="field-input"
                      type="range"
                      min={1}
                      max={30}
                      value={Math.round(selectedObject.stroke)}
                      onChange={(event) => updateObject(selectedObject.id, { stroke: Number(event.target.value) })}
                      aria-label="Толщина пометки"
                    />
                  </div>

                  <div className="field">
                    <span className="field-label">Размер</span>
                    <input
                      className="field-input"
                      type="range"
                      min={10}
                      max={Math.max(60, Math.round(page?.box.width ?? 400))}
                      value={Math.round(selectedObject.width)}
                      onChange={(event) => {
                        const width = Number(event.target.value)
                        const ratio = selectedObject.width ? selectedObject.height / selectedObject.width : 1
                        updateObject(selectedObject.id, { width, height: Math.round(width * ratio) })
                      }}
                      aria-label="Размер пометки"
                    />
                  </div>
                </>
              ) : (
                <>
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
                </>
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

                  {covers.length > 0 && (
                    <div className="ed-panel-row">
                      <button type="button" className="btn btn-quiet" onClick={clearCovers}>
                        Убрать белые пятна
                      </button>
                    </div>
                  )}

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

                </>
              ) : (
                <>
                  {hasDoc && tool !== 'select' && (
                    <div className="ed-tool-settings">
                      <p className="ed-panel-label">Настройки инструмента</p>
                      <div className="field">
                        <span className="field-label">Цвет</span>
                        <ColorPicker
                          value={tool === 'highlight' ? markColor : penColor}
                          onChange={(color) => (tool === 'highlight' ? setMarkColor(color) : setPenColor(color))}
                          label="Цвет инструмента"
                        />
                      </div>
                      {(tool === 'ink' || tool === 'frame' || tool === 'rect' || tool === 'line' || tool === 'arrow') && (
                        <div className="field">
                          <span className="field-label">Толщина</span>
                          <input
                            className="field-input"
                            type="range"
                            min={1}
                            max={12}
                            value={penWidth}
                            onChange={(event) => setPenWidth(Number(event.target.value))}
                            aria-label="Толщина линии"
                          />
                        </div>
                      )}
                      {tool === 'highlight' && (
                        <div className="field">
                          <span className="field-label">Толщина маркера</span>
                          <input
                            className="field-input"
                            type="range"
                            min={6}
                            max={30}
                            value={markWidth}
                            onChange={(event) => setMarkWidth(Number(event.target.value))}
                            aria-label="Толщина маркера"
                          />
                        </div>
                      )}
                      {STAMP_TOOLS.includes(tool) && (
                        <div className="field">
                          <span className="field-label">Размер штампа</span>
                          <input
                            className="field-input"
                            type="range"
                            min={16}
                            max={96}
                            value={stampSize}
                            onChange={(event) => setStampSize(Number(event.target.value))}
                            aria-label="Размер штампа"
                          />
                        </div>
                      )}
                      {tool === 'text' && (
                        <p className="panel-note">
                          Щёлкните по строке или свободному месту — размер, цвет и начертание появятся в свойствах объекта справа.
                        </p>
                      )}
                    </div>
                  )}

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
                </>
              )}
            </div>
          )}

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
          {hasDoc && (
            <button
              type="button"
              className="ed-panel-toggle ed-pages-toggle"
              aria-pressed={thumbsOpen}
              onClick={toggleThumbs}
            >
              <Icon d={ICONS.pages} />
              Страницы
            </button>
          )}
          <button
            type="button"
            className="ed-panel-toggle"
            aria-pressed={panelOpen}
            onClick={togglePanel}
          >
            <Icon d={ICONS.panel} />
            Свойства
          </button>
          <span className="ed-status-note">Всё локально в браузере</span>
        </div>
      </footer>

      {signOpen && (
        <SignatureDialog onClose={() => setSignOpen(false)} onInsert={(bytes) => void insertSignature(bytes)} />
      )}

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          onChange={changeSettings}
          onReset={() => changeSettings({ ...DEFAULT_SETTINGS })}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

/** Миниатюра страницы: pdf.js рисует её только когда она подъехала к экрану. */
function PageThumb({
  pdf,
  source,
  ratio,
  rotate = 0,
}: {
  pdf: PDFDocumentProxy | null
  source: number
  ratio: number
  rotate?: number
}) {
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
      const rotated = (proxy.rotate + rotate) % 360
      const sourceWidth = proxy.getViewport({ scale: 1, rotation: rotated }).width || 1
      const viewport = proxy.getViewport({ scale: 128 / sourceWidth, rotation: rotated })
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
  }, [visible, pdf, source, rotate])

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

/** Пометка на листе: маркер, рамка, линия, стрелка, галочка, крестик или рисунок. */
function MarkView({ object }: { object: MarkObject }) {
  const w = Math.max(0.5, object.width)
  const h = Math.max(0.5, object.height)
  const color = `#${object.color}`
  const stroke = Math.max(0.4, object.stroke)
  const common = {
    stroke: color,
    strokeWidth: stroke,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (object.mark === 'highlight' && !(object.points && object.points.length > 1)) {
    return (
      <span
        className="redactor-mark-highlight"
        style={{ background: color, opacity: object.opacity ?? 0.35 }}
        aria-hidden="true"
      />
    )
  }

  const x1 = object.flipX ? w : 0
  const x2 = object.flipX ? 0 : w
  const y1 = object.flipY ? h : 0
  const y2 = object.flipY ? 0 : h
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = Math.max(6, stroke * 4)

  return (
    <svg
      className="redactor-mark-svg"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {object.mark === 'frame' && (
        <>
          <rect
            x={stroke / 2}
            y={stroke / 2}
            width={Math.max(0.5, w - stroke)}
            height={Math.max(0.5, h - stroke)}
            {...common}
          />
          <rect
            x={Math.max(3, stroke * 3)}
            y={Math.max(3, stroke * 3)}
            width={Math.max(0.5, w - Math.max(3, stroke * 3) * 2)}
            height={Math.max(0.5, h - Math.max(3, stroke * 3) * 2)}
            {...common}
            strokeWidth={Math.max(0.4, stroke / 2)}
            opacity={0.7}
          />
        </>
      )}

      {object.mark === 'rect' && (
        <rect x={stroke / 2} y={stroke / 2} width={Math.max(0.5, w - stroke)} height={Math.max(0.5, h - stroke)} {...common} />
      )}

      {(object.mark === 'line' || object.mark === 'arrow') && (
        <>
          <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} />
          {object.mark === 'arrow' && (
            <>
              <line x1={x2} y1={y2} x2={x2 - Math.cos(angle - 0.5) * head} y2={y2 - Math.sin(angle - 0.5) * head} {...common} />
              <line x1={x2} y1={y2} x2={x2 - Math.cos(angle + 0.5) * head} y2={y2 - Math.sin(angle + 0.5) * head} {...common} />
            </>
          )}
        </>
      )}

      {object.mark === 'check' && (
        <polyline points={`${w * 0.08},${h * 0.55} ${w * 0.36},${h * 0.9} ${w * 0.94},${h * 0.12}`} {...common} />
      )}

      {object.mark === 'cross' && (
        <>
          <line x1={w * 0.12} y1={h * 0.12} x2={w * 0.88} y2={h * 0.88} {...common} />
          <line x1={w * 0.88} y1={h * 0.12} x2={w * 0.12} y2={h * 0.88} {...common} />
        </>
      )}

      {object.mark === 'highlight' && object.points && object.points.length > 1 && (
        <polyline
          points={object.points.map((point) => `${point.x - object.x},${point.y - object.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={object.opacity ?? 0.35}
        />
      )}

      {object.mark === 'ink' && object.points && object.points.length > 1 && (
        <polyline
          points={object.points.map((point) => `${point.x - object.x},${point.y - object.y}`).join(' ')}
          {...common}
        />
      )}
    </svg>
  )
}

type SignTab = 'draw' | 'upload' | 'type'

/** Подпись: нарисовать пальцем, загрузить готовую картинку или напечатать. */
function SignatureDialog({ onClose, onInsert }: { onClose: () => void; onInsert: (bytes: Uint8Array) => void }) {
  const [tab, setTab] = useState<SignTab>('draw')
  const [typed, setTyped] = useState('Подпись')
  const [font, setFont] = useState('cursive')
  const [size, setSize] = useState(72)
  const [color, setColor] = useState('111111')
  const [hasInk, setHasInk] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)

  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
      y: (event.clientY - rect.top) * (canvas.height / Math.max(1, rect.height)),
    }
  }

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastRef.current = point(event)
  }

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const next = point(event)
    if (!canvas || !context || !lastRef.current) return
    context.strokeStyle = `#${color}`
    context.lineWidth = 3.4
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(lastRef.current.x, lastRef.current.y)
    context.lineTo(next.x, next.y)
    context.stroke()
    lastRef.current = next
    setHasInk(true)
  }

  const end = () => {
    drawingRef.current = false
    lastRef.current = null
  }

  const typedCanvas = () => {
    const text = typed.trim() || 'Подпись'
    const spec = `${size}px ${font}`
    const measure = document.createElement('canvas').getContext('2d')
    if (!measure) return null
    measure.font = spec
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(160, Math.ceil(measure.measureText(text).width) + 56)
    canvas.height = Math.ceil(size * 1.9)
    const context = canvas.getContext('2d')
    if (!context) return null
    context.font = spec
    context.fillStyle = `#${color}`
    context.textBaseline = 'middle'
    context.fillText(text, 28, canvas.height / 2)
    return canvas
  }

  const send = async (canvas: HTMLCanvasElement) => {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    onInsert(new Uint8Array(await blob.arrayBuffer()))
  }

  return (
    <div className="ed-modal" role="dialog" aria-modal="true" aria-label="Подпись">
      <div className="ed-modal-card">
        <header className="ed-modal-head">
          <h4>Подпись</h4>
          <button type="button" className="ed-icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon d={ICONS.close} />
          </button>
        </header>

        <div className="ed-modal-tabs" role="tablist">
          {(
            [
              ['draw', 'Нарисовать'],
              ['upload', 'Загрузить'],
              ['type', 'Напечатать'],
            ] as [SignTab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={tab === value ? 'is-active' : ''}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'draw' && (
          <>
            <canvas
              ref={canvasRef}
              width={640}
              height={230}
              className="ed-sign-canvas"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              onPointerCancel={end}
            />
            <div className="ed-modal-row">
              <button type="button" className="btn btn-quiet" onClick={clear}>
                Очистить
              </button>
              <button
                type="button"
                className="ed-primary"
                onClick={() => {
                  const canvas = canvasRef.current
                  if (canvas) void send(canvas)
                }}
                disabled={!hasInk}
              >
                Вставить подпись
              </button>
            </div>
          </>
        )}

        {tab === 'upload' && (
          <>
            <p className="panel-note">
              PNG с прозрачным фоном подойдёт лучше всего — скан подписи или печати. Файл не отправляется на сервер.
            </p>
            <label className="ed-modal-upload">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void file.arrayBuffer().then((buffer) => onInsert(new Uint8Array(buffer)))
                }}
              />
              <span>Выбрать картинку подписи</span>
            </label>
          </>
        )}

        {tab === 'type' && (
          <>
            <label className="field">
              <span className="field-label">Текст подписи</span>
              <input
                className="field-input"
                value={typed}
                maxLength={60}
                onChange={(event) => setTyped(event.target.value)}
                placeholder="Алишер Каримов"
              />
            </label>
            <div className="field">
              <span className="field-label">Шрифт</span>
              <select className="ed-select" value={font} onChange={(event) => setFont(event.target.value)}>
                <option value="cursive">Рукописный</option>
                <option value="'Segoe Script', cursive">Segoe Script</option>
                <option value="Georgia, serif">Georgia (курсив)</option>
                <option value="'Brush Script MT', cursive">Brush Script</option>
              </select>
            </div>
            <div className="field">
              <span className="field-label">Размер</span>
              <input
                className="field-input"
                type="range"
                min={28}
                max={140}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
            </div>
            <div className="field">
              <span className="field-label">Цвет</span>
              <div className="chip-row">
                {['111111', '1A56DB', 'C81E1E'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`swatch${color === value ? ' is-active' : ''}`}
                    style={{ background: `#${value}` }}
                    onClick={() => setColor(value)}
                    aria-label={`Цвет ${value}`}
                  />
                ))}
              </div>
            </div>
            <div className="ed-modal-row">
              <button
                type="button"
                className="ed-primary"
                onClick={() => {
                  const canvas = typedCanvas()
                  if (canvas) void send(canvas)
                }}
              >
                Вставить подпись
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Параметры редактора: применяются сразу и запоминаются в браузере. */
function SettingsDialog({
  settings,
  onChange,
  onReset,
  onClose,
}: {
  settings: EditorSettings
  onChange: (patch: Partial<EditorSettings>) => void
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="ed-modal" role="dialog" aria-modal="true" aria-label="Параметры">
      <div className="ed-modal-card ed-settings-card">
        <header className="ed-modal-head">
          <h4>Параметры</h4>
          <button type="button" className="ed-icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon d={ICONS.close} />
          </button>
        </header>

        <p className="ed-settings-group">Текст по умолчанию</p>

        <label className="field">
          <span className="field-label">Шрифт нового текста</span>
          <select
            className="field-input"
            value={settings.fontFamily}
            onChange={(event) => onChange({ fontFamily: event.target.value as TextFamily })}
          >
            {TEXT_FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label} — {font.hint}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Размер нового текста</span>
          <input
            className="field-input"
            type="number"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={settings.fontSize}
            onChange={(event) => {
              const value = Number(event.target.value)
              if (!Number.isFinite(value)) return
              onChange({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value)) })
            }}
          />
        </label>

        <label className="field">
          <span className="field-label">Межстрочный интервал</span>
          <select
            className="field-input"
            value={String(settings.lineHeight)}
            onChange={(event) => onChange({ lineHeight: Number(event.target.value) })}
          >
            {[1, 1.15, 1.3, 1.5, 2].map((value) => (
              <option key={value} value={String(value)}>
                {value.toFixed(2).replace(/\.?0+$/, '')}
              </option>
            ))}
          </select>
        </label>

        <p className="ed-settings-group">Экран</p>

        <label className="ed-check ed-check-row">
          <input
            type="checkbox"
            checked={settings.showThumbs}
            onChange={(event) => onChange({ showThumbs: event.target.checked })}
          />
          <span>Панель страниц слева</span>
        </label>
        <label className="ed-check ed-check-row">
          <input
            type="checkbox"
            checked={settings.showPanel}
            onChange={(event) => onChange({ showPanel: event.target.checked })}
          />
          <span>Панель свойств справа</span>
        </label>
        <label className="ed-check ed-check-row">
          <input
            type="checkbox"
            checked={settings.showHints}
            onChange={(event) => onChange({ showHints: event.target.checked })}
          />
          <span>Подсказки под лентой</span>
        </label>

        <div className="ed-modal-row">
          <button type="button" className="btn btn-quiet" onClick={onReset}>
            Сбросить
          </button>
          <button type="button" className="ed-primary" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}
