'use client'

import { useState, useRef, useEffect } from 'react'
import {
  addChordFromString,
  removeChord,
  getCursorPosition,
  parseChord,
  formatChord,
  // transposeSong,
} from '@/core/chord-engine'
import { createEmptySection, createEmptyLine } from '@/core/song-store'
import { Artist } from '@/domain/entities/artist'
import { Song } from '@/domain/entities/song'
import { moveChordIndex } from '@/application/use-cases/songs/move-chord-index'
import useSongArtists from './useSongArtists'
import { Chord } from '@/types'

interface PopupState {
  visible: boolean
  lineId: string | null
  sectionId: string | null
  cursorIndex: number
  top: number
  left: number
}

const POPUP_INITIAL: PopupState = {
  visible: false,
  lineId: null,
  sectionId: null,
  cursorIndex: 0,
  top: 0,
  left: 0,
}

function getArtistById(artists: Artist[], artistId: string | null) {
  if (!artistId) return null

  return artists.find((artist) => artist.id === artistId) ?? null
}

interface SongEditorSaveOptions {
  cifraPdfFile?: File | null
}

export function useSongEditorController(
  initialSong: Song,
  onSave: (song: Song, options?: SongEditorSaveOptions) => void | Promise<void>
) {
  const [song, setSong] = useState<Song>(initialSong)
  // const [transpose, setTranspose] = useState(0)  // semitones relative to original
  const [popup, setPopup] = useState<PopupState>(POPUP_INITIAL)
  const [defaultKey, setDefaultKey] = useState(formatChord(initialSong.defaultKey))
  const [popupInput, setPopupInput] = useState('')
  const [popupError, setPopupError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const popupInputRef = useRef<HTMLInputElement>(null)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(initialSong.artist?.id ?? null)
  const {
    artists,
    isLoading: isLoadingArtists,
    isCreating: isCreatingArtist,
    error: artistsError,
    createError: artistCreateError,
    createArtist,
  } = useSongArtists()

  // Close popup on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus popup input when it opens
  useEffect(() => {
    if (popup.visible) {
      setTimeout(() => popupInputRef.current?.focus(), 50)
    }
  }, [popup.visible])

  // ─── Popup helpers ──────────────────────────────────────────────────────────

  function closePopup() {
    setPopup(POPUP_INITIAL)
    setPopupInput('')
    setPopupError(null)
  }

  function openPopup(sectionId: string, lineId: string) {
    const ta = textareaRefs.current[lineId]
    if (!ta) return

    const cursor = getCursorPosition(ta)

    // Estimate pixel position of cursor in textarea
    const rect = ta.getBoundingClientRect()
    const charWidth = 9 // approximate for popup positioning
    const approxLeft = Math.min(cursor * charWidth, rect.width - 160)

    setPopup({
      visible: true,
      sectionId,
      lineId,
      cursorIndex: cursor,
      top: rect.top + window.scrollY - 64,  // above textarea
      left: rect.left + window.scrollX + approxLeft,
    })
    setPopupInput('')
    setPopupError(null)
  }

  function commitPopup() {
    if (!popup.lineId || !popup.sectionId) return
    if (!popupInput.trim()) {
      setPopupError('Digite o acorde.')
      return
    }

    try {
      parseChord(popupInput.trim())
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message.replace('parseChord: ', '') : 'valor inválido'
      setPopupError(`Acorde inválido: ${message}`)
      return
    }

    setSong((s) => {
      const newSections = s.sections.map((sec) => {
        if (sec.id !== popup.sectionId) return sec
        return {
          ...sec,
          lines: sec.lines.map((l) => {
            if (l.id !== popup.lineId) return l
            try {
              return addChordFromString(l, popup.cursorIndex, popupInput.trim())
            } catch (e: unknown) {
              setPopupError(e instanceof Error ? e.message : 'Erro ao adicionar acorde.')
              return l
            }
          }),
        }
      })
      return { ...s, sections: newSections }
    })

    closePopup()
  }

  // ─── Transposition ──────────────────────────────────────────────────────────

  // function applyTranspose(delta: number) {
  //   const next = transpose + delta
  //   setSong((s) => ({ ...s, sections: transposeSong(s.sections, delta) }))
  //   setTranspose(next)
  // }

  // function resetTranspose() {
  //   // Transpose back by -transpose to return to original
  //   setSong((s) => ({ ...s, sections: transposeSong(s.sections, -transpose) }))
  //   setTranspose(0)
  // }

  // ─── Song meta ──────────────────────────────────────────────────────────────

  function updateMeta(field: 'title' | 'defaultKey', value: string | Chord) {
    console.log({ field, value })
    setSong((s) => ({ ...s, [field]: value }))
  }

  function updateDefaultKey(value: string) {
    setDefaultKey(value)
    if (!value || !parseChord(value)) return
    setSong((s) => ({ ...s, defaultKey: parseChord(value) }))
  }

  function updateArtist(artistId: string) {
    setSelectedArtistId(artistId)

    const selectedArtist = getArtistById(artists, artistId)
    if (!selectedArtist) return

    setSong((s) => ({ ...s, artist: selectedArtist }))
  }

  // ─── Section management ─────────────────────────────────────────────────────

  function addSection() {
    setSong((s) => ({ ...s, sections: [...s.sections, createEmptySection()] }))
  }

  function updateSectionName(sectionId: string, name: string) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) => sec.id === sectionId ? { ...sec, name } : sec),
    }))
  }

  function removeSection(sectionId: string) {
    setSong((s) => ({ ...s, sections: s.sections.filter((sec) => sec.id !== sectionId) }))
  }

  // ─── Line management ────────────────────────────────────────────────────────

  function addLine(sectionId: string) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, lines: [...sec.lines, createEmptyLine()] } : sec
      ),
    }))
  }

  function removeLine(sectionId: string, lineId: string) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, lines: sec.lines.filter((l) => l.id !== lineId) }
          : sec
      ),
    }))
  }

  function updateLyrics(sectionId: string, lineId: string, lyrics: string) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, lines: sec.lines.map((l) => l.id === lineId ? { ...l, lyrics } : l) }
          : sec
      ),
    }))
  }

  function handleRemoveChord(sectionId: string, lineId: string, index: number) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? {
            ...sec,
            lines: sec.lines.map((l) => l.id === lineId ? removeChord(l, index) : l),
          }
          : sec
      ),
    }))
  }

  function handleMoveChord(sectionId: string, lineId: string, index: number, delta: -1 | 1) {
    setSong((s) => ({
      ...s,
      sections: s.sections.map((sec) =>
        sec.id === sectionId
          ? {
            ...sec,
            lines: sec.lines.map((l) => l.id === lineId ? moveChordIndex(l, index, delta) : l),
          }
          : sec
      ),
    }))
  }

  // ─── Save ───────────────────────────────────────────────────────────────────

  async function handleSave(options?: SongEditorSaveOptions) {
    const selectedArtist = getArtistById(artists, selectedArtistId)
    const songToSave = selectedArtist ? { ...song, artist: selectedArtist } : song

    setSong(songToSave)
    await onSave(songToSave, options)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return {
    // state
    song,
    defaultKey,
    popup,
    popupInput,
    popupError,
    saved,
    artists,
    isLoadingArtists,
    isCreatingArtist,
    artistsError,
    artistCreateError,
    selectedArtistId,
    textareaRefs,
    popupInputRef,

    // setters
    setPopupInput,
    setPopupError,
    setDefaultKey,

    // actions
    openPopup,
    closePopup,
    commitPopup,
    updateMeta,
    updateArtist,
    addSection,
    addLine,
    removeLine,
    updateLyrics,
    handleSave,
    handleRemoveChord,
    handleMoveChord,
    updateSectionName,
    removeSection,
    createArtist,
    updateDefaultKey
  }
}
