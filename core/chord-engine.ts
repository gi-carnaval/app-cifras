import { Line, Section } from '@/domain/entities/song'
import { RenderOutput, ChordPlacement, Chord, RenderChunk } from '../types'

// ─── Chromatic Scale ──────────────────────────────────────────────────────────

export const chromaticScale = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
]

const flatMap: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
}

// ─── parseChord ───────────────────────────────────────────────────────────────

/**
 * Parses a chord string into a structured Chord object.
 *
 * Supports: C  C#  Cb  Cm  C#m7  C#m7/G#  B5(9)  Cmaj7  Csus2  Cadd9  etc.
 * Throws on invalid input — does NOT attempt to auto-correct.
 */
export function parseChord(input: string): Chord {
  const s = input.trim()
  if (!s) throw new Error(`parseChord: empty input`)

  // Regex anatomy:
  //   [A-G]           root
  //   (#|b)?          accidental
  //   (quality)?      maj\d* | m\d* | dim\d* | aug\d* | sus\d* | add\d* | \d+
  //   (\([^)]+\))?    extension in parens e.g. (9)
  //   (/[A-G](#|b)?)? bass note
  const re = /^([A-G])(#|b)?((?:maj|add|sus|dim|aug)?[0-9]*(?:m(?:aj)?)?[0-9]*)(\([^)]*\))?(?:\/([A-G])(#|b)?)?$/

  const m = s.match(re)
  if (!m) throw new Error(`parseChord: invalid chord "${input}"`)

  const [, root, accidental, quality, extension, bassRoot, bassAcc] = m

  const chord: Chord = { root }
  if (accidental === '#' || accidental === 'b') chord.accidental = accidental as '#' | 'b'
  if (quality) chord.quality = quality  // only set if non-empty
  if (extension) chord.extension = extension
  if (bassRoot) {
    chord.bass = { root: bassRoot }
    if (bassAcc === '#' || bassAcc === 'b') chord.bass.accidental = bassAcc as '#' | 'b'
  }

  return chord
}

// ─── formatChord ─────────────────────────────────────────────────────────────

/**
 * Serialises a Chord back to its canonical string representation.
 */
export function formatChord(chord: Chord): string {
  let s = chord.root
  if (chord.accidental) s += chord.accidental
  if (chord.quality) s += chord.quality
  if (chord.extension) s += chord.extension
  if (chord.bass) {
    s += '/' + chord.bass.root
    if (chord.bass.accidental) s += chord.bass.accidental
  }
  return s
}

// ─── transposeChord ───────────────────────────────────────────────────────────

function transposeNote(
  root: string,
  accidental: '#' | 'b' | undefined,
  steps: number,
): { root: string; accidental?: '#' | 'b' } {
  const note = root + (accidental ?? '')
  const normalised = flatMap[note] ?? note
  const idx = chromaticScale.indexOf(normalised)
  if (idx === -1) throw new Error(`transposeNote: unknown note "${note}"`)

  const newNote = chromaticScale[((idx + steps) % 12 + 12) % 12]
  const newRoot = newNote[0]
  const newAcc = newNote[1] as '#' | undefined
  return newAcc ? { root: newRoot, accidental: newAcc } : { root: newRoot }
}

/**
 * Transposes root and bass by `steps` semitones.
 * Quality and extension are preserved unchanged.
 */
export function transposeChord(chord: Chord, steps: number): Chord {
  const t = transposeNote(chord.root, chord.accidental, steps)
  const result: Chord = { root: t.root }
  if (t.accidental) result.accidental = t.accidental
  if (chord.quality) result.quality = chord.quality
  if (chord.extension) result.extension = chord.extension
  if (chord.bass) {
    const tb = transposeNote(chord.bass.root, chord.bass.accidental, steps)
    result.bass = { root: tb.root }
    if (tb.accidental) result.bass.accidental = tb.accidental
  }
  return result
}

/**
 * Returns a new Line with every chord transposed.
 */
export function transposeLine(line: Line, steps: number): Line {
  return {
    ...line,
    chords: line.chords.map((cp) => ({ ...cp, chord: transposeChord(cp.chord, steps) })),
  }
}

/**
 * Returns new sections with every chord transposed.
 */
export function transposeSong(sections: Section[], steps: number): Section[] {
  return sections.map((sec) => ({
    ...sec,
    lines: sec.lines.map((line) => transposeLine(line, steps)),
  }))
}

export function getTranspositionSteps(fromChord: Chord, toChord: Chord): number {
  const fromNote = fromChord.root + (fromChord.accidental ?? '')
  const toNote = toChord.root + (toChord.accidental ?? '')
  const normalisedFrom = flatMap[fromNote] ?? fromNote
  const normalisedTo = flatMap[toNote] ?? toNote
  const fromIndex = chromaticScale.indexOf(normalisedFrom)
  const toIndex = chromaticScale.indexOf(normalisedTo)

  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`getTranspositionSteps: unsupported key change "${fromNote}" -> "${toNote}"`)
  }

  return toIndex - fromIndex
}

