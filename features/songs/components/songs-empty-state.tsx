import Link from 'next/link'

import { Button } from '@/components/ui/button'

type SongsEmptyStateProps = {
  clearFiltersHref: string
  search?: string
  artistName?: string
  categoryNames?: string[]
}

function buildReasonLabel({
  search,
  artistName,
  categoryNames,
}: Omit<SongsEmptyStateProps, 'clearFiltersHref'>) {
  const reasons = [
    search ? `busca "${search}"` : '',
    artistName ? `artista "${artistName}"` : '',
    ...(categoryNames ?? []).map((categoryName) => `categoria "${categoryName}"`),
  ].filter(Boolean)

  if (reasons.length === 0) return null

  return reasons.join(', ')
}

export function SongsEmptyState({
  clearFiltersHref,
  search = '',
  artistName = '',
  categoryNames = [],
}: SongsEmptyStateProps) {
  const reasonLabel = buildReasonLabel({
    search,
    artistName,
    categoryNames,
  })

  return (
    <div className="rounded-xl border border-dashed border-border bg-(--bg2) px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-(--text)">Nenhuma m&uacute;sica encontrada</h2>
      <p className="mt-2 text-sm text-(--text-muted)">
        {reasonLabel
          ? `Nenhum resultado encontrado para ${reasonLabel}.`
          : 'Ajuste a busca ou remova filtros para voltar a ver a cole&ccedil;&atilde;o completa.'}
      </p>
      <div className="mt-5 flex justify-center">
        <Button asChild variant="outline">
          <Link href={clearFiltersHref}>Limpar filtros</Link>
        </Button>
      </div>
    </div>
  )
}
