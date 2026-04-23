'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'

type FilterOption = {
  id: string
  name: string
}

type SongsFiltersProps = {
  artists: FilterOption[]
  categories: FilterOption[]
  initialSearch: string
  initialArtistId: string
  initialCategoryIds: string[]
}

const ALL_ARTISTS_VALUE = '__all_artists__'

function normalizeSearchValue(value: string) {
  return value.trim()
}

function sortCategoryIds(categoryIds: string[]) {
  return [...categoryIds].sort((first, second) => first.localeCompare(second))
}

function getActiveFiltersCount(search: string, artistId: string, categoryIds: string[]) {
  return [search ? 1 : 0, artistId ? 1 : 0, categoryIds.length].reduce(
    (total, value) => total + value,
    0
  )
}

export function SongsFilters({
  artists,
  categories,
  initialSearch,
  initialArtistId,
  initialCategoryIds,
}: SongsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [artistInput, setArtistInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')

  const selectedArtistValue = initialArtistId || ALL_ARTISTS_VALUE
  const selectedCategories = initialCategoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is FilterOption => Boolean(category))
  const activeFiltersCount = getActiveFiltersCount(initialSearch, initialArtistId, initialCategoryIds)
  const artistItems = useMemo(
    () => [ALL_ARTISTS_VALUE, ...artists.map((artist) => artist.id)],
    [artists]
  )
  const categoryItems = useMemo(
    () => categories.map((category) => category.id),
    [categories]
  )

  useEffect(() => {
    setSearchInput(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      replaceParams({
        search: normalizeSearchValue(searchInput),
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  function replaceParams(nextValues: {
    search?: string
    artistId?: string
    categoryIds?: string[]
  }) {
    const params = new URLSearchParams(searchParams.toString())
    const nextSearch = nextValues.search ?? (searchParams.get('q') ?? '')
    const nextArtistId = nextValues.artistId ?? (searchParams.get('artist') ?? '')
    const nextCategoryIds = sortCategoryIds(
      nextValues.categoryIds
      ?? searchParams.getAll('category')
    )

    if (nextSearch) {
      params.set('q', nextSearch)
    } else {
      params.delete('q')
    }

    if (nextArtistId) {
      params.set('artist', nextArtistId)
    } else {
      params.delete('artist')
    }

    params.delete('category')
    nextCategoryIds.forEach((categoryId) => {
      params.append('category', categoryId)
    })

    const nextQueryString = params.toString()
    const nextHref = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
    const currentHref = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

    if (nextHref === currentHref) return

    router.replace(nextHref, { scroll: false })
  }

  function handleArtistChange(nextArtistId: string | null) {
    const artistId = nextArtistId === ALL_ARTISTS_VALUE ? '' : (nextArtistId ?? '')

    replaceParams({
      search: normalizeSearchValue(searchInput),
      artistId,
    })
  }

  function handleCategoriesChange(nextCategoryIds: string[]) {
    replaceParams({
      search: normalizeSearchValue(searchInput),
      categoryIds: nextCategoryIds,
    })
  }

  function clearFilters() {
    setSearchInput('')
    router.replace(pathname, { scroll: false })
  }

  function getArtistLabel(itemValue: string) {
    if (itemValue === ALL_ARTISTS_VALUE) return 'Todos os artistas'

    return artists.find((artist) => artist.id === itemValue)?.name ?? ''
  }

  function getCategoryLabel(categoryId: string) {
    return categories.find((category) => category.id === categoryId)?.name ?? ''
  }

  return (
    <section className="rounded-xl border border-border bg-(--bg2) p-4 shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-(--text)">Buscar e filtrar</h2>
            <p className="text-sm text-(--text-muted)">
              Pesquise por t&iacute;tulo ou por trechos da letra, e refine por artista ou categoria.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-(--text-muted)">
              {activeFiltersCount === 0
                ? 'Sem filtros ativos'
                : `${activeFiltersCount} ${activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}`}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(14rem,1fr)_minmax(16rem,1.1fr)] lg:items-start">
          <div className="flex flex-col gap-2">
            <label htmlFor="songs-search" className="text-sm font-medium text-(--text-muted)">
              Busca
            </label>
            <Input
              id="songs-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por t&iacute;tulo ou trecho da letra"
            />
            <p className="text-xs text-(--text-dim)">
              A busca &eacute; atualizada automaticamente.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-(--text-muted)">
              Artista
            </label>
            <Combobox
              items={artistItems}
              value={selectedArtistValue}
              inputValue={artistInput}
              itemToStringLabel={getArtistLabel}
              onInputValueChange={setArtistInput}
              onValueChange={handleArtistChange}
            >
              <ComboboxTrigger
                render={(
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <ComboboxValue />
                  </Button>
                )}
              />
              <ComboboxContent>
                <ComboboxInput showTrigger={false} placeholder="Buscar artista" />
                <ComboboxEmpty>Nenhum artista encontrado</ComboboxEmpty>
                <ComboboxList>
                  {(itemValue) => (
                    <ComboboxItem key={itemValue} value={itemValue}>
                      {getArtistLabel(itemValue)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-(--text-muted)">
              Categorias
            </label>
            <Combobox
              multiple
              items={categoryItems}
              value={initialCategoryIds}
              inputValue={categoryInput}
              itemToStringLabel={getCategoryLabel}
              onInputValueChange={setCategoryInput}
              onValueChange={handleCategoriesChange}
            >
              <ComboboxTrigger
                render={(
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <ComboboxValue placeholder="Todas as categorias" />
                  </Button>
                )}
              />
              <ComboboxContent>
                <ComboboxInput showTrigger={false} placeholder="Buscar categoria" />
                <ComboboxEmpty>Nenhuma categoria encontrada</ComboboxEmpty>
                <ComboboxList>
                  {(itemValue) => (
                    <ComboboxItem key={itemValue} value={itemValue}>
                      {getCategoryLabel(itemValue)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {selectedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoriesChange(
                      initialCategoryIds.filter((categoryId) => categoryId !== category.id)
                    )}
                    className="inline-flex min-h-7 items-center gap-1 rounded-md border border-border bg-(--surface) px-2.5 text-xs text-(--text-muted) hover:text-(--text)"
                  >
                    {category.name}
                    <span aria-hidden="true">&times;</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
