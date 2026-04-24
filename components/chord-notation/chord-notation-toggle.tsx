'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useChordNotation } from './chord-notation-provider'

type ChordNotationToggleProps = {
  className?: string
  labelClassName?: string
}

const notationLabels = {
  international: {
    label: 'Internacional',
    shortLabel: 'INT',
  },
  brazilian: {
    label: 'Brasileira',
    shortLabel: 'BR',
  },
} as const

export function ChordNotationToggle({
  className,
  labelClassName,
}: ChordNotationToggleProps = {}) {
  const { notation, setNotation } = useChordNotation()
  const currentNotation = notationLabels[notation]

  function cycleNotation() {
    setNotation(notation === 'international' ? 'brazilian' : 'international')
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      aria-label={`Notação de acordes: ${currentNotation.label}`}
      title="Alternar notação dos acordes"
      onClick={cycleNotation}
    >
      <span className="font-mono text-[0.72rem] font-semibold tracking-[0.18em]">
        {currentNotation.shortLabel}
      </span>
      <span className={cn('hidden sm:inline', labelClassName)}>
        {currentNotation.label}
      </span>
    </Button>
  )
}
