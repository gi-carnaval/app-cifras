import Pocketbase from 'pocketbase'

export type PocketbaseRepositoryOptions = {
  serializedSession?: string
}

export function createPocketbaseClient() {
  return new Pocketbase(process.env.NEXT_PUBLIC_PB_URL)
}

export function createAuthenticatedPocketbaseClient(options?: PocketbaseRepositoryOptions) {
  const pb = createPocketbaseClient()

  if (options?.serializedSession) {
    pb.authStore.loadFromCookie(options.serializedSession)
  }

  return pb
}

export const pb = createPocketbaseClient()
