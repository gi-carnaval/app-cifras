import { Category } from "./category"

export type LiturgicalMoment = {
  id: string
  name: string
  slug: string
  order: number
}

export function isMissaCategory(category: Category) {
  const slug = category.slug.trim().toLowerCase()
  const name = category.name.trim().toLowerCase()

  return slug === 'missa' || name === 'missa' || category.id == "0jy5h3z177ng3yk"
}

export function hasMissaCategory(categories: Category[]) {
  return categories.some(isMissaCategory)
}

export function getLiturgicalMomentIds(liturgicalMoments: LiturgicalMoment[]) {
  return Array.from(
    new Set(
      liturgicalMoments
        .map((liturgicalMoment) => liturgicalMoment.id)
        .filter(Boolean)
    )
  )
}

export function getUniqueLiturgicalMoments(liturgicalMoments: LiturgicalMoment[]) {
  return liturgicalMoments.filter(
    (liturgicalMoment, index, currentLiturgicalMoments) =>
      currentLiturgicalMoments.findIndex(
        (currentLiturgicalMoment) => currentLiturgicalMoment.id === liturgicalMoment.id
      ) === index
  )
}

export function validateLiturgicalMoments(
  shouldShowLiturgicalMoments: boolean,
  liturgicalMomentIds: string[]
) {
  if (!shouldShowLiturgicalMoments || liturgicalMomentIds.length > 0) {
    return null
  }

  return 'Selecione ao menos um momento litúrgico.'
}