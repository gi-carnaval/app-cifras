import { Song } from "../entities/song"

export interface SongRepository {
  getAll(): Promise<Song[]>
  getById(id: string): Promise<Song | null>
  save(song: Song): Promise<Song>
  delete(id: string): Promise<void>
}
