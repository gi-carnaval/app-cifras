"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  addSongToRepertoireAction,
  type AddSongToRepertoireFormState,
} from "./actions"

export type AddToRepertoireOption = {
  id: string
  name: string
  dateLabel: string
  itemsCount: number
  hasSong: boolean
}

type AddToRepertoireFormProps = {
  songId: string
  options: AddToRepertoireOption[]
}

const initialState: AddSongToRepertoireFormState = {}

export function AddToRepertoireForm({ songId, options }: AddToRepertoireFormProps) {
  const [state, formAction, pending] = useActionState(
    addSongToRepertoireAction,
    initialState
  )
  const availableOptions = options.filter((option) => !option.hasSong)

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-(--bg2) px-4 py-10 text-center">
        <h2 className="text-base font-semibold text-(--text)">Nenhum repertório disponível.</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Crie um repertório antes de adicionar músicas a ele.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/repertoires/create">Criar repertório</Link>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
      <input type="hidden" name="songId" value={songId} />
      <div className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="repertoireId" className="text-sm font-medium text-(--text)">
            Repertório
          </label>
          <select
            id="repertoireId"
            name="repertoireId"
            required
            disabled={availableOptions.length === 0}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">
              {availableOptions.length > 0
                ? "Selecione um repertório"
                : "Esta música já está em todos os repertórios disponíveis"}
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id} disabled={option.hasSong}>
                {option.name} - {option.itemsCount} {option.itemsCount === 1 ? "música" : "músicas"}
                {option.hasSong ? " (já adicionada)" : ""}
              </option>
            ))}
          </select>
        </div>

        {state.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {state.status === "duplicate" && state.message ? (
          <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--text-muted)">
            {state.message}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--accent)">
            {state.success}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/">Voltar</Link>
          </Button>
          <Button type="submit" disabled={pending || availableOptions.length === 0}>
            {pending ? "Adicionando..." : "Adicionar ao repertório"}
          </Button>
        </div>
      </div>
    </form>
  )
}
