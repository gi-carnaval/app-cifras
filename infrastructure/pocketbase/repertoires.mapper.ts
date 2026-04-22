import { formatChord, parseChord } from "@/core/chord-engine"
import type {
  Repertoire,
  RepertoireItem,
  RepertoireMember,
} from "@/domain/entities/repertoire"
import type {
  NewRepertoireItem,
  NewRepertoireMember,
  RepertoireItemPosition,
} from "@/domain/repositories/repertoire.repository"
import type {
  PocketbaseRepertoireDTO,
  PocketbaseRepertoireItemDTO,
  PocketbaseRepertoireMemberDTO,
} from "../api/dto/pocketbase-repertoire-dto"

function toCustomKey(value: string) {
  return value ? parseChord(value) : null
}

export function toRepertoireEntity(dto: PocketbaseRepertoireDTO): Repertoire {
  return {
    id: dto.id,
    name: dto.name,
    date: dto.date,
    ownerId: dto.owner,
    description: dto.description,
    currentIndex: dto.current_index,
    isArchived: dto.is_archived,
    createdAt: dto.created,
    updatedAt: dto.updated,
  }
}

export function toPocketbaseRepertoireDTO(repertoire: Repertoire): PocketbaseRepertoireDTO {
  return {
    id: repertoire.id,
    name: repertoire.name,
    date: repertoire.date,
    owner: repertoire.ownerId,
    description: repertoire.description,
    current_index: repertoire.currentIndex,
    is_archived: repertoire.isArchived,
    created: repertoire.createdAt,
    updated: repertoire.updatedAt,
  }
}

export function toRepertoireItemEntity(dto: PocketbaseRepertoireItemDTO): RepertoireItem {
  return {
    id: dto.id,
    repertoireId: dto.repertoire,
    songId: dto.song,
    position: dto.position,
    customKey: toCustomKey(dto.custom_key),
    notes: dto.notes,
    createdAt: dto.created,
    updatedAt: dto.updated,
  }
}

export function toPocketbaseRepertoireItemDTO(
  item: RepertoireItem | NewRepertoireItem
): PocketbaseRepertoireItemDTO {
  return {
    id: "id" in item ? item.id : "",
    repertoire: item.repertoireId,
    song: item.songId,
    position: item.position,
    custom_key: item.customKey ? formatChord(item.customKey) : "",
    notes: item.notes,
    created: "createdAt" in item ? item.createdAt : undefined,
    updated: "updatedAt" in item ? item.updatedAt : undefined,
  }
}

export function toPocketbaseRepertoireItemPositionDTO(item: RepertoireItemPosition) {
  return {
    position: item.position,
  }
}

export function toRepertoireMemberEntity(dto: PocketbaseRepertoireMemberDTO): RepertoireMember {
  return {
    id: dto.id,
    repertoireId: dto.repertoire,
    userId: dto.user,
    role: dto.role,
    createdAt: dto.created,
    updatedAt: dto.updated,
  }
}

export function toPocketbaseRepertoireMemberDTO(
  member: RepertoireMember | NewRepertoireMember
): PocketbaseRepertoireMemberDTO {
  return {
    id: "id" in member ? member.id : "",
    repertoire: member.repertoireId,
    user: member.userId,
    role: member.role,
    created: "createdAt" in member ? member.createdAt : undefined,
    updated: "updatedAt" in member ? member.updatedAt : undefined,
  }
}
