import { SongRepository, type SongListFilters } from "@/domain/repositories/song.repository"

function normalizeFilters(filters?: SongListFilters): SongListFilters {
  return {
    search: filters?.search?.trim() ?? "",
    artistId: filters?.artistId?.trim() ?? "",
    categoryIds: Array.from(
      new Set((filters?.categoryIds ?? []).map((categoryId) => categoryId.trim()).filter(Boolean))
    ),
  }
}

export function getAllSongsUseCase(repo: SongRepository) {
  return async (filters?: SongListFilters) => {
    return repo.getAll(normalizeFilters(filters))
  }
}
