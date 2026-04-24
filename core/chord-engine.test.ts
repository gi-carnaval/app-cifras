/**
 * chord-engine V2 tests — run with: npx vitest run
 * (mirrors run-tests.mjs which requires no deps)
 */
import { describe, it, expect } from 'vitest'
import {
  normalizeChordInput,
  parseChord, formatChord,
  transposeChord, transposeLine,
  addChord, addChordFromString, removeChord, updateChord,
  renderLine, splitLineForRender, chordsForChunk,
  createLine,
} from './chord-engine'

describe('normalizeChordInput', () => {
  it('keeps canonical international notation unchanged', () => {
    expect(normalizeChordInput('C#m7/G#')).toBe('C#m7/G#')
  })

  it('normalizes brazilian major seventh notation', () => {
    expect(normalizeChordInput('F7+')).toBe('Fmaj7')
  })

  it('normalizes degree-symbol diminished notation', () => {
    expect(normalizeChordInput('G#º')).toBe('G#dim')
    expect(normalizeChordInput('G#°')).toBe('G#dim')
  })
})

// ── parseChord ────────────────────────────────────────────────────────────────

describe('parseChord', () => {
  it('parses bare root', () => {
    const c = parseChord('C')
    expect(c.root).toBe('C')
    expect(c.accidental).toBeUndefined()
    expect(c.quality).toBeUndefined()
  })

  it('parses sharp', () => {
    const c = parseChord('C#')
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
  })

  it('parses minor', () => expect(parseChord('Cm').quality).toBe('m'))

  it('parses C#m7', () => {
    const c = parseChord('C#m7')
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
    expect(c.quality).toBe('m7')
  })

  it('parses C#m7/G# with bass', () => {
    const c = parseChord('C#m7/G#')
    expect(c.bass?.root).toBe('G')
    expect(c.bass?.accidental).toBe('#')
  })

  it('parses B5(9) with extension', () => {
    const c = parseChord('B5(9)')
    expect(c.quality).toBe('5')
    expect(c.extension).toBe('(9)')
  })

  it('parses brazilian major seventh notation as canonical maj7', () => {
    const c = parseChord('F7+')
    expect(c.root).toBe('F')
    expect(c.quality).toBe('maj7')
  })

  it('parses brazilian diminished notation as canonical dim', () => {
    const c = parseChord('G#º')
    expect(c.root).toBe('G')
    expect(c.accidental).toBe('#')
    expect(c.quality).toBe('dim')
  })

  it('throws on invalid input', () => {
    expect(() => parseChord('')).toThrow()
    expect(() => parseChord('X#m7')).toThrow()
  })
})

// ── formatChord ───────────────────────────────────────────────────────────────

describe('formatChord', () => {
  it('roundtrips C#m7/G#', () => expect(formatChord(parseChord('C#m7/G#'))).toBe('C#m7/G#'))
  it('roundtrips Cmaj7',   () => expect(formatChord(parseChord('Cmaj7'))).toBe('Cmaj7'))
  it('roundtrips B5(9)',   () => expect(formatChord(parseChord('B5(9)'))).toBe('B5(9)'))
  it('formats brazilian input using canonical engine notation', () => {
    expect(formatChord(parseChord('F7+'))).toBe('Fmaj7')
    expect(formatChord(parseChord('G#°'))).toBe('G#dim')
  })
  it('formats maj7 as 7+ in brazilian mode', () => {
    expect(formatChord(parseChord('Fmaj7'), { notation: 'brazilian' })).toBe('F7+')
  })
  it('formats dim as º in brazilian mode', () => {
    expect(formatChord(parseChord('G#dim'), { notation: 'brazilian' })).toBe('G#º')
  })
  it('keeps normal chords unchanged in brazilian mode', () => {
    expect(formatChord(parseChord('C#m7/G#'), { notation: 'brazilian' })).toBe('C#m7/G#')
  })
  it('keeps slash chords working in brazilian mode', () => {
    expect(formatChord(parseChord('Fmaj7/A'), { notation: 'brazilian' })).toBe('F7+/A')
  })
})

// ── transposeChord ────────────────────────────────────────────────────────────

describe('transposeChord', () => {
  it('C +1 → C#', () => {
    const r = transposeChord(parseChord('C'), 1)
    expect(r.root).toBe('C'); expect(r.accidental).toBe('#')
  })
  it('B +1 → C (wrap)', () => {
    const r = transposeChord(parseChord('B'), 1)
    expect(r.root).toBe('C'); expect(r.accidental).toBeUndefined()
  })
  it('C -1 → B (negative wrap)', () => expect(transposeChord(parseChord('C'), -1).root).toBe('B'))
  it('spec example: C#m7/G# +1 → Dm7/A', () => {
    const r = transposeChord(parseChord('C#m7/G#'), 1)
    expect(r.root).toBe('D')
    expect(r.accidental).toBeUndefined()
    expect(r.quality).toBe('m7')
    expect(r.bass?.root).toBe('A')
    expect(r.bass?.accidental).toBeUndefined()
  })
  it('preserves quality and extension', () => {
    const r = transposeChord(parseChord('B5(9)'), 2)
    expect(r.quality).toBe('5'); expect(r.extension).toBe('(9)')
  })
})

