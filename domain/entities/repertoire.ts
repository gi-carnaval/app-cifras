import type { Chord } from "@/types"

export type Repertoire = {
  id: string
  name: string
  date: string
  ownerId: string
  description: string
  currentIndex: number
  isArchived: boolean
  createdAt?: string
  updatedAt?: string
}

export type RepertoireItem = {
  id: string
  repertoireId: string
  songId: string
  position: number
  customKey: Chord | null
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type RepertoireMember = {
  id: string
  repertoireId: string
  userId: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export function sortRepertoireItemsByPosition(items: RepertoireItem[]) {
  return [...items].sort((firstItem, secondItem) => firstItem.position - secondItem.position)
}

export function hasSongInRepertoire(items: RepertoireItem[], songId: string) {
  return items.some((item) => item.songId === songId)
}

export function getNextRepertoireItemPosition(items: RepertoireItem[]) {
  if (items.length === 0) return 0

  return Math.max(...items.map((item) => item.position)) + 1
}
