"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  updateRepertoireMetadataAction,
  type UpdateRepertoireMetadataFormState,
} from "./actions"

type RepertoireMetadataFormProps = {
  repertoireId: string
  name: string
  date: string
  description: string
}

const initialState: UpdateRepertoireMetadataFormState = {}

export function RepertoireMetadataForm({
  repertoireId,
  name,
  date,
  description,
}: RepertoireMetadataFormProps) {
  const [state, formAction, pending] = useActionState(
    updateRepertoireMetadataAction,
    initialState
  )

  return (
    <form action={formAction} className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
      <input type="hidden" name="repertoireId" value={repertoireId} />
      <div className="grid gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-(--text)">Dados do repertório</h2>
          <p className="text-sm text-(--text-muted)">Nome, data e descrição do repertório.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="grid gap-2">
            <label htmlFor="repertoire-name" className="text-sm font-medium text-(--text)">
              Nome
            </label>
            <Input
              id="repertoire-name"
              name="name"
              required
              defaultValue={name}
              placeholder="Nome do repertório"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="repertoire-date" className="text-sm font-medium text-(--text)">
              Data
            </label>
            <Input id="repertoire-date" name="date" type="date" required defaultValue={date} />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="repertoire-description" className="text-sm font-medium text-(--text)">
            Descrição
          </label>
          <Textarea
            id="repertoire-description"
            name="description"
            rows={4}
            defaultValue={description}
            placeholder="Observações sobre a celebração"
          />
        </div>

        {state.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--accent)">
            {state.success}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar dados"}
          </Button>
        </div>
      </div>
    </form>
  )
}
