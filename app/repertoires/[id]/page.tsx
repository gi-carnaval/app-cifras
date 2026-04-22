import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getAllSongsUseCase } from "@/application/use-cases/songs/get-all-songs"
import { getRepertoireByIdUseCase } from "@/application/use-cases/repertoires/get-repertoire-by-id"
import { getRepertoireItemsUseCase } from "@/application/use-cases/repertoires/get-repertoire-items"
import { getRepertoireMembersUseCase } from "@/application/use-cases/repertoires/get-repertoire-members"
import { canAccessRepertoire, isRepertoireOwner } from "@/application/use-cases/repertoires/repertoire-access"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { formatChord } from "@/core/chord-engine"
import { getNextRepertoireItemPosition } from "@/domain/entities/repertoire"
import type { Chord } from "@/types"
import { createPocketbaseSongRepository } from "@/infrastructure/pocketbase/pocketbase.repository"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { AddRepertoireItemForm, type RepertoireSongOption } from "./add-repertoire-item-form"
import { RepertoireItemsTable, type RepertoireItemRow } from "./repertoire-items-table"
import { RepertoireMetadataForm } from "./repertoire-metadata-form"
import { RepertoireSharingPanel } from "./repertoire-sharing-panel"

export const dynamic = "force-dynamic"

function formatRepertoireDate(date: string) {
  if (!date) return "Sem data"

  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, Number(day)))
  }

  return date
}

function formatDateInputValue(date: string) {
  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/)

  return dateOnlyMatch ? dateOnlyMatch[0] : date
}

function formatOptionalChord(chord: Chord | null | undefined) {
  if (!chord) return ""

  try {
    return formatChord(chord)
  } catch {
    return ""
  }
}

export default async function RepertoirePage({ params }: PageProps<"/repertoires/[id]">) {
  const user = await requireAuthenticatedUser("/repertoires")
  const { id } = await params
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const songRepo = createPocketbaseSongRepository(repositoryOptions)
  const getRepertoireById = getRepertoireByIdUseCase(repertoireRepo)
  const getRepertoireItems = getRepertoireItemsUseCase(itemRepo)
  const getRepertoireMembers = getRepertoireMembersUseCase(memberRepo)
  const getAllSongs = getAllSongsUseCase(songRepo)
  const repertoire = await getRepertoireById(id)

  if (!repertoire) {
    notFound()
  }

  const hasAccess = await canAccessRepertoire(repertoire, user.id, memberRepo)

  if (!hasAccess) {
    redirect("/repertoires")
  }

  const [items, songs, members] = await Promise.all([
    getRepertoireItems(repertoire.id),
    getAllSongs(),
    getRepertoireMembers(repertoire.id),
  ])
  const canManageSharing = isRepertoireOwner(repertoire, user.id)
  const addedSongIds = new Set(items.map((item) => item.songId))
  const songsById = new Map(songs.map((song) => [song.id, song]))
  const songOptions: RepertoireSongOption[] = songs
    .filter((song) => !addedSongIds.has(song.id))
    .map((song) => ({
      id: song.id,
      title: song.title || "Sem título",
      artistName: song.artist?.name ?? "",
      defaultKey: formatOptionalChord(song.defaultKey),
    }))
  const itemRows: RepertoireItemRow[] = items.map((item) => {
    const song = songsById.get(item.songId)

    return {
      id: item.id,
      position: item.position,
      songTitle: song?.title ?? "Música não encontrada",
      artistName: song?.artist?.name ?? "",
      keyLabel: formatOptionalChord(item.customKey) || formatOptionalChord(song?.defaultKey),
      notes: item.notes,
    }
  })
  const nextPosition = getNextRepertoireItemPosition(items)

  return (
    <main className="mx-auto my-0 max-w-4xl px-6 pb-20 pt-0">
      <div className="flex flex-col gap-3 py-6">
        <Link href="/repertoires" className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
          Voltar para repertórios
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-(--text)">
              {repertoire.name}
            </h1>
            <p className="mt-2 text-base text-(--text-muted)">
              {formatRepertoireDate(repertoire.date)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 w-fit items-center rounded-md border border-border bg-(--bg3) px-2.5 text-xs font-medium text-(--accent)">
              {items.length} {items.length === 1 ? "música" : "músicas"}
            </span>
            <Link
              href={`/repertoires/${repertoire.id}/play`}
              className="inline-flex min-h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Modo execução
            </Link>
          </div>
        </div>
      </div>

      <RepertoireMetadataForm
        repertoireId={repertoire.id}
        name={repertoire.name}
        date={formatDateInputValue(repertoire.date)}
        description={repertoire.description}
      />

      <RepertoireSharingPanel
        repertoireId={repertoire.id}
        members={members}
        canManageSharing={canManageSharing}
      />

      <section className="mt-4 rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-(--text)">Músicas do repertório</h2>
          <p className="text-sm text-(--text-muted)">
            Ordem atual das músicas adicionadas.
          </p>
        </div>

        <RepertoireItemsTable repertoireId={repertoire.id} items={itemRows} />
      </section>

      <section className="mt-4">
        <div className="mb-3 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-(--text)">Adicionar música</h2>
          <p className="text-sm text-(--text-muted)">
            Escolha a música e informe a posição em que ela deve entrar.
          </p>
        </div>
        <AddRepertoireItemForm
          repertoireId={repertoire.id}
          songs={songOptions}
          nextPosition={nextPosition}
        />
      </section>
    </main>
  )
}
