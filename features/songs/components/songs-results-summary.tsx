type SongsResultsSummaryProps = {
  songsCount: number
  search: string
  artistName: string
  categoryNames: string[]
}

function getSongsCountLabel(songsCount: number) {
  return songsCount === 1 ? '1 música encontrada' : `${songsCount} músicas encontradas`
}

type SummaryChip = {
  id: string
  label: string
}

function buildSummaryChips(search: string, artistName: string, categoryNames: string[]) {
  const chips: SummaryChip[] = []

  if (search) {
    chips.push({
      id: 'search',
      label: `Busca: ${search}`,
    })
  }

  if (artistName) {
    chips.push({
      id: 'artist',
      label: `Artista: ${artistName}`,
    })
  }

  categoryNames.forEach((categoryName) => {
    chips.push({
      id: `category:${categoryName}`,
      label: `Categoria: ${categoryName}`,
    })
  })

  return chips
}

export function SongsResultsSummary({
  songsCount,
  search,
  artistName,
  categoryNames,
}: SongsResultsSummaryProps) {
  const activeChips = buildSummaryChips(search, artistName, categoryNames)

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-(--bg2) px-4 py-3 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-(--text)">{getSongsCountLabel(songsCount)}</p>
          <p className="text-sm text-(--text-muted)">
            {activeChips.length > 0
              ? 'Filtros ativos aplicados à coleção.'
              : 'Mostrando toda a coleção de músicas.'}
          </p>
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex min-h-7 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-(--text-muted)"
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
