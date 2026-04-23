import type { Repertoire } from "@/domain/entities/repertoire"
import type {
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"

export type RepertoireListItem = {
  repertoire: Repertoire
  itemsCount: number
}

export function getRepertoireListUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo?: RepertoireMemberRepository
) {
  return async (ownerId: string): Promise<RepertoireListItem[]> => {
    if (!ownerId.trim()) return []

    const ownedRepertoires = await repertoireRepo.getAllByOwner(ownerId)
    const sharedMembers = memberRepo ? await memberRepo.getByUserId(ownerId) : []
    const sharedRepertoireIds = Array.from(
      new Set(sharedMembers.map((member) => member.repertoireId))
    )
    const sharedRepertoires = await repertoireRepo.getByIds(sharedRepertoireIds)
    const repertoires = Array.from(
      new Map(
        [...ownedRepertoires, ...sharedRepertoires].map((repertoire) => [
          repertoire.id,
          repertoire,
        ])
      ).values()
    )

    const items = await itemRepo.getByRepertoireIds(repertoires.map((repertoire) => repertoire.id))
    const itemCountByRepertoireId = items.reduce<Record<string, number>>((counts, item) => {
      counts[item.repertoireId] = (counts[item.repertoireId] ?? 0) + 1

      return counts
    }, {})

    return repertoires.map((repertoire) => ({
      repertoire,
      itemsCount: itemCountByRepertoireId[repertoire.id] ?? 0,
    }))
  }
}
