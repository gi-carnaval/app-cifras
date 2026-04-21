'use client'

import type { ReactNode } from 'react'

interface DataTableToolbarProps {
  children?: ReactNode
}

export function DataTableToolbar({ children }: DataTableToolbarProps) {
  if (!children) return null

  return (
    <div className="flex items-center justify-between gap-3">
      {children}
    </div>
  )
}
