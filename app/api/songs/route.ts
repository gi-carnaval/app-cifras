import { Song } from "@/domain/entities/song";
import { createPocketbaseSongRepository } from "@/infrastructure/pocketbase/pocketbase.repository";
import { getAllSongsUseCase } from "@/application/use-cases/songs/get-all-songs";
import { saveSongUseCase, type SaveSongOptions } from "@/application/use-cases/songs/save-song";

async function parseSongSaveRequest(request: Request): Promise<{ song: Song; options: SaveSongOptions }> {
  const formData = await request.formData()
  const rawSong = formData.get('song')

  if (typeof rawSong !== 'string') {
    throw new Error('Payload da música é obrigatório.')
  }

  const pdfFile = formData.get('cifra_pdf')

  return {
    song: JSON.parse(rawSong) as Song,
    options: {
      cifraPdfFile: pdfFile instanceof File ? pdfFile : null,
      removeCifraPdf: formData.get('remove_cifra_pdf') === 'true',
    },
  }
}

function getRepositoryOptions(request: Request) {
  return {
    serializedSession: request.headers.get('cookie') || '',
  }
}

export async function GET(request: Request) {
  const repo = createPocketbaseSongRepository(getRepositoryOptions(request))
  const getAllSongs = getAllSongsUseCase(repo)
  const url = new URL(request.url)
  const search = url.searchParams.get('q') ?? ''
  const artistId = url.searchParams.get('artist') ?? ''
  const categoryIds = url.searchParams.getAll('category')

  const songs = await getAllSongs({
    search,
    artistId,
    categoryIds,
  })

  if (!songs) {
    return new Response(
      JSON.stringify({ message: "Nenhuma música encontrada." }),
      { status: 200 }
    )
  }

  if (!Array.isArray(songs)) {
    return new Response(
      JSON.stringify({ message: "Formato inválido de resposta" }),
      { status: 500 }
    )
  }

  return Response.json(songs)
}

export async function POST(request: Request) {
  const repo = createPocketbaseSongRepository(getRepositoryOptions(request))
  const saveSong = saveSongUseCase(repo)
  const { song, options } = await parseSongSaveRequest(request)

  if (!song.artist?.id) {
    return new Response('Artista é obrigatório.', { status: 400 })
  }

  const created = await saveSong({ ...song, id: '' }, options)

  return Response.json(created, { status: 201 })
}
