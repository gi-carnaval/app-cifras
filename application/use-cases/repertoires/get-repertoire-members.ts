import type { RepertoireMemberRepository } from "@/domain/repositories/repertoire.repository"

export function getRepertoireMembersUseCase(repo: RepertoireMemberRepository) {
  return async (repertoireId: string) => {
    if (!repertoireId.trim()) return []

    return repo.getByRepertoireId(repertoireId)
  }
}
