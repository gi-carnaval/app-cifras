import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getRepertoireByIdUseCase } from "@/application/use-cases/repertoires/get-repertoire-by-id"
import { getRepertoireItemsUseCase } from "@/application/use-cases/repertoires/get-repertoire-items"
import { canAccessRepertoire } from "@/application/use-cases/repertoires/repertoire-access"
import {
  applyRepertoireItemKeyOverride,
  getRepertoireItemEffectiveKeyLabel,
} from "@/application/use-cases/repertoires/apply-repertoire-item-key-override"
import { getSongByIdUseCase } from "@/application/use-cases/songs/get-song-by-id"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { createPocketbaseSongRepository } from "@/infrastructure/pocketbase/pocketbase.repository"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { RepertoirePlayer, type RepertoirePlayerItem } from "./repertoire-player"

export const dynamic = "force-dynamic"

function getInitialIndex(currentIndex: number, itemsLength: number) {
  if (!Number.isInteger(currentIndex)) return 0
  if (itemsLength === 0) return 0

  return Math.min(Math.max(currentIndex, 0), itemsLength - 1)
}

export default async function RepertoirePlayerPage({
  params,
}: PageProps<"/repertoires/[id]/play">) {
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
  const getSongById = getSongByIdUseCase(songRepo)
  const repertoire = await getRepertoireById(id)

  if (!repertoire) {
    notFound()
  }

  const hasAccess = await canAccessRepertoire(repertoire, user.id, memberRepo)

  if (!hasAccess) {
    redirect("/repertoires")
  }

  const items = await getRepertoireItems(repertoire.id)
  const playerItems = (
    await Promise.all(
      items.map(async (item) => {
        const song = await getSongById(item.songId)

        if (!song) return null

        const effectiveSong = applyRepertoireItemKeyOverride(song, item)

        return {
          id: item.id,
          position: item.position,
          notes: item.notes,
          keyLabel: getRepertoireItemEffectiveKeyLabel(song, item),
          song: effectiveSong,
        }
      })
    )
  ).filter((item): item is RepertoirePlayerItem => Boolean(item))

  return (
    <RepertoirePlayer
      repertoireId={repertoire.id}
      repertoireName={repertoire.name}
      initialIndex={getInitialIndex(repertoire.currentIndex, playerItems.length)}
      items={playerItems}
    />
  )
}
