'use client'

import { Button } from '@/components/ui/button'

interface SongAddToRepertoireMenuItemProps {
  onSelect: () => void
}

export function SongAddToRepertoireMenuItem({
  onSelect,
}: SongAddToRepertoireMenuItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-full justify-start rounded-none"
      onClick={onSelect}
    >
      Adicionar ao repertório
    </Button>
  )
}
