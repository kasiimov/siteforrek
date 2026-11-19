import type { ReactNode } from 'react'
import type { Output } from '../lib/download'

export type OptionSpec =
  | {
      kind: 'text'
      key: string
      label: string
      initial: string
      placeholder?: string
    }
  | {
      kind: 'select'
      key: string
      label: string
      initial: string
      choices: { value: string; label: string }[]
    }

export type Values = Record<string, string>
export type RunProgress = (done: number, total: number) => void

export type ToolSpec = {
  id: string
  name: string
  hint: string
  accept: string
  acceptLabel: string
  multiple: boolean
  cta: string
  icon: ReactNode
  options: OptionSpec[]
  builtin?: 'word' | 'images'
  run?: (files: File[], values: Values, onProgress: RunProgress) => Promise<Output[]>
}
