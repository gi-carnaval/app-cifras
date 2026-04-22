export interface RegisterUserInput {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export interface LoginUserInput {
  email: string
  password: string
}

export interface RegisteredUser {
  id: string
  name: string
  email: string
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  isVerified: boolean
}

export interface AuthSession {
  isAuthenticated: boolean
  user: AuthenticatedUser | null
}

export interface AuthRepository {
  register(input: RegisterUserInput): Promise<RegisteredUser>
  requestEmailVerification(email: string): Promise<boolean>
  login(input: LoginUserInput): Promise<AuthenticatedUser>
  getCurrentSession(serializedSession?: string): Promise<AuthSession>
  clearSession(): Promise<AuthSession>
}
