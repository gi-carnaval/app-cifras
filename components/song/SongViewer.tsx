'use client'

import type { CSSProperties } from 'react'
import { useChordNotation } from '@/components/chord-notation/chord-notation-provider'
import { Song } from '@/domain/entities/song'
import { getSongKeyMetadata } from '@/application/use-cases/songs/get-song-key-metadata'
import CifraLine from './CifraLine'

export interface SongVisualConfig {
  lyricFontSize: number
  chordFontSize: number
}

interface SongViewerProps {
  song: Song
  visualConfig?: SongVisualConfig
}

export default function SongViewer({ song, visualConfig }: SongViewerProps) {
  const { notation } = useChordNotation()
  const viewerStyle = visualConfig
    ? {
      '--song-lyrics-font-size': `${visualConfig.lyricFontSize}px`,
      '--song-chord-font-size': `${visualConfig.chordFontSize}px`,
      '--song-chord-row-height': `${Math.max(20, visualConfig.chordFontSize + 9)}px`,
    } as CSSProperties
    : undefined
  const { keyLabel, capoLabel } = getSongKeyMetadata({
    defaultKey: song.defaultKey,
    capo: song.capo,
    notation,
  })
  const metadata = [song.artist.name, keyLabel, capoLabel].filter((item): item is string => Boolean(item))

  return (
    <article className="song-viewer" style={viewerStyle}>
      <header className="song-header">
        <h1 className="song-title">{song.title}</h1>
        {metadata.length > 0 ? (
          <div className="song-meta">
            {metadata.map((item) => (
              <p key={item} className="song-meta-item">{item}</p>
            ))}
          </div>
        ) : null}
      </header>

      <div className="song-body">
        {song.sections.map((section) => (
          <section key={section.id} className="section-block">
            <h2 className="section-name">{section.name}</h2>
            <div className="section-lines">
              {section.lines.map((line) => (
                <CifraLine key={line.id} line={line} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
