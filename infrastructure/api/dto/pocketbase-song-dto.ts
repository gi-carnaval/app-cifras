import { PocketbaseArtistDTO } from "./pocketbase-artist-dto"
import { PocketbaseCategoryDTO } from "./pocketbase-category-dto"
import { PocketbaseLiturgicalMomentDTO } from "./pocketbase-liturgical-moment-dto"

export interface PocketbaseSongDTO {
  collectionId?: string,
  collectionName?: string,
  id: string,
  title: string,
  default_key: string,
  sections: JSON,
  artist: string,
  categories: string[],
  liturgical_moments: string[],
  cifra_pdf: string[],
  expand?: {
    artist?: PocketbaseArtistDTO,
    categories?: PocketbaseCategoryDTO[],
    liturgical_moments?: PocketbaseLiturgicalMomentDTO[]
  },
  created?: string,
  updated?: string
}
