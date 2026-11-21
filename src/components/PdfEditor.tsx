import { useCallback, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent } from 'react'
import { formatSize, saveOutputs } from '../lib/download'
import { addHistory } from '../lib/profile'
import type { ToolSpec } from './toolTypes'

type Message = { tone: 'ok' | 'error' | 'info'; text: string }

const MAX_FILE_MB = 100
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

export function PdfEditor({ spec }: { spec: ToolSpec }) {
  const [files, setFiles] = useState<File[]>([])
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(spec.options.map((option) => [option.key, option.initial])),
  )
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<Message | null>(null)
  const [dragging, setDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const accepts = useCallback(
    (file: File) => {
      if (spec.accept.includes('image/')) {
        return /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name)
      }
      return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    },
    [spec.accept],
  )

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list)
      const valid: File[] = []
      const rejected: string[] = []

      for (const file of incoming) {
        if (!accepts(file)) {
          rejected.push(`«${file.name}» — нужен ${spec.acceptLabel}`)
          continue
        }
        if (file.size > MAX_FILE_BYTES) {
          rejected.push(`«${file.name}» больше ${MAX_FILE_MB} МБ`)
          continue
        }
        valid.push(file)
      }

      if (rejected.length) {
        setMessage({ tone: 'error', text: rejected.join('; ') })
      } else {
        setMessage(null)
      }

      if (!valid.length) return
      setFiles((previous) => (spec.multiple ? [...previous, ...valid] : [valid[0]]))
      if (inputRef.current) inputRef.current.value = ''
    },
    [accepts, spec.acceptLabel, spec.multiple],
  )

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files)
    },
    [addFiles],
  )

  const removeFile = (index: number) => {
    setFiles((previous) => previous.filter((_, current) => current !== index))
    setMessage(null)
  }

  const clearAll = () => {
    setFiles([])
    setMessage(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const run = async () => {
    if (!spec.run || !files.length || busy) return
    setBusy(true)
    setProgress(0)
    setMessage(null)

    try {
      const result = await spec.run(files, values, (done, total) => {
        setProgress(done / Math.max(total, 1))
      })
      const outputs = Array.isArray(result) ? result : result.outputs
      const note = Array.isArray(result) ? undefined : result.note
      const zipName = `${files[0].name.replace(/\.[^.]+$/, '') || 'rekpdf'}-rekpdf.zip`
      await saveOutputs(outputs, zipName)
      addHistory({
        tool: spec.name,
        fileName: files.map((file) => file.name).join(', '),
        result: outputs.length > 1 ? `${outputs.length} файлов в ZIP` : outputs[0]?.name ?? 'файл',
      })
      setMessage({
        tone: note ? 'info' : 'ok',
        text:
          note ??
          (outputs.length === 1
            ? 'Готово — файл уже скачивается.'
            : `Готово — ${outputs.length} файлов скачиваются одним архивом.`),
      })
    } catch (error) {
      console.error(error)
      setMessage({
        tone: 'error',
        text:
          error instanceof Error && error.message
            ? error.message
            : 'Не получилось обработать файл. Проверьте, что он не повреждён и не защищён паролем.',
      })
    } finally {
      setBusy(false)
    }
  }

  const percent = Math.round(progress * 100)

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={spec.accept}
        multiple={spec.multiple}
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files)
        }}
      />

      {!files.length ? (
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
          <p className="dropzone-title">Перетащите {spec.acceptLabel} сюда</p>
          <p className="dropzone-hint">
            {spec.multiple ? 'или нажмите — можно выбрать несколько файлов' : 'или нажмите, чтобы выбрать файл'}
          </p>
          <span className="dropzone-note">
            до {MAX_FILE_MB} МБ · файлы не покидают браузер
          </span>
        </div>
      ) : (
        <div className="file-panel">
          <div className="file-list">
            {files.map((file, index) => (
              <div className="file-row" key={`${file.name}-${file.lastModified}-${index}`}>
                <div className="file-badge">{spec.accept.includes('image/') ? 'IMG' : 'PDF'}</div>
                <div className="file-meta">
                  <p className="file-name" title={file.name}>
                    {file.name}
                  </p>
                  <p className="file-info">{formatSize(file.size)}</p>
                </div>
                <button
                  className="btn btn-quiet btn-icon"
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={busy}
                  aria-label={`Убрать ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {spec.options.length > 0 && (
            <div className="option-grid">
              {spec.options.map((option) => (
                <label className="field" key={option.key}>
                  <span className="field-label">{option.label}</span>
                  {option.kind === 'select' ? (
                    <select
                      className="field-input"
                      value={values[option.key]}
                      disabled={busy}
                      onChange={(event) =>
                        setValues((previous) => ({ ...previous, [option.key]: event.target.value }))
                      }
                    >
                      {option.choices.map((choice) => (
                        <option value={choice.value} key={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field-input"
                      type="text"
                      value={values[option.key]}
                      placeholder={option.placeholder}
                      disabled={busy}
                      onChange={(event) =>
                        setValues((previous) => ({ ...previous, [option.key]: event.target.value }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={run} disabled={busy}>
              {busy ? 'Обрабатываем…' : spec.cta}
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
            <button className="btn btn-quiet" type="button" onClick={clearAll} disabled={busy}>
              Сбросить
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

      {!files.length && message && (
        <p className={`message message-${message.tone}`} role="status">
          {message.text}
        </p>
      )}
    </>
  )
}
