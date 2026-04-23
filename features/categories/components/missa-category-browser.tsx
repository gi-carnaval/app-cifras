'use client'

import { useState } from 'react'

import type { MissaCategoryGroup } from '@/application/use-cases/categories/get-missa-category-browse'
import type { SongRow } from '@/features/songs/types/song-row'
import { SongsMobileList } from '@/features/songs/components/songs-mobile-list'
import { SongsTable } from '@/features/songs/components/songs-table'

type MissaCategoryBrowserGroup = Omit<MissaCategoryGroup, 'songs'> & {
  songs: SongRow[]
}

type MissaCategoryBrowserProps = {
  groups: MissaCategoryBrowserGroup[]
}

export function MissaCategoryBrowser({ groups }: MissaCategoryBrowserProps) {

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? '')
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null

  if (!selectedGroup) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-(--bg2) px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-(--text)">Nenhum grupo disponível</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Ainda não há músicas de Missa organizadas por momento litúrgico.
        </p>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const isSelected = group.id === selectedGroup.id

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroupId(group.id)}
              className={
                isSelected
                  ? "rounded-2xl border border-(--accent) bg-(--bg3) p-5 text-left shadow-xs"
                  : "rounded-2xl border border-border bg-(--bg2) p-5 text-left shadow-xs transition-transform transition-colors hover:border-(--accent2) hover:bg-(--bg3) hover:-translate-y-0.5"
              }
              aria-pressed={isSelected}
            >
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                      Momento litúrgico
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-(--text)">
                      {group.name}
                    </h2>
                  </div>
                  <span className="inline-flex min-h-7 shrink-0 items-center rounded-full border border-border bg-background px-2.5 text-xs font-medium text-(--accent)">
                    {group.songsCount} {group.songsCount === 1 ? 'música' : 'músicas'}
                  </span>
                </div>
                <p className="text-sm leading-6 text-(--text-muted)">
                  {isSelected ? 'Mostrando músicas deste momento.' : 'Abrir músicas deste momento.'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
        <div className="mb-4 flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-(--text)">
            {selectedGroup.name}
          </h2>
          <p className="text-sm text-(--text-muted)">
            {selectedGroup.songsCount} {selectedGroup.songsCount === 1 ? 'música encontrada' : 'músicas encontradas'} neste grupo.
          </p>
        </div>

        <div className="md:hidden">
          <SongsMobileList songs={selectedGroup.songs} />
        </div>
        <div className="hidden md:block">
          <SongsTable songs={selectedGroup.songs} />
        </div>
      </div>
    </section>
  )
}