// ─── Responsive Rendering ────────────────────────────────────────────────────

/**
 * Splits a Line into visual RenderChunks that fit `containerWidth`.
 *
 * INVARIANT: ChordPlacement.index values are NEVER changed.
 * Each chunk carries startIndex so consumers can compute:
 *   relativeIndex = chord.index - chunk.startIndex
 */
export function splitLineForRender(
  line: Line,
  containerWidth: number,
  charWidth: number = 9.6,
): RenderChunk[] {
  const { lyrics } = line
  if (!lyrics) return [{ text: '', startIndex: 0 }]

  const charsPerChunk = Math.max(1, Math.floor(containerWidth / charWidth))
  if (lyrics.length <= charsPerChunk) return [{ text: lyrics, startIndex: 0 }]

  const chunks: RenderChunk[] = []
  let pos = 0

  while (pos < lyrics.length) {
    let end = Math.min(pos + charsPerChunk, lyrics.length)

    // Prefer word boundaries
    if (end < lyrics.length) {
      const spaceIdx = lyrics.lastIndexOf(' ', end)
      if (spaceIdx > pos) end = spaceIdx + 1
    }

    chunks.push({ text: lyrics.slice(pos, end), startIndex: pos })
    pos = end
  }

  return chunks
}

/**
 * Returns ChordPlacements that fall within a chunk, with their relative index.
 * Use: left = (item.relativeIndex / chunk.text.length) * 100 + '%'
 */
export function chordsForChunk(
  chords: ChordPlacement[],
  chunk: RenderChunk,
): Array<{ relativeIndex: number; chord: Chord; absoluteIndex: number }> {
  const end = chunk.startIndex + chunk.text.length
  return chords
    .filter((cp) => cp.index >= chunk.startIndex && cp.index < end)
    .map((cp) => ({
      absoluteIndex: cp.index,
      relativeIndex: cp.index - chunk.startIndex,
      chord: cp.chord,
    }))
}

// ─── Core Use Cases ───────────────────────────────────────────────────────────

export function addChord(line: Line, index: number, chord: Chord): Line {
  if (index < 0 || index > line.lyrics.length) {
    throw new Error(`Index ${index} is out of bounds for lyrics of length ${line.lyrics.length}`)
  }
  const duplicate = line.chords.find((c) => c.index === index)
  if (duplicate) {
    throw new Error(
      `Chord already exists at index ${index}: "${formatChord(duplicate.chord)}". Remove it first.`
    )
  }
  const placement: ChordPlacement = { index, chord }
  const updatedChords = [...line.chords, placement].sort((a, b) => a.index - b.index)
  return { ...line, chords: updatedChords }
}

/** Convenience: parse string then add at index. */
export function addChordFromString(line: Line, index: number, value: string): Line {
  return addChord(line, index, parseChord(value))
}

export function removeChord(line: Line, index: number): Line {
  return { ...line, chords: line.chords.filter((c) => c.index !== index) }
}

export function updateChord(line: Line, index: number, chord: Chord): Line {
  if (!line.chords.find((c) => c.index === index)) {
    throw new Error(`No chord found at index ${index}`)
  }
  return {
    ...line,
    chords: line.chords.map((c) => (c.index === index ? { ...c, chord } : c)),
  }
}

export function renderLine(line: Line): RenderOutput {
  return {
    lyrics: line.lyrics,
    chords: line.chords.map((c) => ({ index: c.index, chord: c.chord })),
  }
}

// ─── Editor Helpers ───────────────────────────────────────────────────────────

export function getCursorPosition(textarea: HTMLTextAreaElement): number {
  return textarea.selectionStart ?? 0
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function createLine(lyrics: string = ''): Line {
  return { id: generateId(), lyrics, chords: [] }
}

export function validateLine(line: Line): string[] {
  const errors: string[] = []
  const seen = new Set<number>()
  for (const cp of line.chords) {
    if (cp.index < 0 || cp.index > line.lyrics.length) {
      errors.push(`Chord "${formatChord(cp.chord)}" has invalid index ${cp.index}`)
    }
    if (seen.has(cp.index)) errors.push(`Duplicate chord at index ${cp.index}`)
    seen.add(cp.index)
  }
  return errors
}
