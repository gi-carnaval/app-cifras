import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getRepertoireOptionsForSongUseCase } from "@/application/use-cases/repertoires/get-repertoire-options-for-song"
import { getSongByIdUseCase } from "@/application/use-cases/songs/get-song-by-id"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { createPocketbaseSongRepository } from "@/infrastructure/pocketbase/pocketbase.repository"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import {
  AddToRepertoireForm,
  type AddToRepertoireOption,
} from "./add-to-repertoire-form"

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

export default async function AddSongToRepertoirePage({
  params,
}: PageProps<"/song/[id]/add-to-repertoire">) {
  const user = await requireAuthenticatedUser("/")
  const { id } = await params
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const songRepo = createPocketbaseSongRepository(repositoryOptions)
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const getSongById = getSongByIdUseCase(songRepo)
  const getRepertoireOptions = getRepertoireOptionsForSongUseCase(
    repertoireRepo,
    itemRepo,
    memberRepo
  )
  const song = await getSongById(id)

  if (!song) {
    notFound()
  }

  const options: AddToRepertoireOption[] = (await getRepertoireOptions({
    userId: user.id,
    songId: song.id,
  })).map((option) => ({
    id: option.repertoire.id,
    name: option.repertoire.name,
    dateLabel: formatRepertoireDate(option.repertoire.date),
    itemsCount: option.itemsCount,
    hasSong: option.hasSong,
  }))

  return (
    <main className="mx-auto my-0 max-w-3xl px-6 pb-20 pt-0">
      <div className="flex flex-col gap-3 py-6">
        <Link href="/" className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
          Voltar para músicas
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">
            Adicionar ao repertório
          </h1>
          <p className="text-base text-(--text-muted)">
            {song.title} {song.artist?.name ? `- ${song.artist.name}` : ""}
          </p>
        </div>
      </div>

      <AddToRepertoireForm songId={song.id} options={options} />
    </main>
  )
}
