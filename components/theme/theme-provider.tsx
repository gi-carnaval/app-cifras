'use client'

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = 'cifras-app-theme'
const THEME_CHANGE_EVENT = 'cifras-app-theme-change'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return isTheme(storedTheme) ? storedTheme : 'system'
}

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme) {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme: Theme) {
  const resolvedTheme = resolveTheme(theme)
  const root = document.documentElement

  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = resolvedTheme

  return resolvedTheme
}

function subscribeTheme(listener: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  function handleChange() {
    applyTheme(getStoredTheme())
    listener()
  }

  window.addEventListener('storage', handleChange)
  window.addEventListener(THEME_CHANGE_EVENT, handleChange)
  mediaQuery.addEventListener('change', handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange)
    mediaQuery.removeEventListener('change', handleChange)
  }
}

function getThemeSnapshot() {
  return getStoredTheme()
}

function getServerThemeSnapshot(): Theme {
  return 'system'
}

function getResolvedThemeSnapshot() {
  return resolveTheme(getStoredTheme())
}

function getServerResolvedThemeSnapshot(): 'light' | 'dark' {
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )
  const resolvedTheme = useSyncExternalStore(
    subscribeTheme,
    getResolvedThemeSnapshot,
    getServerResolvedThemeSnapshot
  )

  function setTheme(nextTheme: Theme) {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

export { THEME_STORAGE_KEY }
