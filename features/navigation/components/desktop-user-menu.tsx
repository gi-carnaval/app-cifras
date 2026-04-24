'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, LogOutIcon } from 'lucide-react'
import { useAuthSession } from '@/features/auth/auth-session-provider'
import { useTheme, type Theme } from '@/components/theme/theme-provider'
import { useChordNotation } from '@/components/chord-notation/chord-notation-provider'
import type { ChordNotation } from '@/core/chord-engine'
import { Button } from '@/components/ui/button'

const triggerClassName =
  'inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-(--text) shadow-xs transition-colors hover:bg-muted'

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]

const notationOptions: Array<{ value: ChordNotation; label: string }> = [
  { value: 'brazilian', label: 'Brasileira' },
  { value: 'international', label: 'Internacional' },
]

function getSegmentButtonClassName(isSelected: boolean) {
  return isSelected
    ? 'bg-(--bg) text-(--text) shadow-xs'
    : 'text-(--text-muted) hover:text-(--text)'
}

export function DesktopUserMenu() {
  const { status, user, isAuthenticated, signOut } = useAuthSession()
  const { theme, setTheme } = useTheme()
  const { notation, setNotation } = useChordNotation()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const userLabel = useMemo(() => user?.name || user?.email || 'Conta', [user])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function updateMenuPosition() {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()

      setMenuPosition({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      })
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      const clickedTrigger = triggerRef.current?.contains(target)
      const clickedMenu = menuRef.current?.contains(target)

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    updateMenuPosition()

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen])

  if (status === 'loading') {
    return <span className="text-sm text-(--text-muted)">Carregando...</span>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="max-w-36 truncate">{userLabel}</span>
        <ChevronDownIcon
          className={`size-4 text-(--text-muted) transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen
        ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[var(--z-popover)] w-80 rounded-2xl border border-border bg-(--bg) p-3 shadow-lg"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            <div className="border-b border-border px-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Conta
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-(--text)">
                {userLabel}
              </p>
            </div>

            <div className="space-y-4 px-2 py-3">
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Preferências
                </p>

                <div className="rounded-xl border border-border bg-(--bg2) p-3">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-(--text)">Notação dos acordes</p>
                      <p className="text-xs text-(--text-muted)">
                        Exibição atual: {notation === 'brazilian' ? 'Brasileira' : 'Internacional'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                    {notationOptions.map((option) => {
                      const isSelected = notation === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${getSegmentButtonClassName(isSelected)}`}
                          onClick={() => setNotation(option.value)}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-(--bg2) p-3">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-(--text)">Tema</p>
                      <p className="text-xs text-(--text-muted)">
                        Selecionado: {themeOptions.find((option) => option.value === theme)?.label ?? 'Sistema'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {themeOptions.map((option) => {
                      const isSelected = theme === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${getSegmentButtonClassName(isSelected)}`}
                          onClick={() => setTheme(option.value)}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              <section className="space-y-2 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Ações da conta
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => void signOut()}
                >
                  <span>Sair</span>
                  <LogOutIcon className="size-4" />
                </Button>
              </section>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  )
}
