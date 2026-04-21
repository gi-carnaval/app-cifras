import { createRegisterUserUseCase } from '@/application/use-cases/auth/register-user'
import type { RegisterUserInput } from '@/domain/repositories/auth.repository'
import { createPocketbaseAuthRepository } from '@/infrastructure/pocketbase/pocketbase-auth.repository'

function isRegisterUserInput(value: unknown): value is RegisterUserInput {
  if (!value || typeof value !== 'object') return false

  const input = value as Record<string, unknown>

  return (
    typeof input.name === 'string' &&
    typeof input.email === 'string' &&
    typeof input.password === 'string' &&
    typeof input.passwordConfirm === 'string'
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!isRegisterUserInput(body)) {
      return new Response('Payload de cadastro inválido.', { status: 400 })
    }

    const repo = createPocketbaseAuthRepository()
    const registerUser = createRegisterUserUseCase(repo)
    const result = await registerUser(body)

    return Response.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao cadastrar usuário.'

    return new Response(message, { status: 400 })
  }
}
