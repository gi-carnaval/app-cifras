import type {
  Repertoire,
  RepertoireItem,
  RepertoireMember,
} from "../entities/repertoire"

export type NewRepertoireItem = Omit<RepertoireItem, "id" | "createdAt" | "updatedAt">
export type NewRepertoireMember = Omit<RepertoireMember, "id" | "createdAt" | "updatedAt">
export type RepertoireItemPosition = Pick<RepertoireItem, "id" | "position">

export interface RepertoireRepository {
  getAllByOwner(ownerId: string): Promise<Repertoire[]>
  getById(id: string): Promise<Repertoire | null>
  save(repertoire: Repertoire): Promise<Repertoire>
  archive(id: string): Promise<Repertoire>
  delete(id: string): Promise<void>
}

export interface RepertoireItemRepository {
  getByRepertoireId(repertoireId: string): Promise<RepertoireItem[]>
  getById(id: string): Promise<RepertoireItem | null>
  add(item: NewRepertoireItem): Promise<RepertoireItem>
  update(item: RepertoireItem): Promise<RepertoireItem>
  remove(id: string): Promise<void>
  replacePositions(items: RepertoireItemPosition[]): Promise<RepertoireItem[]>
}

export interface RepertoireMemberRepository {
  getByRepertoireId(repertoireId: string): Promise<RepertoireMember[]>
  getByUserId(userId: string): Promise<RepertoireMember[]>
  add(member: NewRepertoireMember): Promise<RepertoireMember>
  updateRole(id: string, role: string): Promise<RepertoireMember>
  remove(id: string): Promise<void>
}
