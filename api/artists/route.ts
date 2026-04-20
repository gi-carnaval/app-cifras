import { createPocketbaseArtistRepository } from "@/infrastructure/pocketbase/pocketbase-artist.repository";
import { createArtistUseCase } from "@/application/use-cases/artists/create-artist";
import { getAllArtistsUseCase } from "@/application/use-cases/artists/get-all-artists";

export async function GET() {
  const repo = createPocketbaseArtistRepository()
  const getAllArtists = getAllArtistsUseCase(repo)

  const artists = await getAllArtists()

  if (!artists) {
    return new Response(
      JSON.stringify({ message: "Nenhum artista encontrado." }),
      { status: 200 }
    )
  }

  if (!Array.isArray(artists)) {
    return new Response(
      JSON.stringify({ message: "Formato inválido de resposta" }),
      { status: 500 }
    )
  }

  return Response.json(artists)
}

export async function POST(request: Request) {
  const repo = createPocketbaseArtistRepository()
  const createArtist = createArtistUseCase(repo)
  const body = await request.json()

  if (!body?.name || typeof body.name !== "string") {
    return new Response("Nome do artista é obrigatório.", { status: 400 })
  }

  const created = await createArtist(body.name)

  return Response.json(created, { status: 201 })
}
