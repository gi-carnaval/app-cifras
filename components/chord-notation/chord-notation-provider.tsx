'use client'

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { ChordNotation } from '@/core/chord-engine'

const STORAGE_KEY = 'cifras-app-chord-notation'
const CHANGE_EVENT = 'cifras-app-chord-notation-change'
const DEFAULT_NOTATION: ChordNotation = 'brazilian'

type ChordNotationContextValue = {
  notation: ChordNotation
  setNotation: (notation: ChordNotation) => void
}

const ChordNotationContext = createContext<ChordNotationContextValue | null>(null)

function isChordNotation(value: string | null): value is ChordNotation {
  return value === 'international' || value === 'brazilian'
}

function readNotationSnapshot(): ChordNotation {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTATION
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)

  return isChordNotation(storedValue) ? storedValue : DEFAULT_NOTATION
}

function readServerNotationSnapshot(): ChordNotation {
  return DEFAULT_NOTATION
}

function subscribeToNotation(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => onStoreChange()

  window.addEventListener('storage', handleChange)
  window.addEventListener(CHANGE_EVENT, handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(CHANGE_EVENT, handleChange)
  }
}

function persistNotation(notation: ChordNotation) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, notation)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function useStoredChordNotation() {
  return useSyncExternalStore(
    subscribeToNotation,
    readNotationSnapshot,
    readServerNotationSnapshot,
  )
}

export function ChordNotationProvider({ children }: { children: ReactNode }) {
  const notation = useStoredChordNotation()
  const value = useMemo<ChordNotationContextValue>(
    () => ({
      notation,
      setNotation: persistNotation,
    }),
    [notation],
  )

  return (
    <ChordNotationContext.Provider value={value}>
      {children}
    </ChordNotationContext.Provider>
  )
}

export function useChordNotation() {
  const context = useContext(ChordNotationContext)

  if (!context) {
    throw new Error('useChordNotation must be used within ChordNotationProvider')
  }

  return context
}
