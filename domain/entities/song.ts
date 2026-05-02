import { Chord, ChordPlacement } from "@/types"
import { Artist } from "./artist"
import { Category } from "./category"
import { LiturgicalMoment } from "./liturgicalMoment"

export type Line = {
  id: string
  lyrics: string
  chords: ChordPlacement[]
}

export type Section = {
  id: string
  name: string
  lines: Line[]
}

export type Song = {
  id: string
  title: string
  artist: Artist
  categories: Category[]
  liturgicalMoments: LiturgicalMoment[]
  sections: Section[]
  capo?: number
  defaultKey: Chord
  cifraPDF: string
}

export function getArtistById(artists: Artist[], artistId: string | null) {
  if (!artistId) return null
  return artists.find((artist) => artist.id === artistId) ?? null
}

export function getCategoriesByIds(categories: Category[], categoryIds: string[]) {
  return categoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is Category => Boolean(category))
}

export function getLiturgicalMomentsByIds(
  liturgicalMoments: LiturgicalMoment[],
  liturgicalMomentIds: string[]
) {
  return liturgicalMomentIds
    .map((liturgicalMomentId) =>
      liturgicalMoments.find((liturgicalMoment) => liturgicalMoment.id === liturgicalMomentId)
    )
    .filter((liturgicalMoment): liturgicalMoment is LiturgicalMoment => Boolean(liturgicalMoment))
}
