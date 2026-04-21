'use client'

import type { Column } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span>{title}</span>
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 text-(--text-muted)"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span>{title}</span>
      <span aria-hidden="true">
        {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}
      </span>
    </Button>
  )
}
