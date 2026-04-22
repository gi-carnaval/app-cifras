import {
  getNextRepertoireItemPosition,
  hasSongInRepertoire,
  type RepertoireItem,
} from "@/domain/entities/repertoire"
import type {
  NewRepertoireItem,
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { requireRepertoireAccess } from "./repertoire-access"

export type AddSongToRepertoireInput = {
  repertoireId: string
  songId: string
  userId: string
}

export type AddSongToRepertoireResult =
  | {
      status: "added"
      item: RepertoireItem
      message: string
    }
  | {
      status: "duplicate"
      message: string
    }

export function addSongToRepertoireUseCase(
  repertoireRepo: RepertoireRepository,
  itemRepo: RepertoireItemRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: AddSongToRepertoireInput): Promise<AddSongToRepertoireResult> => {
    const repertoireId = input.repertoireId.trim()
    const songId = input.songId.trim()
    const userId = input.userId.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!songId) {
      throw new Error("Música é obrigatória.")
    }

    if (!userId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    await requireRepertoireAccess(repertoire, userId, memberRepo)

    const currentItems = await itemRepo.getByRepertoireId(repertoireId)

    if (hasSongInRepertoire(currentItems, songId)) {
      return {
        status: "duplicate",
        message: "Esta música já está no repertório selecionado.",
      }
    }

    const item: NewRepertoireItem = {
      repertoireId,
      songId,
      position: getNextRepertoireItemPosition(currentItems),
      customKey: null,
      notes: "",
    }

    const createdItem = await itemRepo.add(item)

    return {
      status: "added",
      item: createdItem,
      message: "Música adicionada ao repertório.",
    }
  }
}
