import { Line, Section, Song } from '@/domain/entities/song'
import { generateId } from './chord-engine'

export function createEmptySong(): Song {
  return {
    id: generateId(),
    title: '',
    artist: {
      id: '',
      name: '',
      slug: '',
    },
    categories: [],
    liturgicalMoments: [],
    defaultKey: { root: 'C' },
    cifraPDF: '',
    sections: [
      {
        id: generateId(),
        name: 'Verso',
        lines: [{ id: generateId(), lyrics: '', chords: [] }],
      },
    ],
  }
}

export function createEmptySection(): Section {
  return {
    id: generateId(),
    name: 'Novo Trecho',
    lines: [{ id: generateId(), lyrics: '', chords: [] }],
  }
}

export function createEmptyLine(): Line {
  return { id: generateId(), lyrics: '', chords: [] }
}
