import { SongRepository } from "@/domain/repositories/song.repository"

export function deleteSongUseCase(repo: SongRepository) {
  return async (id: string) => {
    return repo.delete(id)
  }
}
