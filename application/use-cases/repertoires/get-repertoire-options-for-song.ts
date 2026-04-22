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

    const options = await Promise.all(
      repertoires.map(async (repertoire) => {
        const items = await itemRepo.getByRepertoireId(repertoire.id)

        return {
          repertoire,
          itemsCount: items.length,
          hasSong: items.some((item) => item.songId === songId),
        }
      })
    )

    return options
  }
}
