import { Artist } from "@/domain/entities/artist";
import { useEffect, useState } from "react";

export default function useSongArtists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const getArtists = async () => {
      try {
        const res = await fetch("/api/artists")
        if (!res.ok) throw new Error("Erro ao carregar artistas.")
        setArtists(await res.json())
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao carregar artistas.")
      } finally {
        setIsLoading(false)
      }
    }
    getArtists()
  }, [])

  async function createArtist(name: string) {
    setIsCreating(true)
    setCreateError(null)

    try {
      const res = await fetch("/api/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error(await res.text())

      const createdArtist = await res.json() as Artist

      setArtists((currentArtists) => {
        const artistExists = currentArtists.some((artist) => artist.id === createdArtist.id)
        if (artistExists) return currentArtists

        return [...currentArtists, createdArtist].sort((a, b) => a.name.localeCompare(b.name))
      })

      return createdArtist
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao criar artista."
      setCreateError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }

  return {
    artists,
    isLoading,
    isCreating,
    error,
    createError,
    createArtist,
  }
}
