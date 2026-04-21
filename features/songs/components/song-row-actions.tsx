'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/features/auth/auth-session-provider'

interface SongRowActionsProps {
  songId: string
  songTitle: string
}

export function SongRowActions({ songId, songTitle }: SongRowActionsProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function deleteSong() {
    const shouldDelete = window.confirm(`Excluir "${songTitle}"?`)
    if (!shouldDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/songs/${songId}`, {
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
    <div className="relative flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Ações para ${songTitle}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreHorizontalIcon className="size-4" />
      </Button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Fechar ações"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-9 z-20 min-w-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start rounded-none"
              asChild
            >
              <Link href={`/song/${songId}`}>Ver</Link>
            </Button>
            {isAuthenticated && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none"
                asChild
              >
                <Link href={`/song/${songId}/edit`}>Editar</Link>
              </Button>
            )}
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
          </div>
        </>
      )}
    </div>
  )
}
