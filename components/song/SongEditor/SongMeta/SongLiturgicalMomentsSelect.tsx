'use client'

import { useMemo, useState } from 'react'
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
import type { LiturgicalMoment } from '@/domain/entities/liturgicalMoment'

interface SongLiturgicalMomentsSelectProps {
  selectedMomentIds: string[]
  onChangeMomentIds: (momentIds: string[]) => void
  liturgicalMoments: LiturgicalMoment[]
  isLoading: boolean
  error: string | null
}

export default function SongLiturgicalMomentsSelect({
  selectedMomentIds,
  onChangeMomentIds,
  liturgicalMoments,
  isLoading,
  error,
}: SongLiturgicalMomentsSelectProps) {
  const [inputValue, setInputValue] = useState('')

  const normalizedInput = inputValue.trim().toLocaleLowerCase()
  const liturgicalMomentIds = liturgicalMoments.map((moment) => moment.id)

  const selectedMoments = selectedMomentIds
    .map((momentId) => liturgicalMoments.find((moment) => moment.id === momentId))
    .filter((moment): moment is LiturgicalMoment => Boolean(moment))

  const filteredLiturgicalMomentIds = useMemo(() => {
    if (!normalizedInput) return liturgicalMomentIds

    return liturgicalMoments
      .filter((moment) => moment.name.toLocaleLowerCase().includes(normalizedInput))
      .map((moment) => moment.id)
  }, [liturgicalMomentIds, liturgicalMoments, normalizedInput])

  function getMomentName(momentId: string) {
    return liturgicalMoments.find((moment) => moment.id === momentId)?.name ?? ''
  }

  function getSelectedMomentsLabel() {
    if (selectedMoments.length === 0) return 'Selecionar momentos'

    return selectedMoments.map((moment) => moment.name).join(', ')
  }

  function removeMoment(momentId: string) {
    onChangeMomentIds(selectedMomentIds.filter((selectedId) => selectedId !== momentId))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor="liturgical-moments-select"
        className="text-sm font-medium text-(--text-muted)"
      >
        Momentos litúrgicos
      </label>

      <Combobox
        multiple
        items={liturgicalMomentIds}
        filteredItems={filteredLiturgicalMomentIds}
        value={selectedMomentIds}
        inputValue={inputValue}
        itemToStringLabel={getMomentName}
        onInputValueChange={setInputValue}
        onValueChange={onChangeMomentIds}
      >
        <ComboboxTrigger
          render={
            <Button
              id="liturgical-moments-select"
              variant="outline"
              className="w-full justify-between overflow-hidden font-normal"
            >
              <span className="truncate text-left">
                <ComboboxValue>
                  {getSelectedMomentsLabel()}
                </ComboboxValue>
              </span>
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput
            showTrigger={false}
            placeholder="Buscar momento litúrgico"
            disabled={isLoading}
          />
          <ComboboxEmpty>
            {isLoading ? 'Carregando momentos litúrgicos...' : 'Nenhum momento litúrgico encontrado'}
          </ComboboxEmpty>
          <ComboboxList>
            {(itemValue) => (
              <ComboboxItem key={itemValue} value={itemValue}>
                {getMomentName(itemValue)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selectedMoments.length > 0 && (
        <div className="flex max-w-full flex-wrap gap-2">
          {selectedMoments.map((moment) => (
            <span
              key={moment.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-(--surface) px-2 py-1 text-xs text-(--text)"
            >
              {moment.name}
              <button
                type="button"
                className="text-(--text-muted) hover:text-(--danger)"
                aria-label={`Remover momento litúrgico ${moment.name}`}
                onClick={() => removeMoment(moment.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-(--danger)">{error}</p>}

      <p className="text-xs text-(--text-dim)">
        Campo exibido apenas para músicas da categoria missa.
      </p>
    </div>
  )
}
