import type { LiturgicalMoment } from "@/domain/entities/liturgicalMoment"
import type { Song } from "@/domain/entities/song"
import type { LiturgicalMomentRepository } from "@/domain/repositories/liturgicalMoment.repository"
import type { SongRepository } from "@/domain/repositories/song.repository"

export type MissaCategoryGroup = {
  id: string
  name: string
  slug: string
  songsCount: number
  songs: Song[]
}

const UNCLASSIFIED_GROUP_ID = "__sem_momento_liturgico__"
const UNCLASSIFIED_GROUP_NAME = "Sem momento litúrgico"
const UNCLASSIFIED_GROUP_SLUG = "sem-momento-liturgico"

function uniqueSongsById(songs: Song[]) {
  return Array.from(new Map(songs.map((song) => [song.id, song])).values())
}

function orderMomentGroups(
  groupsByMomentId: Map<string, Song[]>,
  liturgicalMoments: LiturgicalMoment[]
): MissaCategoryGroup[] {
  return liturgicalMoments
    .map((liturgicalMoment) => {
      const songs = uniqueSongsById(groupsByMomentId.get(liturgicalMoment.id) ?? [])

      if (songs.length === 0) return null

      return {
        id: liturgicalMoment.id,
        name: liturgicalMoment.name,
        slug: liturgicalMoment.slug,
        songsCount: songs.length,
        songs,
      }
    })
    .filter((group): group is MissaCategoryGroup => Boolean(group))
}

function buildUnclassifiedGroup(songs: Song[]): MissaCategoryGroup | null {
  const unclassifiedSongs = songs.filter((song) => song.liturgicalMoments.length === 0)

  if (unclassifiedSongs.length === 0) return null

  return {
    id: UNCLASSIFIED_GROUP_ID,
    name: UNCLASSIFIED_GROUP_NAME,
    slug: UNCLASSIFIED_GROUP_SLUG,
    songsCount: unclassifiedSongs.length,
    songs: unclassifiedSongs,
  }
}

export function getMissaCategoryBrowseUseCase(
  songRepo: SongRepository,
  liturgicalMomentRepo: LiturgicalMomentRepository
) {
  return async (categoryId: string): Promise<MissaCategoryGroup[]> => {
    const normalizedCategoryId = categoryId.trim()

    if (!normalizedCategoryId) return []

    const [songs, liturgicalMoments] = await Promise.all([
      songRepo.getAll({
        categoryIds: [normalizedCategoryId],
      }),
      liturgicalMomentRepo.getAll(),
    ])

    const groupsByMomentId = songs.reduce<Map<string, Song[]>>((groups, song) => {
      song.liturgicalMoments.forEach((liturgicalMoment) => {
        const currentSongs = groups.get(liturgicalMoment.id) ?? []

        groups.set(liturgicalMoment.id, [...currentSongs, song])
      })

      return groups
    }, new Map<string, Song[]>())
    const orderedMomentGroups = orderMomentGroups(groupsByMomentId, liturgicalMoments)
    const unclassifiedGroup = buildUnclassifiedGroup(songs)

    return unclassifiedGroup
      ? [...orderedMomentGroups, unclassifiedGroup]
      : orderedMomentGroups
  }
}
