import type { RepertoireRepository } from "@/domain/repositories/repertoire.repository"

export function getRepertoiresByOwnerUseCase(repo: RepertoireRepository) {
  return async (ownerId: string) => {
    if (!ownerId.trim()) return []

    return repo.getAllByOwner(ownerId)
  }
}
