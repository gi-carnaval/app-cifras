import type { RepertoireItem } from "@/domain/entities/repertoire"
import type { RepertoireItemRepository } from "@/domain/repositories/repertoire.repository"

export function updateRepertoireItemUseCase(repo: RepertoireItemRepository) {
  return async (item: RepertoireItem) => {
    const currentItems = await repo.getByRepertoireId(item.repertoireId)
    const hasDuplicatedSong = currentItems.some(
      (currentItem) => currentItem.id !== item.id && currentItem.songId === item.songId
    )

    if (hasDuplicatedSong) {
      throw new Error("Esta música já está no repertório.")
    }

    return repo.update({
      ...item,
      notes: item.notes.trim(),
    })
  }
}
