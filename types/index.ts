// ─── Chord Model (V2) ─────────────────────────────────────────────────────────

export type Chord = {
  root: string              // A–G
  accidental?: '#' | 'b'
  quality?: string          // m, maj7, dim, sus2, etc.
  extension?: string        // (9), (11), add9, etc.
  bass?: {
    root: string
    accidental?: '#' | 'b'
  }
}

export type ChordPlacement = {
  index: number
  chord: Chord
}
// ─── Render Model ─────────────────────────────────────────────────────────────

export type RenderOutput = {
  lyrics: string
  chords: Array<{
    index: number
    chord: Chord
  }>
}

/**
 * A visual chunk of a line used for responsive rendering.
 * startIndex is the original string offset — never mutated.
 */
export type RenderChunk = {
  text: string        // substring of lyrics
  startIndex: number  // offset into original lyrics string
}
