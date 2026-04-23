'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '../auth-session-provider'

type AuthNavProps = {
  orientation?: "inline" | "stacked"
  linkClassName?: string
  containerClassName?: string
  userClassName?: string
  buttonClassName?: string
}

const defaultLinkClassName = "navbar-link"

export function AuthNav({
  orientation = "inline",
  linkClassName = defaultLinkClassName,
  containerClassName,
  userClassName,
  buttonClassName,
}: AuthNavProps = {}) {
  const { status, user, isAuthenticated, signOut } = useAuthSession()
  const isStacked = orientation === "stacked"

  if (status === 'loading') {
    return <span className="text-sm text-(--text-muted)">Carregando...</span>
  }

  if (!isAuthenticated) {
    if (isStacked) {
      return (
        <div className={containerClassName ?? "flex flex-col gap-3"}>
          <Link href="/login" className={linkClassName}>Entrar</Link>
          <Link href="/register" className={linkClassName}>Cadastrar</Link>
        </div>
      )
    }

    return (
      <>
        <Link href="/login" className={linkClassName}>Entrar</Link>
        <Link href="/register" className={linkClassName}>Cadastrar</Link>
      </>
    )
  }

  return (
    <div className={containerClassName ?? "flex items-center gap-2"}>
      <span className={userClassName ?? "hidden text-sm text-(--text-muted) sm:inline"}>
        {user?.name || user?.email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={buttonClassName}
        onClick={() => void signOut()}
      >
        Sair
      </Button>
    </div>
  )
}
