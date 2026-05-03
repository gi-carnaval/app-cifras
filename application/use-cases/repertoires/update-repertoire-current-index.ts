import type {
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type UpdateRepertoireCurrentIndexInput = {
  repertoireId: string
  userId: string
  currentIndex: number
}

export function updateRepertoireCurrentIndexUseCase(
  repo: RepertoireRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: UpdateRepertoireCurrentIndexInput) => {
    const repertoireId = input.repertoireId.trim()
    const userId = input.userId.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!userId) {
      throw new Error("Usuário é obrigatório.")
    }

    if (!Number.isFinite(input.currentIndex)) {
      throw new Error("Índice atual inválido.")
    }

    const currentIndex = Math.max(0, Math.floor(input.currentIndex))

    const repertoire = await repo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, userId, memberRepo)

    return repo.save({
      ...repertoire,
      currentIndex,
    })
  }
}
