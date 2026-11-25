import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent } from 'react'
import type { DocxStats } from '../lib/toWord'
import { baseName, download, formatSize, saveOutputs } from '../lib/download'
import { addHistory } from '../lib/profile'
import { track } from '../lib/analytics'
import { pagesLabel } from '../lib/pages'
import {
  MAX_BATCH_FILES,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  batchPagesError,
  bigFileWarning,
  filesLabel,
  isAbortError,
  outputName,
  uniqueName,
  zipName,
} from '../lib/batch'

type Job = 'word' | 'images'
type Message = { tone: 'ok' | 'error' | 'info'; text: string }
type Item = { file: File; pages: number }

function wordSummary(items: Item[], stats: DocxStats): string {
  const head =
    items.length === 1
      ? 'Готово — Word скачивается'
      : `Готово — ${filesLabel(items.length)}, ZIP скачивается`

  const parts = [pagesLabel(stats.pages)]
  if (stats.tables) parts.push(`таблиц: ${stats.tables}`)
  if (stats.images) parts.push(`картинок: ${stats.images}`)
  if (stats.links) parts.push(`ссылок: ${stats.links}`)

  const scanned = stats.scanned
    ? stats.scanned === 1
      ? ' 1 страница без текста вставлена картинкой.'
      : ` ${stats.scanned} страниц без текста вставлены картинкой.`
    : ''

  return `${head}: ${parts.join(' · ')}.${scanned}`
}

function imagesSummary(count: number, files: number): string {
  const word = count === 1 ? 'изображение' : 'изображений'
  return files === 1
    ? `Нашли ${count} ${word} — ZIP скачивается.`
    : `Нашли ${count} ${word} в ${filesLabel(files)} — ZIP скачивается.`
}

