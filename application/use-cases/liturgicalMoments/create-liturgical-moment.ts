import type { CategoryRepository } from "@/domain/repositories/category.repository"
import { LiturgicalMomentRepository } from "@/domain/repositories/liturgicalMoment.repository"

function normalizeLiturgicalMomentName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function slugifyLiturgicalMomentName(name: string) {
  return normalizeLiturgicalMomentName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createLiturgicalMomentUseCase(repo: LiturgicalMomentRepository) {
  return async (name: string, order: number) => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error("Nome do momento litúrgico é obrigatório.")
    }

    const liturgicalMoment = await repo.getAll()
    const existingLiturgicalMoment = liturgicalMoment.find(
      (liturgicalMoment) => normalizeLiturgicalMomentName(liturgicalMoment.name) === normalizeLiturgicalMomentName(trimmedName)
    )

    if (existingLiturgicalMoment) {
      return existingLiturgicalMoment
    }

    return repo.save({
      id: "",
      name: trimmedName,
      slug: slugifyLiturgicalMomentName(trimmedName),
      order: order
    })
  }
}
