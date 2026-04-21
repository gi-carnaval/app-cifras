import { LiturgicalMomentRepository } from "@/domain/repositories/liturgicalMoment.repository"

export function getAllLiturgicalMomentsUseCase(repo: LiturgicalMomentRepository) {
  return async () => {
    return repo.getAll()
  }
}
