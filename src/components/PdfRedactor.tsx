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
import type { EditorObject, EditorPage, TextObject, ToPdfPoint } from '../lib/docEditor'

type Tool = 'select' | 'text'
type Message = { tone: 'ok' | 'error' | 'info'; text: string }

const MAX_FILE_MB = 100
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

const HINTS: Record<Tool, string> = {
  select: 'Нажмите на объект, чтобы выбрать. Тащите мышкой или пальцем, чтобы двигать. Delete — удалить.',
  text: 'Нажмите на странице в том месте, где нужен текст, — он появится и его можно будет напечатать справа.',
}

const IMAGE_HINT = 'Фото встанет на страницу. Тащите его мышкой или пальцем, а за уголок справа снизу меняйте размер.'

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
  page: 'M7 3h10v18H7zM10 8h4M10 12h4',
  undo: 'M9 7 4 12l5 5M4 12h9a6 6 0 0 1 6 6',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M5 20h14',
  eraser: 'm9 20-3-3 8-8 3 3zM15 7l2-2 3 3-2 2M4 20h5',
  panel: 'M4 5h16v14H4zM14 5v14',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  close: 'M6 6l12 12M18 6 6 18',
  pages: 'M8 3h8v4H8zM6 7h12v14H6zM9 11h6M9 15h6',
}

