import { getLiturgicalMomentsByIds, type Song } from '@/domain/entities/song'
import { hasMissaCategory, validateLiturgicalMoments, type LiturgicalMoment } from '@/domain/entities/liturgicalMoment'

interface UpdateSongLiturgicalMomentsInput {
  song: Song
  liturgicalMomentIds: string[]
  availableLiturgicalMoments: LiturgicalMoment[]
}

export function updateSongLiturgicalMoments({
  song,
  liturgicalMomentIds,
  availableLiturgicalMoments,
}: UpdateSongLiturgicalMomentsInput) {
  const shouldKeepLiturgicalMoments = hasMissaCategory(song.categories)

  if (!shouldKeepLiturgicalMoments) {
    return {
      nextSong: {
        ...song,
        liturgicalMoments: [],
      },
      fieldError: null,
    }
  }

  const uniqueIds = Array.from(new Set(liturgicalMomentIds))
  const selectedLiturgicalMoments = getLiturgicalMomentsByIds(
    availableLiturgicalMoments,
    uniqueIds
  )

  return {
    nextSong: {
      ...song,
      liturgicalMoments: selectedLiturgicalMoments,
    },
    fieldError: validateLiturgicalMoments(true, uniqueIds),
  }
}