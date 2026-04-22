import Link from 'next/link'

import { toSongActionTarget } from '../types/song-action-target'
import type { SongRow } from '../types/song-row'
import { SongRowActions } from './song-row-actions'

interface SongsMobileListProps {
  songs: SongRow[]
}

function getVisibleCategories(categories: string[]) {
  return {
    visibleCategories: categories.slice(0, 2),
    hiddenCount: Math.max(categories.length - 2, 0),
  }
}

export function SongsMobileList({ songs }: SongsMobileListProps) {
  if (songs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-(--bg2) px-4 py-10 text-center text-sm text-(--text-muted)">
        Nenhuma música encontrada.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-sm text-(--text-muted)">
        {songs.length} {songs.length === 1 ? 'música' : 'músicas'}
      </p>

      <div className="flex flex-col gap-3">
        {songs.map((song) => {
          const { visibleCategories, hiddenCount } = getVisibleCategories(song.categories)

          return (
            <article
              key={song.id}
              className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/song/${song.id}`}
                    className="block truncate text-base font-semibold leading-tight text-(--text) hover:text-(--accent2)"
                  >
                    {song.title}
                  </Link>
                  <p className="mt-1 truncate text-sm text-(--text-muted)">
                    {song.artistName}
                  </p>
                </div>
                <SongRowActions song={toSongActionTarget(song)} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--bg) px-2.5 text-xs font-semibold text-accent">
                  Tom {song.defaultKey || '-'}
                </span>
                {visibleCategories.length > 0 ? (
                  visibleCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs text-(--text-muted)"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs text-(--text-muted)">
                    Sem categoria
                  </span>
                )}
                {hiddenCount > 0 && (
                  <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs text-(--text-muted)">
                    +{hiddenCount}
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
