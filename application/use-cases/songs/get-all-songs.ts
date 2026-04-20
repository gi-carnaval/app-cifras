import { SongRepository } from "@/domain/repositories/song.repository";

export function getAllSongsUseCase(repo: SongRepository) {
  return async () => {
    return repo.getAll()
  }
}