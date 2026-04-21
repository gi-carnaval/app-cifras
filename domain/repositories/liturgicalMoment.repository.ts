import { LiturgicalMoment } from "../entities/liturgicalMoment"

export interface LiturgicalMomentRepository {
  getAll(): Promise<LiturgicalMoment[]>
  save(liturgicalMoment: Pick<LiturgicalMoment, "id" | "name" | "slug" | "order">): Promise<LiturgicalMoment>
}
