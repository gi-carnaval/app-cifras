import type {
  AuthenticatedUser,
  RegisteredUser,
} from '@/domain/repositories/auth.repository'
import type { PocketbaseUserDTO } from '../api/dto/pocketbase-user-dto'

export function toRegisteredUser(dto: PocketbaseUserDTO): RegisteredUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
  }
}

export function toAuthenticatedUser(dto: PocketbaseUserDTO): AuthenticatedUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    isVerified: dto.verified === true,
  }
}
