import { Song } from "@/domain/entities/song"
import { SongRepository } from "@/domain/repositories/song.repository"

const STORAGE_KEY = "cifras_songs_v2"

function readSongs(): Song[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as Song[] : []
  } catch {
    return []
  }
}

function writeSongs(songs: Song[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
}

export function createLocalStorageSongRepository(): SongRepository {
  async function getAll(): Promise<Song[]> {
    return readSongs()
  }

  async function getById(id: string): Promise<Song | null> {
    return readSongs().find((song) => song.id === id) ?? null
  }

  async function save(song: Song): Promise<Song> {
    const songs = readSongs()
    const existingIndex = songs.findIndex((currentSong) => currentSong.id === song.id)
    const nextSongs = existingIndex >= 0
      ? songs.map((currentSong) => currentSong.id === song.id ? song : currentSong)
      : [...songs, song]

    writeSongs(nextSongs)
    return song
  }

  async function remove(id: string): Promise<void> {
    writeSongs(readSongs().filter((song) => song.id !== id))
  }

  return {
    getAll,
    getById,
    save,
    delete: remove,
  }
}
