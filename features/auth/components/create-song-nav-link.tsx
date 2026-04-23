'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '../auth-session-provider'

type CreateSongNavLinkProps = {
  className?: string
}

export function CreateSongNavLink({ className }: CreateSongNavLinkProps = {}) {
  const { isAuthenticated } = useAuthSession()

  if (!isAuthenticated) {
    return null
  }

  return (
    <Button asChild size="sm" className={className}>
      <Link href="/song/create">+ Nova Música</Link>
    </Button>
  )
}
