'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { MoreHorizontalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/features/auth/auth-session-provider'
import { AddSongToRepertoireDialog } from '@/features/repertoires/components/add-song-to-repertoire-dialog'
import type { SongActionTarget } from '../types/song-action-target'
import { SongAddToRepertoireMenuItem } from './song-add-to-repertoire-menu-item'

interface SongRowActionsProps {
  song: SongActionTarget
}

export function SongRowActions({ song }: SongRowActionsProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthSession()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddToRepertoireOpen, setIsAddToRepertoireOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (!isOpen) return

    function updateMenuPosition() {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()

      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen])

  async function deleteSong() {
    const shouldDelete = window.confirm(`Excluir "${song.title}"?`)
    if (!shouldDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/songs/${song.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      setIsOpen(false)
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative flex shrink-0 justify-end">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Ações para ${song.title}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontalIcon className="size-4" />
      </Button>

      {isOpen
        ? createPortal(
          <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar ações"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-none"
              asChild
            >
              <Link href={`/song/${song.id}`}>Ver</Link>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start rounded-none"
                  asChild
                >
                  <Link href={`/song/${song.id}/edit`}>Editar</Link>
                </Button>
                <SongAddToRepertoireMenuItem
                  onSelect={() => {
                    setIsOpen(false)
                    setIsAddToRepertoireOpen(true)
                  }}
                />
              </>
            )}
            {isAuthenticated ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full justify-start rounded-none"
                disabled={isDeleting}
                onClick={deleteSong}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            ) : null}
          </div>
          </>,
          document.body
        )
        : null}
      {isAuthenticated ? (
        <AddSongToRepertoireDialog
          songId={song.id}
          songTitle={song.title}
          open={isAddToRepertoireOpen}
          onOpenChange={setIsAddToRepertoireOpen}
        />
      ) : null}
    </div>
  )
}
