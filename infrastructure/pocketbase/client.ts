import Pocketbase from 'pocketbase'

export const pb = new Pocketbase(process.env.NEXT_PUBLIC_PB_URL)