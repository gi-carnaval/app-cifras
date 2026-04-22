export interface PocketbaseRepertoireDTO {
  collectionId?: string
  collectionName?: string
  id: string
  name: string
  date: string
  owner: string
  description: string
  current_index: number
  is_archived: boolean
  created?: string
  updated?: string
}

export interface PocketbaseRepertoireItemDTO {
  collectionId?: string
  collectionName?: string
  id: string
  repertoire: string
  song: string
  position: number
  custom_key: string
  notes: string
  created?: string
  updated?: string
}

export interface PocketbaseRepertoireMemberDTO {
  collectionId?: string
  collectionName?: string
  id: string
  repertoire: string
  user: string
  role: string
  created?: string
  updated?: string
}
