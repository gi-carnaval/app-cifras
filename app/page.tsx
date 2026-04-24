import { getAllSongsUseCase } from '@/application/use-cases/songs/get-all-songs'
import { getAllArtistsUseCase } from '@/application/use-cases/artists/get-all-artists'
import { getAllCategoriesUseCase } from '@/application/use-cases/categories/get-all-categories'
import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'
import { SongsEmptyState } from '@/features/songs/components/songs-empty-state'
import { SongsFilters } from '@/features/songs/components/songs-filters'
import { SongsResultsSummary } from '@/features/songs/components/songs-results-summary'
import { SongsMobileList } from '@/features/songs/components/songs-mobile-list'
import { SongsTable } from '@/features/songs/components/songs-table'
import { toSongRows } from '@/features/songs/mappers/song-row.mapper'
import { createPocketbaseArtistRepository } from '@/infrastructure/pocketbase/pocketbase-artist.repository'
import { createPocketbaseCategoryRepository } from '@/infrastructure/pocketbase/pocketbase-category.repository'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type HomePageSearchParams = Promise<{
  q?: string | string[]
  artist?: string | string[]
  category?: string | string[]
}>

function getSingleSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function getMultiSearchParamValues(value: string | string[] | undefined) {
  if (!value) return []

  return Array.isArray(value) ? value : [value]
}

function getClearFiltersHref() {
  return '/'
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: HomePageSearchParams
}) {
  // await requireAuthenticatedUser('/')
  const resolvedSearchParams = await searchParams
  const search = getSingleSearchParamValue(resolvedSearchParams.q).trim()
  const artistId = getSingleSearchParamValue(resolvedSearchParams.artist).trim()
  const categoryIds = Array.from(
    new Set(getMultiSearchParamValues(resolvedSearchParams.category).map((categoryId) => categoryId.trim()).filter(Boolean))
  )
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repo = createPocketbaseSongRepository(repositoryOptions)
  const artistRepo = createPocketbaseArtistRepository(repositoryOptions)
  const categoryRepo = createPocketbaseCategoryRepository(repositoryOptions)
  const getAllSongs = getAllSongsUseCase(repo)
  const getAllArtists = getAllArtistsUseCase(artistRepo)
  const getAllCategories = getAllCategoriesUseCase(categoryRepo)
  const [songs, artists, categories] = await Promise.all([
    getAllSongs({
      search,
      artistId,
      categoryIds,
    }),
    getAllArtists(),
    getAllCategories(),
  ])
  const songRows = toSongRows(songs)
  const selectedArtistName = artists.find((artist) => artist.id === artistId)?.name ?? ''
  const selectedCategoryNames = categoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId)?.name ?? '')
    .filter(Boolean)

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <div className="flex flex-col gap-3 py-6">
        <p className="text-base text-(--text-muted)">Sua coleção de músicas com acordes</p>
        <SongsFilters
          artists={artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
          }))}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
          initialSearch={search}
          initialArtistId={artistId}
          initialCategoryIds={categoryIds}
        />
      </div>

      <div className="mb-4">
        <SongsResultsSummary
          songsCount={songRows.length}
          search={search}
          artistName={selectedArtistName}
          categoryNames={selectedCategoryNames}
        />
      </div>

      {songRows.length === 0 ? (
        <SongsEmptyState
          clearFiltersHref={getClearFiltersHref()}
          search={search}
          artistName={selectedArtistName}
          categoryNames={selectedCategoryNames}
        />
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
