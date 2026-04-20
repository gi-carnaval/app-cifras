import { Song } from "@/domain/entities/song"
import { SaveSongOptions } from "./save-song"

interface UpsertSongRepository {
  save(song: Song, options?: SaveSongOptions): Promise<Song>
}

export function upsertSongUseCase(repo: UpsertSongRepository) {
  return async (song: Song, options?: SaveSongOptions) => {
    return repo.save(song, options)
  }
}
