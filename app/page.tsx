import { getAllSongsUseCase } from '@/application/use-cases/songs/get-all-songs'
import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'
import { SongsMobileList } from '@/features/songs/components/songs-mobile-list'
import { SongsTable } from '@/features/songs/components/songs-table'
import { toSongRows } from '@/features/songs/mappers/song-row.mapper'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await requireAuthenticatedUser('/')
  const cookieStore = await cookies()
  const repo = createPocketbaseSongRepository({
    serializedSession: cookieStore.toString(),
  })
  const getAllSongs = getAllSongsUseCase(repo)
  const songs = await getAllSongs()
  const songRows = toSongRows(songs)

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <div className="flex items-center justify-between gap-4 py-6">
        <p className="text-base text-(--text-muted)">Sua coleção de músicas com acordes</p>
      </div>

      <div className="md:hidden">
        <SongsMobileList songs={songRows} />
      </div>
      <div className="hidden md:block">
        <SongsTable songs={songRows} />
      </div>
    </main>
  )
}
