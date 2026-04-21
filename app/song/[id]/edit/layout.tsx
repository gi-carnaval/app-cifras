import type { ReactNode } from 'react'

import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'

interface EditSongLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function EditSongLayout({ children, params }: EditSongLayoutProps) {
  const { id } = await params

  await requireAuthenticatedUser(`/song/${id}/edit`)

  return children
}
