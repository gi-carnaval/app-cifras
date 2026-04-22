"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SongViewer from "@/components/song/SongViewer"
import type { Song } from "@/domain/entities/song"

export type RepertoirePlayerItem = {
  id: string
  position: number
  notes: string
  keyLabel: string
  song: Song
}

type RepertoirePlayerProps = {
  repertoireId: string
  repertoireName: string
  initialIndex: number
  items: RepertoirePlayerItem[]
}

function clampIndex(index: number, maxIndex: number) {
  return Math.min(Math.max(index, 0), maxIndex)
}

export function RepertoirePlayer({
  repertoireId,
  repertoireName,
  initialIndex,
  items,
}: RepertoirePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    items.length > 0 ? clampIndex(initialIndex, items.length - 1) : 0
  )
  const currentItem = items[currentIndex] ?? null
  const progressLabel = currentItem ? `${currentIndex + 1} de ${items.length}` : "0 de 0"
  const visualConfig = useMemo(
    () => ({
      lyricFontSize: 18,
      chordFontSize: 18,
    }),
    []
  )

  function goToPrevious() {
    setCurrentIndex((index) => clampIndex(index - 1, items.length - 1))
  }

  function goToNext() {
    setCurrentIndex((index) => clampIndex(index + 1, items.length - 1))
  }

  if (!currentItem) {
    return (
      <main className="mx-auto my-0 max-w-5xl px-6 pb-20 pt-0">
        <div className="flex flex-col gap-3 py-6">
          <Link href={`/repertoires/${repertoireId}`} className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
            Voltar para o repertório
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">{repertoireName}</h1>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-(--bg2) px-4 py-12 text-center">
          <h2 className="text-base font-semibold text-(--text)">Nenhuma música para executar.</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Adicione músicas ao repertório antes de abrir o modo de execução.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto my-0 max-w-6xl px-4 pb-28 pt-0 sm:px-6 sm:pb-20">
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-(--bg)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/repertoires/${repertoireId}`} className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
                Sair do modo execução
              </Link>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-(--text)">
                {repertoireName}
              </h1>
            </div>
            <div className="inline-flex min-h-8 w-fit items-center rounded-md border border-border bg-(--bg3) px-3 text-sm font-medium text-(--accent)">
              {progressLabel}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_9rem] sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              Anterior
            </Button>
            <div className="flex gap-2 overflow-x-auto py-1">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={
                    index === currentIndex
                      ? "inline-flex min-h-9 shrink-0 items-center rounded-md border border-(--accent) bg-(--accent) px-3 text-sm font-semibold text-(--bg)"
                      : "inline-flex min-h-9 shrink-0 items-center rounded-md border border-border bg-(--bg2) px-3 text-sm font-medium text-(--text-muted) hover:text-(--text)"
                  }
                  aria-current={index === currentIndex ? "step" : undefined}
                >
                  {index + 1}. {item.song.title || "Sem título"}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={goToNext}
              disabled={currentIndex === items.length - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-5 max-w-4xl">
        <div className="mb-4 rounded-lg border border-border bg-(--bg2) p-4 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-(--text-muted)">Música atual</p>
              <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-(--text)">
                {currentItem.song.title}
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">
                {currentItem.song.artist.name || "Artista não informado"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs font-medium text-(--text-muted)">
                Posição {currentItem.position}
              </span>
              <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 font-mono text-xs font-medium text-(--accent)">
                Tom {currentItem.keyLabel || "-"}
              </span>
            </div>
          </div>
          {currentItem.notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
              {currentItem.notes}
            </p>
          ) : null}
        </div>

        <SongViewer song={currentItem.song} visualConfig={visualConfig} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-(--bg)/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={goToNext}
            disabled={currentIndex === items.length - 1}
          >
            Próxima
          </Button>
        </div>
      </div>
    </main>
  )
}
