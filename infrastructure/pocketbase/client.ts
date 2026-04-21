import Pocketbase from 'pocketbase'

export function createPocketbaseClient() {
  return new Pocketbase(process.env.NEXT_PUBLIC_PB_URL)
}

export const pb = createPocketbaseClient()
