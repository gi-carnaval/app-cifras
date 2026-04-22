export type SongActionTarget = {
  id: string
  title: string
}

export function toSongActionTarget(song: SongActionTarget): SongActionTarget {
  return {
    id: song.id,
    title: song.title,
  }
}
