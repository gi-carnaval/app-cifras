import { Song } from "@/domain/entities/song"

export interface SaveSongOptions {
  cifraPdfFile?: File | null
  removeCifraPdf?: boolean
}

interface SaveSongRepository {
  save(song: Song, options?: SaveSongOptions): Promise<Song>
}

export function saveSongUseCase(repo: SaveSongRepository) {
  return async (song: Song, options?: SaveSongOptions) => {
    return repo.save(song, options)
  }
}
