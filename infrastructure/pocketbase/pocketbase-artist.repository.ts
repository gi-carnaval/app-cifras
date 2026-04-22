import { createAuthenticatedPocketbaseClient, type PocketbaseRepositoryOptions } from "./client";
import { PocketbaseArtistDTO } from "../api/dto/pocketbase-artist-dto";
import { ArtistRepository } from "@/domain/repositories/artist.repository";
import { Artist } from "@/domain/entities/artist";
import { toArtistEntity, toPocketbaseArtistDTO } from "./artists.mapper";

export function createPocketbaseArtistRepository(
  options?: PocketbaseRepositoryOptions
): ArtistRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "artists"

  async function getAll(): Promise<Artist[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseArtistDTO>({
      sort: "name",
    })

    return result.map(toArtistEntity)
  }

  async function save(artist: Pick<Artist, "id" | "name" | "slug">): Promise<Artist> {
    if (artist.id) {
      const updated = await pb
        .collection(collection)
        .update<PocketbaseArtistDTO>(artist.id, toPocketbaseArtistDTO(artist))

      return toArtistEntity(updated)
    }

    const created = await pb
      .collection(collection)
      .create<PocketbaseArtistDTO>(toPocketbaseArtistDTO(artist))

    return toArtistEntity(created)
  }

  return {
    getAll,
    save,
  }
}
