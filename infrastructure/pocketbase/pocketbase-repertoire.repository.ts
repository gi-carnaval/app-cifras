import type {
  NewRepertoireItem,
  NewRepertoireMember,
  RepertoireItemPosition,
  RepertoireItemRepository,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import type { Repertoire, RepertoireItem } from "@/domain/entities/repertoire"
import type {
  PocketbaseRepertoireDTO,
  PocketbaseRepertoireItemDTO,
  PocketbaseRepertoireMemberDTO,
} from "../api/dto/pocketbase-repertoire-dto"
import { createAuthenticatedPocketbaseClient, type PocketbaseRepositoryOptions } from "./client"
import {
  toPocketbaseRepertoireDTO,
  toPocketbaseRepertoireItemDTO,
  toPocketbaseRepertoireItemPositionDTO,
  toPocketbaseRepertoireMemberDTO,
  toRepertoireEntity,
  toRepertoireItemEntity,
  toRepertoireMemberEntity,
} from "./repertoires.mapper"

function filterValue(value: string) {
  return value.replaceAll('"', '\\"')
}

function buildOrFilter(field: string, values: string[]) {
  return values.map((value) => `${field} = "${filterValue(value)}"`).join(" || ")
}

export function createPocketbaseRepertoireRepository(
  options?: PocketbaseRepositoryOptions
): RepertoireRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "repertoires"

  async function getAllByOwner(ownerId: string): Promise<Repertoire[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireDTO>({
      filter: `owner = "${filterValue(ownerId)}"`,
      sort: "-date,-created",
    })

    return result.map(toRepertoireEntity)
  }

  async function getById(id: string): Promise<Repertoire | null> {
    try {
      const record = await pb.collection(collection).getOne<PocketbaseRepertoireDTO>(id)

      return toRepertoireEntity(record)
    } catch {
      return null
    }
  }

  async function getByIds(ids: string[]): Promise<Repertoire[]> {
    if (ids.length === 0) return []

    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireDTO>({
      filter: buildOrFilter("id", ids),
      sort: "-date,-created",
    })

    return result.map(toRepertoireEntity)
  }

  async function save(repertoire: Repertoire): Promise<Repertoire> {
    const payload = toPocketbaseRepertoireDTO(repertoire)

    if (repertoire.id) {
      const updated = await pb
        .collection(collection)
        .update<PocketbaseRepertoireDTO>(repertoire.id, payload)

      return toRepertoireEntity(updated)
    }

    const created = await pb.collection(collection).create<PocketbaseRepertoireDTO>(payload)

    return toRepertoireEntity(created)
  }

  async function archive(id: string): Promise<Repertoire> {
    const updated = await pb.collection(collection).update<PocketbaseRepertoireDTO>(id, {
      is_archived: true,
    })

    return toRepertoireEntity(updated)
  }

  async function remove(id: string): Promise<void> {
    await pb.collection(collection).delete(id)
  }

  return {
    getAllByOwner,
    getById,
    getByIds,
    save,
    archive,
    delete: remove,
  }
}

export function createPocketbaseRepertoireItemRepository(
  options?: PocketbaseRepositoryOptions
): RepertoireItemRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "repertoire_items"

  async function getByRepertoireId(repertoireId: string): Promise<RepertoireItem[]> {
    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireItemDTO>({
      filter: `repertoire = "${filterValue(repertoireId)}"`,
      sort: "position",
    })

    return result.map(toRepertoireItemEntity)
  }

  async function getByRepertoireIds(repertoireIds: string[]): Promise<RepertoireItem[]> {
    if (repertoireIds.length === 0) return []

    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireItemDTO>({
      filter: buildOrFilter("repertoire", repertoireIds),
      sort: "position",
    })

    return result.map(toRepertoireItemEntity)
  }

  async function getById(id: string): Promise<RepertoireItem | null> {
    try {
      const record = await pb.collection(collection).getOne<PocketbaseRepertoireItemDTO>(id)

      return toRepertoireItemEntity(record)
    } catch {
      return null
    }
  }

  async function add(item: NewRepertoireItem): Promise<RepertoireItem> {
    const created = await pb
      .collection(collection)
      .create<PocketbaseRepertoireItemDTO>(toPocketbaseRepertoireItemDTO(item))

    return toRepertoireItemEntity(created)
  }

  async function update(item: RepertoireItem): Promise<RepertoireItem> {
    const updated = await pb
      .collection(collection)
      .update<PocketbaseRepertoireItemDTO>(item.id, toPocketbaseRepertoireItemDTO(item))

    return toRepertoireItemEntity(updated)
  }

  async function remove(id: string): Promise<void> {
    await pb.collection(collection).delete(id)
  }

  async function replacePositions(items: RepertoireItemPosition[]): Promise<RepertoireItem[]> {
    const updatedItems = await Promise.all(
      items.map((item) =>
        pb
          .collection(collection)
          .update<PocketbaseRepertoireItemDTO>(
            item.id,
            toPocketbaseRepertoireItemPositionDTO(item)
          )
      )
    )

    return updatedItems.map(toRepertoireItemEntity)
  }

  return {
    getByRepertoireId,
    getByRepertoireIds,
    getById,
    add,
    update,
    remove,
    replacePositions,
  }
}

export function createPocketbaseRepertoireMemberRepository(
  options?: PocketbaseRepositoryOptions
): RepertoireMemberRepository {
  const pb = createAuthenticatedPocketbaseClient(options)
  const collection = "repertoire_members"

  async function getByRepertoireId(repertoireId: string) {
    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireMemberDTO>({
      filter: `repertoire = "${filterValue(repertoireId)}"`,
      sort: "created",
    })
    return result.map(toRepertoireMemberEntity)
  }

  async function getByUserId(userId: string) {
    const result = await pb.collection(collection).getFullList<PocketbaseRepertoireMemberDTO>({
      filter: `user = "${filterValue(userId)}"`,
      sort: "created",
    })

    return result.map(toRepertoireMemberEntity)
  }

  async function add(member: NewRepertoireMember) {
    const created = await pb
      .collection(collection)
      .create<PocketbaseRepertoireMemberDTO>(toPocketbaseRepertoireMemberDTO(member))

    return toRepertoireMemberEntity(created)
  }

  async function updateRole(id: string, role: string) {
    const updated = await pb.collection(collection).update<PocketbaseRepertoireMemberDTO>(id, {
      role,
    })

    return toRepertoireMemberEntity(updated)
  }

  async function remove(id: string): Promise<void> {
    await pb.collection(collection).delete(id)
  }

  return {
    getByRepertoireId,
    getByUserId,
    add,
    updateRole,
    remove,
  }
}
