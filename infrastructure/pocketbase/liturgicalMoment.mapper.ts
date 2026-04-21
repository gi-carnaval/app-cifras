
import { LiturgicalMoment } from "@/domain/entities/liturgicalMoment"
import { PocketbaseLiturgicalMomentDTO } from "../api/dto/pocketbase-liturgical-moment-dto"

export function toLiturgicalMomentEntity(dto: PocketbaseLiturgicalMomentDTO): LiturgicalMoment {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    order: dto.order
  }
}

export function toPocketbaseLiturgicalMomentDTO(liturgicalMoment: LiturgicalMoment): PocketbaseLiturgicalMomentDTO {
  return {
    id: liturgicalMoment.id,
    name: liturgicalMoment.name,
    slug: liturgicalMoment.slug,
    order: liturgicalMoment.order
  }
}
