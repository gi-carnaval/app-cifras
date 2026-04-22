import type {
  AuthRepository,
  AuthenticatedUser,
  LoginUserInput,
} from '@/domain/repositories/auth.repository'

export interface LoginUserResult {
  status: 'success'
  user: AuthenticatedUser
}

export interface UnverifiedLoginUserResult {
  status: 'unverified'
  message: string
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function validateLoginUserInput(input: LoginUserInput) {
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email) {
    throw new Error('E-mail é obrigatório.')
  }

  if (!password) {
    throw new Error('Senha é obrigatória.')
  }

  return {
    email,
    password,
  }
}

export function createLoginUserUseCase(repo: AuthRepository) {
  return async function loginUser(
    input: LoginUserInput
  ): Promise<LoginUserResult | UnverifiedLoginUserResult> {
    const validInput = validateLoginUserInput(input)
    const user = await repo.login(validInput)

    if (!user.isVerified) {
      await repo.clearSession()

      return {
        status: 'unverified',
        message: 'Sua conta ainda não foi verificada.',
      }
    }

    return {
      status: 'success',
      user,
    }
  }
}
