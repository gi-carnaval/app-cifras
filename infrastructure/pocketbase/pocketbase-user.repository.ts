import type { User } from "@/domain/entities/user"
import type { UserRepository } from "@/domain/repositories/user.repository"
import type { PocketbaseUserDTO } from "../api/dto/pocketbase-user-dto"
import { createPocketbaseClient } from "./client"
import { toUserEntity } from "./users.mapper"

function filterValue(value: string) {
  return value.replaceAll('"', '\\"')
}

type PocketbaseUserRepositoryOptions = {
  serializedSession?: string
}

function createAuthenticatedPocketbaseClient(options?: PocketbaseUserRepositoryOptions) {
  const pb = createPocketbaseClient()

  if (options?.serializedSession) {
    pb.authStore.loadFromCookie(options.serializedSession)
  }

  return pb
}

export function createPocketbaseUserRepository(
  options?: PocketbaseUserRepositoryOptions
): UserRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "users"

  async function getByEmail(email: string): Promise<User | null> {
    try {
      const record = await pb.collection(collection).getFirstListItem<PocketbaseUserDTO>(
        `email = "${filterValue(email)}"`
      )

      return toUserEntity(record)
    } catch {
      return null
    }
  }

  return {
    getByEmail,
  }
}
