import type {
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type UpdateRepertoireMetadataInput = {
  repertoireId: string
  ownerId: string
  name: string
  date: string
  description?: string
}

export function updateRepertoireMetadataUseCase(
  repo: RepertoireRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: UpdateRepertoireMetadataInput) => {
    const repertoireId = input.repertoireId.trim()
    const ownerId = input.ownerId.trim()
    const name = input.name.trim()
    const date = input.date.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!ownerId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    if (!name) {
      throw new Error("Nome do repertório é obrigatório.")
    }

    if (!date) {
      throw new Error("Data do repertório é obrigatória.")
    }

    const repertoire = await repo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, ownerId, memberRepo)

    return repo.save({
      ...repertoire,
      name,
      date,
      description: input.description?.trim() ?? "",
    })
  }
}
