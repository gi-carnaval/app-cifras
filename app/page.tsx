import { getAllSongsUseCase } from '@/application/use-cases/songs/get-all-songs'
import { SongsTable } from '@/features/songs/components/songs-table'
import { toSongRows } from '@/features/songs/mappers/song-row.mapper'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const repo = createPocketbaseSongRepository()
  const getAllSongs = getAllSongsUseCase(repo)
  const songs = await getAllSongs()
  const songRows = toSongRows(songs)

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <div className="flex items-center justify-between gap-4 py-6">
        <p className="text-base text-(--text-muted)">Sua coleção de músicas com acordes</p>
      </div>

      <SongsTable songs={songRows} />
    </main>
  )
}
