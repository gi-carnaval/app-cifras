"use server"

import { addRepertoireItemUseCase } from "@/application/use-cases/repertoires/add-repertoire-item"
import { removeRepertoireItemUseCase } from "@/application/use-cases/repertoires/remove-repertoire-item"
import { removeRepertoireMemberUseCase } from "@/application/use-cases/repertoires/remove-repertoire-member"
import { reorderRepertoireItemsUseCase } from "@/application/use-cases/repertoires/reorder-repertoire-items"
import { shareRepertoireUseCase } from "@/application/use-cases/repertoires/share-repertoire"
import { updateRepertoireMetadataUseCase } from "@/application/use-cases/repertoires/update-repertoire-metadata"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { createPocketbaseUserRepository } from "@/infrastructure/pocketbase/pocketbase-user.repository"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type AddRepertoireItemFormState = {
  error?: string
  success?: string
}

export type UpdateRepertoireMetadataFormState = {
  error?: string
  success?: string
}

export type ShareRepertoireFormState = {
  error?: string
  success?: string
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

function getPosition(formData: FormData) {
  const rawPosition = getFormValue(formData, "position")

  if (!rawPosition.trim()) return -1

  const position = Number(rawPosition)

  return Number.isFinite(position) ? position : -1
}

function getReorderDirection(formData: FormData) {
  const direction = getFormValue(formData, "direction")

  if (direction !== "up" && direction !== "down") {
    throw new Error("Direção de ordenação inválida.")
  }

  return direction
}

export async function addRepertoireItemAction(
  _state: AddRepertoireItemFormState,
  formData: FormData
): Promise<AddRepertoireItemFormState> {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const addRepertoireItem = addRepertoireItemUseCase(repertoireRepo, itemRepo, memberRepo)

  try {
    await addRepertoireItem({
      repertoireId,
      songId: getFormValue(formData, "songId"),
      ownerId: user.id,
      position: getPosition(formData),
      customKey: getFormValue(formData, "customKey"),
      notes: getFormValue(formData, "notes"),
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível adicionar a música.",
    }
  }

  revalidatePath(`/repertoires/${repertoireId}`)

  return {
    success: "Música adicionada ao repertório.",
  }
}

export async function updateRepertoireMetadataAction(
  _state: UpdateRepertoireMetadataFormState,
  formData: FormData
): Promise<UpdateRepertoireMetadataFormState> {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repertoireRepo = createPocketbaseRepertoireRepository({
    serializedSession: cookieStore.toString(),
  })
  const memberRepo = createPocketbaseRepertoireMemberRepository({
    serializedSession: cookieStore.toString(),
  })
  const updateRepertoireMetadata = updateRepertoireMetadataUseCase(repertoireRepo, memberRepo)

  try {
    await updateRepertoireMetadata({
      repertoireId,
      ownerId: user.id,
      name: getFormValue(formData, "name"),
      date: getFormValue(formData, "date"),
      description: getFormValue(formData, "description"),
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível atualizar o repertório.",
    }
  }

  revalidatePath("/repertoires")
  revalidatePath(`/repertoires/${repertoireId}`)

  return {
    success: "Repertório atualizado.",
  }
}

export async function shareRepertoireAction(
  _state: ShareRepertoireFormState,
  formData: FormData
): Promise<ShareRepertoireFormState> {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const userRepo = createPocketbaseUserRepository(repositoryOptions)
  const shareRepertoire = shareRepertoireUseCase(repertoireRepo, memberRepo, userRepo)

  try {
    await shareRepertoire({
      repertoireId,
      ownerId: user.id,
      email: getFormValue(formData, "email"),
      role: "editor",
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível compartilhar.",
    }
  }

  revalidatePath("/repertoires")
  revalidatePath(`/repertoires/${repertoireId}`)

  return {
    success: "Repertório compartilhado.",
  }
}

export async function reorderRepertoireItemAction(formData: FormData) {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const reorderRepertoireItems = reorderRepertoireItemsUseCase(
    repertoireRepo,
    itemRepo,
    memberRepo
  )

  await reorderRepertoireItems({
    repertoireId,
    ownerId: user.id,
    itemId: getFormValue(formData, "itemId"),
    direction: getReorderDirection(formData),
  })

  revalidatePath(`/repertoires/${repertoireId}`)
}

export async function removeRepertoireItemAction(formData: FormData) {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const removeRepertoireItem = removeRepertoireItemUseCase(repertoireRepo, itemRepo, memberRepo)

  await removeRepertoireItem({
    repertoireId,
    ownerId: user.id,
    itemId: getFormValue(formData, "itemId"),
  })

  revalidatePath("/repertoires")
  revalidatePath(`/repertoires/${repertoireId}`)
}

export async function removeRepertoireMemberAction(formData: FormData) {
  const repertoireId = getFormValue(formData, "repertoireId")
  const user = await requireAuthenticatedUser(`/repertoires/${repertoireId}`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const removeRepertoireMember = removeRepertoireMemberUseCase(repertoireRepo, memberRepo)

  await removeRepertoireMember({
    repertoireId,
    ownerId: user.id,
    memberId: getFormValue(formData, "memberId"),
  })

  revalidatePath("/repertoires")
  revalidatePath(`/repertoires/${repertoireId}`)
}
