// ── Test runner sem dependências externas ─────────────────────────────────────
let passed = 0
let failed = 0
let currentSuite = ''

function expect(val) {
  return {
    toBe: (exp) => {
      if (val !== exp) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`)
    },
    toEqual: (exp) => {
      const a = JSON.stringify(val), b = JSON.stringify(exp)
      if (a !== b) throw new Error(`Expected\n  ${b}\ngot\n  ${a}`)
    },
    toHaveLength: (n) => {
      if (val.length !== n) throw new Error(`Expected length ${n}, got ${val.length}`)
    },
    toBeUndefined: () => {
      if (val !== undefined) throw new Error(`Expected undefined, got ${JSON.stringify(val)}`)
    },
    toThrow: () => {
      throw new Error('Use assertThrows() for throw assertions')
    },
  }
}

function assertThrows(fn, msgHint = '') {
  try { fn(); throw new Error('Expected error but none was thrown') }
  catch (e) {
    if (e.message === 'Expected error but none was thrown') throw e
    return // ok
  }
}

function it(name, fn) {
  try { fn(); console.log(`  ✓  ${name}`); passed++ }
  catch (e) { console.log(`  ✗  ${name}\n     → ${e.message}`); failed++ }
}

function describe(name, fn) {
  console.log(`\n${name}`)
  fn()
}

// ── Inline motor V2 (transpilado de chord-engine.ts) ──────────────────────────

const chromaticScale = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

function parseChord(input) {
  const s = input.trim()
  if (!s) throw new Error(`parseChord: empty input`)
  const re = /^([A-G])(#|b)?((?:maj|add|sus|dim|aug)?[0-9]*(?:m(?:aj)?)?[0-9]*)(\([^)]*\))?(?:\/([A-G])(#|b)?)?$/
  const m = s.match(re)
  if (!m) throw new Error(`parseChord: invalid chord "${input}"`)
  const [, root, accidental, quality, extension, bassRoot, bassAcc] = m
  const chord = { root }
  if (accidental === '#' || accidental === 'b') chord.accidental = accidental
  if (quality) chord.quality = quality
  if (extension) chord.extension = extension
  if (bassRoot) {
    chord.bass = { root: bassRoot }
    if (bassAcc === '#' || bassAcc === 'b') chord.bass.accidental = bassAcc
  }
  return chord
}

function formatChord(chord) {
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

function transposeNote(root, accidental, steps) {
  const flatMap = { Db:'C#',Eb:'D#',Fb:'E',Gb:'F#',Ab:'G#',Bb:'A#',Cb:'B' }
  const note = root + (accidental ?? '')
  const normalised = flatMap[note] ?? note
  const idx = chromaticScale.indexOf(normalised)
  if (idx === -1) throw new Error(`transposeNote: unknown note "${note}"`)
  const newNote = chromaticScale[((idx + steps) % 12 + 12) % 12]
  const newRoot = newNote[0]
  const newAcc = newNote[1]
  return newAcc ? { root: newRoot, accidental: newAcc } : { root: newRoot }
}

function transposeChord(chord, steps) {
  const t = transposeNote(chord.root, chord.accidental, steps)
  const result = { root: t.root }
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

function transposeLine(line, steps) {
  return { ...line, chords: line.chords.map(cp => ({ ...cp, chord: transposeChord(cp.chord, steps) })) }
}

function generateId() { return Math.random().toString(36).slice(2,10) + Date.now().toString(36) }

function createLine(lyrics = '') { return { id: generateId(), lyrics, chords: [] } }

function addChord(line, index, chord) {
  if (index < 0 || index > line.lyrics.length)
    throw new Error(`Index ${index} is out of bounds for lyrics of length ${line.lyrics.length}`)
  const dup = line.chords.find(c => c.index === index)
  if (dup) throw new Error(`Chord already exists at index ${index}`)
  const updatedChords = [...line.chords, { index, chord }].sort((a,b) => a.index - b.index)
  return { ...line, chords: updatedChords }
}

function addChordFromString(line, index, value) { return addChord(line, index, parseChord(value)) }

function removeChord(line, index) { return { ...line, chords: line.chords.filter(c => c.index !== index) } }

function updateChord(line, index, chord) {
  if (!line.chords.find(c => c.index === index)) throw new Error(`No chord found at index ${index}`)
  return { ...line, chords: line.chords.map(c => c.index === index ? { ...c, chord } : c) }
}

function renderLine(line) {
  return { lyrics: line.lyrics, chords: line.chords.map(c => ({ index: c.index, chord: c.chord })) }
}

function splitLineForRender(line, containerWidth, charWidth = 9.6) {
  const { lyrics } = line
  if (!lyrics) return [{ text: '', startIndex: 0 }]
  const charsPerChunk = Math.max(1, Math.floor(containerWidth / charWidth))
  if (lyrics.length <= charsPerChunk) return [{ text: lyrics, startIndex: 0 }]
  const chunks = []
  let pos = 0
  while (pos < lyrics.length) {
    let end = Math.min(pos + charsPerChunk, lyrics.length)
    if (end < lyrics.length) {
      const spaceIdx = lyrics.lastIndexOf(' ', end)
      if (spaceIdx > pos) end = spaceIdx + 1
    }
    chunks.push({ text: lyrics.slice(pos, end), startIndex: pos })
    pos = end
  }
  return chunks
}

function chordsForChunk(chords, chunk) {
  const end = chunk.startIndex + chunk.text.length
  return chords
    .filter(cp => cp.index >= chunk.startIndex && cp.index < end)
    .map(cp => ({ absoluteIndex: cp.index, relativeIndex: cp.index - chunk.startIndex, chord: cp.chord }))
}

// ── TESTES ────────────────────────────────────────────────────────────────────

describe('parseChord', () => {
  it('parsa nota simples: "C"', () => {
    const c = parseChord('C')
    expect(c.root).toBe('C')
    expect(c.accidental).toBeUndefined()
    expect(c.quality).toBeUndefined()  // no quality for bare root
  })

  it('parsa com sustenido: "C#"', () => {
    const c = parseChord('C#')
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
  })

  it('parsa menor: "Cm"', () => {
    const c = parseChord('Cm')
    expect(c.root).toBe('C')
    expect(c.quality).toBe('m')
  })

  it('parsa "C#m7"', () => {
    const c = parseChord('C#m7')
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
    expect(c.quality).toBe('m7')
  })

  it('parsa "C#m7/G#" com baixo', () => {
    const c = parseChord('C#m7/G#')
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
    expect(c.quality).toBe('m7')
    expect(c.bass.root).toBe('G')
    expect(c.bass.accidental).toBe('#')
  })

  it('parsa "B5(9)" com extensão', () => {
    const c = parseChord('B5(9)')
    expect(c.root).toBe('B')
    expect(c.quality).toBe('5')
    expect(c.extension).toBe('(9)')
  })

  it('parsa "Cmaj7"', () => {
    const c = parseChord('Cmaj7')
    expect(c.root).toBe('C')
    expect(c.quality).toBe('maj7')
  })

  it('lança erro em input inválido', () => {
    assertThrows(() => parseChord('X#m7'))
    assertThrows(() => parseChord(''))
    assertThrows(() => parseChord('123'))
  })
})

describe('formatChord', () => {
  it('serializa roundtrip "C#m7/G#"', () => {
    const c = parseChord('C#m7/G#')
    expect(formatChord(c)).toBe('C#m7/G#')
  })

  it('serializa "Cmaj7"', () => {
    expect(formatChord(parseChord('Cmaj7'))).toBe('Cmaj7')
  })

  it('serializa "B5(9)"', () => {
    expect(formatChord(parseChord('B5(9)'))).toBe('B5(9)')
  })
})

describe('transposeChord', () => {
  it('transpõe C +1 → C#', () => {
    const c = transposeChord(parseChord('C'), 1)
    expect(c.root).toBe('C')
    expect(c.accidental).toBe('#')
  })

  it('transpõe B +1 → C (wraparound)', () => {
    const c = transposeChord(parseChord('B'), 1)
    expect(c.root).toBe('C')
    expect(c.accidental).toBeUndefined()
  })

  it('transpõe C -1 → B (wraparound negativo)', () => {
    const c = transposeChord(parseChord('C'), -1)
    expect(c.root).toBe('B')
  })

  it('transpõe C#m7/G# +1 → Dm7/A (spec example)', () => {
    const original = parseChord('C#m7/G#')
    const result = transposeChord(original, 1)
    expect(result.root).toBe('D')
    expect(result.accidental).toBeUndefined()
    expect(result.quality).toBe('m7')
    expect(result.bass.root).toBe('A')
    expect(result.bass.accidental).toBeUndefined()
  })

  it('preserva quality e extension na transposição', () => {
    const c = transposeChord(parseChord('B5(9)'), 2)
    expect(c.quality).toBe('5')
    expect(c.extension).toBe('(9)')
  })

  it('transpõe steps negativos: Am -2 → Gm', () => {
    const c = transposeChord(parseChord('Am'), -2)
    expect(c.root).toBe('G')
    expect(c.quality).toBe('m')
  })
})

describe('transposeLine', () => {
  it('transpõe todos os acordes de uma linha', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'C')
    line = addChordFromString(line, 5, 'Am')
    const transposed = transposeLine(line, 2)
    expect(formatChord(transposed.chords[0].chord)).toBe('D')
    expect(formatChord(transposed.chords[1].chord)).toBe('Bm')
  })

  it('não altera os índices na transposição', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'C')
    line = addChordFromString(line, 5, 'Am')
    const transposed = transposeLine(line, 3)
    expect(transposed.chords[0].index).toBe(0)
    expect(transposed.chords[1].index).toBe(5)
  })

  it('não muta a linha original', () => {
    let line = createLine('abc')
    line = addChordFromString(line, 0, 'C')
    transposeLine(line, 1)
    expect(formatChord(line.chords[0].chord)).toBe('C')
  })
})

describe('addChord / removeChord / updateChord (V2)', () => {
  it('adiciona acorde como objeto Chord', () => {
    const line = createLine('Hoje eu preciso')
    const updated = addChord(line, 0, parseChord('E'))
    expect(updated.chords).toHaveLength(1)
    expect(updated.chords[0].index).toBe(0)
    expect(updated.chords[0].chord.root).toBe('E')
  })

  it('impede duplicidade no mesmo index', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'E')
    assertThrows(() => addChordFromString(line, 0, 'G'))
  })

  it('remove acorde', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'E')
    line = removeChord(line, 0)
    expect(line.chords).toHaveLength(0)
  })

  it('atualiza acorde', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'E')
    line = updateChord(line, 0, parseChord('Am'))
    expect(formatChord(line.chords[0].chord)).toBe('Am')
  })
})

describe('renderLine (V2)', () => {
  it('renderiza linha com acordes estruturados', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'E')
    line = addChordFromString(line, 6, 'Am')
    const out = renderLine(line)
    expect(out.lyrics).toBe('Hoje eu preciso')
    expect(out.chords).toHaveLength(2)
    expect(out.chords[0].index).toBe(0)
    expect(out.chords[0].chord.root).toBe('E')
    expect(out.chords[1].index).toBe(6)
    expect(out.chords[1].chord.root).toBe('A')
  })
})

describe('splitLineForRender', () => {
  it('retorna chunk único se letra cabe no container', () => {
    const line = createLine('abc')
    const chunks = splitLineForRender(line, 500)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].startIndex).toBe(0)
    expect(chunks[0].text).toBe('abc')
  })

  it('divide em múltiplos chunks', () => {
    const line = createLine('Olha que coisa mais linda mais cheia de graca')
    // 10 chars per chunk (charWidth = 10, containerWidth = 100)
    const chunks = splitLineForRender(line, 100, 10)
    expect(chunks.length > 1).toBe(true)
  })

  it('mantém startIndex correto em cada chunk', () => {
    const line = createLine('ab cd ef gh')
    const chunks = splitLineForRender(line, 30, 10) // ~3 chars per chunk
    let pos = 0
    for (const chunk of chunks) {
      expect(chunk.startIndex).toBe(pos)
      pos += chunk.text.length
    }
    expect(pos).toBe(line.lyrics.length)
  })

  it('retorna chunk vazio para letra vazia', () => {
    const line = createLine('')
    const chunks = splitLineForRender(line, 400)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].text).toBe('')
  })
})

describe('chordsForChunk', () => {
  it('filtra acordes pelo range do chunk', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 0, 'C')
    line = addChordFromString(line, 8, 'Am')
    const chunk = { text: 'Hoje eu ', startIndex: 0 }
    const result = chordsForChunk(line.chords, chunk)
    expect(result).toHaveLength(1)
    expect(result[0].absoluteIndex).toBe(0)
    expect(result[0].relativeIndex).toBe(0)
  })

  it('calcula relativeIndex = absoluteIndex - startIndex', () => {
    let line = createLine('Hoje eu preciso')
    line = addChordFromString(line, 8, 'Am')
    const chunk = { text: 'eu preciso', startIndex: 5 }
    const result = chordsForChunk(line.chords, chunk)
    expect(result).toHaveLength(1)
    expect(result[0].relativeIndex).toBe(3) // 8 - 5
    expect(result[0].absoluteIndex).toBe(8)
  })

  it('não inclui acordes fora do range', () => {
    let line = createLine('Hoje eu preciso amigo')
    line = addChordFromString(line, 16, 'G')
    const chunk = { text: 'Hoje eu ', startIndex: 0 }
    const result = chordsForChunk(line.chords, chunk)
    expect(result).toHaveLength(0)
  })
})

// ── Resultado ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`Resultado: ${passed} passaram, ${failed} falharam`)
if (failed > 0) process.exit(1)
