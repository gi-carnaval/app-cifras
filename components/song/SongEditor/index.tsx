'use client'

import { useState, type KeyboardEvent } from 'react'
import {
  formatChord,
} from '@/core/chord-engine'
import { useChordNotation } from '@/components/chord-notation/chord-notation-provider'
import { Song } from '@/domain/entities/song'
import CifraLine from '../CifraLine'
import SongCategoriesSelect from './SongMeta/SongCategoriesSelect'
import SongArtistSelect from './SongMeta/SongArtistSelect'
import SongLiturgicalMomentsSelect from './SongMeta/SongLiturgicalMomentsSelect'
import { useSongEditorController } from '@/features/song-editor/useSongEditorController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SongPdfUpload from './SongPdfUpload'

interface SongEditorSaveOptions {
  cifraPdfFile?: File | null
}

interface SongEditorProps {
  initialSong: Song
  onSave: (song: Song, options?: SongEditorSaveOptions) => void | Promise<void>
}

export default function SongEditor({ initialSong, onSave }: SongEditorProps) {
  const { notation } = useChordNotation()
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const controller = useSongEditorController(initialSong, onSave)

  const {
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

    categories,
    isLoadingCategories,
    isCreatingCategory,
    categoriesError,
    categoryCreateError,

    liturgicalMomentOptions,
    isLoadingLiturgicalMoments,
    liturgicalMomentsError,

    selectedArtistId,
    selectedCategoryIds,
    selectedLiturgicalMomentsIds,
    shouldShowLiturgicalMoments,
    textareaRefs,
    popupInputRef,

    setPopupInput,
    setPopupError,

    openPopup,
    closePopup,
    commitPopup,
    updateMeta,
    updateArtist,
    updateCategories,
    updateLiturgicalMoments,
    addSection,
    addLine,
    removeLine,
    updateLyrics,
    handleSave,
    handleRemoveChord,
    handleMoveChord,
    removeSection,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
    updateSectionName,
    createArtist,
    createCategory,
    updateDefaultKey
  } = controller

  function handleLyricsShortcut(
    event: KeyboardEvent<HTMLTextAreaElement>,
    sectionId: string,
    lineId: string,
  ) {
    const isAddChordShortcut =
      event.ctrlKey &&
      event.shiftKey &&
      event.key.toLowerCase() === 'c'

    if (!isAddChordShortcut) return

    const textarea = textareaRefs.current[lineId]
    const cursorIndex = event.currentTarget.selectionStart
    const isValidTextarea = textarea === event.currentTarget
    const hasValidCursor =
      Number.isInteger(cursorIndex) &&
      cursorIndex >= 0 &&
      cursorIndex <= event.currentTarget.value.length

    if (!isValidTextarea || !hasValidCursor) return

    event.preventDefault()
    openPopup(sectionId, lineId)
  }

  return (
    <div className="editor-root">

      {/* Chord Popup */}
      {popup.visible && (
        <>
          <div className="popup-overlay" onClick={closePopup} />
          <div
            className="chord-popup"
            style={{ top: popup.top, left: popup.left }}
          >
            <div className="popup-header">
              <span className="popup-label">
                Acorde na posição <strong>{popup.cursorIndex}</strong>
              </span>
              <button className="popup-close" onClick={closePopup}>✕</button>
            </div>
            <div className="popup-body">
              <input
                ref={popupInputRef}
                className="popup-input"
                placeholder="Ex: Am, C#m7, G/B"
                value={popupInput}
                onChange={(e) => { setPopupInput(e.target.value); setPopupError(null) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitPopup()
                  if (e.key === 'Escape') closePopup()
                }}
              />
              <button className="btn-primary popup-confirm" onClick={commitPopup}>
                OK
              </button>
            </div>
            {popupError && <p className="popup-error">{popupError}</p>}
            <div className="popup-hint">
              Suporta: Am · C# · Cmaj7/F7+ · G#dim/G#º · C#m7/G# · B5(9)
            </div>
          </div>
        </>
      )}

      {/* Meta */}
      <section className="editor-meta rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
            Dados da música
          </span>
          <input
            className="editor-input title-input border-0 bg-transparent px-0 py-1 text-2xl shadow-none outline-none focus:border-transparent sm:text-3xl"
            placeholder="Título da música"
            value={song.title}
            onChange={(e) => updateMeta('title', e.target.value)}
          />
        </div>

        <div className="grid gap-5 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.55fr)]">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-dim)">
              Identidade
            </span>
            <div className="grid gap-4 sm:grid-cols-[6rem_6rem_minmax(0,1fr)]">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="song-key-input"
                  className="text-sm font-medium text-(--text-muted)"
                >
                  Tom
                </label>
                <input
                  id="song-key-input"
                  className="w-full rounded-lg border border-border bg-(--bg) px-3.5 py-2 text-[0.95rem] text-(--text) transition-[border-color] duration-150 focus:border-(--accent)"
                  placeholder="Tom"
                  value={defaultKey}
                  onChange={(e) => updateDefaultKey(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="song-capo-input"
                  className="text-sm font-medium text-(--text-muted)"
                >
                  Capo
                </label>
                <Input
                  id="song-capo-input"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="0"
                  value={song.capo ?? ''}
                  onChange={(event) => {
                    const { value } = event.currentTarget
                    if (!/^\d*$/.test(value)) return

                    updateMeta('capo', value === '' ? undefined : Number.parseInt(value, 10))
                  }}
                />
              </div>
              <SongArtistSelect
                selectedArtistId={selectedArtistId}
                onChangeArtist={updateArtist}
                artists={artists}
                isLoading={isLoadingArtists}
                isCreating={isCreatingArtist}
                error={artistsError}
                createError={artistCreateError}
                createArtist={createArtist}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-dim)">
              Classificação
            </span>
            <div className="grid gap-4">
              <SongCategoriesSelect
                selectedCategoryIds={selectedCategoryIds}
                onChangeCategories={updateCategories}
                categories={categories}
                isLoading={isLoadingCategories}
                isCreating={isCreatingCategory}
                error={categoriesError}
                createError={categoryCreateError}
                createCategory={createCategory}
              />
              {shouldShowLiturgicalMoments && (
                <SongLiturgicalMomentsSelect
                  liturgicalMoments={liturgicalMomentOptions}
                  selectedMomentIds={selectedLiturgicalMomentsIds}
                  onChangeMomentIds={updateLiturgicalMoments}
                  isLoading={isLoadingLiturgicalMoments}
                  error={liturgicalMomentsError}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Transposition bar */}


      {/* Sections */}
      {song.sections.map((section, sectionIndex) => {
        const isFirstSection = sectionIndex === 0
        const isLastSection = sectionIndex === song.sections.length - 1

        return (
          <div key={section.id} className="section-editor">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex gap-2">
                <input
                  className="editor-input section-name-input"
                  value={section.name}
                  onChange={(e) => updateSectionName(section.id, e.target.value)}
                  placeholder="Nome do trecho"
                />
                <div className="flex items-center gap-2">
                  <button className="btn-ghost" onClick={() => duplicateSection(section.id)}>
                    Duplicar trecho
                  </button>
                  <button className="btn-ghost btn-danger" onClick={() => removeSection(section.id)}>
                    Remover trecho
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Mover trecho para cima"
                  title="Mover trecho para cima"
                  disabled={isFirstSection}
                  onClick={() => moveSectionUp(section.id)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Mover trecho para baixo"
                  title="Mover trecho para baixo"
                  disabled={isLastSection}
                  onClick={() => moveSectionDown(section.id)}
                >
                  ↓
                </Button>
              </div>
            </div>

            {section.lines.map((line) => (
              <div key={line.id} className="line-editor-block">

                {/* Live preview */}
                <div className="line-preview">
                  <CifraLine line={line} />
                </div>

                {/* Textarea + actions */}
                <div className="line-input-row">
                  <textarea
                    ref={(el) => { textareaRefs.current[line.id] = el }}
                    className="editor-textarea"
                    value={line.lyrics}
                    placeholder="Digite a letra aqui..."
                    rows={1}
                    onChange={(e) => updateLyrics(section.id, line.id, e.target.value)}
                    onKeyDown={(e) => handleLyricsShortcut(e, section.id, line.id)}
                  />
                  <Button
                    variant="default"
                    size="lg"
                    // className="bg-red-500"
                    title="Posicione o cursor e clique para adicionar acorde"
                    onClick={() => openPopup(section.id, line.id)}
                  >
                    + Acorde
                  </Button>
                  <button
                    className="btn-ghost btn-danger btn-icon"
                    onClick={() => removeLine(section.id, line.id)}
                    title="Remover linha"
                  >
                    ✕
                  </button>
                </div>

                {/* Chord tags */}
                {line.chords.length > 0 && (
                  <div className="chord-tags">
                    {line.chords.map((cp) => (
                      <span key={`${line.id}-${cp.index}`} className="chord-tag group">
                        <button
                          type="button"
                          className="chord-tag-shift"
                          aria-label="Move chord left"
                          onClick={() => handleMoveChord(section.id, line.id, cp.index, -1)}
                        >
                          {"<"}
                        </button>
                        <span className="chord-tag-value">
                          {formatChord(cp.chord, { notation })}
                        </span>
                        <button
                          type="button"
                          className="chord-tag-shift"
                          aria-label="Move chord right"
                          onClick={() => handleMoveChord(section.id, line.id, cp.index, 1)}
                        >
                          {">"}
                        </button>
                        <button
                          type="button"
                          className="chord-tag-remove hidden group-hover:block"
                          onClick={() => handleRemoveChord(section.id, line.id, cp.index)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button className="btn-ghost btn-add-line" onClick={() => addLine(section.id)}>
              + Linha
            </button>
          </div>
        )
      })}

      <div className="editor-actions">
        <button className="btn-ghost" onClick={addSection}>
          + Novo Trecho
        </button>
        <div className="editor-actions-end">
          <SongPdfUpload
            selectedFile={selectedPdfFile}
            onConfirm={setSelectedPdfFile}
          />
          <button
            className="btn-primary btn-save"
            onClick={async () => {
              await handleSave({ cifraPdfFile: selectedPdfFile })
              setSelectedPdfFile(null)
            }}
          >
            {saved ? '✓ Salvo!' : 'Salvar Música'}
          </button>
        </div>
      </div>
    </div>
  )
}
