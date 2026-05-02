import { Song } from "@/domain/entities/song";
import { createPocketbaseSongRepository } from "@/infrastructure/pocketbase/pocketbase.repository";
import { getSongByIdUseCase } from "@/application/use-cases/songs/get-song-by-id";
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

function toSongSaveErrorResponse(error: unknown) {
  if (error instanceof SyntaxError) {
    return new Response('Payload da música é inválido.', { status: 400 })
  }

  if (error instanceof Error && error.name === 'SongValidationError') {
    return new Response(error.message, { status: 400 })
  }

  console.error('Erro ao salvar música:', error)
  return new Response('Erro ao salvar a música.', { status: 500 })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const repo = createPocketbaseSongRepository(getRepositoryOptions(request))
    const getSongById = getSongByIdUseCase(repo)
    const song = await getSongById(id)
    if (!song) {
      return new Response('Música não encontrada.', { status: 404 })
    }

    return Response.json(song)
  } catch (error) {
    console.error('Erro ao buscar música por id:', error)
    return new Response('Erro ao buscar a música.', { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const repo = createPocketbaseSongRepository(getRepositoryOptions(request))
    const saveSong = saveSongUseCase(repo)
    const { song, options } = await parseSongSaveRequest(request)

    if (!song.artist?.id) {
      return new Response('Artista é obrigatório.', { status: 400 })
    }

    const updated = await saveSong({ ...song, id }, options)

    return Response.json(updated)
  } catch (error) {
    return toSongSaveErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const repo = createPocketbaseSongRepository(getRepositoryOptions(request))
  await repo.delete(id)

  return new Response(null, { status: 204 })
}
