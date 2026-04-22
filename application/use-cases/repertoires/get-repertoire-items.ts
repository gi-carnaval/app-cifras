import { sortRepertoireItemsByPosition } from "@/domain/entities/repertoire"
import type { RepertoireItemRepository } from "@/domain/repositories/repertoire.repository"

export function getRepertoireItemsUseCase(repo: RepertoireItemRepository) {
  return async (repertoireId: string) => {
    if (!repertoireId.trim()) return []

    const items = await repo.getByRepertoireId(repertoireId)

    return sortRepertoireItemsByPosition(items)
  }
}
