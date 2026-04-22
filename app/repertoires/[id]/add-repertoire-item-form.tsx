"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  addRepertoireItemAction,
  type AddRepertoireItemFormState,
} from "./actions"

export type RepertoireSongOption = {
  id: string
  title: string
  artistName: string
  defaultKey: string
}

type AddRepertoireItemFormProps = {
  repertoireId: string
  songs: RepertoireSongOption[]
  nextPosition: number
}

const initialState: AddRepertoireItemFormState = {}

export function AddRepertoireItemForm({
  repertoireId,
  songs,
  nextPosition,
}: AddRepertoireItemFormProps) {
  const [state, formAction, pending] = useActionState(addRepertoireItemAction, initialState)
  const hasSongs = songs.length > 0

  return (
    <form action={formAction} className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
      <input type="hidden" name="repertoireId" value={repertoireId} />
      <div className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="songId" className="text-sm font-medium text-(--text)">
            Música
          </label>
          <select
            id="songId"
            name="songId"
            required
            disabled={!hasSongs}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          >
            <option value="">
              {hasSongs ? "Selecione uma música" : "Todas as músicas já foram adicionadas"}
            </option>
            {songs.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title} {song.artistName ? `- ${song.artistName}` : ""}{" "}
                {song.defaultKey ? `(Tom ${song.defaultKey})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <div className="grid gap-2">
            <label htmlFor="position" className="text-sm font-medium text-(--text)">
              Posição
            </label>
            <Input
              id="position"
              name="position"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={nextPosition}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="customKey" className="text-sm font-medium text-(--text)">
              Tom personalizado
            </label>
            <Input id="customKey" name="customKey" placeholder="Ex: D, Am, G/B" />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="notes" className="text-sm font-medium text-(--text)">
            Observações
          </label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Notas para esta música" />
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
          <Button type="submit" disabled={pending || !hasSongs}>
            {pending ? "Adicionando..." : "Adicionar música"}
          </Button>
        </div>
      </div>
    </form>
  )
}
