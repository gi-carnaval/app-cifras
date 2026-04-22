import { parseChord } from "@/core/chord-engine"
import { hasSongInRepertoire } from "@/domain/entities/repertoire"
import type {
  NewRepertoireItem,
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type AddRepertoireItemInput = {
  repertoireId: string
  songId: string
  ownerId: string
  position: number
  customKey?: string
  notes?: string
}

function toCustomKey(value?: string) {
  const customKey = value?.trim()

  if (!customKey) return null

  try {
    return parseChord(customKey)
  } catch {
    throw new Error("Tom personalizado inválido.")
  }
}

export function addRepertoireItemUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: AddRepertoireItemInput) => {
    const repertoireId = input.repertoireId.trim()
    const songId = input.songId.trim()
    const ownerId = input.ownerId.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!ownerId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    if (!songId) {
      throw new Error("Música é obrigatória.")
    }

    if (!Number.isInteger(input.position) || input.position < 0) {
      throw new Error("Posição do item é obrigatória.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, ownerId, memberRepo)

    const currentItems = await itemRepo.getByRepertoireId(repertoireId)

    if (hasSongInRepertoire(currentItems, songId)) {
      throw new Error("Esta música já está no repertório.")
    }

    const item: NewRepertoireItem = {
      repertoireId,
      songId,
      position: input.position,
      customKey: toCustomKey(input.customKey),
      notes: input.notes?.trim() ?? "",
    }

    return itemRepo.add(item)
  }
}
