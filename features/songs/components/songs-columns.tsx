'use client'

import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import type { SongRow } from '../types/song-row'
import { SongRowActions } from './song-row-actions'

export const songsColumns: ColumnDef<SongRow>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Música" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/song/${row.original.id}`}
        className="font-medium text-(--text) hover:text-(--accent2)"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'artistName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Artista" />
    ),
    cell: ({ row }) => (
      <span className="text-(--text-muted)">{row.original.artistName}</span>
    ),
  },
  {
    accessorKey: 'defaultKey',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tom" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-(--accent)">{row.original.defaultKey}</span>
    ),
  },
  {
    accessorKey: 'categoriesLabel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categorias" />
    ),
    cell: ({ row }) => (
      <span className="text-(--text-muted)">{row.original.categoriesLabel}</span>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DataTableRowActions>
        <SongRowActions
          songId={row.original.id}
          songTitle={row.original.title}
        />
      </DataTableRowActions>
    ),
  },
]
