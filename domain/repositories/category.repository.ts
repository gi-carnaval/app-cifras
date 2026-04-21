import type { Category } from "../entities/category"

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  save(category: Pick<Category, "id" | "name" | "slug">): Promise<Category>
}
