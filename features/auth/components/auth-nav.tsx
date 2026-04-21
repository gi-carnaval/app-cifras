'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '../auth-session-provider'

export function AuthNav() {
  const { status, user, isAuthenticated, signOut } = useAuthSession()

  if (status === 'loading') {
    return <span className="text-sm text-(--text-muted)">Carregando...</span>
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link href="/login" className="navbar-link">Entrar</Link>
        <Link href="/register" className="navbar-link">Cadastrar</Link>
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-(--text-muted) sm:inline">
        {user?.name || user?.email}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={() => void signOut()}>
        Sair
      </Button>
    </div>
  )
}
