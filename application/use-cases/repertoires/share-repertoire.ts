import type {
  NewRepertoireMember,
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import type { UserRepository } from "@/domain/repositories/user.repository"
import { isRepertoireOwner } from "./repertoire-access"

export type ShareRepertoireInput = {
  repertoireId: string
  ownerId: string
  email: string
  role?: string
}

export function shareRepertoireUseCase(
  repertoireRepo: RepertoireRepository,
  memberRepo: RepertoireMemberRepository,
  userRepo: UserRepository
) {
  return async (input: ShareRepertoireInput) => {
    const repertoireId = input.repertoireId.trim()
    const ownerId = input.ownerId.trim()
    const email = input.email.trim().toLowerCase()
    const role = input.role?.trim() || "editor"

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!ownerId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    if (!email) {
      throw new Error("E-mail do usuário é obrigatório.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    if (!isRepertoireOwner(repertoire, ownerId)) {
      throw new Error("Apenas o proprietário pode compartilhar este repertório.")
    }

    const user = await userRepo.getByEmail(email)

    if (!user) {
      throw new Error("Usuário não encontrado.")
    }

    if (user.id === repertoire.ownerId) {
      throw new Error("O proprietário já tem acesso ao repertório.")
    }

    const members = await memberRepo.getByRepertoireId(repertoireId)
    const existingMember = members.find((member) => member.userId === user.id)

    if (existingMember) {
      return existingMember.role === role
        ? existingMember
        : memberRepo.updateRole(existingMember.id, role)
    }

    const member: NewRepertoireMember = {
      repertoireId,
      userId: user.id,
      role,
    }

    return memberRepo.add(member)
  }
}
