import type { User } from "@/domain/entities/user"
import type { PocketbaseUserDTO } from "../api/dto/pocketbase-user-dto"

export function toUserEntity(dto: PocketbaseUserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
  }
}
