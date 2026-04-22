import type {
  RepertoireMemberRepository,
  RepertoireRepository,
} from "@/domain/repositories/repertoire.repository"
import { isRepertoireOwner } from "./repertoire-access"

export type RemoveRepertoireMemberInput = {
  repertoireId: string
  ownerId: string
  memberId: string
}

export function removeRepertoireMemberUseCase(
  repertoireRepo: RepertoireRepository,
  memberRepo: RepertoireMemberRepository
) {
  return async (input: RemoveRepertoireMemberInput) => {
    const repertoireId = input.repertoireId.trim()
    const ownerId = input.ownerId.trim()
    const memberId = input.memberId.trim()

    if (!repertoireId) {
      throw new Error("Repertório é obrigatório.")
    }

    if (!ownerId) {
      throw new Error("Usuário responsável é obrigatório.")
    }

    if (!memberId) {
      throw new Error("Membro é obrigatório.")
    }

    const repertoire = await repertoireRepo.getById(repertoireId)

    if (!repertoire) {
      throw new Error("Repertório não encontrado.")
    }

    if (!isRepertoireOwner(repertoire, ownerId)) {
      throw new Error("Apenas o proprietário pode remover compartilhamentos.")
    }

    const members = await memberRepo.getByRepertoireId(repertoireId)
    const member = members.find((currentMember) => currentMember.id === memberId)

    if (!member) {
      throw new Error("Membro não encontrado.")
    }

    return memberRepo.remove(memberId)
  }
}
