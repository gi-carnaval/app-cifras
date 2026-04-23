import { getCategoryNavigationUseCase } from '@/application/use-cases/categories/get-category-navigation'
import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'
import { CategoryGrid } from '@/features/categories/components/category-grid'
import { createPocketbaseCategoryRepository } from '@/infrastructure/pocketbase/pocketbase-category.repository'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  await requireAuthenticatedUser('/categorias')
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const categoryRepo = createPocketbaseCategoryRepository(repositoryOptions)
  const songRepo = createPocketbaseSongRepository(repositoryOptions)
  const getCategoryNavigation = getCategoryNavigationUseCase(categoryRepo, songRepo)
  const categories = await getCategoryNavigation()

  return (
    <main className="mx-auto my-0 max-w-215 px-6 pb-20 pt-0">
      <div className="flex flex-col gap-3 py-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--text)">Categorias</h1>
        <p className="max-w-3xl text-base text-(--text-muted)">
          Escolha uma categoria para navegar pela cole&ccedil;&atilde;o de forma mais r&aacute;pida.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-(--bg2) px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-(--text)">Nenhuma categoria cadastrada</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Crie categorias para organizar melhor a navega&ccedil;&atilde;o das m&uacute;sicas.
          </p>
        </div>
      ) : (
        <CategoryGrid categories={categories} />
      )}
    </main>
  )
}
