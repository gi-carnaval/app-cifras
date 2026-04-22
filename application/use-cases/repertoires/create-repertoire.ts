import type { Repertoire } from "@/domain/entities/repertoire"
import type { RepertoireRepository } from "@/domain/repositories/repertoire.repository"

export type CreateRepertoireInput = {
  name: string
  date: string
  ownerId: string
  description?: string
}

export function createRepertoireUseCase(repo: RepertoireRepository) {
  return async (input: CreateRepertoireInput) => {
    const name = input.name.trim()
    const date = input.date.trim()
    const ownerId = input.ownerId.trim()

    if (!name) {
      throw new Error("Nome do repertório é obrigatório.")
    }

    if (!date) {
      throw new Error("Data do repertório é obrigatória.")
    }

    if (!ownerId) {
      throw new Error("Responsável pelo repertório é obrigatório.")
    }

    const repertoire: Repertoire = {
      id: "",
      name,
      date,
      ownerId,
      description: input.description?.trim() ?? "",
      currentIndex: 0,
      isArchived: false,
    }

    return repo.save(repertoire)
  }
}
