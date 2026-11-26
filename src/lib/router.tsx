import { useEffect, useState } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

/** Маршруты сайта: одна страница — один путь, без бэкенда. */
export const ROUTES = {
  home: '/',
  tools: '/tools',
  services: '/services',
  editor: '/editor',
  about: '/about',
  contacts: '/contacts',
  uz: '/uz',
  en: '/en',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]

function normalize(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '')
  return clean || '/'
}

const KNOWN = new Set<string>(Object.values(ROUTES))

const STATIC = new Set<string>([
  '/terms',
  '/privacy-policy',
  '/about',
  '/contacts',
])

export function isKnownRoute(path: string): boolean {
  const n = normalize(path)
  if (KNOWN.has(n)) return true
  if (STATIC.has(n)) return true
  return false
}

/** Текущий путь с подпиской на кнопки «назад/вперёд» браузера. */
export function usePath(): string {
  const [path, setPath] = useState(() => normalize(window.location.pathname))

  useEffect(() => {
    const update = () => setPath(normalize(window.location.pathname))
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return path
}

/** Переход без перезагрузки; якоря вида «/#faq» тоже понимает. */
export function navigate(to: string) {
  const [path, hash] = to.split('#')
  const target = normalize(path || window.location.pathname)
  if (target !== normalize(window.location.pathname) || hash) {
    window.history.pushState({}, '', `${target}${hash ? `#${hash}` : ''}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.requestAnimationFrame(() => {
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
  children: ReactNode
}

/** Ссылка внутри сайта: обычный href для копирования, переход — без перезагрузки. */
export function Link({ to, children, onClick, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        // Средний клик и «открыть в новой вкладке» не перехватываем.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
