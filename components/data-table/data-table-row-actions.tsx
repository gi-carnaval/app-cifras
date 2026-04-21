'use client'

import type { ReactNode } from 'react'

interface DataTableRowActionsProps {
  children: ReactNode
}

export function DataTableRowActions({ children }: DataTableRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {children}
    </div>
  )
}
