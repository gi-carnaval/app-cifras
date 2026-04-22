"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createRepertoireAction,
  type CreateRepertoireFormState,
} from "./actions"

const initialState: CreateRepertoireFormState = {}

export function RepertoireCreateForm() {
  const [state, formAction, pending] = useActionState(createRepertoireAction, initialState)

  return (
    <form action={formAction} className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="repertoire-name" className="text-sm font-medium text-(--text)">
            Nome
          </label>
          <Input
            id="repertoire-name"
            name="name"
            required
            autoFocus
            placeholder="Ex: Missa de domingo"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="repertoire-date" className="text-sm font-medium text-(--text)">
            Data
          </label>
          <Input id="repertoire-date" name="date" type="date" required />
        </div>

        <div className="grid gap-2">
          <label htmlFor="repertoire-description" className="text-sm font-medium text-(--text)">
            Descrição
          </label>
          <Textarea
            id="repertoire-description"
            name="description"
            placeholder="Observações sobre a celebração"
            rows={4}
          />
        </div>

        {state.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/repertoires">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar repertório"}
          </Button>
        </div>
      </div>
    </form>
  )
}
