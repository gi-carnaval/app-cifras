import type {
  AuthRepository,
  AuthSession,
} from '@/domain/repositories/auth.repository'

export function createLogoutUserUseCase(repo: AuthRepository) {
  return async function logoutUser(): Promise<AuthSession> {
    return repo.clearSession()
  }
}
