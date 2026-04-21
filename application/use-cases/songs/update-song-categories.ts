import type { Category } from '@/domain/entities/category'
import { getLiturgicalMomentIds, hasMissaCategory, validateLiturgicalMoments } from '@/domain/entities/liturgicalMoment'
import { getCategoriesByIds, type Song } from '@/domain/entities/song'

interface UpdateSongCategoriesInput {
  song: Song
  categoryIds: string[]
  availableCategories: Category[]
}

export function updateSongCategories({
  song,
  categoryIds,
  availableCategories,
}: UpdateSongCategoriesInput) {
  const uniqueCategoryIds = Array.from(new Set(categoryIds))
  const selectedCategories = getCategoriesByIds(availableCategories, uniqueCategoryIds)

  const nextSong: Song = {
    ...song,
    categories: selectedCategories,
  }


  return {
    nextSong,
    selectedCategoryIds: uniqueCategoryIds,
  }
}