import { createGetCurrentSessionUseCase } from '@/application/use-cases/auth/get-current-session'
import { createPocketbaseAuthRepository } from '@/infrastructure/pocketbase/pocketbase-auth.repository'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuthenticatedUser(redirectTo: string) {
  const cookieStore = await cookies()
  const repo = createPocketbaseAuthRepository()
  const getCurrentSession = createGetCurrentSessionUseCase(repo)
  const session = await getCurrentSession(cookieStore.toString())

  if (!session.isAuthenticated) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  return session.user
}
