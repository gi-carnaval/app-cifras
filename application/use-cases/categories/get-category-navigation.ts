import type { Category } from "@/domain/entities/category"
import type { CategoryRepository } from "@/domain/repositories/category.repository"
import type { SongRepository } from "@/domain/repositories/song.repository"

export type CategoryNavigationItem = {
  id: string
  name: string
  slug: string
  songsCount: number
}

function buildSongsCountByCategoryId(categoryIds: string[][]) {
  return categoryIds.reduce<Record<string, number>>((counts, ids) => {
    ids.forEach((categoryId) => {
      counts[categoryId] = (counts[categoryId] ?? 0) + 1
    })

    return counts
  }, {})
}

function toCategoryNavigationItem(
  category: Category,
  songsCountByCategoryId: Record<string, number>
): CategoryNavigationItem {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    songsCount: songsCountByCategoryId[category.id] ?? 0,
  }
}

export function getCategoryNavigationUseCase(
  categoryRepo: CategoryRepository,
  songRepo: SongRepository
) {
  return async (): Promise<CategoryNavigationItem[]> => {
    const [categories, songs] = await Promise.all([
      categoryRepo.getAll(),
      songRepo.getAll(),
    ])
    const songsCountByCategoryId = buildSongsCountByCategoryId(
      songs.map((song) => song.categories.map((category) => category.id))
    )

    return categories.map((category) => toCategoryNavigationItem(category, songsCountByCategoryId))
  }
}
