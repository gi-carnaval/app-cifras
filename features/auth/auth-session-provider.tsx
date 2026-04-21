'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  AuthSession,
  AuthenticatedUser,
} from '@/domain/repositories/auth.repository'

type AuthSessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthSessionContextValue {
  status: AuthSessionStatus
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  refreshSession: () => Promise<AuthSession>
  signOut: () => Promise<void>
}

const unauthenticatedSession: AuthSession = {
  isAuthenticated: false,
  user: null,
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

async function readSession() {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    return unauthenticatedSession
  }

  return response.json() as Promise<AuthSession>
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(unauthenticatedSession)
  const [status, setStatus] = useState<AuthSessionStatus>('loading')

  const applySession = useCallback((nextSession: AuthSession) => {
    setSession(nextSession)
    setStatus(nextSession.isAuthenticated ? 'authenticated' : 'unauthenticated')
  }, [])

  const refreshSession = useCallback(async () => {
    const nextSession = await readSession()
    applySession(nextSession)

    return nextSession
  }, [applySession])

  const signOut = useCallback(async () => {
    const response = await fetch('/api/auth/session', {
      method: 'DELETE',
      cache: 'no-store',
    })

    if (!response.ok) {
      applySession(unauthenticatedSession)
      return
    }

    const nextSession = await response.json() as AuthSession
    applySession(nextSession)
  }, [applySession])

  useEffect(() => {
    let isActive = true

    void readSession().then((nextSession) => {
      if (isActive) {
        applySession(nextSession)
      }
    })

    return () => {
      isActive = false
    }
  }, [applySession])

  const value = useMemo<AuthSessionContextValue>(() => ({
    status,
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    refreshSession,
    signOut,
  }), [refreshSession, session, signOut, status])

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)

  if (!context) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider.')
  }

  return context
}