export function WordImagesTool({ mode }: { mode: 'word' | 'images' }) {
  const [items, setItems] = useState<Item[]>([])
  const [loadingFile, setLoadingFile] = useState(false)
  const [loadingNote, setLoadingNote] = useState('Открываем документ…')
  const [demoLoading, setDemoLoading] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [warning, setWarning] = useState<{ job: Job; text: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressNote, setProgressNote] = useState('')
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const appendNext = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setItems([])
    setMessage(null)
    setProgress(0)
    setProgressNote('')
    setWarning(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const readItems = useCallback(
    async (candidates: File[], append: boolean) => {
      if (loadingFile || job) return

      const pdfs = candidates.filter((file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name))
      if (!pdfs.length) {
        setMessage({ tone: 'error', text: 'Это не PDF. Выберите файл с расширением .pdf' })
        return
      }

      const oversized = pdfs.find((file) => file.size > MAX_FILE_BYTES)
      if (oversized) {
        setMessage({
          tone: 'error',
          text: `«${oversized.name}» больше ${MAX_FILE_MB} МБ — браузер такое не переварит. Сожмите PDF или разбейте его на части.`,
        })
        if (inputRef.current) inputRef.current.value = ''
        return
      }

      const existing = append ? items : []
      const room = MAX_BATCH_FILES - existing.length
      if (room <= 0) {
        setMessage({
          tone: 'error',
          text: `За раз берём не больше ${MAX_BATCH_FILES} файлов. Обработайте эту пачку, потом добавьте следующую.`,
        })
        return
      }

      const fresh = pdfs.slice(0, room)
      const skipped = pdfs.length - fresh.length

      setLoadingFile(true)
      setMessage(null)
      setWarning(null)
      setProgress(0)
      setProgressNote('')

      const loaded: Item[] = []
      const failed: string[] = []

      try {
        const { openPdf } = await import('../lib/pdf')
        for (let index = 0; index < fresh.length; index++) {
          const file = fresh[index]
          setLoadingNote(
            fresh.length > 1 ? `Открываем ${index + 1} из ${fresh.length} · ${file.name}` : 'Открываем документ…',
          )
          try {
            const pdf = await openPdf(file)
            try {
              loaded.push({ file, pages: pdf.numPages })
            } finally {
              await pdf.destroy()
            }
          } catch (error) {
            console.error(error)
            failed.push(file.name)
          }
        }

        setItems([...existing, ...loaded])

        if (skipped > 0) {
          setMessage({
            tone: 'info',
            text: `Взяли первые ${MAX_BATCH_FILES} файлов — ещё ${skipped} остались за бортом.`,
          })
        } else if (failed.length === 1) {
          setMessage({
            tone: 'error',
            text: `Не удалось открыть «${failed[0]}»: файл повреждён или защищён паролем.`,
          })
        } else if (failed.length > 1) {
          setMessage({
            tone: 'error',
            text: `Не открылись: ${failed.join(', ')}. Возможно, файлы повреждены или под паролем.`,
          })
        }
      } finally {
        setLoadingFile(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [items, job, loadingFile],
  )

  const loadDemo = useCallback(async () => {
    setDemoLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}demo.pdf`)
      if (!response.ok) throw new Error(`demo.pdf: ${response.status}`)
      const blob = await response.blob()
      await readItems([new File([blob], 'demo-schet.pdf', { type: 'application/pdf' })], false)
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не удалось открыть демо-документ. Выберите свой PDF.' })
    } finally {
      setDemoLoading(false)
    }
  }, [readItems])

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      const dropped = Array.from(event.dataTransfer.files ?? [])
      if (dropped.length) void readItems(dropped, false)
    },
    [readItems],
  )

  const removeItem = useCallback((index: number) => {
    setItems((current) => current.filter((_, position) => position !== index))
    setMessage(null)
    setWarning(null)
  }, [])

  const run = useCallback(
    async (nextJob: Job) => {
      if (!items.length) return

      const controller = new AbortController()
      abortRef.current = controller
      const total = items.length

      setJob(nextJob)
      setProgress(0)
      setProgressNote('')
      setMessage(null)
      const startedAt = Date.now()

      try {
        if (nextJob === 'word') {
          const [{ openPdf }, { pdfToDocx }] = await Promise.all([
            import('../lib/pdf'),
            import('../lib/toWord'),
          ])
          const outputs: { name: string; blob: Blob }[] = []
          const taken = new Set<string>()
          const stats: DocxStats = { pages: 0, scanned: 0, tables: 0, images: 0, links: 0 }

          for (let index = 0; index < items.length; index++) {
            const { file } = items[index]
            setProgressNote(total > 1 ? `${index + 1} из ${total} · ${file.name}` : '')

            const pdf = await openPdf(file)
            try {
              const result = await pdfToDocx(
                pdf,
                (done, pages) => setProgress((index + done / Math.max(1, pages)) / total),
                controller.signal,
              )
              stats.pages += result.stats.pages
              stats.scanned += result.stats.scanned
              stats.tables += result.stats.tables
              stats.images += result.stats.images
              stats.links += result.stats.links

              const name = uniqueName(outputName(file.name, 'docx'), taken)
              taken.add(name)
              outputs.push({ name, blob: result.blob })
            } finally {
              await pdf.destroy()
            }
          }

          if (outputs.length === 1) download(outputs[0].blob, outputs[0].name)
          else await saveOutputs(outputs, zipName(items[0].file.name, 'word'))

          track(nextJob === 'word' ? 'PDF → Word' : 'Картинки из PDF', 'done', {
            ms: Date.now() - startedAt,
            pages: stats.pages,
            size: Math.round(items.reduce((sum, item) => sum + item.file.size, 0) / 1024),
            kind: 'pdf',
          })
          addHistory({
            tool: nextJob === 'word' ? 'PDF → Word' : 'Картинки из PDF',
            fileName: items[0].file.name,
            result: pagesLabel(stats.pages),
          })
          setMessage({ tone: 'ok', text: wordSummary(items, stats) })
        } else if (total === 1) {
          const [{ openPdf }, { extractImages, imagesToZip }] = await Promise.all([
            import('../lib/pdf'),
            import('../lib/images'),
          ])
          const pdf = await openPdf(items[0].file)
          try {
            const images = await extractImages(pdf, (done, pages) => setProgress(done / Math.max(1, pages)), controller.signal)
            if (!images.length) {
              setMessage({
                tone: 'info',
                text: 'В этом PDF нет встроенных растровых картинок: скорее всего, внутри только текст или векторная графика.',
              })
              return
            }
            download(await imagesToZip(images), `${baseName(items[0].file.name)}-images.zip`)
            track('Картинки из PDF', 'done', {
              ms: Date.now() - startedAt,
              size: Math.round(items[0].file.size / 1024),
              kind: 'pdf',
            })
            addHistory({
              tool: 'Картинки из PDF',
              fileName: items[0].file.name,
              result: `${images.length} изображений`,
            })
            setMessage({ tone: 'ok', text: imagesSummary(images.length, 1) })
          } finally {
            await pdf.destroy()
          }
        } else {
          const [{ openPdf }, { extractImages }, { default: JSZip }] = await Promise.all([
            import('../lib/pdf'),
            import('../lib/images'),
            import('jszip'),
          ])
          const zip = new JSZip()
          let count = 0

          for (let index = 0; index < items.length; index++) {
            const { file } = items[index]
            setProgressNote(`${index + 1} из ${total} · ${file.name}`)

            const pdf = await openPdf(file)
            try {
              const images = await extractImages(
                pdf,
                (done, pages) => setProgress((index + done / Math.max(1, pages)) / total),
                controller.signal,
              )
              const folder = baseName(file.name)
              for (const image of images) zip.file(`${folder}/${image.name}`, image.blob)
              count += images.length
            } finally {
              await pdf.destroy()
            }
          }

          if (!count) {
            setMessage({
              tone: 'info',
              text: 'Ни в одном из файлов не нашлось встроенных растровых картинок.',
            })
            return
          }

          download(await zip.generateAsync({ type: 'blob', compression: 'STORE' }), zipName(items[0].file.name, 'images'))
          setMessage({ tone: 'ok', text: imagesSummary(count, total) })
        }
      } catch (error) {
        if (isAbortError(error)) {
          setMessage({
            tone: 'info',
            text: 'Остановили — ничего не скачалось. Файлы на месте, можно запустить снова.',
          })
        } else {
          console.error(error)
          const message = error instanceof Error && error.message ? error.message : 'Не получилось собрать файл'
          track(nextJob === 'word' ? 'PDF → Word' : 'Картинки из PDF', 'error', {
            message,
            ms: Date.now() - startedAt,
            kind: 'pdf',
          })
          setMessage({ tone: 'error', text: 'Не получилось собрать файл. Попробуйте другой документ.' })
        }
      } finally {
        abortRef.current = null
        setJob(null)
        setProgress(0)
        setProgressNote('')
      }
    },
    [items],
  )

  const start = useCallback(
    (nextJob: Job, force = false) => {
      if (!items.length || job) return

      const infos = items.map((item) => ({ name: item.file.name, size: item.file.size, pages: item.pages }))
      const limit = batchPagesError(infos)
      if (limit) {
        setMessage({ tone: 'error', text: limit })
        return
      }

      const hint = bigFileWarning(infos)
      if (hint && !force) {
        setWarning({ job: nextJob, text: hint })
        return
      }

      setWarning(null)
      void run(nextJob)
    },
    [items, job, run],
  )

  const busy = job !== null
  const percent = Math.round(progress * 100)
  const compact = items.length > 1

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? [])
          if (picked.length) void readItems(picked, appendNext.current)
          appendNext.current = false
        }}
      />

      {!items.length ? (
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}${loadingFile ? ' is-loading' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            appendNext.current = false
            inputRef.current?.click()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              appendNext.current = false
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="dropzone-title">{loadingFile ? loadingNote : 'Перетащите PDF сюда'}</p>
          <p className="dropzone-hint">или нажмите, чтобы выбрать файл — можно сразу несколько</p>
          <span className="dropzone-note">
            PDF · до {MAX_FILE_MB} МБ каждый · до {MAX_BATCH_FILES} файлов · всё остаётся в браузере
          </span>
        </div>
      ) : (
        <div className="file-panel">
          <div className="file-list">
            {items.map((item, index) => (
              <div className="file-row" key={`${item.file.name}-${item.file.size}-${item.file.lastModified}-${index}`}>
                <div className="file-badge">PDF</div>
                <div className="file-meta">
                  <p className="file-name" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="file-info">
                    {formatSize(item.file.size)} · {pagesLabel(item.pages)}
                  </p>
                </div>
                <button
                  className="btn btn-quiet btn-icon"
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={busy}
                >
                  Убрать
                </button>
              </div>
            ))}
          </div>

          <div className="actions">
            {items.length < MAX_BATCH_FILES && (
              <button
                className="btn btn-quiet"
                type="button"
                onClick={() => {
                  appendNext.current = true
                  inputRef.current?.click()
                }}
                disabled={busy || loadingFile}
              >
                Добавить ещё PDF
              </button>
            )}
            <button className="btn btn-quiet" type="button" onClick={reset} disabled={busy}>
              {compact ? 'Очистить список' : 'Заменить'}
            </button>
          </div>

          <div className="actions">
            <button
              className={`btn ${mode === 'word' ? 'btn-primary' : 'btn-soft'}`}
              type="button"
              onClick={() => start('word')}
              disabled={busy}
            >
              {job === 'word'
                ? 'Собираем Word…'
                : compact
                  ? `Скачать ${filesLabel(items.length)} в ZIP`
                  : 'Скачать Word (.docx)'}
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v12m0 0 4.5-4.5M12 16l-4.5-4.5M5 20h14"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`btn ${mode === 'images' ? 'btn-primary' : 'btn-soft'}`}
              type="button"
              onClick={() => start('images')}
              disabled={busy}
            >
              {job === 'images'
                ? 'Ищем картинки…'
                : compact
                  ? 'Вытащить картинки из всех (.zip)'
                  : 'Вытащить изображения (.zip)'}
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5M12 4v11m0 0 4-4m-4 4-4-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {warning && !busy && (
            <div className="message message-warn" role="status">
              <p>{warning.text}</p>
              <div className="warning-actions">
                <button className="btn btn-primary" type="button" onClick={() => start(warning.job, true)}>
                  Продолжить
                </button>
                <button className="btn btn-quiet" type="button" onClick={() => setWarning(null)}>
                  Не сейчас
                </button>
              </div>
            </div>
          )}

          {busy && (
            <div className="progress" role="status" aria-live="polite">
              <div className="progress-bar">
                <span style={{ width: `${Math.max(percent, 6)}%` }} />
              </div>
              <div className="progress-foot">
                <p className="progress-text">
                  {percent >= 100 ? 'Финалим файл…' : `${job === 'word' ? 'Собираем Word' : 'Ищем картинки'} · ${percent}%`}
                  {progressNote ? ` · ${progressNote}` : ''}
                </p>
                <button
                  className="btn btn-quiet btn-icon"
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                >
                  Отменить
                </button>
              </div>
            </div>
          )}

          {message && !busy && (
            <p className={`message message-${message.tone}`} role="status">
              {message.text}
            </p>
          )}
        </div>
      )}

      {!items.length && (
        <div className="actions">
          <button
            className="btn btn-soft"
            type="button"
            onClick={loadDemo}
            disabled={demoLoading || loadingFile}
          >
            {demoLoading ? 'Готовим пример…' : 'Открыть демо-документ'}
          </button>
        </div>
      )}

      {!items.length && message && !loadingFile && (
        <p className={`message message-${message.tone}`} role="status">
          {message.text}
        </p>
      )}
    </>
  )
}
