import type { Repertoire } from "@/domain/entities/repertoire"
import type {
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"

export type RepertoireOptionForSong = {
  repertoire: Repertoire
  itemsCount: number
  hasSong: boolean
}

export function getRepertoireOptionsForSongUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: { userId: string; songId: string }): Promise<RepertoireOptionForSong[]> => {
    const userId = input.userId.trim()
    const songId = input.songId.trim()

    if (!userId || !songId) return []

    const ownedRepertoires = await repertoireRepo.getAllByOwner(userId)
    const sharedMembers = await memberRepo.getByUserId(userId)
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
    const itemSummaryByRepertoireId = items.reduce<
      Record<string, { itemsCount: number; hasSong: boolean }>
    >((summary, item) => {
      const current = summary[item.repertoireId] ?? {
        itemsCount: 0,
        hasSong: false,
      }

      summary[item.repertoireId] = {
        itemsCount: current.itemsCount + 1,
        hasSong: current.hasSong || item.songId === songId,
      }

      return summary
    }, {})

    return repertoires.map((repertoire) => ({
      repertoire,
      itemsCount: itemSummaryByRepertoireId[repertoire.id]?.itemsCount ?? 0,
      hasSong: itemSummaryByRepertoireId[repertoire.id]?.hasSong ?? false,
    }))
  }
}
