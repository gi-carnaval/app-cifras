// ─── Song Model ───────────────────────────────────────────────────────────────

import { Chord, ChordPlacement } from "@/types"
import { Artist } from "./artist"
import { Category } from "./category"

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
  sections: Section[]
  defaultKey: Chord
  cifraPDF: string
}
