import type {
  AuthRepository,
  AuthSession,
} from '@/domain/repositories/auth.repository'

export function createGetCurrentSessionUseCase(repo: AuthRepository) {
  return async function getCurrentSession(serializedSession?: string): Promise<AuthSession> {
    return repo.getCurrentSession(serializedSession)
  }
}
