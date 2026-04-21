import type { ReactNode } from 'react'

import { requireAuthenticatedUser } from '@/app/auth/require-authenticated-user'

export default async function CreateSongLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser('/song/create')

  return children
}
