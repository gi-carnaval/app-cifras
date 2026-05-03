'use client'

import { useEffect, useRef, useState } from 'react'
import { splitLineForRender, chordsForChunk, formatChord } from '@/core/chord-engine'
import { useChordNotation } from '@/components/chord-notation/chord-notation-provider'
import { Line } from '@/domain/entities/song'

const DEFAULT_CHAR_WIDTH = 9.6
const CHAR_WIDTH_SAMPLE = 'mmmmmmmmmmmmmmmmmmmm'

interface CifraLineProps {
  line: Line
  showChords?: boolean
}

export default function CifraLine({ line, showChords = true }: CifraLineProps) {
  const { notation } = useChordNotation()
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(800)
  const [charWidth, setCharWidth] = useState<number>(DEFAULT_CHAR_WIDTH)

  // Observe container width for responsive chunking
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContainerWidth(w)
    })
    obs.observe(containerRef.current)
    setContainerWidth(containerRef.current.offsetWidth || 800)
    return () => obs.disconnect()
  }, [])

  // Measure the actual rendered monospace column width so indexes remain aligned after font scaling.
  useEffect(() => {
    const measureCharWidth = () => {
      const sampleWidth = measureRef.current?.getBoundingClientRect().width
      if (!sampleWidth) return

      setCharWidth(sampleWidth / CHAR_WIDTH_SAMPLE.length)
    }

    measureCharWidth()

    const obs = new ResizeObserver(measureCharWidth)
    if (measureRef.current) obs.observe(measureRef.current)

    document.fonts?.ready.then(measureCharWidth).catch(() => undefined)
    window.addEventListener('resize', measureCharWidth)

    return () => {
      obs.disconnect()
      window.removeEventListener('resize', measureCharWidth)
    }
  }, [])

  const chunks = splitLineForRender(line, containerWidth, charWidth)

  return (
    <div ref={containerRef} className="cifra-line-v2">
      <span ref={measureRef} className="cifra-char-measure" aria-hidden="true">
        {CHAR_WIDTH_SAMPLE}
      </span>

      {chunks.map((chunk, i) => {
        const chordItems = chordsForChunk(line.chords, chunk)

        return (
          <div key={i} className={showChords ? 'cifra-chunk' : 'cifra-chunk cifra-chunk-lyrics-only'}>
            {showChords ? (
              <div className="chords-layer" aria-hidden="true">
                {chordItems.map((item) => (
                  <span
                    key={item.absoluteIndex}
                    className="chord"
                    style={{ left: `${item.relativeIndex * charWidth}px` }}
                  >
                    {formatChord(item.chord, { notation })}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="lyrics">{chunk.text || '\u00A0'}</div>
          </div>
        )
      })}
    </div>
  )
}
