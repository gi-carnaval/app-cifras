import { SongRepository } from "@/domain/repositories/song.repository"

export function getSongByIdUseCase(repo: SongRepository) {
  return async (id: string) => {
    return repo.getById(id)
  }
}
