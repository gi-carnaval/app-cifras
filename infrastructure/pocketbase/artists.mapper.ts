import { Artist } from "@/domain/entities/artist";
import { PocketbaseArtistDTO } from "../api/dto/pocketbase-artist-dto";

export function toArtistEntity(dto: PocketbaseArtistDTO): Artist {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug
  }
}

export function toPocketbaseArtistDTO(artist: Artist): PocketbaseArtistDTO {
  return {
    id: artist.id,
    name: artist.name,
    slug: artist.slug
  }
}