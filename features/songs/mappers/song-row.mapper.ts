import { formatChord } from '@/core/chord-engine'
import type { Song } from '@/domain/entities/song'
import type { SongRow } from '../types/song-row'

export function toSongRow(song: Song): SongRow {
  return {
    id: song.id,
    title: song.title || 'Sem título',
    artistName: song.artist?.name || 'Artista desconhecido',
    defaultKey: formatChord(song.defaultKey),
    categoriesLabel: song.categories.length
      ? song.categories.map((category) => category.name).join(', ')
      : 'Sem categoria',
  }
}

export function toSongRows(songs: Song[]): SongRow[] {
  return songs.map(toSongRow)
}
