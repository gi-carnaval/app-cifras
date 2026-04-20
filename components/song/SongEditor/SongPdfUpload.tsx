'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SongPdfUploadProps {
  selectedFile: File | null
  onConfirm: (file: File | null) => void
}

export default function SongPdfUpload({
  selectedFile,
  onConfirm,
}: SongPdfUploadProps) {
  const [open, setOpen] = useState(false)
  const [draftFile, setDraftFile] = useState<File | null>(selectedFile)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const filePickerOpenedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      filePickerOpenedRef.current = false
      return
    }

    if (filePickerOpenedRef.current) return

    filePickerOpenedRef.current = true
    fileInputRef.current?.click()
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setDraftFile(selectedFile)
    }
  }

  function handleConfirm() {
    onConfirm(draftFile)
    setOpen(false)
  }

  return (
    <div className="pdf-upload-row">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            Adicionar PDF
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar PDF</DialogTitle>
            <DialogDescription>
              Selecione o arquivo PDF da cifra. O envio acontece somente ao salvar a música.
            </DialogDescription>
          </DialogHeader>

          <div className="pdf-upload-field">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                setDraftFile(event.target.files?.[0] ?? null)
              }}
            />
            <p className="pdf-upload-file">
              {draftFile ? draftFile.name : 'Nenhum arquivo selecionado'}
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedFile && (
        <span className="pdf-upload-selected">
          PDF selecionado: {selectedFile.name}
        </span>
      )}
    </div>
  )
}
