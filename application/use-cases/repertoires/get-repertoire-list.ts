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
    const sharedRepertoires = (
      await Promise.all(
        sharedMembers.map((member) => repertoireRepo.getById(member.repertoireId))
      )
    ).filter((repertoire): repertoire is Repertoire => Boolean(repertoire))
    const repertoires = Array.from(
      new Map(
        [...ownedRepertoires, ...sharedRepertoires].map((repertoire) => [
          repertoire.id,
          repertoire,
        ])
      ).values()
    )
    const itemsByRepertoire = await Promise.all(
      repertoires.map(async (repertoire) => ({
        repertoire,
        items: await itemRepo.getByRepertoireId(repertoire.id),
      }))
    )

    return itemsByRepertoire.map(({ repertoire, items }) => ({
      repertoire,
      itemsCount: items.length,
    }))
  }
}
