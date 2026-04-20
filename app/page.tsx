'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Song } from '../domain/entities/song'

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch('/api/songs')
        console.log({ res })
        const songs = await res.json()
        setSongs(songs)
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-20 px-6">
      <h1 className="page-title">Cifras</h1>
      <p className="page-subtitle">Sua coleção de músicas com acordes</p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', paddingTop: 40 }}>Carregando...</p>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎸</div>
          <p>Nenhuma música ainda.</p>
          <br />
          <Link href="/admin" className="btn-primary">
            Adicionar primeira música
          </Link>
        </div>
      ) : (
        <div className="song-grid">
          {songs.map((song) => {
            const totalLines = song.sections.reduce(
              (acc, s) => acc + s.lines.length,
              0
            )
            const totalChords = song.sections.reduce(
              (acc, s) =>
                acc + s.lines.reduce((a, l) => a + l.chords.length, 0),
              0
            )
            return (
              <Link key={song.id} href={`/song/${song.id}`} className="song-card">
                <div className="song-card-title">{song.title || 'Sem título'}</div>
                <div className="song-card-artist">{song.artist?.name || 'Artista desconhecido'}</div>
                <div className="song-card-meta">
                  {song.sections.length} trecho{song.sections.length !== 1 ? 's' : ''} ·{' '}
                  {totalLines} linha{totalLines !== 1 ? 's' : ''} ·{' '}
                  {totalChords} acorde{totalChords !== 1 ? 's' : ''}
                </div>
                <div className="song-card-actions">
                  <span className="btn-ghost btn-sm">Ver cifra →</span>
                  {/* <Link
                    href={`/song/${song.id}/edit`}
                    className="btn-ghost btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Editar
                  </Link> */}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