export function PdfRedactor() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pages, setPages] = useState<EditorPage[]>([])
  const [index, setIndex] = useState(0)
  const [fitScale, setFitScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<Tool>('select')
  const [selected, setSelected] = useState<string | null>(null)
  const [eraseAnnotations, setEraseAnnotations] = useState(false)
  const [history, setHistory] = useState<EditorPage[][]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const docRef = useRef<PDFDocumentProxy | null>(null)
  const pageCache = useRef(new Map<number, PDFPageProxy>())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pagesRef = useRef<EditorPage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const stageWrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const resizeRef = useRef<{ id: string; startX: number; originWidth: number; ratio: number; moved: boolean } | null>(null)

  pagesRef.current = pages

  const page = pages[index] ?? null
  const boxWidth = page?.box.width ?? 0
  const scale = fitScale * zoom
  const selectedObject = page?.objects.find((object) => object.id === selected) ?? null
  const zoomPercent = Math.round(zoom * 100)

  useEffect(() => {
    return () => {
      void docRef.current?.destroy()
    }
  }, [])

  const openFile = useCallback(async (next: File) => {
    if (!(next.type === 'application/pdf' || /\.pdf$/i.test(next.name))) {
      setMessage({ tone: 'error', text: `«${next.name}» — нужен PDF` })
      return
    }
    if (next.size > MAX_FILE_BYTES) {
      setMessage({ tone: 'error', text: `«${next.name}» больше ${MAX_FILE_MB} МБ` })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await docRef.current?.destroy()
      pageCache.current.clear()
      const doc = await openPdf(next)
      docRef.current = doc
      setPdf(doc)

      const models: EditorPage[] = []
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        const proxy = await doc.getPage(pageNumber)
        const viewport = proxy.getViewport({ scale: 1 })
        pageCache.current.set(pageNumber - 1, proxy)
        models.push({ source: pageNumber - 1, box: { width: viewport.width, height: viewport.height }, objects: [] })
      }

      setFile(next)
      setPages(models)
      setHistory([])
      setIndex(0)
      setSelected(null)
      setZoom(1)
      setTool('select')
      setPanelOpen(false)
      track('Редактор PDF', 'open')
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось открыть PDF. Возможно, он повреждён или защищён паролем.' })
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
  }, [boxWidth])

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

  const addText = (x: number, y: number) => {
    if (!page) return
    const object: TextObject = {
      kind: 'text',
      id: uid(),
      x,
      y,
      text: '',
      size: 14,
      color: TEXT_COLORS[0].value,
      width: Math.max(80, Math.min(260, page.box.width - x - 24)),
    }
    mutate((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, objects: [...item.objects, object] } : item)))
    setSelected(object.id)
    setTool('select')
    setPanelOpen(true)
    window.setTimeout(() => textareaRef.current?.focus(), 60)
  }

  const addImage = async (next: File) => {
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
      const object: EditorObject = {
        kind: 'image',
        id: uid(),
        ...position,
        width: size.width,
        height: size.height,
        data: bytes,
        type,
      }
      bitmap.close()
      mutate((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, objects: [...item.objects, object] } : item)))
      setSelected(object.id)
      // Возвращаем «Выбор», иначе объект не потянешь: таскать умеет только этот режим.
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

  const removeSelected = useCallback(() => {
    if (!selected) return
    mutate((current) =>
      current.map((item, itemIndex) =>
        itemIndex !== index ? item : { ...item, objects: item.objects.filter((object) => object.id !== selected) },
      ),
    )
    setSelected(null)
  }, [index, mutate, selected])

  const undo = () => {
    setHistory((previous) => {
      const last = previous[previous.length - 1]
      if (!last) return previous
      setPages(last)
      return previous.slice(0, -1)
    })
    setSelected(null)
  }

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
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeSelected, selected])

  // Один снимок на жест: Ctrl+Z должен возвращать объект на место, а не удалять его.
  const snapshot = () => {
    setHistory((previous) => [...previous.slice(-40), pagesRef.current])
  }

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const model = pagesRef.current[index]
      if (!model) return

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
  }, [index, scale, updateObject])

  const onStageClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!page) return
    if (tool !== 'text') {
      setSelected(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / scale
    const y = (event.clientY - rect.top) / scale
    addText(Math.max(0, Math.min(x, page.box.width - 60)), Math.max(0, Math.min(y, page.box.height - 24)))
  }

  const save = async () => {
    if (!file || !pages.length) return
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
        source: file,
        pages,
        toPdf: (pageIndex, x, y) => converters[pageIndex](x, y),
        eraseAnnotations,
      })

      download(result.blob, `${baseName(file.name)}-edited.pdf`)
      track('Редактор PDF', 'done')
      addHistory({ tool: 'Редактор PDF', fileName: file.name, result: `объектов: ${result.objects}` })
      const parts = [`${result.pages} страниц(ы)`]
      if (result.objects) parts.push(`добавлено объектов: ${result.objects}`)
      if (eraseAnnotations) parts.push('пометки убраны')
      setMessage({ tone: 'ok', text: `Готово — PDF скачивается: ${parts.join(' · ')}.` })
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

  const resetFile = () => {
    setFile(null)
    setPdf(null)
    setPages([])
    setIndex(0)
    setSelected(null)
    setHistory([])
    setMessage(null)
    setZoom(1)
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
    resetFile()
    window.setTimeout(() => inputRef.current?.click(), 30)
  }

  return (
    <div className={`editor-app${panelOpen ? ' show-panel' : ''}`}>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
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
          if (next) void addImage(next)
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
          {file ? (
            <>
              <span className="ed-doc-badge">PDF</span>
              <span className="ed-doc-name" title={file.name}>
                {file.name}
              </span>
              <span className="ed-doc-meta">
                {formatSize(file.size)} · {pages.length} стр.
              </span>
            </>
          ) : (
            <span className="ed-doc-name">Новый документ</span>
          )}
        </div>

        <div className="ed-top-actions">
          {file && (
            <div className="ed-zoom">
              <button
                type="button"
                className="ed-icon-btn"
                onClick={() => changeZoom(zoom - 0.1)}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Уменьшить масштаб"
              >
                <Icon d={ICONS.minus} />
              </button>
              <span className="ed-zoom-value">{zoomPercent}%</span>
              <button
                type="button"
                className="ed-icon-btn"
                onClick={() => changeZoom(zoom + 0.1)}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Увеличить масштаб"
              >
                <Icon d={ICONS.plus} />
              </button>
              <button
                type="button"
                className="ed-icon-btn"
                onClick={() => setZoom(1)}
                title="По ширине окна"
                aria-label="По ширине окна"
              >
                <Icon d={ICONS.fit} />
              </button>
            </div>
          )}

          {file && (
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

      {file && (
        <div className="ed-ribbon">
          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={openAnotherFile}>
                <Icon d={ICONS.download} />
                <span>Открыть</span>
              </button>
              <button type="button" className="ed-tool" onClick={addBlankPage} title="Вставить пустой лист после текущего">
                <Icon d={ICONS.page} />
                <span>Пустой лист</span>
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
            </div>
            <span className="ed-group-label">Инструменты</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={undo} disabled={!history.length || busy}>
                <Icon d={ICONS.undo} />
                <span>Отменить</span>
              </button>
              <button
                type="button"
                className={`ed-tool${eraseAnnotations ? ' is-active' : ''}`}
                aria-pressed={eraseAnnotations}
                onClick={() => setEraseAnnotations((value) => !value)}
                title="Убрать комментарии, штампы и подписи-аннотации"
              >
                <Icon d={ICONS.eraser} />
                <span>{eraseAnnotations ? 'Пометки убрать' : 'Пометки'}</span>
              </button>
            </div>
            <span className="ed-group-label">Правка</span>
          </div>

          <div className="ed-group">
            <div className="ed-group-row">
              <button type="button" className="ed-tool" onClick={() => void save()} disabled={busy}>
                <Icon d={ICONS.download} />
                <span>{busy ? 'Собираем…' : 'Скачать PDF'}</span>
              </button>
            </div>
            <span className="ed-group-label">Экспорт</span>
          </div>

          <p className="ed-hint">{selectedObject?.kind === 'image' ? IMAGE_HINT : HINTS[tool]}</p>
        </div>
      )}

      <div className="ed-work">
        <nav className="ed-rail" aria-label="Панели редактора">
          <button
            type="button"
            className="ed-rail-btn is-active"
            title="Инструменты и страницы"
            onClick={() => setTool('select')}
          >
            <Icon d={ICONS.pages} />
          </button>
          <button type="button" className={`ed-rail-btn${tool === 'text' ? ' is-active' : ''}`} title="Добавить текст" onClick={() => setTool('text')}>
            <Icon d={ICONS.text} />
          </button>
          <button
            type="button"
            className="ed-rail-btn"
            title="Вставить фото"
            onClick={() => {
              setTool('select')
              imageInputRef.current?.click()
            }}
          >
            <Icon d={ICONS.image} />
          </button>
          <button type="button" className="ed-rail-btn" title="Пустой лист" onClick={addBlankPage} disabled={!file}>
            <Icon d={ICONS.page} />
          </button>
          <button type="button" className="ed-rail-btn" title="Отменить шаг" onClick={undo} disabled={!history.length}>
            <Icon d={ICONS.undo} />
          </button>
          <button
            type="button"
            className="ed-rail-btn"
            title="Свойства и пометки"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <Icon d={ICONS.panel} />
          </button>
        </nav>

        {file && (
          <aside className="ed-thumbs" aria-label="Страницы документа">
            <p className="ed-thumbs-head">Страницы</p>
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
                      <span className="ed-thumb-blank" />
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
          {file && page ? (
            <div
              className={`redactor-stage${tool === 'text' ? ' is-placing' : ''}`}
              style={{ width: Math.floor(page.box.width * scale), height: Math.floor(page.box.height * scale) }}
              onPointerDown={onStageClick}
            >
              <canvas ref={canvasRef} className="redactor-canvas" />

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
                      if (tool !== 'select') return
                      event.preventDefault()
                      setSelected(object.id)
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
                <p className="dropzone-title">Откройте PDF для редактирования</p>
                <p className="dropzone-hint">Перетащите файл сюда или нажмите, чтобы выбрать</p>
                <span className="dropzone-note">до {MAX_FILE_MB} МБ · файл остаётся в браузере</span>
              </div>

              <ol className="ed-steps">
                <li>
                  <strong>Текст</strong> — нажмите «Текст» и щёлкните по странице, печатайте справа в свойствах.
                </li>
                <li>
                  <strong>Фото</strong> — картинка встанет на лист, её можно тащить пальцем и тянуть за уголок.
                </li>
                <li>
                  <strong>Страницы</strong> — слева миниатюры, пустой лист добавляется после текущего.
                </li>
                <li>
                  <strong>Экспорт</strong> — «Скачать PDF» собирает готовый файл на вашем устройстве.
                </li>
              </ol>
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
                      rows={4}
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
                          className={`chip${selectedObject.size === size ? ' is-active' : ''}`}
                          onClick={() => updateObject(selectedObject.id, { size })}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
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

              <button type="button" className="btn btn-quiet panel-remove" onClick={removeSelected}>
                Удалить объект
              </button>
            </>
          ) : (
            <div className="panel-empty">
              <ul className="panel-list">
                <li>
                  <b>Текст</b> — включите «Текст» и щёлкните по странице.
                </li>
                <li>
                  <b>Фото</b> — объект встанет на лист, тащите его пальцем или мышкой.
                </li>
                <li>
                  <b>Пустой лист</b> — добавит страницу после текущей.
                </li>
                <li>
                  <b>Отменить</b> — шаг назад, работает и Ctrl+Z.
                </li>
              </ul>
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

          <div className="ed-panel-actions">
            <button type="button" className="btn btn-quiet" onClick={openAnotherFile}>
              Открыть другой файл
            </button>
            {file && (
              <button type="button" className="btn btn-quiet" onClick={resetFile}>
                Закрыть документ
              </button>
            )}
          </div>
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
            disabled={!file || index === 0}
            aria-label="Предыдущая страница"
          >
            ←
          </button>
          <span>
            {file ? `Страница ${index + 1} из ${pages.length}` : 'Файл не открыт'}
          </span>
          <button
            type="button"
            className="ed-nav-btn"
            onClick={() => {
              setIndex((current) => Math.min(pages.length - 1, current + 1))
              setSelected(null)
            }}
            disabled={!file || index >= pages.length - 1}
            aria-label="Следующая страница"
          >
            →
          </button>
        </div>

        {file && (
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

