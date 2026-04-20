// infrastructure/repositories/pocketbase-song.repository.ts
import { toPocketbaseSongDTO, toPocketbaseSongFormData, toSongEntity } from "./songs.mapper";
import { pb } from "./client";
import { Song } from "@/domain/entities/song";
import { SongRepository } from "@/domain/repositories/song.repository";
import { PocketbaseSongDTO } from "../api/dto/pocketbase-song-dto";

interface PocketbaseSongSaveOptions {
  cifraPdfFile?: File | null
  removeCifraPdf?: boolean
}

type PocketbaseSongRepository = SongRepository & {
  save(song: Song, options?: PocketbaseSongSaveOptions): Promise<Song>
}

export function createPocketbaseSongRepository(): PocketbaseSongRepository {
  const collection = "songs";

  async function getAll(): Promise<Song[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseSongDTO>({
      expand: "artist,categories",
    });
    return result.map(toSongEntity);
  }

  async function getById(id: string): Promise<Song | null> {
    try {
      const record = await pb.collection(collection).getOne<PocketbaseSongDTO>(id, {
        expand: "artist,categories",
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
