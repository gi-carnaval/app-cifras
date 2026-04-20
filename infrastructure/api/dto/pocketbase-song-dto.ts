import { PocketbaseArtistDTO } from "./pocketbase-artist-dto"
import { PocketbaseCategoryDTO } from "./pocketbase-category-dto"

export interface PocketbaseSongDTO {
  collectionId?: string,
  collectionName?: string,
  id: string,
  title: string,
  default_key: string,
  sections: JSON,
  artist: string,
  categories: string[],
  cifra_pdf: string[],
  expand?: {
    artist?: PocketbaseArtistDTO,
    categories?: PocketbaseCategoryDTO[],
  },
  created?: string,
  updated?: string
}
