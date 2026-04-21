import { Category } from "@/domain/entities/category"
import { PocketbaseCategoryDTO } from "../api/dto/pocketbase-category-dto"

export function toCategoryEntity(dto: PocketbaseCategoryDTO): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
  }
}

export function toPocketbaseCategoryDTO(category: Category): PocketbaseCategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  }
}
