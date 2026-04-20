'use client'

import { useState, type KeyboardEvent } from 'react'
import {
  formatChord,
  parseChord,
} from '@/core/chord-engine'
import { Song } from '@/domain/entities/song'
import CifraLine from '../CifraLine'
import SongArtistSelect from './SongMeta/SongArtistSelect'
import { useSongEditorController } from '@/features/song-editor/useSongEditorController'
import { Button } from '@/components/ui/button'
import SongPdfUpload from './SongPdfUpload'

interface SongEditorSaveOptions {
  cifraPdfFile?: File | null
}

interface SongEditorProps {
  initialSong: Song
  onSave: (song: Song, options?: SongEditorSaveOptions) => void | Promise<void>
}

export default function SongEditor({ initialSong, onSave }: SongEditorProps) {
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
    selectedArtistId,
    textareaRefs,
    popupInputRef,

    setPopupInput,
    setPopupError,
    setDefaultKey,

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
    removeSection,
    updateSectionName,
    createArtist,
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
              Suporta: Am · C# · Cmaj7 · C#m7/G# · B5(9)
            </div>
          </div>
        </>
      )}

      {/* Meta */}
      <div className="editor-meta">
        <input
          className="editor-input title-input"
          placeholder="Título da música"
          value={song.title}
          onChange={(e) => updateMeta('title', e.target.value)}
        />
        <div className="flex gap-8 justify-start items-start">
          <input
            className="w-20 border border-border rounded-lg text-[0.95rem] text-(--text) transition-[border-color] duration-150 px-3.5 py-2.5 border-solid bg-(--bg2)"
            placeholder="Tom"
            value={defaultKey}
            onChange={(e) => updateDefaultKey(e.target.value)}
          />
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

      {/* Transposition bar */}


      {/* Sections */}
      {song.sections.map((section) => (
        <div key={section.id} className="section-editor">
          <div className="section-header-row">
            <input
              className="editor-input section-name-input"
              value={section.name}
              onChange={(e) => updateSectionName(section.id, e.target.value)}
              placeholder="Nome do trecho"
            />
            <button className="btn-ghost btn-danger" onClick={() => removeSection(section.id)}>
              Remover trecho
            </button>
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
                      <span className="chord-tag-value">{formatChord(cp.chord)}</span>
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
      ))}

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
