import type {
  AuthSession,
  AuthRepository,
  LoginUserInput,
  RegisterUserInput,
} from '@/domain/repositories/auth.repository'
import type { PocketbaseUserDTO } from '../api/dto/pocketbase-user-dto'
import { createPocketbaseClient } from './client'
import { toAuthenticatedUser, toRegisteredUser } from './auth.mapper'

interface PocketbaseRegisterUserPayload {
  name: string
  email: string
  emailVisibility: boolean
  password: string
  passwordConfirm: string
}

interface PocketbaseAuthRepository extends AuthRepository {
  exportSessionCookie(): string
}

function toPocketbaseRegisterPayload(input: RegisterUserInput): PocketbaseRegisterUserPayload {
  return {
    name: input.name,
    email: input.email,
    emailVisibility: true,
    password: input.password,
    passwordConfirm: input.passwordConfirm,
  }
}

export function createPocketbaseAuthRepository(): PocketbaseAuthRepository {
  const pb = createPocketbaseClient()
  const collection = 'users'

  function getUnauthenticatedSession(): AuthSession {
    return {
      isAuthenticated: false,
      user: null,
    }
  }

  async function register(input: RegisterUserInput) {
    const createdUser = await pb
      .collection(collection)
      .create<PocketbaseUserDTO>(toPocketbaseRegisterPayload(input))

    return toRegisteredUser(createdUser)
  }

  async function requestEmailVerification(email: string) {
    try {
      await pb.collection(collection).requestVerification(email)
      return true
    } catch {
      return false
    }
  }

  async function login(input: LoginUserInput) {
    const authResult = await pb
      .collection(collection)
      .authWithPassword<PocketbaseUserDTO>(input.email, input.password)

    return toAuthenticatedUser(authResult.record)
  }

  async function getCurrentSession(serializedSession?: string): Promise<AuthSession> {
    pb.authStore.loadFromCookie(serializedSession || '')

    if (!pb.authStore.isValid) {
      pb.authStore.clear()
      return getUnauthenticatedSession()
    }

    try {
      const authResult = await pb
        .collection(collection)
        .authRefresh<PocketbaseUserDTO>()

      return {
        isAuthenticated: true,
        user: toAuthenticatedUser(authResult.record),
      }
    } catch {
      pb.authStore.clear()
      return getUnauthenticatedSession()
    }
  }

  async function clearSession(): Promise<AuthSession> {
    pb.authStore.clear()
    return getUnauthenticatedSession()
  }

  function exportSessionCookie() {
    return pb.authStore.exportToCookie({
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  return {
    register,
    requestEmailVerification,
    login,
    getCurrentSession,
    clearSession,
    exportSessionCookie,
  }
}
