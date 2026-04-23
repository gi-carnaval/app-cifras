import Link from "next/link"

import type { CategoryNavigationItem } from "@/application/use-cases/categories/get-category-navigation"

type CategoryGridProps = {
  categories: CategoryNavigationItem[]
}

function getSongsCountLabel(songsCount: number) {
  return songsCount === 1 ? "1 música" : `${songsCount} músicas`
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categorias/${category.slug}`}
          className="group rounded-2xl border border-border bg-(--bg2) p-5 shadow-xs transition-transform transition-colors hover:border-(--accent2) hover:bg-(--bg3) hover:-translate-y-0.5"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                  Categoria
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-(--text)">
                  {category.name}
                </h2>
              </div>
              <span className="inline-flex min-h-7 shrink-0 items-center rounded-full border border-border bg-background px-2.5 text-xs font-medium text-(--accent)">
                {getSongsCountLabel(category.songsCount)}
              </span>
            </div>

            <p className="text-sm leading-6 text-(--text-muted)">
              Abrir sele&ccedil;&atilde;o de m&uacute;sicas desta categoria.
            </p>

            <div className="mt-auto inline-flex items-center text-sm font-medium text-(--accent)">
              Explorar categoria
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
