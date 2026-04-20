'use client'

import { useState } from 'react'

interface QuickCreateArtistProps {
  onCancel: () => void
}

export default function QuickCreateArtist({
  // onCreate,
  onCancel,
}: QuickCreateArtistProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)

      // await onCreate(name.trim())

      setName('')
    } catch (err) {
      setError('Erro ao criar artista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-(--radius) border border-(--border) bg-(--bg2) p-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="artist-name"
          className="text-sm font-medium text-(--text-muted)"
        >
          Novo artista
        </label>

        <input
          id="artist-name"
          type="text"
          placeholder="Nome do artista"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="w-full rounded-(--radius) border border-(--border) bg-(--surface) px-3! py-2.5 text-sm text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="text-sm text-(--danger)">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}