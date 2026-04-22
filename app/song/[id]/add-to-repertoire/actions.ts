"use server"

import { addSongToRepertoireUseCase } from "@/application/use-cases/repertoires/add-song-to-repertoire"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type AddSongToRepertoireFormState = {
  status?: "added" | "duplicate" | "error"
  error?: string
  message?: string
  success?: string
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function addSongToRepertoireAction(
  _state: AddSongToRepertoireFormState,
  formData: FormData
): Promise<AddSongToRepertoireFormState> {
  const songId = getFormValue(formData, "songId")
  const user = await requireAuthenticatedUser(`/song/${songId}/add-to-repertoire`)
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const addSongToRepertoire = addSongToRepertoireUseCase(
    repertoireRepo,
    itemRepo,
    memberRepo
  )

  try {
    const result = await addSongToRepertoire({
      songId,
      repertoireId: getFormValue(formData, "repertoireId"),
      userId: user.id,
    })

    if (result.status === "duplicate") {
      return {
        status: "duplicate",
        message: result.message,
      }
    }

    revalidatePath("/repertoires")
    revalidatePath(`/song/${songId}/add-to-repertoire`)

    return {
      status: "added",
      success: result.message,
    }
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Não foi possível adicionar ao repertório.",
    }
  }
}
