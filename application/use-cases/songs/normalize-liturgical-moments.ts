import { getLiturgicalMomentIds, getUniqueLiturgicalMoments, type LiturgicalMoment } from '@/domain/entities/liturgicalMoment'


export function normalizeLiturgicalMomentsWithOptions(
  selectedLiturgicalMoments: LiturgicalMoment[],
  liturgicalMomentOptions: LiturgicalMoment[]
) {
  const selectedIds = getLiturgicalMomentIds(selectedLiturgicalMoments)

  return selectedIds
    .map((selectedId) => {
      return (
        liturgicalMomentOptions.find((liturgicalMoment) => liturgicalMoment.id === selectedId) ??
        selectedLiturgicalMoments.find((liturgicalMoment) => liturgicalMoment.id === selectedId)
      )
    })
    .filter((liturgicalMoment): liturgicalMoment is LiturgicalMoment => Boolean(liturgicalMoment))
}

export function buildLiturgicalMomentOptions(
  loadedOptions: LiturgicalMoment[],
  selectedLiturgicalMoments: LiturgicalMoment[]
) {
  return getUniqueLiturgicalMoments([...loadedOptions, ...selectedLiturgicalMoments])
}