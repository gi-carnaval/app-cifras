import { createGetCurrentSessionUseCase } from '@/application/use-cases/auth/get-current-session'
import { createLogoutUserUseCase } from '@/application/use-cases/auth/logout-user'
import { createPocketbaseAuthRepository } from '@/infrastructure/pocketbase/pocketbase-auth.repository'

export async function GET(request: Request) {
  const repo = createPocketbaseAuthRepository()
  const getCurrentSession = createGetCurrentSessionUseCase(repo)
  const session = await getCurrentSession(request.headers.get('cookie') || '')
  const response = Response.json(session)

  response.headers.append('Set-Cookie', repo.exportSessionCookie())

  return response
}

export async function DELETE() {
  const repo = createPocketbaseAuthRepository()
  const logoutUser = createLogoutUserUseCase(repo)
  const session = await logoutUser()
  const response = Response.json(session)

  response.headers.append('Set-Cookie', repo.exportSessionCookie())

  return response
}
