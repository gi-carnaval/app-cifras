'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Song } from '@/domain/entities/song'
import SongEditor from '@/components/song/SongEditor'

interface SongEditorSaveOptions {
  cifraPdfFile?: File | null
}

export default function EditSongPage() {
  const params = useParams()
  const editId = params.id as string
  const router = useRouter()

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSong() {
      const res = await fetch(`/api/songs/${editId}`)
      const song = await res.json()
      setSong(song)
      setLoading(false)
    }

    fetchSong()
  }, [editId])

  const handleSave = async (updated: Song, options?: SongEditorSaveOptions) => {
    const formData = new FormData()
    formData.set('song', JSON.stringify(updated))

    if (options?.cifraPdfFile) {
      formData.set('cifra_pdf', options.cifraPdfFile)
    }

    const res = await fetch(`/api/songs/${updated.id}`, {
      method: 'PUT',
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

  const handleDelete = async () => {
    if (!song) return
    if (!confirm('Tem certeza que deseja excluir esta música?')) return

    const res = await fetch(`/api/songs/${song.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    router.push('/')
  }

  if (loading || !song) {
    return (
      <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
        <p style={{ color: 'var(--text-muted)', paddingTop: 40 }}>Carregando...</p>
      </main>
    )
  }

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="back-link">
          ← Voltar
        </Link>
        {editId && (
          <button className="btn-ghost btn-danger btn-sm" onClick={handleDelete}>
            Excluir música
          </button>
        )}
      </div>

      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          {editId ? 'Editando música' : 'Nova música'}
        </span>
      </div>

      <SongEditor key={song.id} initialSong={song} onSave={handleSave} />
    </main>
  )
}
