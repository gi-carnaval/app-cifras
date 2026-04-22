import type { RepertoireRepository } from "@/domain/repositories/repertoire.repository"

export function getRepertoireByIdUseCase(repo: RepertoireRepository) {
  return async (id: string) => {
    if (!id.trim()) return null

    return repo.getById(id)
  }
}
