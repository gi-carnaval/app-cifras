import type { Category } from "@/domain/entities/category"
import type { CategoryRepository } from "@/domain/repositories/category.repository"
import type { PocketbaseCategoryDTO } from "../api/dto/pocketbase-category-dto"
import { pb } from "./client"
import { toCategoryEntity, toPocketbaseCategoryDTO } from "./categories.mapper"

export function createPocketbaseCategoryRepository(): CategoryRepository {
  const collection = "categories"

  async function getAll(): Promise<Category[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseCategoryDTO>({
      sort: "name",
    })

    return result.map(toCategoryEntity)
  }

  async function save(category: Pick<Category, "id" | "name" | "slug">): Promise<Category> {
    if (category.id) {
      const updated = await pb
        .collection(collection)
        .update<PocketbaseCategoryDTO>(category.id, toPocketbaseCategoryDTO(category))

      return toCategoryEntity(updated)
    }

    const created = await pb
      .collection(collection)
      .create<PocketbaseCategoryDTO>(toPocketbaseCategoryDTO(category))

    return toCategoryEntity(created)
  }

  return {
    getAll,
    save,
  }
}
