"use server"

import { createRepertoireUseCase } from "@/application/use-cases/repertoires/create-repertoire"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { createPocketbaseRepertoireRepository } from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type CreateRepertoireFormState = {
  error?: string
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function createRepertoireAction(
  _state: CreateRepertoireFormState,
  formData: FormData
): Promise<CreateRepertoireFormState> {
  const user = await requireAuthenticatedUser("/repertoires/create")
  const cookieStore = await cookies()
  const repertoireRepo = createPocketbaseRepertoireRepository({
    serializedSession: cookieStore.toString(),
  })
  const createRepertoire = createRepertoireUseCase(repertoireRepo)

  let createdId = ""

  try {
    const created = await createRepertoire({
      name: getFormValue(formData, "name"),
      date: getFormValue(formData, "date"),
      description: getFormValue(formData, "description"),
      ownerId: user.id,
    })

    createdId = created.id
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível criar o repertório.",
    }
  }

  revalidatePath("/repertoires")
  redirect(`/repertoires/${createdId}`)
}
