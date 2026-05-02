import { Song } from "@/domain/entities/song"

export interface SaveSongOptions {
  cifraPdfFile?: File | null
  removeCifraPdf?: boolean
}

interface SaveSongRepository {
  save(song: Song, options?: SaveSongOptions): Promise<Song>
}

function createSongValidationError(message: string) {
  const error = new Error(message)
  error.name = 'SongValidationError'
  return error
}

function normalizeCapo(capo: Song["capo"]) {
  if (capo === undefined) return undefined
  if (typeof capo !== 'number' || Number.isNaN(capo)) {
    throw createSongValidationError('Capo deve ser um número.')
  }
  if (!Number.isInteger(capo)) {
    throw createSongValidationError('Capo deve ser um número inteiro.')
  }
  if (capo < 0) {
    throw createSongValidationError('Capo deve ser maior ou igual a 0.')
  }

  return capo
}

export function saveSongUseCase(repo: SaveSongRepository) {
  return async (song: Song, options?: SaveSongOptions) => {
    return repo.save(
      {
        ...song,
        capo: normalizeCapo(song.capo),
      },
      options
    )
  }
}
