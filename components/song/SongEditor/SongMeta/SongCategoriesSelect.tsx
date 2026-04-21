'use client'

import { useMemo, useState } from 'react'
import type { Category } from '@/domain/entities/category'
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
import { Button } from '@/components/ui/button'

const CREATE_CATEGORY_VALUE = '__create_category__'

interface SongCategoriesSelectProps {
  selectedCategoryIds: string[]
  onChangeCategories: (categoryIds: string[]) => void
  categories: Category[]
  isLoading: boolean
  isCreating: boolean
  error: string | null
  createError: string | null
  createCategory: (name: string) => Promise<Category | null>
}

function normalizeCategoryName(name: string) {
  return name.trim().toLocaleLowerCase()
}

function uniqueCategoryIds(categoryIds: string[]) {
  return Array.from(new Set(categoryIds.filter((categoryId) => categoryId !== CREATE_CATEGORY_VALUE)))
}

export default function SongCategoriesSelect({
  selectedCategoryIds,
  onChangeCategories,
  categories,
  isLoading,
  isCreating,
  error,
  createError,
  createCategory,
}: SongCategoriesSelectProps) {
  const [inputValue, setInputValue] = useState('')

  const trimmedInput = inputValue.trim()
  const normalizedInput = normalizeCategoryName(trimmedInput)
  const exactCategory = categories.find(
    (category) => normalizeCategoryName(category.name) === normalizedInput
  )

  const filteredCategoryIds = useMemo(() => {
    if (!normalizedInput) return categories.map((category) => category.id)

    return categories
      .filter((category) => normalizeCategoryName(category.name).includes(normalizedInput))
      .map((category) => category.id)
  }, [categories, normalizedInput])

  const shouldShowCreateOption = Boolean(trimmedInput) && !exactCategory && !isLoading
  const comboboxItems = shouldShowCreateOption
    ? [...filteredCategoryIds, CREATE_CATEGORY_VALUE]
    : filteredCategoryIds

  const categoryIds = categories.map((category) => category.id)
  const selectedCategories = selectedCategoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is Category => Boolean(category))

  const getCategoryName = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.name ?? ''
  const getItemLabel = (itemValue: string) =>
    itemValue === CREATE_CATEGORY_VALUE
      ? `Criar categoria "${trimmedInput}"`
      : getCategoryName(itemValue)

  async function handleValueChange(nextValues: string[]) {
    const selectedCreateOption = nextValues.includes(CREATE_CATEGORY_VALUE)

    if (!selectedCreateOption) {
      onChangeCategories(uniqueCategoryIds(nextValues))
      return
    }

    if (exactCategory) {
      onChangeCategories(uniqueCategoryIds([...selectedCategoryIds, exactCategory.id]))
      setInputValue('')
      return
    }

    const category = await createCategory(trimmedInput)
    if (!category) return

    setInputValue('')
  }

  function removeCategory(categoryId: string) {
    onChangeCategories(selectedCategoryIds.filter((selectedId) => selectedId !== categoryId))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor="categories-select"
        className="text-sm font-medium text-(--text-muted)"
      >
        Categorias
      </label>
      <Combobox
        multiple
        items={categoryIds}
        filteredItems={comboboxItems}
        value={selectedCategoryIds}
        inputValue={inputValue}
        itemToStringLabel={getItemLabel}
        onInputValueChange={setInputValue}
        onValueChange={handleValueChange}
      >
        <ComboboxTrigger render={<Button variant="outline" className="w-full justify-between font-normal"><ComboboxValue placeholder="Selecionar categorias" /></Button>} />
        <ComboboxContent>
          <ComboboxInput showTrigger={false} placeholder="Buscar categoria" disabled={isLoading || isCreating} />
          <ComboboxEmpty>{isLoading ? 'Carregando categorias...' : error ?? 'Nenhuma categoria encontrada'}</ComboboxEmpty>
          <ComboboxList>
            {(itemValue) => (
              <ComboboxItem
                key={itemValue}
                value={itemValue}
                className={itemValue === CREATE_CATEGORY_VALUE ? 'border-t border-border text-accent-foreground' : undefined}
              >
                {getItemLabel(itemValue)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selectedCategories.length > 0 && (
        <div className="flex max-w-full flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-(--surface) px-2 py-1 text-xs text-(--text)"
            >
              {category.name}
              <button
                type="button"
                className="text-(--text-muted) hover:text-(--danger)"
                aria-label={`Remover categoria ${category.name}`}
                onClick={() => removeCategory(category.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {createError && <p className="text-sm text-(--danger)">{createError}</p>}

      {/* <p className="text-xs text-(--text-dim)">
        Selecione uma ou mais categorias existentes ou cadastre uma nova.
      </p> */}
    </div>
  )
}
