'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { transposeSong } from '@/core/chord-engine'
import { Song } from '@/domain/entities/song'
import SongViewer from './SongViewer'

type ViewMode = 'chord' | 'pdf'

interface SongPageClientProps {
  initialSong: Song
}

function getPdfUrl(song: Song) {
  if (!song.cifraPDF) return null

  const baseUrl = process.env.NEXT_PUBLIC_PB_URL?.replace(/\/$/, '')
  if (!baseUrl) return null

  return `${baseUrl}/api/files/songs/${song.id}/${encodeURIComponent(song.cifraPDF)}`
}

export default function SongPageClient({ initialSong }: SongPageClientProps) {
  const [song, setSong] = useState(initialSong)
  const [steps, setSteps] = useState(0)
  const [mode, setMode] = useState<ViewMode>('chord')
  const [songFontSize, setSongFontSize] = useState(16)
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
  const pdfUrl = getPdfUrl(song)
  const visualConfig = {
    lyricFontSize: songFontSize,
    chordFontSize: Math.round(songFontSize * 0.8125),
  }
  const mobileToolButtonClass =
    'h-11 flex-1 flex-col gap-0 border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] hover:bg-[var(--accent)] hover:text-[var(--bg)]'

  function applyTranspose(delta: number) {
    const next = steps + delta
    setSong((currentSong) => ({
      ...currentSong,
      sections: transposeSong(currentSong.sections, delta),
    }))
    setSteps(next)
  }

  function resetTranspose() {
    setSong(initialSong)
    setSteps(0)
  }

  function decreaseFontSize() {
    setSongFontSize((currentSize) => Math.max(12, currentSize - 1))
  }

  function increaseFontSize() {
    setSongFontSize((currentSize) => Math.min(28, currentSize + 1))
  }

  function resetFontSize() {
    setSongFontSize(16)
  }

  return (
    <main className="max-w-215 mx-auto my-0 pt-0 pb-28 sm:pb-20 px-6">
      <div className="song-toolbar">
        <Link href="/" className="back-link">← Todas as músicas</Link>
        <Link href={`/song/${song.id}/edit`} className="btn-ghost btn-sm">Editar cifra</Link>
      </div>

      <div className="song-view-mode-bar">
        <div className="song-view-mode-toggle" aria-label="Modo de visualização">
          <Button
            type="button"
            variant={mode === 'chord' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('chord')}
          >
            Letra e Cifra
          </Button>
          <Button
            type="button"
            variant={mode === 'pdf' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('pdf')}
          >
            PDF
          </Button>
        </div>
      </div>

      {mode === 'chord' && (
        <>
          <div className="hidden sm:flex items-center justify-between gap-3 flex-wrap py-2 mb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="transpose-label">Tom</span>
              <div className="transpose-controls">
                <button
                  type="button"
                  className="transpose-btn"
                  onClick={() => applyTranspose(-1)}
                >
                  −1
                </button>
                <span className="transpose-value">
                  {steps === 0 ? 'Original' : `${steps > 0 ? '+' : ''}${steps} st`}
                </span>
                <button
                  type="button"
                  className="transpose-btn"
                  onClick={() => applyTranspose(+1)}
                >
                  +1
                </button>
                {steps !== 0 && (
                  <button
                    type="button"
                    className="transpose-reset"
                    onClick={resetTranspose}
                    title="Voltar ao original"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>

            <div className="song-font-controls" aria-label="Tamanho da fonte">
              <span className="transpose-label">Fonte</span>
              <Button type="button" variant="outline" size="sm" onClick={decreaseFontSize}>
                A-
              </Button>
              <span className="song-font-value">{songFontSize}px</span>
              <Button type="button" variant="outline" size="sm" onClick={increaseFontSize}>
                A+
              </Button>
              {songFontSize !== 16 && (
                <Button type="button" variant="ghost" size="sm" onClick={resetFontSize}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          <SongViewer song={song} visualConfig={visualConfig} />

          <div
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden"
            role="toolbar"
            aria-label="Ferramentas de leitura"
          >
            <div className="mx-auto flex max-w-sm items-center justify-between gap-2 rounded-lg border border-border bg-(--bg2) p-2 shadow-lg shadow-black/30">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={mobileToolButtonClass}
                onClick={() => applyTranspose(-1)}
                aria-label="Diminuir tom"
              >
                <span className="text-sm font-semibold leading-none">-1</span>
                <span className="text-[0.65rem] leading-none opacity-70">Tom</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={mobileToolButtonClass}
                onClick={() => applyTranspose(+1)}
                aria-label="Aumentar tom"
              >
                <span className="text-sm font-semibold leading-none">+1</span>
                <span className="text-[0.65rem] leading-none opacity-70">Tom</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={mobileToolButtonClass}
                onClick={decreaseFontSize}
                aria-label="Diminuir fonte"
              >
                <span className="text-sm font-semibold leading-none">A-</span>
                <span className="text-[0.65rem] leading-none opacity-70">Fonte</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={mobileToolButtonClass}
                onClick={increaseFontSize}
                aria-label="Aumentar fonte"
              >
                <span className="text-sm font-semibold leading-none">A+</span>
                <span className="text-[0.65rem] leading-none opacity-70">Fonte</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {mode === 'pdf' && (
        <div className={isPdfFullscreen ? 'song-pdf-viewer fullscreen' : 'song-pdf-viewer'}>
          {pdfUrl ? (
            <>
              <div className="song-pdf-toolbar hidden sm:flex">
                <span className="song-pdf-title">{song.title || 'PDF da cifra'}</span>
                {isPdfFullscreen ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsPdfFullscreen(false)}>
                    Fechar
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsPdfFullscreen(true)}>
                    Abrir em tela cheia
                  </Button>
                )}
              </div>
              <iframe
                className="song-pdf-frame hidden sm:block"
                src={pdfUrl}
                title={`PDF - ${song.title}`}
              />
              <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-5 py-12 text-center sm:hidden">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{song.title || 'PDF da cifra'}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Visualização móvel</p>
                </div>
                <Button type="button" asChild>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    Abrir PDF
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="song-pdf-empty">
              <p>Nenhum PDF disponível para esta música</p>
              <Button type="button" asChild>
                <Link href={`/song/${song.id}/edit`}>Adicionar PDF</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
