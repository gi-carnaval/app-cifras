import { Artist } from "../entities/artist"

export interface ArtistRepository {
  getAll(): Promise<Artist[]>
  save(artist: Pick<Artist, "id" | "name" | "slug">): Promise<Artist>
}