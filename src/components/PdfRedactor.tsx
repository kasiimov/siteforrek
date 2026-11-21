import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { openPdf } from '../lib/pdf'
import { baseName, download, formatSize } from '../lib/download'
import { addHistory } from '../lib/profile'
import { track } from '../lib/analytics'
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

const HINTS: Record<Tool, string> = {
  select: 'Нажмите на объект, чтобы выбрать. Тащите мышкой, чтобы двигать. Delete — удалить.',
  text: 'Нажмите на странице в том месте, где нужен текст, — он появится и его можно будет напечатать справа.',
}

const IMAGE_HINT = 'Фото встанет на страницу. Тащите его мышкой, а за уголок справа снизу меняйте размер.'

const uid = () => Math.random().toString(36).slice(2, 10)

export function PdfRedactor() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<EditorPage[]>([])
  const [index, setIndex] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [tool, setTool] = useState<Tool>('select')
  const [selected, setSelected] = useState<string | null>(null)
  const [eraseAnnotations, setEraseAnnotations] = useState(false)
  const [history, setHistory] = useState<EditorPage[][]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)

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
  const selectedObject = page?.objects.find((object) => object.id === selected) ?? null

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
      // Подгоняем страницу под ширину окна, чтобы на телефоне не было горизонтальной прокрутки.
      const available = Math.max(280, Math.min(window.innerWidth, 980) - 120)
      setScale(Math.min(1.5, Math.max(0.35, available / (models[0]?.box.width ?? 595))))
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось открыть PDF. Возможно, он повреждён или защищён паролем.' })
    } finally {
      setLoading(false)
    }
  }, [])

  // Держим страницу ровно по ширине колонки: иначе canvas сжимается, а объекты остаются в пикселях.
  useEffect(() => {
    const wrap = stageWrapRef.current
    if (!wrap || !boxWidth) return

    const fit = () => {
      const styles = getComputedStyle(wrap)
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const available = wrap.clientWidth - padding - 2
      if (available < 40) return
      setScale(Math.min(1.5, Math.max(0.2, available / boxWidth)))
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

  const mutate = useCallback(
    (updater: (current: EditorPage[]) => EditorPage[]) => {
      setHistory((previous) => [...previous.slice(-40), pagesRef.current])
      setPages((previous) => updater(previous))
    },
    [],
  )

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
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
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

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) void openFile(dropped)
  }

  if (!file) {
    return (
      <div className="redactor-empty">
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            const next = event.target.files?.[0]
            if (next) void openFile(next)
          }}
        />
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}`}
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

        <ol className="redactor-steps">
          <li>
            <strong>Добавьте текст</strong> — нажмите на страницу и печатайте. Размер, цвет и место
            выбираются справа.
          </li>
          <li>
            <strong>Вставьте фото</strong> — картинка встанет на страницу, её можно двигать и
            растягивать по ширине.
          </li>
          <li>
            <strong>Добавьте пустой лист</strong> — он появится сразу после текущей страницы.
          </li>
          <li>
            <strong>Уберите пометки</strong> — переключатель снимет подписи и комментарии-аннотации.
          </li>
        </ol>

        {loading && <p className="message message-info">Открываем документ…</p>}
        {message && <p className={`message message-${message.tone}`}>{message.text}</p>}
      </div>
    )
  }

  const objects = page?.objects ?? []
  const stageWidth = Math.floor((page?.box.width ?? 0) * scale)
  const stageHeight = Math.floor((page?.box.height ?? 0) * scale)

  return (
    <div className="redactor">
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

      <div className="redactor-top">
        <div className="redactor-file">
          <span className="file-badge">PDF</span>
          <div className="file-meta">
            <p className="file-name" title={file.name}>
              {file.name}
            </p>
            <p className="file-info">
              {formatSize(file.size)} · {pages.length} страниц(ы)
            </p>
          </div>
        </div>

        <div className="redactor-segmented" role="group" aria-label="Инструменты редактора">
          <button
            type="button"
            className={`segment${tool === 'select' ? ' is-active' : ''}`}
            aria-pressed={tool === 'select'}
            onClick={() => setTool('select')}
          >
            Выбор
          </button>
          <button
            type="button"
            className={`segment${tool === 'text' ? ' is-active' : ''}`}
                                aria-pressed={tool === 'text'}
            onClick={() => setTool('text')}
          >
            <span className="segment-icon" aria-hidden="true">
              T
            </span>
            Текст
          </button>
          <button
            type="button"
            className="segment"
            onClick={() => {
              setTool('select')
              imageInputRef.current?.click()
            }}
          >
            <span className="segment-icon" aria-hidden="true">
              ▣
            </span>
            Фото
          </button>
          <button type="button" className="segment" onClick={addBlankPage}>
            <span className="segment-icon" aria-hidden="true">
              ＋
            </span>
            Пустой лист
          </button>
        </div>

        <div className="redactor-actions">
          <button type="button" className="btn btn-quiet" onClick={undo} disabled={!history.length || busy}>
            Отменить
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>
            {busy ? 'Собираем…' : 'Скачать PDF'}
          </button>
        </div>
      </div>

      <p className="redactor-hint">{selectedObject?.kind === 'image' ? IMAGE_HINT : HINTS[tool]}</p>

      <div className="redactor-body">
        <div className="redactor-stage-wrap" ref={stageWrapRef}>
          <div
            className={`redactor-stage${tool === 'text' ? ' is-placing' : ''}`}
            style={{ width: stageWidth, height: stageHeight }}
            onPointerDown={onStageClick}
          >
            <canvas ref={canvasRef} className="redactor-canvas" />

            {objects.map((object) => {
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

          <div className="redactor-pager">
            <button
              type="button"
              className="pager-btn"
              onClick={() => {
                setIndex((current) => Math.max(0, current - 1))
                setSelected(null)
              }}
              disabled={index === 0}
              aria-label="Предыдущая страница"
            >
              ←
            </button>
            <span className="pager-label">
              Страница {index + 1} из {pages.length}
            </span>
            <button
              type="button"
              className="pager-btn"
              onClick={() => {
                setIndex((current) => Math.min(pages.length - 1, current + 1))
                setSelected(null)
              }}
              disabled={index >= pages.length - 1}
              aria-label="Следующая страница"
            >
              →
            </button>
          </div>
        </div>

        <aside className="redactor-panel">
          {selectedObject ? (
            <>
              <h4 className="panel-title">Выбранный объект</h4>

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
                    max={Math.max(40, Math.floor(Math.min(
                      (page?.box.width ?? 500) - selectedObject.x,
                      ((page?.box.height ?? 700) - selectedObject.y) / (selectedObject.height / selectedObject.width || 1),
                    )))}
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
              <h4 className="panel-title">Как это работает</h4>
              <ul className="panel-list">
                <li>
                  <b>Текст</b> — нажмите «Текст», затем на страницу. Печатайте здесь, справа.
                </li>
                <li>
                  <b>Фото</b> — выберите картинку, она встанет на страницу. Тащите мышкой.
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

          <button
            type="button"
            className="btn btn-quiet panel-reset"
            onClick={() => {
              setFile(null)
              setPages([])
              setIndex(0)
              setSelected(null)
              setHistory([])
              setMessage(null)
            }}
          >
            Открыть другой файл
          </button>
        </aside>
      </div>

      {message && (
        <p className={`message message-${message.tone}`} role="status">
          {message.text}
        </p>
      )}
    </div>
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
