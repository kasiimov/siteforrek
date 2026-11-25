export type Output = { name: string; blob: Blob }

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function baseName(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, '') || 'document'
}

/** Скачивает один файл напрямую, а несколько — одним ZIP-архивом. */
export async function saveOutputs(outputs: Output[], zipName: string) {
  if (!outputs.length) throw new Error('Нет файлов для скачивания')
  if (outputs.length === 1) {
    download(outputs[0].blob, outputs[0].name)
    return
  }
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const output of outputs) zip.file(output.name, output.blob)
  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  download(blob, zipName)
}
