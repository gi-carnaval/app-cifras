import type { Repertoire } from "@/domain/entities/repertoire"
import type { RepertoireMemberRepository } from "@/domain/repositories/repertoire.repository"

export async function canAccessRepertoire(
  repertoire: Repertoire,
  userId: string,
  memberRepo: RepertoireMemberRepository
) {
  const actorUserId = userId.trim()

  if (!actorUserId) return false
  if (repertoire.ownerId === actorUserId) return true

  const members = await memberRepo.getByRepertoireId(repertoire.id)

  return members.some((member) => member.userId === actorUserId)
}

export async function requireRepertoireAccess(
  repertoire: Repertoire,
  userId: string,
  memberRepo: RepertoireMemberRepository
) {
  const hasAccess = await canAccessRepertoire(repertoire, userId, memberRepo)

  if (!hasAccess) {
    throw new Error("Você não pode acessar este repertório.")
  }
}

export function isRepertoireOwner(repertoire: Repertoire, userId: string) {
  return repertoire.ownerId === userId.trim()
}
