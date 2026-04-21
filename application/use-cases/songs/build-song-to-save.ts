import type { Artist } from '@/domain/entities/artist'
import type { Category } from '@/domain/entities/category'
import { getLiturgicalMomentIds, hasMissaCategory, validateLiturgicalMoments, type LiturgicalMoment } from '@/domain/entities/liturgicalMoment'
import { getArtistById, getCategoriesByIds, type Song } from '@/domain/entities/song'
import { normalizeLiturgicalMomentsWithOptions } from './normalize-liturgical-moments'

interface BuildSongToSaveInput {
  song: Song
  artists: Artist[]
  categories: Category[]
  liturgicalMoments: LiturgicalMoment[]
  selectedArtistId: string | null
  selectedCategoryIds: string[]
}

export function buildSongToSave({
  song,
  artists,
  categories,
  liturgicalMoments,
  selectedArtistId,
  selectedCategoryIds,
}: BuildSongToSaveInput) {
  const selectedArtist = getArtistById(artists, selectedArtistId)
  const categoryPool = [...categories, ...song.categories]
  const selectedCategories = getCategoriesByIds(categoryPool, selectedCategoryIds)

  const normalizedLiturgicalMoments = normalizeLiturgicalMomentsWithOptions(
    song.liturgicalMoments,
    liturgicalMoments
  )

  const selectedLiturgicalMomentIds = getLiturgicalMomentIds(normalizedLiturgicalMoments)
  const shouldSaveLiturgicalMoments = hasMissaCategory(selectedCategories)

  const fieldError = validateLiturgicalMoments(
    shouldSaveLiturgicalMoments,
    shouldSaveLiturgicalMoments ? selectedLiturgicalMomentIds : []
  )

  if (fieldError) {
    return {
      songToSave: null,
      fieldError,
    }
  }

  const songWithRelations: Song = {
    ...song,
    categories: selectedCategories,
    liturgicalMoments: shouldSaveLiturgicalMoments ? normalizedLiturgicalMoments : [],
  }

  return {
    songToSave: selectedArtist
      ? { ...songWithRelations, artist: selectedArtist }
      : songWithRelations,
    fieldError: null,
  }
}