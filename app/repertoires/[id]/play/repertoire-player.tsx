"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import Link from "next/link"
import { getSongKeyMetadata } from "@/application/use-cases/songs/get-song-key-metadata"
import { useChordNotation } from "@/components/chord-notation/chord-notation-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SongViewer from "@/components/song/SongViewer"
import type { Song } from "@/domain/entities/song"
import { formatChord } from "@/core/chord-engine"

export type RepertoirePlayerItem = {
  id: string
  position: number
  notes: string
  customKeyLabel: string | null
  song: Song
}

type RepertoirePlayerProps = {
  repertoireId: string
  repertoireName: string
  initialIndex: number
  items: RepertoirePlayerItem[]
}

type PlayerViewMode = "lyrics" | "pdf"
type LyricsVisualizationMode = "lyrics-with-chords" | "lyrics-only"
type AutoScrollSpeedLevel = 1 | 2 | 3 | 4 | 5
const PLAYER_FONT_SIZE_STORAGE_KEY = "cifras-app-repertoire-player-font-size"
const PLAYER_AUTO_SCROLL_SPEED_STORAGE_KEY = "cifras-app-repertoire-player-auto-scroll-speed"
const PLAYER_LYRICS_VISUALIZATION_MODE_STORAGE_KEY = "cifras-app-repertoire-player-lyrics-visualization-mode"
const DEFAULT_PLAYER_FONT_SIZE = 20
const MIN_PLAYER_FONT_SIZE = 16
const MAX_PLAYER_FONT_SIZE = 30
const AUTO_SCROLL_SPEED_LEVELS = [1, 2, 3, 4, 5] as const
const AUTO_SCROLL_VELOCITY_BY_LEVEL: Record<AutoScrollSpeedLevel, number> = {
  1: 6,
  2: 12,
  3: 24,
  4: 36,
  5: 48,
}
const DEFAULT_AUTO_SCROLL_SPEED_LEVEL: AutoScrollSpeedLevel = 3
const AUTO_SCROLL_INTERVAL_MS = 16
const MOBILE_CONTROLS_HIDE_DELAY_MS = 3200
const MOBILE_TAP_MOVE_THRESHOLD = 12
const CURRENT_INDEX_PERSIST_DEBOUNCE_MS = 800
const DEFAULT_LYRICS_VISUALIZATION_MODE: LyricsVisualizationMode = "lyrics-with-chords"

function clampIndex(index: number, maxIndex: number) {
  return Math.min(Math.max(index, 0), maxIndex)
}

function clampFontSize(fontSize: number) {
  return Math.min(Math.max(fontSize, MIN_PLAYER_FONT_SIZE), MAX_PLAYER_FONT_SIZE)
}

function clampAutoScrollSpeedLevel(level: number): AutoScrollSpeedLevel {
  if (level <= AUTO_SCROLL_SPEED_LEVELS[0]) {
    return AUTO_SCROLL_SPEED_LEVELS[0]
  }

  if (level >= AUTO_SCROLL_SPEED_LEVELS[AUTO_SCROLL_SPEED_LEVELS.length - 1]) {
    return AUTO_SCROLL_SPEED_LEVELS[AUTO_SCROLL_SPEED_LEVELS.length - 1]
  }

  return Math.round(level) as AutoScrollSpeedLevel
}

function mapStoredAutoScrollSpeedLevel(value: number): AutoScrollSpeedLevel {
  if (AUTO_SCROLL_SPEED_LEVELS.includes(value as AutoScrollSpeedLevel)) {
    return value as AutoScrollSpeedLevel
  }

  if (value <= 12) {
    return 1
  }

  if (value <= 24) {
    return 2
  }

  if (value <= 36) {
    return 3
  }

  if (value <= 48) {
    return 4
  }

  return 5
}

function getAutoScrollVelocity(level: AutoScrollSpeedLevel) {
  return AUTO_SCROLL_VELOCITY_BY_LEVEL[level]
}

function getMaxScrollTop(element: HTMLDivElement) {
  return Math.max(0, element.scrollHeight - element.clientHeight)
}

function readStoredPlayerFontSize() {
  if (typeof window === "undefined") {
    return DEFAULT_PLAYER_FONT_SIZE
  }

  const rawValue = window.localStorage.getItem(PLAYER_FONT_SIZE_STORAGE_KEY)
  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_PLAYER_FONT_SIZE
  }

  return clampFontSize(parsedValue)
}

function readStoredAutoScrollSpeed() {
  if (typeof window === "undefined") {
    return DEFAULT_AUTO_SCROLL_SPEED_LEVEL
  }

  const rawValue = window.localStorage.getItem(PLAYER_AUTO_SCROLL_SPEED_STORAGE_KEY)
  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_AUTO_SCROLL_SPEED_LEVEL
  }

  return mapStoredAutoScrollSpeedLevel(parsedValue)
}

