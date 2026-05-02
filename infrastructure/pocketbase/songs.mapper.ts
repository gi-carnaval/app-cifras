import { parseChord, formatChord } from "@/core/chord-engine"
import { Artist } from "@/domain/entities/artist"
import { Category } from "@/domain/entities/category"
import type { Section, Song } from "@/domain/entities/song"
import { PocketbaseSongDTO } from "../api/dto/pocketbase-song-dto"
import { toArtistEntity } from "./artists.mapper"
import { toCategoryEntity } from "./categories.mapper"
import { LiturgicalMoment } from "@/domain/entities/liturgicalMoment"
import { toLiturgicalMomentEntity } from "./liturgicalMoment.mapper"

interface PocketbaseSongSaveOptions {
  cifraPdfFile?: File | null
  removeCifraPdf?: boolean
}

function toCapo(value: PocketbaseSongDTO["capo"]): Song["capo"] {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  if (!Number.isInteger(value) || value < 0) return undefined

  return value
}

function toSections(value: PocketbaseSongDTO["sections"]): Section[] {
  return Array.isArray(value) ? value as unknown as Section[] : []
}

function toArtist(dto: PocketbaseSongDTO): Artist {
  if (dto.expand?.artist) {
    return toArtistEntity(dto.expand.artist)
  }

  return {
    id: dto.artist,
    name: "",
    slug: "",
  }
}

function toCategories(dto: PocketbaseSongDTO): Category[] {
  if (dto.expand?.categories) {
    return dto.expand.categories.map(toCategoryEntity)
  }

  return dto.categories.map((categoryId) => ({
    id: categoryId,
    name: "",
    slug: "",
  }))
}

function toLiturgicalMoments(dto: PocketbaseSongDTO): LiturgicalMoment[] {
  if (dto.expand?.liturgical_moments) {
    return dto.expand.liturgical_moments.map(toLiturgicalMomentEntity)
  }

  return (dto.liturgical_moments ?? []).map((liturgicalMomentId) => ({
    id: liturgicalMomentId,
    name: "",
    slug: "",
    order: 0
  }))
}

export function toSongEntity(dto: PocketbaseSongDTO): Song {
  return {
    id: dto.id,
    title: dto.title,
    artist: toArtist(dto),
    capo: toCapo(dto.capo),
    defaultKey: parseChord(dto.default_key) || "",
    categories: toCategories(dto),
    liturgicalMoments: toLiturgicalMoments(dto),
    sections: toSections(dto.sections),
    cifraPDF: dto.cifra_pdf?.[0] ?? "",
  }
}

export function toPocketbaseSongDTO(song: Song): PocketbaseSongDTO {
  return {
    id: song.id,
    title: song.title,
    capo: song.capo ?? 0,
    artist: song.artist.id,
    categories: song.categories.map((category) => category.id),
    liturgical_moments: song.liturgicalMoments.map(moment => moment.id),
    cifra_pdf: song.cifraPDF ? [song.cifraPDF] : [],
    default_key: formatChord(song.defaultKey),
    sections: song.sections as unknown as JSON,
  }
}

export function toPocketbaseSongFormData(song: Song, options?: PocketbaseSongSaveOptions): FormData {
  const formData = new FormData()

  formData.set("title", song.title)
  formData.set("capo", String(song.capo ?? 0))
  formData.set("artist", song.artist.id)
  formData.set("default_key", formatChord(song.defaultKey))
  formData.set("sections", JSON.stringify(song.sections))
  if (song.liturgicalMoments.length > 0) {
    song.liturgicalMoments.forEach((liturgicalMoment) => {
      formData.append("liturgical_moments", liturgicalMoment.id)
    })
  } else {
    formData.set("liturgical_moments", "")
  }

  song.categories.forEach((category) => {
    formData.append("categories", category.id)
  })

  if (options?.cifraPdfFile) {
    formData.set("cifra_pdf", options.cifraPdfFile)
  } else if (options?.removeCifraPdf) {
    formData.set("cifra_pdf", "")
  }

  return formData
}
