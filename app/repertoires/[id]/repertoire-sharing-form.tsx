"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  shareRepertoireAction,
  type ShareRepertoireFormState,
} from "./actions"

type RepertoireSharingFormProps = {
  repertoireId: string
}

const initialState: ShareRepertoireFormState = {}

export function RepertoireSharingForm({ repertoireId }: RepertoireSharingFormProps) {
  const [state, formAction, pending] = useActionState(shareRepertoireAction, initialState)

  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <input type="hidden" name="repertoireId" value={repertoireId} />
      <div className="grid gap-2">
        <label htmlFor="share-email" className="text-sm font-medium text-(--text)">
          E-mail do usuário
        </label>
        <Input
          id="share-email"
          name="email"
          type="email"
          required
          placeholder="usuario@exemplo.com"
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Compartilhando..." : "Compartilhar"}
        </Button>
      </div>

      {state.error ? (
        <p className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="sm:col-span-2 rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--accent)">
          {state.success}
        </p>
      ) : null}
    </form>
  )
}
