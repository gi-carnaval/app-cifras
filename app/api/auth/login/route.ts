import { createLoginUserUseCase } from '@/application/use-cases/auth/login-user'
import type { LoginUserInput } from '@/domain/repositories/auth.repository'
import { createPocketbaseAuthRepository } from '@/infrastructure/pocketbase/pocketbase-auth.repository'

function isLoginUserInput(value: unknown): value is LoginUserInput {
  if (!value || typeof value !== 'object') return false

  const input = value as Record<string, unknown>

  return (
    typeof input.email === 'string' &&
    typeof input.password === 'string'
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!isLoginUserInput(body)) {
      return new Response('Payload de login inválido.', { status: 400 })
    }

    const repo = createPocketbaseAuthRepository()
    const loginUser = createLoginUserUseCase(repo)
    const result = await loginUser(body)
    const response = Response.json(result)

    response.headers.append('Set-Cookie', repo.exportSessionCookie())

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao entrar.'

    return new Response(message, { status: 400 })
  }
}
