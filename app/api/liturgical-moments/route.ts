import { createLiturgicalMomentUseCase } from "@/application/use-cases/liturgicalMoments/create-liturgical-moment"
import { getAllLiturgicalMomentsUseCase } from "@/application/use-cases/liturgicalMoments/get-all-liturgical-moments"
import { createPocketbaseLiturgicalMomentRepository } from "@/infrastructure/pocketbase/pocketbase-liturgical-moment.repository"

function getRepositoryOptions(request: Request) {
  return {
    serializedSession: request.headers.get("cookie") || "",
  }
}

export async function GET(request: Request) {
  const repo = createPocketbaseLiturgicalMomentRepository(getRepositoryOptions(request))
  const getAllLiturgicalMoments = getAllLiturgicalMomentsUseCase(repo)

  const liturgicalMoments = await getAllLiturgicalMoments()

  if (!Array.isArray(liturgicalMoments)) {
    return new Response(
      JSON.stringify({ message: "Formato inválido de resposta" }),
      { status: 500 }
    )
  }

  return Response.json(liturgicalMoments)
}

export async function POST(request: Request) {
  const repo = createPocketbaseLiturgicalMomentRepository(getRepositoryOptions(request))
  const createLiturgicalMoment = createLiturgicalMomentUseCase(repo)
  const body = await request.json()

  if (!body?.name || typeof body.name !== "string") {
    return new Response("Nome do momento litúrgico é obrigatório.", { status: 400 })
  }

  const created = await createLiturgicalMoment(body.name, body.order)

  return Response.json(created, { status: 201 })
}