function readStoredLyricsVisualizationMode(): LyricsVisualizationMode {
  if (typeof window === "undefined") {
    return DEFAULT_LYRICS_VISUALIZATION_MODE
  }

  const storedMode = window.localStorage.getItem(PLAYER_LYRICS_VISUALIZATION_MODE_STORAGE_KEY)

  if (storedMode === "lyrics-only") {
    return "lyrics-only"
  }

  return DEFAULT_LYRICS_VISUALIZATION_MODE
}

function getPdfUrl(song: Song) {
  if (!song.cifraPDF) return null

  const baseUrl = process.env.NEXT_PUBLIC_PB_URL?.replace(/\/$/, "")

  if (!baseUrl) return null

  return `${baseUrl}/api/files/songs/${song.id}/${encodeURIComponent(song.cifraPDF)}`
}

function hasStructuredLyrics(song: Song) {
  return song.sections.some((section) =>
    section.lines.some((line) => line.lyrics.trim() || line.chords.length > 0)
  )
}

function getInitialViewMode(song: Song): PlayerViewMode {
  if (hasStructuredLyrics(song)) return "lyrics"
  if (getPdfUrl(song)) return "pdf"

  return "lyrics"
}

export function RepertoirePlayer({
  repertoireId,
  repertoireName,
  initialIndex,
  items,
}: RepertoirePlayerProps) {
  const { notation } = useChordNotation()
  const [currentIndex, setCurrentIndex] = useState(() =>
    items.length > 0 ? clampIndex(initialIndex, items.length - 1) : 0
  )
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isSongListOpen, setIsSongListOpen] = useState(false)
  const [fontSize, setFontSize] = useState(readStoredPlayerFontSize)
  const [autoScrollSpeedLevel, setAutoScrollSpeedLevel] = useState(readStoredAutoScrollSpeed)
  const [lyricsVisualizationMode, setLyricsVisualizationMode] = useState(readStoredLyricsVisualizationMode)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(true)
  const [viewMode, setViewMode] = useState<PlayerViewMode>(() =>
    items.length > 0 ? getInitialViewMode(items[clampIndex(initialIndex, items.length - 1)]?.song) : "lyrics"
  )
  const lyricsScrollAreaRef = useRef<HTMLDivElement | null>(null)
  const autoScrollIntervalRef = useRef<number | null>(null)
  const autoScrollRemainderRef = useRef(0)
  const mobileControlsHideTimeoutRef = useRef<number | null>(null)
  const contentPointerStateRef = useRef<{ x: number, y: number } | null>(null)
  const contentPointerMovedRef = useRef(false)
  const persistTimeoutRef = useRef<number | null>(null)
  const lastPersistedIndexRef = useRef(initialIndex)
  const pendingPersistIndexRef = useRef<number | null>(null)
  const isPersistingIndexRef = useRef(false)
  const hasMountedRef = useRef(false)
  const currentItem = items[currentIndex] ?? null
  const progressLabel = currentItem ? `${currentIndex + 1} / ${items.length}` : "0 / 0"
  const visualConfig = {
    lyricFontSize: fontSize,
    chordFontSize: fontSize,
    showChords: lyricsVisualizationMode === "lyrics-with-chords",
  }
  const hasLyrics = currentItem ? hasStructuredLyrics(currentItem.song) : false
  const pdfUrl = currentItem ? getPdfUrl(currentItem.song) : null
  const hasPdf = Boolean(pdfUrl)
  const hasLyricsContentView = hasLyrics && viewMode === "lyrics"
  const currentSongMetadata = currentItem
    ? getSongKeyMetadata({
      defaultKey: currentItem.song.defaultKey,
      capo: currentItem.song.capo,
      notation,
    })
    : { keyLabel: null, capoLabel: null }

  useEffect(() => {
    window.localStorage.setItem(PLAYER_FONT_SIZE_STORAGE_KEY, String(fontSize))
  }, [fontSize])

  useEffect(() => {
    window.localStorage.setItem(PLAYER_AUTO_SCROLL_SPEED_STORAGE_KEY, String(autoScrollSpeedLevel))
  }, [autoScrollSpeedLevel])

  useEffect(() => {
    window.localStorage.setItem(PLAYER_LYRICS_VISUALIZATION_MODE_STORAGE_KEY, lyricsVisualizationMode)
  }, [lyricsVisualizationMode])

  useEffect(() => {
    scheduleMobileControlsHide()

    return () => {
      clearMobileControlsHideTimeout()
    }
  }, [])

  async function persistCurrentIndex(index: number) {
    if (index === lastPersistedIndexRef.current) {
      return
    }

    isPersistingIndexRef.current = true

    try {
      const response = await fetch(`/api/repertoires/${repertoireId}/current-index`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          currentIndex: index,
        }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível salvar a posição atual do repertório.")
      }

      lastPersistedIndexRef.current = index
    } catch (error) {
      console.error(error)
    } finally {
      isPersistingIndexRef.current = false

      const pendingIndex = pendingPersistIndexRef.current

      if (pendingIndex !== null && pendingIndex !== lastPersistedIndexRef.current) {
        pendingPersistIndexRef.current = null
        void persistCurrentIndex(pendingIndex)
      }
    }
  }

  function stopAutoScroll() {
    if (autoScrollIntervalRef.current !== null) {
      window.clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }

    autoScrollRemainderRef.current = 0
    setIsAutoScrolling(false)
  }

  function clearMobileControlsHideTimeout() {
    if (mobileControlsHideTimeoutRef.current !== null) {
      window.clearTimeout(mobileControlsHideTimeoutRef.current)
      mobileControlsHideTimeoutRef.current = null
    }
  }

  function scheduleMobileControlsHide() {
    clearMobileControlsHideTimeout()
    mobileControlsHideTimeoutRef.current = window.setTimeout(() => {
      setIsMobileControlsVisible(false)
    }, MOBILE_CONTROLS_HIDE_DELAY_MS)
  }

  function showMobileControls() {
    setIsMobileControlsVisible(true)
    scheduleMobileControlsHide()
  }

  function hideMobileControls() {
    clearMobileControlsHideTimeout()
    setIsMobileControlsVisible(false)
  }

  function resetScrollToTop() {
    const scrollArea = lyricsScrollAreaRef.current

    if (!scrollArea) return

    autoScrollRemainderRef.current = 0
    scrollArea.scrollTo({
      top: 0,
      behavior: "auto",
    })
  }

  function selectIndex(index: number) {
    const nextIndex = clampIndex(index, items.length - 1)
    const nextItem = items[nextIndex]

    stopAutoScroll()
    setCurrentIndex(nextIndex)

    if (!nextItem) {
      setViewMode("lyrics")
      return
    }

    setViewMode(getInitialViewMode(nextItem.song))
  }

  function jumpToSong(index: number) {
    selectIndex(index)
    setIsSongListOpen(false)
  }

  function goToPrevious() {
    selectIndex(currentIndex - 1)
  }

  function goToNext() {
    selectIndex(currentIndex + 1)
  }

  function decreaseFontSize() {
    setFontSize((currentFontSize) => clampFontSize(currentFontSize - 1))
  }

  function increaseFontSize() {
    setFontSize((currentFontSize) => clampFontSize(currentFontSize + 1))
  }

  function resetFontSize() {
    setFontSize(DEFAULT_PLAYER_FONT_SIZE)
  }

  function decreaseAutoScrollSpeed() {
    setAutoScrollSpeedLevel((currentLevel) => clampAutoScrollSpeedLevel(currentLevel - 1))
  }

  function increaseAutoScrollSpeed() {
    setAutoScrollSpeedLevel((currentLevel) => clampAutoScrollSpeedLevel(currentLevel + 1))
  }

  function toggleAutoScroll() {
    if (!hasLyrics || viewMode !== "lyrics") return

    showMobileControls()
    setIsAutoScrolling((currentValue) => !currentValue)
  }

  function selectViewMode(mode: PlayerViewMode) {
    if (mode !== "lyrics") {
      stopAutoScroll()
    }

    showMobileControls()
    setViewMode(mode)
  }

  function selectLyricsVisualizationMode(mode: LyricsVisualizationMode) {
    showMobileControls()
    setLyricsVisualizationMode(mode)
  }

  function handleContentPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") {
      return
    }

    contentPointerStateRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
    contentPointerMovedRef.current = false
  }

  function handleContentPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const pointerState = contentPointerStateRef.current

    if (!pointerState) {
      return
    }

    const distanceX = Math.abs(event.clientX - pointerState.x)
    const distanceY = Math.abs(event.clientY - pointerState.y)

    if (distanceX > MOBILE_TAP_MOVE_THRESHOLD || distanceY > MOBILE_TAP_MOVE_THRESHOLD) {
      contentPointerMovedRef.current = true
    }
  }

  function handleContentPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") {
      return
    }

    const wasTap = !contentPointerMovedRef.current

    contentPointerStateRef.current = null
    contentPointerMovedRef.current = false

    if (!wasTap || isMobileControlsVisible) {
      return
    }

    showMobileControls()
  }

  useEffect(() => {
    if (!currentItem || viewMode !== "lyrics" || !hasLyrics) {
      if (autoScrollIntervalRef.current !== null) {
        window.clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      return
    }

    resetScrollToTop()
  }, [currentItem?.id, hasLyrics, viewMode])

  useEffect(() => {
    if (!isMobileControlsVisible) {
      clearMobileControlsHideTimeout()
      return
    }

    scheduleMobileControlsHide()

    return () => {
      clearMobileControlsHideTimeout()
    }
  }, [currentIndex, isFocusMode, isMobileControlsVisible, viewMode])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (persistTimeoutRef.current !== null) {
      window.clearTimeout(persistTimeoutRef.current)
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      const nextIndex = currentIndex

      if (isPersistingIndexRef.current) {
        pendingPersistIndexRef.current = nextIndex
        return
      }

      pendingPersistIndexRef.current = null
      void persistCurrentIndex(nextIndex)
    }, CURRENT_INDEX_PERSIST_DEBOUNCE_MS)

    return () => {
      if (persistTimeoutRef.current !== null) {
        window.clearTimeout(persistTimeoutRef.current)
        persistTimeoutRef.current = null
      }
    }
  }, [currentIndex, repertoireId])

  useEffect(() => {
    if (!isAutoScrolling || viewMode !== "lyrics" || !hasLyrics) {
      if (autoScrollIntervalRef.current !== null) {
        window.clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      return
    }

    const scrollArea = lyricsScrollAreaRef.current

    if (!scrollArea) {
      return
    }

    const maxScrollTop = getMaxScrollTop(scrollArea)

    if (maxScrollTop <= 0) {
      return
    }

    if (autoScrollIntervalRef.current !== null) {
      window.clearInterval(autoScrollIntervalRef.current)
    }

    autoScrollRemainderRef.current = 0
    autoScrollIntervalRef.current = window.setInterval(() => {
      const currentScrollArea = lyricsScrollAreaRef.current

      if (!currentScrollArea) {
        stopAutoScroll()
        return
      }

      const currentMaxScrollTop = getMaxScrollTop(currentScrollArea)

      if (currentMaxScrollTop <= 0) {
        stopAutoScroll()
        return
      }

      const velocity = getAutoScrollVelocity(autoScrollSpeedLevel)
      const nextDistance = autoScrollRemainderRef.current + (velocity * AUTO_SCROLL_INTERVAL_MS) / 1000
      const wholePixels = Math.floor(nextDistance)

      autoScrollRemainderRef.current = nextDistance - wholePixels

      if (wholePixels <= 0) {
        return
      }

      const nextScrollTop = Math.min(currentScrollArea.scrollTop + wholePixels, currentMaxScrollTop)

      currentScrollArea.scrollTop = nextScrollTop

      if (nextScrollTop >= currentMaxScrollTop) {
        stopAutoScroll()
      }
    }, AUTO_SCROLL_INTERVAL_MS)

    return () => {
      if (autoScrollIntervalRef.current !== null) {
        window.clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }
  }, [autoScrollSpeedLevel, hasLyrics, isAutoScrolling, viewMode])

  if (!currentItem) {
    return (
      <main className="mx-auto my-0 max-w-5xl px-6 pb-20 pt-0">
        <div className="flex flex-col gap-3 py-6">
          <Link href={`/repertoires/${repertoireId}`} className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
            Voltar para o repertório
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">{repertoireName}</h1>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-(--bg2) px-4 py-12 text-center">
          <h2 className="text-base font-semibold text-(--text)">Nenhuma música para executar.</h2>
          <p className="mt-2 text-sm text-(--text-muted)">
            Adicione músicas ao repertório antes de abrir o modo de execução.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className={isFocusMode
      ? "min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--accent)_14%,transparent)_0%,transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--bg)_96%,var(--surface))_0%,color-mix(in_oklab,var(--bg)_88%,var(--bg2))_100%)] pb-16 pt-3 md:pb-44"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,var(--bg)_0%,color-mix(in_oklab,var(--bg)_88%,black)_100%)] pb-16 pt-3 md:pb-44 md:pt-4"}
    >
      <div className="md:hidden fixed inset-x-0 top-0 z-40 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pointer-events-none">
        <div
          data-mobile-controls="true"
          onPointerDown={showMobileControls}
          className={isMobileControlsVisible
            ? "pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-[20px] border border-border/80 bg-(--bg)/90 px-3 py-2 shadow-lg shadow-black/15 backdrop-blur transition-all duration-200"
            : "pointer-events-none mx-auto flex max-w-5xl -translate-y-3 items-center justify-between gap-3 rounded-[20px] border border-border/80 bg-(--bg)/90 px-3 py-2 opacity-0 shadow-lg shadow-black/15 backdrop-blur transition-all duration-200"}
        >
          <div className="min-w-0">
            <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              {repertoireName}
            </p>
            <p className="truncate text-sm font-semibold text-(--text)">
              {currentItem.song.title || "Sem título"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex min-h-9 items-center rounded-full border border-border bg-(--surface) px-3 text-sm font-semibold text-(--accent)">
              {progressLabel}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                showMobileControls()
                setIsSongListOpen(true)
              }}
              className="rounded-full"
            >
              Lista
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isFocusMode) {
                  setIsFocusMode(false)
                  showMobileControls()
                  return
                }

                hideMobileControls()
              }}
              className="rounded-full"
            >
              {isFocusMode ? "Sair do foco" : "Ocultar"}
            </Button>
          </div>
        </div>
      </div>

      {!isFocusMode ? (
        <div className="hidden md:block sticky top-0 z-30 px-3 pb-3 sm:px-5">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-[24px] border border-border/80 bg-(--bg)/92 px-4 py-3 shadow-lg shadow-black/15 backdrop-blur md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                Modo execução
              </p>
              <p className="mt-1 truncate text-sm font-medium text-(--text-muted)">
                {repertoireName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex min-h-10 items-center rounded-full border border-border bg-(--bg3) px-3 text-sm font-semibold text-(--accent)">
                {progressLabel}
              </div>
              <Button type="button" variant="ghost" size="sm" asChild className="shrink-0">
                <Link href={`/repertoires/${repertoireId}`}>
                  Sair
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSongListOpen(true)}
                className="shrink-0 rounded-full"
              >
                Lista
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFocusMode(true)}
                className="shrink-0 rounded-full"
              >
                Modo foco
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--text-muted)">
                Música atual
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-(--text) md:text-3xl">
                {currentItem.song.title || "Sem título"}
              </h1>
              <p className="mt-1 text-sm text-(--text-muted)">
                {currentItem.song.artist.name || "Artista não informado"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <span className="inline-flex min-h-9 items-center rounded-full border border-border bg-(--surface) px-3 text-sm font-medium text-(--text-muted)">
                Posição {currentItem.position}
              </span>
              {currentSongMetadata.keyLabel ? (
                <span className="inline-flex min-h-9 items-center rounded-full border border-border bg-(--surface) px-3 text-sm font-medium text-(--accent)">
                  {currentSongMetadata.keyLabel}
                </span>
              ) : null}
              {currentSongMetadata.capoLabel ? (
                <span className="inline-flex min-h-9 items-center rounded-full border border-border bg-(--surface) px-3 text-sm font-medium text-(--text-muted)">
                  {currentSongMetadata.capoLabel}
                </span>
              ) : null}
              {hasLyrics ? (
                <div className="hidden items-center gap-1 rounded-full border border-border bg-(--surface) p-1 md:inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= MIN_PLAYER_FONT_SIZE}
                    className="min-h-8 rounded-full px-2.5"
                  >
                    A-
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFontSize}
                    disabled={fontSize === DEFAULT_PLAYER_FONT_SIZE}
                    className="min-h-8 rounded-full px-2.5 text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={fontSize >= MAX_PLAYER_FONT_SIZE}
                    className="min-h-8 rounded-full px-2.5"
                  >
                    A+
                  </Button>
                </div>
              ) : null}
              {hasPdf ? (
                <Button
                  type="button"
                  variant={viewMode === "pdf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectViewMode("pdf")}
                  className="min-h-9 rounded-full px-4"
                >
                  PDF
                </Button>
              ) : null}
              {hasLyrics ? (
                <div className="hidden items-center gap-1 rounded-full border border-border bg-(--surface) p-1 md:inline-flex">
                  <Button
                    type="button"
                    variant={lyricsVisualizationMode === "lyrics-with-chords" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => selectLyricsVisualizationMode("lyrics-with-chords")}
                    className="min-h-8 rounded-full px-3 text-xs"
                  >
                    Letra e Cifras
                  </Button>
                  <Button
                    type="button"
                    variant={lyricsVisualizationMode === "lyrics-only" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => selectLyricsVisualizationMode("lyrics-only")}
                    className="min-h-8 rounded-full px-3 text-xs"
                  >
                    Apenas Letra
                  </Button>
                </div>
              ) : null}
              {hasLyrics ? (
                <Button
                  type="button"
                  variant={viewMode === "lyrics" ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectViewMode("lyrics")}
                  className="min-h-9 rounded-full px-4"
                >
                  Cifra
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="hidden md:block sticky top-0 z-30 px-3 pb-2 sm:px-5">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-[20px] border border-border/80 bg-(--bg)/88 px-3 py-2 shadow-lg shadow-black/15 backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                {repertoireName}
              </p>
              <p className="truncate text-sm font-semibold text-(--text)">
                {currentItem.song.title || "Sem título"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex min-h-9 items-center rounded-full border border-border bg-(--surface) px-3 text-sm font-semibold text-(--accent)">
                {progressLabel}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSongListOpen(true)}
                className="rounded-full"
              >
                Lista
              </Button>
              {hasLyrics ? (
                <div className="hidden items-center gap-1 rounded-full border border-border bg-(--surface) p-1 md:inline-flex">
                  <Button
                    type="button"
                    variant={lyricsVisualizationMode === "lyrics-with-chords" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => selectLyricsVisualizationMode("lyrics-with-chords")}
                    className="rounded-full text-xs"
                  >
                    Letra e Cifras
                  </Button>
                  <Button
                    type="button"
                    variant={lyricsVisualizationMode === "lyrics-only" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => selectLyricsVisualizationMode("lyrics-only")}
                    className="rounded-full text-xs"
                  >
                    Apenas Letra
                  </Button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFocusMode(false)}
                className="rounded-full"
              >
                Sair do foco
              </Button>
            </div>
          </div>
        </div>
      )}

      <section
        className="mx-auto mt-2 max-w-5xl px-3 sm:px-5"
        onPointerDown={handleContentPointerDown}
        onPointerMove={handleContentPointerMove}
        onPointerUp={handleContentPointerUp}
      >
        {!isFocusMode && currentItem.notes ? (
          <div className="mb-4 rounded-[20px] border border-border/80 bg-(--bg2) px-4 py-3 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
              Observações
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-(--text-muted)">
              {currentItem.notes}
            </p>
          </div>
        ) : null}

        {viewMode === "lyrics" && hasLyrics ? (
          <div
            ref={lyricsScrollAreaRef}
            className={isFocusMode
              ? (isMobileControlsVisible
                ? "max-h-[calc(100vh-15rem)] overflow-y-auto rounded-[28px] border border-border/80 bg-(--bg)/86 px-4 py-5 shadow-2xl shadow-black/15 md:max-h-[calc(100vh-12.5rem)] md:px-6 md:py-6"
                : "max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[28px] border border-border/80 bg-(--bg)/86 px-4 py-5 shadow-2xl shadow-black/15 md:max-h-[calc(100vh-12.5rem)] md:px-6 md:py-6")
              : (isMobileControlsVisible
                ? "max-h-[calc(100vh-19rem)] overflow-y-auto rounded-[28px] border border-border/80 bg-(--bg2) px-4 py-5 shadow-xl shadow-black/10 md:max-h-[calc(100vh-17rem)] md:px-6 md:py-6"
                : "max-h-[calc(100vh-10rem)] overflow-y-auto rounded-[28px] border border-border/80 bg-(--bg2) px-4 py-5 shadow-xl shadow-black/10 md:max-h-[calc(100vh-17rem)] md:px-6 md:py-6")}
          >
            <SongViewer song={currentItem.song} visualConfig={visualConfig} />
          </div>
        ) : null}

        {viewMode === "pdf" && pdfUrl ? (
          <>
            <div className={isFocusMode
              ? "hidden overflow-hidden rounded-[28px] border border-border/80 bg-(--bg)/86 shadow-2xl shadow-black/15 sm:block"
              : "hidden overflow-hidden rounded-[28px] border border-border/80 bg-(--bg2) shadow-xl shadow-black/10 sm:block"}
            >
              <iframe
                className="min-h-[76vh] w-full bg-white"
                src={pdfUrl}
                title={`PDF - ${currentItem.song.title}`}
              />
            </div>
            <div className={isFocusMode
              ? "flex min-h-80 flex-col items-center justify-center gap-4 rounded-[28px] border border-border/80 bg-(--bg)/86 px-5 py-12 text-center shadow-2xl shadow-black/15 sm:hidden"
              : "flex min-h-80 flex-col items-center justify-center gap-4 rounded-[28px] border border-border/80 bg-(--bg2) px-5 py-12 text-center shadow-xl shadow-black/10 sm:hidden"}
            >
              <div>
                <p className="text-sm font-semibold text-(--text)">
                  {currentItem.song.title || "PDF da cifra"}
                </p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  Abrir PDF em uma nova aba para leitura no dispositivo.
                </p>
              </div>
              <Button type="button" asChild size="lg">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Abrir PDF
                </a>
              </Button>
            </div>
          </>
        ) : null}

        {!hasLyrics && !hasPdf ? (
          <div className={isFocusMode
            ? "rounded-[28px] border border-dashed border-border bg-(--bg)/86 px-4 py-12 text-center"
            : "rounded-[28px] border border-dashed border-border bg-(--bg2) px-4 py-12 text-center"}
          >
            <h3 className="text-base font-semibold text-(--text)">Sem conteúdo para leitura</h3>
            <p className="mt-2 text-sm text-(--text-muted)">
              Esta música ainda não possui cifra estruturada nem PDF disponível.
            </p>
          </div>
        ) : null}
      </section>

      <div className="md:hidden pointer-events-none fixed inset-x-0 bottom-0 z-30 h-36 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklab,var(--bg)_18%,transparent)_35%,color-mix(in_oklab,var(--bg)_92%,transparent)_100%)] transition-opacity duration-200" style={{ opacity: isMobileControlsVisible ? 1 : 0 }} />

      <div className="hidden md:block fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-5">
        <div className={isFocusMode
          ? "mx-auto flex max-w-4xl flex-col gap-2 rounded-[24px] border border-border/80 bg-(--bg)/92 p-2 shadow-2xl shadow-black/20 backdrop-blur"
          : "mx-auto flex max-w-3xl flex-col gap-2 rounded-[24px] border border-border/80 bg-(--bg)/94 p-2 shadow-2xl shadow-black/25 backdrop-blur"}
        >
          {hasLyrics && viewMode === "lyrics" ? (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-2">
              <Button
                type="button"
                variant={isAutoScrolling ? "default" : "outline"}
                size="sm"
                onClick={toggleAutoScroll}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                {isAutoScrolling ? "Pausar" : "Auto-scroll"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decreaseAutoScrollSpeed}
                disabled={autoScrollSpeedLevel <= AUTO_SCROLL_SPEED_LEVELS[0]}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                -
              </Button>
              <div className="flex min-w-[4.5rem] flex-col items-center justify-center px-2 text-center">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
                  Vel.
                </span>
                <span className="text-sm font-bold text-(--text)">{autoScrollSpeedLevel}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={increaseAutoScrollSpeed}
                disabled={autoScrollSpeedLevel >= AUTO_SCROLL_SPEED_LEVELS[AUTO_SCROLL_SPEED_LEVELS.length - 1]}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  stopAutoScroll()
                  resetScrollToTop()
                }}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Topo
              </Button>
            </div>
          ) : null}

          {hasLyrics ? (
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize <= MIN_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                A-
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFontSize}
                disabled={fontSize === DEFAULT_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize >= MAX_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                A+
              </Button>
            </div>
          ) : null}

          {hasLyrics ? (
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <Button
                type="button"
                variant={lyricsVisualizationMode === "lyrics-with-chords" ? "default" : "outline"}
                size="sm"
                onClick={() => selectLyricsVisualizationMode("lyrics-with-chords")}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Letra e Cifras
              </Button>
              <Button
                type="button"
                variant={lyricsVisualizationMode === "lyrics-only" ? "default" : "outline"}
                size="sm"
                onClick={() => selectLyricsVisualizationMode("lyrics-only")}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Apenas Letra
              </Button>
            </div>
          ) : null}

          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="min-h-14 rounded-[18px] text-base font-semibold"
            >
              Anterior
            </Button>
            <div className="flex min-w-[5.5rem] flex-col items-center justify-center px-2 text-center">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                Faixa
              </span>
              <span className="text-base font-bold text-(--text)">{progressLabel}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsSongListOpen(true)}
              className="min-h-14 rounded-[18px] px-4 text-sm font-semibold"
            >
              Lista
            </Button>
            <Button
              type="button"
              variant={isFocusMode ? "secondary" : "outline"}
              size="lg"
              onClick={() => setIsFocusMode((value) => !value)}
              className="min-h-14 rounded-[18px] px-4 text-sm font-semibold"
            >
              {isFocusMode ? "Sair do foco" : "Modo foco"}
            </Button>
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={goToNext}
              disabled={currentIndex === items.length - 1}
              className="min-h-14 rounded-[18px] text-base font-semibold"
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 pointer-events-none">
        <div
          data-mobile-controls="true"
          onPointerDown={showMobileControls}
          className={isMobileControlsVisible
            ? "pointer-events-auto mx-auto flex max-w-5xl translate-y-0 flex-col gap-2 rounded-[24px] border border-border/80 bg-(--bg)/94 p-2 shadow-2xl shadow-black/20 backdrop-blur transition-all duration-200"
            : "pointer-events-none mx-auto flex max-w-5xl translate-y-6 flex-col gap-2 rounded-[24px] border border-border/80 bg-(--bg)/94 p-2 opacity-0 shadow-2xl shadow-black/20 backdrop-blur transition-all duration-200"}
        >
          {hasLyricsContentView ? (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-2">
              <Button
                type="button"
                variant={isAutoScrolling ? "default" : "outline"}
                size="sm"
                onClick={toggleAutoScroll}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                {isAutoScrolling ? "Pausar" : "Auto-scroll"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decreaseAutoScrollSpeed}
                disabled={autoScrollSpeedLevel <= AUTO_SCROLL_SPEED_LEVELS[0]}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                -
              </Button>
              <div className="flex min-w-[4.5rem] flex-col items-center justify-center px-2 text-center">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-(--text-muted)">
                  Vel.
                </span>
                <span className="text-sm font-bold text-(--text)">{autoScrollSpeedLevel}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={increaseAutoScrollSpeed}
                disabled={autoScrollSpeedLevel >= AUTO_SCROLL_SPEED_LEVELS[AUTO_SCROLL_SPEED_LEVELS.length - 1]}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  stopAutoScroll()
                  resetScrollToTop()
                  showMobileControls()
                }}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Topo
              </Button>
            </div>
          ) : null}

          {hasLyrics ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  decreaseFontSize()
                  showMobileControls()
                }}
                disabled={fontSize <= MIN_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                A-
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetFontSize()
                  showMobileControls()
                }}
                disabled={fontSize === DEFAULT_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  increaseFontSize()
                  showMobileControls()
                }}
                disabled={fontSize >= MAX_PLAYER_FONT_SIZE}
                className="min-h-10 rounded-[14px] px-3 font-semibold"
              >
                A+
              </Button>
            </div>
          ) : null}

          {hasLyrics ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={lyricsVisualizationMode === "lyrics-with-chords" ? "default" : "outline"}
                size="sm"
                onClick={() => selectLyricsVisualizationMode("lyrics-with-chords")}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Letra e Cifras
              </Button>
              <Button
                type="button"
                variant={lyricsVisualizationMode === "lyrics-only" ? "default" : "outline"}
                size="sm"
                onClick={() => selectLyricsVisualizationMode("lyrics-only")}
                className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
              >
                Apenas Letra
              </Button>
            </div>
          ) : null}

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                goToPrevious()
                showMobileControls()
              }}
              disabled={currentIndex === 0}
              className="min-h-14 rounded-[18px] text-base font-semibold"
            >
              Anterior
            </Button>
            <div className="flex min-w-[5.5rem] flex-col items-center justify-center px-2 text-center">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                Faixa
              </span>
              <span className="text-base font-bold text-(--text)">{progressLabel}</span>
            </div>
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => {
                goToNext()
                showMobileControls()
              }}
              disabled={currentIndex === items.length - 1}
              className="min-h-14 rounded-[18px] text-base font-semibold"
            >
              Próxima
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={viewMode === "lyrics" ? "default" : "outline"}
              size="sm"
              onClick={() => selectViewMode("lyrics")}
              disabled={!hasLyrics}
              className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
            >
              Cifra
            </Button>
            <Button
              type="button"
              variant={viewMode === "pdf" ? "default" : "outline"}
              size="sm"
              onClick={() => selectViewMode("pdf")}
              disabled={!hasPdf}
              className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
            >
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isFocusMode) {
                  setIsFocusMode(false)
                  showMobileControls()
                  return
                }

                setIsFocusMode(true)
                showMobileControls()
              }}
              className="min-h-10 rounded-[14px] px-3 text-xs font-semibold"
            >
              {isFocusMode ? "Sair do foco" : "Modo foco"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isSongListOpen} onOpenChange={setIsSongListOpen}>
        <DialogContent className="top-auto bottom-0 left-1/2 max-h-[80vh] w-full max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-0 rounded-b-none rounded-t-[28px] p-0 sm:top-1/2 sm:bottom-auto sm:max-w-lg sm:-translate-y-1/2 sm:rounded-b-[28px]" showCloseButton={false}>
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-(--text)">Lista do repertório</DialogTitle>
            <DialogDescription>
              Selecione uma música para ir direto ao ponto desejado.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(80vh-5.5rem)] overflow-y-auto p-3 sm:p-4">
            <div className="flex flex-col gap-2">
              {items.map((item, index) => {
                const itemKeyLabel = item.customKeyLabel ?? formatChord(item.song.defaultKey, { notation })
                const isCurrentItem = index === currentIndex

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToSong(index)}
                    className={isCurrentItem
                      ? "flex items-center gap-3 rounded-[20px] border border-(--accent) bg-(--accent)/12 px-4 py-3 text-left"
                      : "flex items-center gap-3 rounded-[20px] border border-border bg-(--bg2) px-4 py-3 text-left hover:border-(--accent)/60 hover:bg-(--bg3)"}
                    aria-current={isCurrentItem ? "true" : undefined}
                  >
                    <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-(--surface) text-sm font-semibold text-(--text)">
                      {item.position}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-(--text)">
                          {item.song.title || "Sem título"}
                        </p>
                        {isCurrentItem ? (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-(--accent) px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--bg)">
                            Atual
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-(--text-muted)">
                        <span>{item.song.artist.name || "Artista não informado"}</span>
                        <span>Tom {itemKeyLabel}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
