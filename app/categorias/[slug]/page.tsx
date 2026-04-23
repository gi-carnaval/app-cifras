import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCategoryBySlugUseCase } from '@/application/use-cases/categories/get-category-by-slug'
import { getMissaCategoryBrowseUseCase } from '@/application/use-cases/categories/get-missa-category-browse'
import { getAllSongsUseCase } from '@/application/use-cases/songs/get-all-songs'
import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'
import { MissaCategoryBrowser } from '@/features/categories/components/missa-category-browser'
import { SongsMobileList } from '@/features/songs/components/songs-mobile-list'
import { SongsTable } from '@/features/songs/components/songs-table'
import { toSongRows } from '@/features/songs/mappers/song-row.mapper'
import { isMissaCategory } from '@/domain/entities/liturgicalMoment'
import { createPocketbaseCategoryRepository } from '@/infrastructure/pocketbase/pocketbase-category.repository'
import { createPocketbaseLiturgicalMomentRepository } from '@/infrastructure/pocketbase/pocketbase-liturgical-moment.repository'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function CategorySongsPage({
  params,
}: PageProps<'/categorias/[slug]'>) {
  await requireAuthenticatedUser('/categorias')
  const { slug } = await params
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const categoryRepo = createPocketbaseCategoryRepository(repositoryOptions)
  const songRepo = createPocketbaseSongRepository(repositoryOptions)
  const liturgicalMomentRepo = createPocketbaseLiturgicalMomentRepository(repositoryOptions)
  const getCategoryBySlug = getCategoryBySlugUseCase(categoryRepo)
  const getAllSongs = getAllSongsUseCase(songRepo)
  const getMissaCategoryBrowse = getMissaCategoryBrowseUseCase(songRepo, liturgicalMomentRepo)
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  if (isMissaCategory(category)) {
    const missaGroups = await getMissaCategoryBrowse(category.id)
    const missaGroupsWithRows = missaGroups.map((group) => ({
      ...group,
      songs: toSongRows(group.songs),
    }))

    return (
      <main className="mx-auto my-0 max-w-215 px-6 pb-20 pt-0">
        <div className="flex flex-col gap-3 py-6">
          <Link href="/categorias" className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
            Voltar para categorias
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-(--text)">{category.name}</h1>
            <p className="max-w-3xl text-base text-(--text-muted)">
              Navegue pelas músicas da missa por momento litúrgico para encontrar opções com mais rapidez.
            </p>
          </div>
        </div>

        <MissaCategoryBrowser groups={missaGroupsWithRows} />
      </main>
    )
  }

  const songs = await getAllSongs({
    categoryIds: [category.id],
  })
  const songRows = toSongRows(songs)

  return (
    <main className="mx-auto my-0 max-w-215 px-6 pb-20 pt-0">
      <div className="flex flex-col gap-3 py-6">
        <Link href="/categorias" className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
          Voltar para categorias
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-(--text)">{category.name}</h1>
          <p className="text-base text-(--text-muted)">
            {songs.length} {songs.length === 1 ? 'música encontrada' : 'músicas encontradas'} nesta categoria.
          </p>
        </div>
      </div>

      {songRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-(--bg2) px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-(--text)">Nenhuma m&uacute;sica nesta categoria</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Esta categoria existe, mas ainda n&atilde;o possui m&uacute;sicas associadas.
          </p>
        </div>
      ) : (
        <>
          <div className="md:hidden">
            <SongsMobileList songs={songRows} />
          </div>
          <div className="hidden md:block">
            <SongsTable songs={songRows} />
          </div>
        </>
      )}
    </main>
  )
}
