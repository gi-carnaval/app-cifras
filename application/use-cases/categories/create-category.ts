import type { CategoryRepository } from "@/domain/repositories/category.repository"

function normalizeCategoryName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function slugifyCategoryName(name: string) {
  return normalizeCategoryName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createCategoryUseCase(repo: CategoryRepository) {
  return async (name: string) => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error("Nome da categoria é obrigatório.")
    }

    const categories = await repo.getAll()
    const existingCategory = categories.find(
      (category) => normalizeCategoryName(category.name) === normalizeCategoryName(trimmedName)
    )

    if (existingCategory) {
      return existingCategory
    }

    return repo.save({
      id: "",
      name: trimmedName,
      slug: slugifyCategoryName(trimmedName),
    })
  }
}
