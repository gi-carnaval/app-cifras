'use client'

import Link from 'next/link'

import { useAuthSession } from '../auth-session-provider'

export function CreateSongNavLink() {
  const { isAuthenticated } = useAuthSession()

  if (!isAuthenticated) {
    return null
  }

  return (
    <Link href="/song/create" className="navbar-link">
      <span className="btn-primary btn-sm">+ Nova Música</span>
    </Link>
  )
}
