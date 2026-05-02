import { generateId } from '@/core/chord-engine'
import type { Section } from '@/domain/entities/song'

function createDuplicatedSectionName(name: string) {
  const trimmedName = name.trim()

  return trimmedName ? `${trimmedName} (cópia)` : 'Novo Trecho (cópia)'
}

export function duplicateSongSection(section: Section): Section {
  return {
    ...section,
    id: generateId(),
    name: createDuplicatedSectionName(section.name),
    lines: section.lines.map((line) => ({
      ...line,
      id: generateId(),
      chords: line.chords.map((chordPlacement) => ({ ...chordPlacement })),
    })),
  }
}
