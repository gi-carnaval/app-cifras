"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  addSongToRepertoireAction,
} from "@/app/song/[id]/add-to-repertoire/actions"

type RepertoirePickerOption = {
  id: string
  name: string
  dateLabel: string
  itemsCount: number
  hasSong: boolean
}

type AddSongToRepertoireDialogProps = {
  songId: string
  songTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getItemsCountLabel(count: number) {
  return `${count} ${count === 1 ? "música" : "músicas"}`
}

export function AddSongToRepertoireDialog({
  songId,
  songTitle,
  open,
  onOpenChange,
}: AddSongToRepertoireDialogProps) {
  const [options, setOptions] = useState<RepertoirePickerOption[]>([])
  const [selectedRepertoireId, setSelectedRepertoireId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitDuplicate, setSubmitDuplicate] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [pending, startTransition] = useTransition()
  const availableOptions = useMemo(
    () => options.filter((option) => !option.hasSong),
    [options]
  )
  const canSubmit = Boolean(selectedRepertoireId) && !pending

  useEffect(() => {
    if (!open) return

    let isActive = true

    async function loadOptions() {
      setIsLoading(true)
      setLoadError("")
      setSubmitError("")
      setSubmitDuplicate("")
      setSubmitSuccess("")

      try {
        const response = await fetch(
          `/api/repertoires/options-for-song?songId=${encodeURIComponent(songId)}`,
          { cache: "no-store" }
        )

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const nextOptions = await response.json() as RepertoirePickerOption[]

        if (isActive) {
          setOptions(nextOptions)
          setSelectedRepertoireId("")
        }
      } catch {
        if (isActive) {
          setLoadError("Não foi possível carregar os repertórios.")
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isActive = false
    }
  }, [open, songId])

  function confirmSelection() {
    if (!selectedRepertoireId) return

    const repertoireId = selectedRepertoireId
    const formData = new FormData()

    formData.set("songId", songId)
    formData.set("repertoireId", repertoireId)

    setSubmitError("")
    setSubmitDuplicate("")
    setSubmitSuccess("")

    startTransition(async () => {
      const result = await addSongToRepertoireAction({}, formData)

      if (result.status === "error" || result.error) {
        setSubmitError(result.error ?? "Não foi possível adicionar ao repertório.")
        return
      }

      if (result.status === "duplicate") {
        setOptions((currentOptions) =>
          currentOptions.map((option) =>
            option.id === repertoireId ? { ...option, hasSong: true } : option
          )
        )
        setSelectedRepertoireId("")
        setSubmitDuplicate(
          result.message ?? "Esta música já está no repertório selecionado."
        )
        return
      }

      setOptions((currentOptions) =>
        currentOptions.map((option) =>
          option.id === repertoireId ? { ...option, hasSong: true } : option
        )
      )
      setSelectedRepertoireId("")
      setSubmitSuccess(result.success ?? "Música adicionada ao repertório.")
    })
  }

  function selectRepertoire(repertoireId: string) {
    setSelectedRepertoireId(repertoireId)
    setSubmitError("")
    setSubmitDuplicate("")
    setSubmitSuccess("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar ao repertório</DialogTitle>
          <DialogDescription>{songTitle}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-(--text-muted)">
            Carregando repertórios...
          </div>
        ) : null}

        {!isLoading && loadError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        {!isLoading && !loadError && options.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
            <h3 className="text-sm font-semibold text-(--text)">Nenhum repertório disponível.</h3>
            <p className="mt-2 text-sm text-(--text-muted)">
              Crie um repertório antes de adicionar músicas.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/repertoires/create">Criar repertório</Link>
            </Button>
          </div>
        ) : null}

        {!isLoading && !loadError && options.length > 0 ? (
          <div className="grid gap-4">
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              {options.map((option) => {
                const isSelected = selectedRepertoireId === option.id

                return (
                  <label
                    key={option.id}
                    className={
                      option.hasSong
                        ? "flex cursor-not-allowed items-start gap-3 border-b border-border p-3 opacity-55 last:border-0"
                        : isSelected
                          ? "flex cursor-pointer items-start gap-3 border-b border-border bg-(--bg3) p-3 last:border-0"
                          : "flex cursor-pointer items-start gap-3 border-b border-border p-3 hover:bg-(--bg3) last:border-0"
                    }
                  >
                    <input
                      type="radio"
                      name="selectedRepertoire"
                      value={option.id}
                      disabled={option.hasSong}
                      checked={isSelected}
                      onChange={() => selectRepertoire(option.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-(--text)">
                        {option.name}
                      </span>
                      <span className="mt-1 block text-xs text-(--text-muted)">
                        {option.dateLabel} · {getItemsCountLabel(option.itemsCount)}
                        {option.hasSong ? " · já contém esta música" : ""}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {availableOptions.length === 0 ? (
              <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--text-muted)">
                Esta música já está em todos os repertórios disponíveis.
              </p>
            ) : null}

            {submitError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            {submitDuplicate ? (
              <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--text-muted)">
                {submitDuplicate}
              </p>
            ) : null}

            {submitSuccess ? (
              <p className="rounded-md border border-border bg-(--bg3) px-3 py-2 text-sm text-(--accent)">
                {submitSuccess}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button type="button" disabled={!canSubmit} onClick={confirmSelection}>
                {pending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
