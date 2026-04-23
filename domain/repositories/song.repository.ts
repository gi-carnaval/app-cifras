import { Song } from "../entities/song"

export type SongListFilters = {
  search?: string
  artistId?: string
  categoryIds?: string[]
}

export interface SongRepository {
  getAll(filters?: SongListFilters): Promise<Song[]>
  getById(id: string): Promise<Song | null>
  save(song: Song): Promise<Song>
  delete(id: string): Promise<void>
}
