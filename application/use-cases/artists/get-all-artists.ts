import { ArtistRepository } from "@/domain/repositories/artist.repository";

export function getAllArtistsUseCase(repo: ArtistRepository) {
  return async () => {
    return repo.getAll()
  }
}