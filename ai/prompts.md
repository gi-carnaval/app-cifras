Read and apply:

# AI Context Entry Point

Always read these files before any task:

@ai/rules.md
# Project Rules

## CORE RULE

* Use functional programming only (NO classes)
* Do NOT use classes
* Domain must not depend on other layers

* Avoid overengineering:
  * no unnecessary abstractions
  * no generic layers without purpose

Violation of this rule = architecture broken

## General

* Prefer pure functions when possible
* Avoid unnecessary abstractions

## Architecture

* Follow Clean Architecture (pragmatic)
* Domain must not depend on other layers
* Infrastructure must not leak into UI
* Infrastructure must NOT redefine Song
* types/ folder must NOT contain domain entities

## Next.js

* Server Components should call use-cases directly
* Client Components may call /api
* Avoid internal HTTP calls when unnecessary

## Data

* Song entity lives in domain/entities
* Never expose external DTOs outside infrastructure
* Always use mappers

## UI

* Components should not contain business logic
* Keep state minimal and local when possible
* UI must not call PocketBase directly
* UI must NOT define Song shape
* File uploads:
  * handled in UI
  * sent on save
  * never stored in domain
@ai/architecture.
# Architecture Overview

## Layers

### Domain

* Entities
* Repository interfaces
* Pure business rules

### Application

* Use cases
* DTOs
* Mappers

### Infrastructure

* PocketBase integration
* Repository implementations

### App (Next.js)

* UI
* Route handlers

## Data Flow

UI → Use Case → Repository Interface → Infrastructure → External API

## Notes

* No direct PocketBase calls in UI
* File uploads handled by infrastructure layer (triggered from UI)

## Flow:

UI → use-case → repository → PocketBase

## Important:

* core/ folder is legacy and should be reduced
* new logic goes to application/
@ai/patterns.md
# Patterns

## Repository (Functional)

export function createXRepository(deps) {
return {
async getAll() {},
async getById() {},
async save() {},
}
}

## Use Case

export function createUseCase(repo) {
return async (input) => {
// logic
}
}

## Mapper

export function toEntity(dto) {}
export function toDTO(entity) {}
@ai/decisions.md
# Architectural Decisions

## PDF Upload

* PDF is NOT part of domain entity directly
* Stored as external file (PocketBase)
* Uploaded only on save
* Managed as UI state until submission

## Data Fetching

* Server Components call use-cases directly
* API routes used only when necessary

## Repositories

* Functional factories (no classes)

* SongEditor will be split gradually
* PDF handled separately
* No full refactor, only incremental changes
* Avoid touching chord-engine

## Decision: PDF Upload
PDF is NOT part of domain logic
PDF is treated as UI + Infrastructure concern

Flow:

1. UI stores File in local state
2. On save → send via FormData
3. Repository handles upload
4. Domain only receives file reference (string[])

IMPORTANT:

* Domain NEVER sees File object
@ai/glossary.md
# Glossary

Song: Musical entity with sections and lines
Section: Group of lines (verse, chorus)
Line: Contains lyrics and chord positions
Chord: Musical notation with index position
PDF: External file representing sheet music (cifra)

IMPORTANT:

* PDF is NOT core domain logic

Execution priority:

1. rules.md (strict constraints)
2. decisions.md (overrides patterns)
3. patterns.md (implementation guidance)
4. architecture.md (flow understanding)

If conflict exists:
- rules override everything
- decisions override patterns

Before implementing:
1. Identify which layer this belongs to
2. Ensure no rule violations from ai/rules.md
3. Follow patterns strictly from ai/patterns.md

If conflict arises:
- rules.md overrides everything
- decisions.md overrides patterns

Task:

Adicione um estilo com tailwindcss nestes componentes que você criou:

src\components\song\SongEditor\SongMeta\SongArtistSelect.tsx:
'use client'

import { useState } from 'react'
import QuickCreateArtist from './QuickCreateArtist'

interface Artist {
  id: string
  name: string
}

interface SongArtistSelectProps {
  artists: Artist[]
  selectedArtistId: string | null
  onChangeArtist: (id: string) => void
  onCreateArtist: (name: string) => Promise<Artist>
}

export default function SongArtistSelect({
  artists,
  selectedArtistId,
  onChangeArtist,
  onCreateArtist,
}: SongArtistSelectProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectChange = (value: string) => {
    if (value === '__create__') {
      setIsCreating(true)
      return
    }

    onChangeArtist(value)
  }

  const handleCreate = async (name: string) => {
    const newArtist = await onCreateArtist(name)

    onChangeArtist(newArtist.id)
    setIsCreating(false)
  }

  if (isCreating) {
    return (
      <QuickCreateArtist
        onCreate={handleCreate}
        onCancel={() => setIsCreating(false)}
      />
    )
  }

  return (
    <select
      value={selectedArtistId ?? ''}
      onChange={(e) => handleSelectChange(e.target.value)}
    >
      <option value="" disabled>
        Selecione um artista
      </option>

      {artists.map((artist) => (
        <option key={artist.id} value={artist.id}>
          {artist.name}
        </option>
      ))}

      <option value="__create__">Cadastrar novo artista</option>
    </select>
  )
}

e

src\components\song\SongEditor\SongMeta\QuickCreateArtist.tsx:

'use client'

import { useState } from 'react'

interface QuickCreateArtistProps {
  onCreate: (name: string) => Promise<void>
  onCancel: () => void
}

export default function QuickCreateArtist({
  onCreate,
  onCancel,
}: QuickCreateArtistProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setLoading(true)
      setError(null)

      await onCreate(name.trim())

      setName('')
    } catch (err) {
      setError('Erro ao criar artista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Nome do artista"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>

      <button onClick={onCancel} disabled={loading}>
        Cancelar
      </button>

      {error && <p>{error}</p>}
    </div>
  )
}