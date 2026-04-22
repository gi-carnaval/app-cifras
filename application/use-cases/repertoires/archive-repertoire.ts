import type { RepertoireRepository } from "@/domain/repositories/repertoire.repository"

export function archiveRepertoireUseCase(repo: RepertoireRepository) {
  return async (id: string) => {
    const repertoireId = id.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    return repo.archive(repertoireId)
  }
}
