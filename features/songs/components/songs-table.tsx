'use client'

import { DataTable } from '@/components/data-table/data-table'
import type { SongRow } from '../types/song-row'
import { songsColumns } from './songs-columns'

interface SongsTableProps {
  songs: SongRow[]
}

export function SongsTable({ songs }: SongsTableProps) {
  return (
    <DataTable
      columns={songsColumns}
      data={songs}
      emptyMessage="Nenhuma música encontrada."
      toolbarContent={(
        <>
          <p className="text-sm text-(--text-muted)">
            {songs.length} {songs.length === 1 ? 'música' : 'músicas'}
          </p>
        </>
      )}
    />
  )
}
