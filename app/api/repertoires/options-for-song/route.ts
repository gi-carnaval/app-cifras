import { createGetCurrentSessionUseCase } from "@/application/use-cases/auth/get-current-session"
import { getRepertoireOptionsForSongUseCase } from "@/application/use-cases/repertoires/get-repertoire-options-for-song"
import { createPocketbaseAuthRepository } from "@/infrastructure/pocketbase/pocketbase-auth.repository"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"

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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const songId = url.searchParams.get("songId") ?? ""

  if (!songId.trim()) {
    return Response.json({ message: "Música é obrigatória." }, { status: 400 })
  }

  const authRepo = createPocketbaseAuthRepository()
  const getCurrentSession = createGetCurrentSessionUseCase(authRepo)
  const session = await getCurrentSession(request.headers.get("cookie") || "")

  if (!session.isAuthenticated || !session.user) {
    return Response.json({ message: "Não autenticado." }, { status: 401 })
  }

  const repositoryOptions = {
    serializedSession: request.headers.get("cookie") || "",
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const getOptions = getRepertoireOptionsForSongUseCase(
    repertoireRepo,
    itemRepo,
    memberRepo
  )
  const options = await getOptions({
    userId: session.user.id,
    songId,
  })

  return Response.json(
    options.map((option) => ({
      id: option.repertoire.id,
      name: option.repertoire.name,
      dateLabel: formatRepertoireDate(option.repertoire.date),
      itemsCount: option.itemsCount,
      hasSong: option.hasSong,
    }))
  )
}
