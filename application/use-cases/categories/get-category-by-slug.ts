import type { Category } from "@/domain/entities/category"
import type { CategoryRepository } from "@/domain/repositories/category.repository"

export function getCategoryBySlugUseCase(repo: CategoryRepository) {
  return async (slug: string): Promise<Category | null> => {
    const normalizedSlug = slug.trim()

    if (!normalizedSlug) return null

    const categories = await repo.getAll()

    return categories.find((category) => category.slug === normalizedSlug) ?? null
  }
}
