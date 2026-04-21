import { createCategoryUseCase } from "@/application/use-cases/categories/create-category"
import { getAllCategoriesUseCase } from "@/application/use-cases/categories/get-all-categories"
import { createPocketbaseCategoryRepository } from "@/infrastructure/pocketbase/pocketbase-category.repository"

export async function GET() {
  const repo = createPocketbaseCategoryRepository()
  const getAllCategories = getAllCategoriesUseCase(repo)

  const categories = await getAllCategories()

  if (!Array.isArray(categories)) {
    return new Response(
      JSON.stringify({ message: "Formato inválido de resposta" }),
      { status: 500 }
    )
  }

  return Response.json(categories)
}

export async function POST(request: Request) {
  const repo = createPocketbaseCategoryRepository()
  const createCategory = createCategoryUseCase(repo)
  const body = await request.json()

  if (!body?.name || typeof body.name !== "string") {
    return new Response("Nome da categoria é obrigatório.", { status: 400 })
  }

  const created = await createCategory(body.name)

  return Response.json(created, { status: 201 })
}
