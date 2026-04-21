import type { CategoryRepository } from "@/domain/repositories/category.repository"

export function getAllCategoriesUseCase(repo: CategoryRepository) {
  return async () => {
    return repo.getAll()
  }
}
