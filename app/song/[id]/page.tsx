import Link from 'next/link'
import { getSongByIdUseCase } from '@/application/use-cases/songs/get-song-by-id'
import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'
import SongPageClient from '@/components/song/SongPageClient'
import { createPocketbaseSongRepository } from '@/infrastructure/pocketbase/pocketbase.repository'
import { cookies } from 'next/headers'

interface SongPageProps {
  params: Promise<{ id: string }>
}

export default async function SongPage({ params }: SongPageProps) {
  const { id } = await params
  await requireAuthenticatedUser(`/song/${id}`)
  const cookieStore = await cookies()
  const repo = createPocketbaseSongRepository({
    serializedSession: cookieStore.toString(),
  })
  const getSongById = getSongByIdUseCase(repo)
  const song = await getSongById(id)

  if (!song) {
    return (
      <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">🎵</div>
          <p>Música não encontrada.</p>
          <br />
          <Link href="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </main>
    )
  }

  return <SongPageClient initialSong={song} />
}
