'use client'

import { useMemo, useState } from 'react'
import { Artist } from '@/domain/entities/artist'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'

const CREATE_ARTIST_VALUE = '__create_artist__'

interface SongArtistSelectProps {
  selectedArtistId: string | null
  onChangeArtist: (id: string) => void
  artists: Artist[]
  isLoading: boolean
  isCreating: boolean
  error: string | null
  createError: string | null
  createArtist: (name: string) => Promise<Artist | null>
}

function normalizeArtistName(name: string) {
  return name.trim().toLocaleLowerCase()
}

export default function SongArtistSelect({
  selectedArtistId,
  onChangeArtist,
  artists,
  isLoading,
  isCreating,
  error,
  createError,
  createArtist,
}: SongArtistSelectProps) {
  const [inputValue, setInputValue] = useState('')

  const trimmedInput = inputValue.trim()
  const normalizedInput = normalizeArtistName(trimmedInput)
  const exactArtist = artists.find(
    (artist) => normalizeArtistName(artist.name) === normalizedInput
  )

  const filteredArtistIds = useMemo(() => {
    if (!normalizedInput) return artists.map((artist) => artist.id)

    return artists
      .filter((artist) => normalizeArtistName(artist.name).includes(normalizedInput))
      .map((artist) => artist.id)
  }, [artists, normalizedInput])

  const shouldShowCreateOption = Boolean(trimmedInput) && !exactArtist && !isLoading
  const comboboxItems = shouldShowCreateOption
    ? [...filteredArtistIds, CREATE_ARTIST_VALUE]
    : filteredArtistIds

  const artistIds = artists.map((artist) => artist.id)
  const getArtistName = (artistId: string) =>
    artists.find((artist) => artist.id === artistId)?.name ?? ''
  const getItemLabel = (itemValue: string) =>
    itemValue === CREATE_ARTIST_VALUE ? `Criar artista "${trimmedInput}"` : getArtistName(itemValue)

  async function handleValueChange(itemValue: string | null) {
    if (!itemValue) return

    if (itemValue !== CREATE_ARTIST_VALUE) {
      onChangeArtist(itemValue)
      return
    }

    const artist = exactArtist ?? await createArtist(trimmedInput)
    if (!artist) return

    onChangeArtist(artist.id)
    setInputValue('')
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor="artist-select"
        className="text-sm font-medium text-(--text-muted)"
      >
        Artista
      </label>
      <Combobox
        items={artistIds}
        filteredItems={comboboxItems}
        value={selectedArtistId}
        inputValue={inputValue}
        itemToStringLabel={getItemLabel}
        onInputValueChange={setInputValue}
        onValueChange={handleValueChange}
      >
        <ComboboxTrigger render={<Button variant="outline" className="w-64 justify-between font-normal"><ComboboxValue /></Button>} />
        <ComboboxContent>
          <ComboboxInput showTrigger={false} placeholder="Buscar artista" disabled={isLoading || isCreating} />
          <ComboboxEmpty>{isLoading ? 'Carregando artistas...' : error ?? 'Nenhum artista encontrado'}</ComboboxEmpty>
          <ComboboxList>
            {(itemValue) => (
              <ComboboxItem
                key={itemValue}
                value={itemValue}
                className={itemValue === CREATE_ARTIST_VALUE ? 'border-t border-border text-accent' : undefined}
              >
                {getItemLabel(itemValue)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {createError && <p className="text-sm text-(--danger)">{createError}</p>}

      <p className="text-xs text-(--text-dim)">
        Selecione um artista existente ou cadastre um novo.
      </p>
    </div >
  )
}
