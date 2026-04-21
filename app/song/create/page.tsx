'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Song } from '@/domain/entities/song'
import SongEditor from '@/components/song/SongEditor'
import { createEmptySong } from '@/core/song-store'

interface SongCreateSaveOptions {
  cifraPdfFile?: File | null
}

export default function CreateSongPage() {
  const router = useRouter()

  createEmptySong()

  const [song, setSong] = useState<Song>(createEmptySong())

  const handleCreate = async (newSong: Song, options?: SongCreateSaveOptions) => {
    const formData = new FormData()
    formData.set('song', JSON.stringify(newSong))

    if (options?.cifraPdfFile) {
      formData.set('cifra_pdf', options.cifraPdfFile)
    }

    const res = await fetch(`/api/songs/`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    const savedSong = await res.json()
    setSong(savedSong)
    // redirect to view page after save
    router.push(`/song/${savedSong.id}`)
  }


  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="back-link">
          ← Voltar
        </Link>
      </div>

      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Nova música
        </span>
      </div>
      <SongEditor key={song.id} initialSong={song} onSave={handleCreate} />
    </main>
  )
}
