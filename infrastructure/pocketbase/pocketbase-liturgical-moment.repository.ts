import { createAuthenticatedPocketbaseClient, type PocketbaseRepositoryOptions } from "./client"
import { LiturgicalMoment } from "@/domain/entities/liturgicalMoment"
import { LiturgicalMomentRepository } from "@/domain/repositories/liturgicalMoment.repository"
import { toLiturgicalMomentEntity, toPocketbaseLiturgicalMomentDTO } from "./liturgicalMoment.mapper"
import { PocketbaseLiturgicalMomentDTO } from "../api/dto/pocketbase-liturgical-moment-dto"

export function createPocketbaseLiturgicalMomentRepository(
  options?: PocketbaseRepositoryOptions
): LiturgicalMomentRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "liturgical_moments"

  async function getAll(): Promise<LiturgicalMoment[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseLiturgicalMomentDTO>({
      sort: "order",
    })

    return result.map(toLiturgicalMomentEntity)
  }

  async function save(liturgicalMoment: Pick<LiturgicalMoment, "id" | "name" | "slug" | "order">): Promise<LiturgicalMoment> {
    if (liturgicalMoment.id) {
      const updated = await pb
        .collection(collection)
        .update<PocketbaseLiturgicalMomentDTO>(liturgicalMoment.id, toPocketbaseLiturgicalMomentDTO(liturgicalMoment))

      return toLiturgicalMomentEntity(updated)
    }

    const created = await pb
      .collection(collection)
      .create<PocketbaseLiturgicalMomentDTO>(toPocketbaseLiturgicalMomentDTO(liturgicalMoment))

    return toLiturgicalMomentEntity(created)
  }

  return {
    getAll,
    save,
  }
}
