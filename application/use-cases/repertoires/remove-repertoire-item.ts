import { sortRepertoireItemsByPosition } from "@/domain/entities/repertoire"
import type {
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type RemoveRepertoireItemInput = {
  repertoireId: string
  ownerId: string
  itemId: string
}

export function removeRepertoireItemUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: RemoveRepertoireItemInput) => {
    const repertoireId = input.repertoireId.trim()
    const ownerId = input.ownerId.trim()
    const itemId = input.itemId.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!ownerId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    if (!itemId) {
      throw new Error("Item do repertório é obrigatório.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, ownerId, memberRepo)

    const item = await itemRepo.getById(itemId)

    if (!item || item.repertoireId !== repertoireId) {
      throw new Error("Item do repertório não encontrado.")
    }

    await itemRepo.remove(itemId)

    const remainingItems = sortRepertoireItemsByPosition(
      await itemRepo.getByRepertoireId(repertoireId)
    )

    return itemRepo.replacePositions(
      remainingItems.map((remainingItem, position) => ({
        id: remainingItem.id,
        position,
      }))
    )
  }
}
