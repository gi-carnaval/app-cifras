import { sortRepertoireItemsByPosition } from "@/domain/entities/repertoire"
import type {
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type ReorderRepertoireItemsInput = {
  repertoireId: string
  ownerId: string
  itemId: string
  direction: "up" | "down"
}

function moveItemIds(itemIds: string[], itemId: string, direction: "up" | "down") {
  const currentIndex = itemIds.indexOf(itemId)

  if (currentIndex === -1) {
    throw new Error("Item do repertório não encontrado.")
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= itemIds.length) {
    return itemIds
  }

  const nextItemIds = [...itemIds]
  const currentItemId = nextItemIds[currentIndex]

  nextItemIds[currentIndex] = nextItemIds[targetIndex]
  nextItemIds[targetIndex] = currentItemId

  return nextItemIds
}

export function reorderRepertoireItemsUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: ReorderRepertoireItemsInput) => {
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

    if (input.direction !== "up" && input.direction !== "down") {
      throw new Error("Direção de ordenação inválida.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, ownerId, memberRepo)

    const currentItems = sortRepertoireItemsByPosition(
      await itemRepo.getByRepertoireId(repertoireId)
    )
    const nextItemIds = moveItemIds(
      currentItems.map((item) => item.id),
      itemId,
      input.direction
    )

    return itemRepo.replacePositions(
      nextItemIds.map((id, position) => ({
        id,
        position,
      }))
    )
  }
}
