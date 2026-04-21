import type {
  AuthRepository,
  RegisterUserInput,
  RegisteredUser,
} from '@/domain/repositories/auth.repository'

export interface RegisterUserResult {
  user: RegisteredUser
  emailVerificationRequested: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function validateRegisterUserInput(input: RegisterUserInput) {
  const name = input.name.trim()
  const email = normalizeEmail(input.email)
  const password = input.password
  const passwordConfirm = input.passwordConfirm

  if (!name) {
    throw new Error('Nome é obrigatório.')
  }

  if (!email) {
    throw new Error('E-mail é obrigatório.')
  }

  if (!password) {
    throw new Error('Senha é obrigatória.')
  }

  if (!passwordConfirm) {
    throw new Error('Confirmação de senha é obrigatória.')
  }

  if (password !== passwordConfirm) {
    throw new Error('As senhas não conferem.')
  }

  return {
    name,
    email,
    password,
    passwordConfirm,
  }
}

export function createRegisterUserUseCase(repo: AuthRepository) {
  return async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
    const validInput = validateRegisterUserInput(input)
    const user = await repo.register(validInput)
    const emailVerificationRequested = await repo.requestEmailVerification(validInput.email)

    return {
      user,
      emailVerificationRequested,
    }
  }
}
