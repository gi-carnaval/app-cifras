import { formatChord, transposeChord, type ChordNotation } from '@/core/chord-engine'
import type { Chord } from '@/types'

interface GetSongKeyMetadataInput {
  defaultKey?: Chord | null
  capo?: number
  notation?: ChordNotation
}

export interface SongKeyMetadata {
  keyLabel: string | null
  capoLabel: string | null
}

function hasValidCapo(capo: number | undefined) {
  return typeof capo === 'number' && Number.isInteger(capo) && capo > 0
}

function formatKey(chord: Chord | null | undefined, notation: ChordNotation) {
  if (!chord) return null

  try {
    return formatChord(chord, { notation })
  } catch {
    return null
  }
}

export function getRealKeyFromCapo(
  defaultKey: Chord | null | undefined,
  capo: number,
  notation: ChordNotation = 'brazilian'
) {
  if (!hasValidCapo(capo) || !defaultKey) return null

  try {
    return formatChord(transposeChord(defaultKey, capo), { notation })
  } catch {
    return null
  }
}

export function getSongKeyMetadata({
  defaultKey,
  capo,
  notation = 'brazilian',
}: GetSongKeyMetadataInput): SongKeyMetadata {
  const defaultKeyLabel = formatKey(defaultKey, notation)

  if (!hasValidCapo(capo)) {
    return {
      keyLabel: defaultKeyLabel ? `Tom: ${defaultKeyLabel}` : null,
      capoLabel: null,
    }
  }

  const realKeyLabel = getRealKeyFromCapo(defaultKey, capo as number, notation)

  return {
    keyLabel:
      realKeyLabel && defaultKeyLabel
        ? `Tom: ${realKeyLabel} | Forma: ${defaultKeyLabel}`
        : defaultKeyLabel
          ? `Tom: ${defaultKeyLabel}`
          : null,
    capoLabel: `Capo: ${capo}ª casa`,
  }
}
