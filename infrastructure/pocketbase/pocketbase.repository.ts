// infrastructure/repositories/pocketbase-song.repository.ts
import { toPocketbaseSongDTO, toPocketbaseSongFormData, toSongEntity } from "./songs.mapper";
import { createAuthenticatedPocketbaseClient, type PocketbaseRepositoryOptions } from "./client";
import { Song } from "@/domain/entities/song";
import { SongRepository, type SongListFilters } from "@/domain/repositories/song.repository";
import { PocketbaseSongDTO } from "../api/dto/pocketbase-song-dto";

interface PocketbaseSongSaveOptions {
  cifraPdfFile?: File | null
  removeCifraPdf?: boolean
}

type PocketbaseSongRepository = SongRepository & {
  save(song: Song, options?: PocketbaseSongSaveOptions): Promise<Song>
}

function filterValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')
}

function buildSongSearchFilter(search: string) {
  const trimmedSearch = search.trim()

  if (!trimmedSearch) return ""

  const escapedSearch = filterValue(trimmedSearch)

  return `(title ~ "${escapedSearch}" || sections ~ "${escapedSearch}")`
}

function buildArtistFilter(artistId: string) {
  const trimmedArtistId = artistId.trim()

  if (!trimmedArtistId) return ""

  return `artist = "${filterValue(trimmedArtistId)}"`
}

function buildCategoryFilter(categoryIds: string[]) {
  if (categoryIds.length === 0) return ""

  return `(${categoryIds.map((categoryId) => `categories ~ "${filterValue(categoryId)}"`).join(" || ")})`
}

function buildSongsFilter(filters?: SongListFilters) {
  const parts = [
    buildSongSearchFilter(filters?.search ?? ""),
    buildArtistFilter(filters?.artistId ?? ""),
    buildCategoryFilter(filters?.categoryIds ?? []),
  ].filter(Boolean)

  return parts.join(" && ")
}

export function createPocketbaseSongRepository(
  options?: PocketbaseRepositoryOptions
): PocketbaseSongRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "songs";

  async function getAll(filters?: SongListFilters): Promise<Song[]> {
    const filter = buildSongsFilter(filters)
    const result = await pb.collection(collection).getFullList<PocketbaseSongDTO>({
      expand: "artist, categories, liturgical_moments",
      filter: filter || undefined,
      sort: "title",
    });
    return result.map(toSongEntity);
  }

  async function getById(id: string): Promise<Song | null> {
    try {
      const record = await pb.collection(collection).getOne<PocketbaseSongDTO>(id, {
        expand: "artist,categories,liturgical_moments",
      });
      return toSongEntity(record);
    } catch {
      return null;
    }
  }

  async function save(song: Song, options?: PocketbaseSongSaveOptions): Promise<Song> {
    const payload = options ? toPocketbaseSongFormData(song, options) : toPocketbaseSongDTO(song);

    if (song.id) {
      const updated = await pb
        .collection(collection)
        .update<PocketbaseSongDTO>(song.id, payload);

      return (await getById(updated.id)) ?? song;
    }

    const created = await pb
      .collection(collection)
      .create<PocketbaseSongDTO>(payload);

    return (await getById(created.id)) ?? song;
  }

  async function remove(id: string): Promise<void> {
    await pb.collection(collection).delete(id);
  }

  return {
    getAll,
    getById,
    save,
    delete: remove,
  };
}
