import { createGetCurrentSessionUseCase } from "@/application/use-cases/auth/get-current-session"
import { updateRepertoireCurrentIndexUseCase } from "@/application/use-cases/repertoires/update-repertoire-current-index"
import { createPocketbaseAuthRepository } from "@/infrastructure/pocketbase/pocketbase-auth.repository"
import {
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type UpdateCurrentIndexPayload = {
  currentIndex?: number
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params
  const authRepo = createPocketbaseAuthRepository()
  const getCurrentSession = createGetCurrentSessionUseCase(authRepo)
  const serializedSession = request.headers.get("cookie") || ""
  const session = await getCurrentSession(serializedSession)

  if (!session.isAuthenticated || !session.user) {
    return Response.json({ message: "Não autenticado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as UpdateCurrentIndexPayload | null
  const currentIndex = body?.currentIndex

  if (typeof currentIndex !== "number" || !Number.isFinite(currentIndex)) {
    return Response.json({ message: "Índice atual inválido." }, { status: 400 })
  }

  try {
    const repositoryOptions = {
      serializedSession,
    }
    const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
    const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
    const updateCurrentIndex = updateRepertoireCurrentIndexUseCase(repertoireRepo, memberRepo)
    const repertoire = await updateCurrentIndex({
      repertoireId: id,
      userId: session.user.id,
      currentIndex,
    })

    return Response.json({
      currentIndex: repertoire.currentIndex,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o repertório."

    return Response.json({ message }, { status: 400 })
  }
}
