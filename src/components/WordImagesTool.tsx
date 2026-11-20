import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent } from 'react'
import { openPdf } from '../lib/pdf'
import type { PDFDocumentProxy } from '../lib/pdf'
import { pdfToDocx } from '../lib/toWord'
import { extractImages, imagesToZip } from '../lib/images'
import { download, formatSize } from '../lib/download'
import { pagesLabel } from '../lib/pages'

type Job = 'word' | 'images' | null
type Message = { tone: 'ok' | 'error' | 'info'; text: string }

const MAX_FILE_MB = 100
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
const MAX_PAGES = 200

function pagesLimitError(count: number | null): string | null {
  if (!count || count <= MAX_PAGES) return null
  return `В документе ${count} страниц — больше ${MAX_PAGES} браузер не осилит. Разбейте PDF на части и обработайте по очереди.`
}

export function WordImagesTool({ mode }: { mode: 'word' | 'images' }) {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pages, setPages] = useState<number | null>(null)
  const [loadingFile, setLoadingFile] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [job, setJob] = useState<Job>(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)

  useEffect(() => {
    pdfRef.current = pdf
  }, [pdf])

  useEffect(() => {
    return () => {
      pdfRef.current?.destroy()
    }
  }, [])

  const reset = useCallback(() => {
    pdfRef.current?.destroy()
    pdfRef.current = null
    setPdf(null)
    setFile(null)
    setPages(null)
    setMessage(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const acceptFile = useCallback(async (candidate: File) => {
    const looksLikePdf = candidate.type === 'application/pdf' || /\.pdf$/i.test(candidate.name)
    if (!looksLikePdf) {
      setMessage({ tone: 'error', text: 'Это не PDF. Выберите файл с расширением .pdf' })
      return
    }

    if (candidate.size > MAX_FILE_BYTES) {
      setMessage({
        tone: 'error',
        text: `Файл больше ${MAX_FILE_MB} МБ — браузер такое не переварит. Сожмите PDF или разбейте его на части.`,
      })
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setLoadingFile(true)
    setMessage(null)
    setProgress(0)
    setPages(null)

    try {
      pdfRef.current?.destroy()
      const document = await openPdf(candidate)
      pdfRef.current = document
      setPdf(document)
      setFile(candidate)
      setPages(document.numPages)
    } catch (error) {
      console.error(error)
      pdfRef.current = null
      setPdf(null)
      setFile(null)
      setMessage({
        tone: 'error',
        text: 'Не удалось открыть PDF. Возможно, файл повреждён или защищён паролем.',
      })
    } finally {
      setLoadingFile(false)
    }
  }, [])

  const loadDemo = useCallback(async () => {
    setDemoLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}demo.pdf`)
      if (!response.ok) throw new Error(`demo.pdf: ${response.status}`)
      const blob = await response.blob()
      await acceptFile(new File([blob], 'demo-schet.pdf', { type: 'application/pdf' }))
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не удалось открыть демо-документ. Выберите свой PDF.' })
    } finally {
      setDemoLoading(false)
    }
  }, [acceptFile])

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      const dropped = event.dataTransfer.files?.[0]
      if (dropped) void acceptFile(dropped)
    },
    [acceptFile],
  )

  const runWord = useCallback(async () => {
    if (!pdf || !file || job) return
    const limit = pagesLimitError(pages)
    if (limit) {
      setMessage({ tone: 'error', text: limit })
      return
    }
    setJob('word')
    setProgress(0)
    setMessage(null)
    try {
      const { blob, stats } = await pdfToDocx(pdf, (done, total) => setProgress(done / total))
      const name = file.name.replace(/\.pdf$/i, '') || 'document'
      download(blob, `${name}.docx`)
      const summary = [pagesLabel(stats.pages)]
      if (stats.tables) summary.push(`таблиц: ${stats.tables}`)
      if (stats.images) summary.push(`картинок: ${stats.images}`)
      const scannedNote = stats.scanned
        ? stats.scanned === 1
          ? ' 1 страница без текста вставлена картинкой.'
          : ` ${stats.scanned} страниц без текста вставлены картинкой.`
        : ''
      setMessage({ tone: 'ok', text: `Готово — Word скачивается: ${summary.join(' · ')}.${scannedNote}` })
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось собрать .docx. Попробуйте другой файл.' })
    } finally {
      setJob(null)
    }
  }, [file, job, pages, pdf])

  const runImages = useCallback(async () => {
    if (!pdf || !file || job) return
    const limit = pagesLimitError(pages)
    if (limit) {
      setMessage({ tone: 'error', text: limit })
      return
    }
    setJob('images')
    setProgress(0)
    setMessage(null)
    try {
      const images = await extractImages(pdf, (done, total) => setProgress(done / total))
      if (!images.length) {
        setMessage({
          tone: 'info',
          text: 'В этом PDF нет встроенных растровых картинок: скорее всего, внутри только текст или векторная графика.',
        })
        return
      }
      const zip = await imagesToZip(images)
      const name = file.name.replace(/\.pdf$/i, '') || 'images'
      download(zip, `${name}-images.zip`)
      setMessage({
        tone: 'ok',
        text: `Нашли ${images.length} ${images.length === 1 ? 'изображение' : 'изображений'} — ZIP скачивается.`,
      })
    } catch (error) {
      console.error(error)
      setMessage({ tone: 'error', text: 'Не получилось извлечь изображения. Попробуйте другой файл.' })
    } finally {
      setJob(null)
    }
  }, [file, job, pages, pdf])

  const busy = job !== null
  const percent = Math.round(progress * 100)

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => {
          const picked = event.target.files?.[0]
          if (picked) void acceptFile(picked)
        }}
      />

      {!file ? (
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}${loadingFile ? ' is-loading' : ''}`}
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
          <p className="dropzone-title">
            {loadingFile ? 'Открываем документ…' : 'Перетащите PDF сюда'}
          </p>
          <p className="dropzone-hint">или нажмите, чтобы выбрать файл</p>
          <span className="dropzone-note">
            PDF · до {MAX_FILE_MB} МБ · файл не покидает браузер
          </span>
        </div>
      ) : (
        <div className="file-panel">
          <div className="file-row">
            <div className="file-badge">PDF</div>
            <div className="file-meta">
              <p className="file-name" title={file.name}>
                {file.name}
              </p>
              <p className="file-info">
                {formatSize(file.size)}
                {pages ? ` · ${pagesLabel(pages)}` : ''}
              </p>
            </div>
            <button className="btn btn-quiet" type="button" onClick={reset} disabled={busy}>
              Заменить
            </button>
          </div>

          <div className="actions">
            <button
              className={`btn ${mode === 'word' ? 'btn-primary' : 'btn-soft'}`}
              type="button"
              onClick={runWord}
              disabled={busy}
            >
              {job === 'word' ? 'Собираем Word…' : 'Скачать Word (.docx)'}
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
              onClick={runImages}
              disabled={busy}
            >
              {job === 'images' ? 'Ищем картинки…' : 'Вытащить изображения (.zip)'}
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

          {busy && (
            <div className="progress" role="status" aria-live="polite">
              <div className="progress-bar">
                <span style={{ width: `${Math.max(percent, 6)}%` }} />
              </div>
              <p className="progress-text">
                {percent >= 100 ? 'Финалим файл…' : `Обрабатываем страницы · ${percent}%`}
              </p>
            </div>
          )}

          {message && !busy && (
            <p className={`message message-${message.tone}`} role="status">
              {message.text}
            </p>
          )}
        </div>
      )}

      {!file && (
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

      {!file && message && !loadingFile && (
        <p className={`message message-${message.tone}`} role="status">
          {message.text}
        </p>
      )}
    </>
  )
}
