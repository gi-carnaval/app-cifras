import { addChord, removeChord } from '@/core/chord-engine'
import { Line } from '@/domain/entities/song'

export function moveChordIndex(line: Line, currentIndex: number, delta: -1 | 1): Line {
  const currentPlacements = line.chords.filter((cp) => cp.index === currentIndex)
  if (currentPlacements.length !== 1) return line

  try {
    const nextIndex = currentIndex + delta
    const lineWithoutChord = removeChord(line, currentIndex)
    return addChord(lineWithoutChord, nextIndex, currentPlacements[0].chord)
  } catch {
    return line
  }
}
