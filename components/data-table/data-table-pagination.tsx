'use client'

import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-(--text-muted)">
        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
