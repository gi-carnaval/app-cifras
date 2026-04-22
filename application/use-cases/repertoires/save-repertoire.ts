import type { Repertoire } from "@/domain/entities/repertoire"
import type { RepertoireRepository } from "@/domain/repositories/repertoire.repository"

export function saveRepertoireUseCase(repo: RepertoireRepository) {
  return async (repertoire: Repertoire) => {
    if (!repertoire.name.trim()) {
      throw new Error("Nome do repertório é obrigatório.")
    }

    if (!repertoire.ownerId.trim()) {
      throw new Error("Responsável pelo repertório é obrigatório.")
    }

    return repo.save({
      ...repertoire,
      name: repertoire.name.trim(),
      description: repertoire.description.trim(),
    })
  }
}