// ── transposeLine ─────────────────────────────────────────────────────────────

describe('transposeLine', () => {
  it('transposes all chords, preserves indexes', () => {
    let line = createLine('abc def')
    line = addChordFromString(line, 0, 'C')
    line = addChordFromString(line, 4, 'Am')
    const t = transposeLine(line, 2)
    expect(formatChord(t.chords[0].chord)).toBe('D')
    expect(formatChord(t.chords[1].chord)).toBe('Bm')
    expect(t.chords[0].index).toBe(0)
    expect(t.chords[1].index).toBe(4)
  })
  it('does not mutate original line', () => {
    let line = createLine('abc')
    line = addChordFromString(line, 0, 'C')
    transposeLine(line, 1)
    expect(formatChord(line.chords[0].chord)).toBe('C')
  })
})

// ── addChord / removeChord / updateChord ──────────────────────────────────────

describe('chord CRUD', () => {
  it('adds chord at index', () => {
    const line = addChordFromString(createLine('Hoje eu preciso'), 0, 'E')
    expect(line.chords).toHaveLength(1)
    expect(line.chords[0].index).toBe(0)
  })
  it('adds brazilian maj7 input as the same canonical chord as international notation', () => {
    const brazilianLine = addChordFromString(createLine('Hoje eu preciso'), 0, 'F7+')
    const internationalLine = addChordFromString(createLine('Hoje eu preciso'), 0, 'Fmaj7')

    expect(brazilianLine.chords[0].chord).toEqual(internationalLine.chords[0].chord)
    expect(formatChord(brazilianLine.chords[0].chord)).toBe('Fmaj7')
  })
  it('adds brazilian diminished input as the same canonical chord as international notation', () => {
    const brazilianLine = addChordFromString(createLine('Hoje eu preciso'), 0, 'G#º')
    const internationalLine = addChordFromString(createLine('Hoje eu preciso'), 0, 'G#dim')

    expect(brazilianLine.chords[0].chord).toEqual(internationalLine.chords[0].chord)
    expect(formatChord(brazilianLine.chords[0].chord)).toBe('G#dim')
  })
  it('keeps existing supported slash chords working when added from string', () => {
    const line = addChordFromString(createLine('Hoje eu preciso'), 0, 'C#m7/G#')

    expect(formatChord(line.chords[0].chord)).toBe('C#m7/G#')
  })
  it('throws on duplicate index', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 0, 'E')
    expect(() => addChordFromString(line, 0, 'G')).toThrow()
  })
  it('removes chord', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 0, 'E')
    line = removeChord(line, 0)
    expect(line.chords).toHaveLength(0)
  })
  it('updates chord', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 0, 'E')
    line = updateChord(line, 0, parseChord('Am'))
    expect(formatChord(line.chords[0].chord)).toBe('Am')
  })
})

// ── renderLine ────────────────────────────────────────────────────────────────

describe('renderLine', () => {
  it('returns lyrics and structured chords', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 0, 'E')
    const out = renderLine(line)
    expect(out.lyrics).toBe('Hoje eu preciso')
    expect(out.chords[0].chord.root).toBe('E')
  })
})

// ── splitLineForRender ────────────────────────────────────────────────────────

describe('splitLineForRender', () => {
  it('returns single chunk when text fits', () => {
    const chunks = splitLineForRender(createLine('abc'), 500)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].startIndex).toBe(0)
  })
  it('splits into multiple chunks', () => {
    const line = createLine('Olha que coisa mais linda mais cheia de graca')
    expect(splitLineForRender(line, 100, 10).length).toBeGreaterThan(1)
  })
  it('startIndex continuity: covers full string', () => {
    const line = createLine('ab cd ef gh')
    const chunks = splitLineForRender(line, 30, 10)
    let pos = 0
    for (const c of chunks) { expect(c.startIndex).toBe(pos); pos += c.text.length }
    expect(pos).toBe(line.lyrics.length)
  })
})

// ── chordsForChunk ────────────────────────────────────────────────────────────

describe('chordsForChunk', () => {
  it('filters chords to chunk range', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 0, 'C')
    line = addChordFromString(line, 8, 'Am')
    const result = chordsForChunk(line.chords, { text: 'Hoje eu ', startIndex: 0 })
    expect(result).toHaveLength(1)
    expect(result[0].absoluteIndex).toBe(0)
  })
  it('relativeIndex = absoluteIndex - startIndex', () => {
    let line = addChordFromString(createLine('Hoje eu preciso'), 8, 'Am')
    const result = chordsForChunk(line.chords, { text: 'eu preciso', startIndex: 5 })
    expect(result[0].relativeIndex).toBe(3)
  })
})
