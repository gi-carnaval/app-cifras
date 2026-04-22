import type {
  AuthRepository,
  AuthSession,
} from '@/domain/repositories/auth.repository'

export function createGetCurrentSessionUseCase(repo: AuthRepository) {
  return async function getCurrentSession(serializedSession?: string): Promise<AuthSession> {
    const session = await repo.getCurrentSession(serializedSession)

    if (session.user && !session.user.isVerified) {
      return repo.clearSession()
    }

    return session
  }
}
