'use client'

import type { CSSProperties } from 'react'
import { Song } from '@/domain/entities/song'
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
  const viewerStyle = visualConfig
    ? {
      '--song-lyrics-font-size': `${visualConfig.lyricFontSize}px`,
      '--song-chord-font-size': `${visualConfig.chordFontSize}px`,
      '--song-chord-row-height': `${Math.max(20, visualConfig.chordFontSize + 9)}px`,
    } as CSSProperties
    : undefined

  return (
    <article className="song-viewer" style={viewerStyle}>
      <header className="song-header">
        <h1 className="song-title">{song.title}</h1>
        <p className="song-artist">{song.artist.name}</p>
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
