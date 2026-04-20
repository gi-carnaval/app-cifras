import { ArtistRepository } from "@/domain/repositories/artist.repository"

function normalizeArtistName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function slugifyArtistName(name: string) {
  return normalizeArtistName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createArtistUseCase(repo: ArtistRepository) {
  return async (name: string) => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error("Nome do artista é obrigatório.")
    }

    const artists = await repo.getAll()
    const existingArtist = artists.find(
      (artist) => normalizeArtistName(artist.name) === normalizeArtistName(trimmedName)
    )

    if (existingArtist) {
      return existingArtist
    }

    return repo.save({
      id: "",
      name: trimmedName,
      slug: slugifyArtistName(trimmedName),
    })
  }
}
