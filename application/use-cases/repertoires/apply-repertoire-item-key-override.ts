import { formatChord, getTranspositionSteps, transposeChord, transposeSong } from "@/core/chord-engine"
import type { RepertoireItem } from "@/domain/entities/repertoire"
import type { Song } from "@/domain/entities/song"

export function applyRepertoireItemKeyOverride(song: Song, repertoireItem: RepertoireItem): Song {
  const customKey = repertoireItem.customKey

  if (!customKey) return song

  try {
    const steps = getTranspositionSteps(song.defaultKey, customKey)

    if (steps === 0) {
      return {
        ...song,
        defaultKey: customKey,
      }
    }

    return {
      ...song,
      defaultKey: transposeChord(song.defaultKey, steps),
      sections: transposeSong(song.sections, steps),
    }
  } catch {
    return song
  }
}

export function getRepertoireItemEffectiveKeyLabel(song: Song, repertoireItem: RepertoireItem): string {
  try {
    const effectiveSong = applyRepertoireItemKeyOverride(song, repertoireItem)

    return formatChord(effectiveSong.defaultKey)
  } catch {
    return ""
  }
}
