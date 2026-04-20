# Cifras App V2

## 1. Overview

Cifras App V2 is a Next.js application for creating, editing, and reading song chord sheets (`cifras`). The main goal is to provide a structured chord + lyrics system where chords are stored semantically and rendered aligned above the intended lyric position.

Key features:

- Chord rendering aligned with lyrics using index-based chord positions.
- Song transposition without changing stored lyric indexes.
- Responsive line rendering for desktop and mobile reading.
- Font-size controls for the song reading view.
- PDF support through `cifra_pdf` / `cifraPDF`, with PDF files stored externally in PocketBase.
- Song editor with chord placement, chord index adjustment, artist selection/creation, and deferred PDF upload.

## 2. Tech Stack

- Next.js
- React
- TypeScript
- PocketBase
- shadcn/ui components
- Tailwind CSS

## 3. Architecture

The project follows a pragmatic Clean Architecture split. New behavior should be placed in the smallest correct layer and should not leak infrastructure details into UI or domain code.

### Layers

- `domain/`
  - Domain entities and repository contracts.
  - Contains the `Song`, `Artist`, and repository interfaces.
  - Must not depend on application, infrastructure, or UI.

- `application/`
  - Use cases and application orchestration.
  - Coordinates repositories without knowing storage details.
  - Examples: get all songs, get song by id, save song, delete song, move chord index.

- `infrastructure/`
  - External integrations and persistence implementations.
  - PocketBase repositories, DTOs, and mappers live here.
  - PocketBase response shapes must not leak outside this layer.

- `app/`
  - Next.js routes, route handlers, and pages.
  - Server Components call use cases directly where appropriate.
  - Client Components handle UI interaction and local UI state.

- `components/` and `features/`
  - UI components and feature-level hooks/controllers.
  - UI must not call PocketBase directly.

### Data Flow

```txt
UI -> use case -> repository contract -> infrastructure implementation -> PocketBase
```

Important rules:

- Domain is isolated from all other layers.
- UI does not call PocketBase directly.
- External DTOs are mapped to domain entities before leaving infrastructure.
- File uploads are UI + infrastructure concerns only.
- Functional patterns are required; do not introduce classes.

## 4. Core Concepts

### Song

A `Song` is the main domain entity. It contains metadata and structured content:

- `id`
- `title`
- `artist`
- `categories`
- `defaultKey`
- `sections`
- `cifraPDF`

### Section

A `Section` groups lines within a song, such as verses or choruses.

### Line

A `Line` contains:

- `lyrics`: the lyric text.
- `chords`: chord placements for that lyric line.

### Chord

A `Chord` represents musical notation. It supports root notes, accidentals, chord quality, extensions, and bass notes.

### Chord Positioning

Chord placement is index-based. Each chord stores an `index` that points to a character position in the original lyric string.

The stored index is the semantic source of truth. Rendering may split a line into chunks for responsive layouts, but the original index is preserved.

### Rendering Strategy

The renderer splits long lyric lines into chunks based on the available width. For each chunk:

- `relativeIndex = chord.index - chunk.startIndex`
- the chord is positioned above the lyric column represented by that relative index
- the chord layer and lyric layer are vertically separated

The UI measures the rendered monospace character width so font-size changes and mobile rendering keep chord alignment stable.

## 5. PDF Handling

PDF files are not domain logic.

The PDF flow is:

1. UI stores the selected `File` in local component state.
2. The file is not uploaded immediately.
3. On the main save action, the file is passed as save options.
4. The application save use case delegates to the repository.
5. The PocketBase repository sends the file with `FormData`.
6. PocketBase returns a file reference, mapped back to the domain `Song` as `cifraPDF`.

Important constraints:

- Do not store `File` objects inside `Song`.
- Do not upload PDF files from the view page.
- Do not put PDF persistence logic in domain or UI components.

## 6. Project Structure

```txt
app/
  api/                         Route handlers used where client-side API access is needed
  song/[id]/page.tsx           Song view page
  song/[id]/edit/page.tsx      Song edit page
  song/create/page.tsx         Song creation page

application/
  use-cases/
    artists/                   Artist use cases
    songs/                     Song use cases

components/
  song/
    CifraLine.tsx              Responsive chord + lyric line renderer
    SongViewer.tsx             Full song renderer
    SongPageClient.tsx         Client-side song view controls
    SongEditor/                Song editing UI
  ui/                          shadcn/ui-based primitives

core/
  chord-engine.ts              Legacy/core chord parsing, formatting, transposition, and render helpers

domain/
  entities/                    Domain entities
  repositories/                Repository contracts

features/
  song-editor/                 Editor controller and editor-focused hooks

infrastructure/
  api/dto/                     External DTO shapes
  local-storage/               Local storage repository implementation
  pocketbase/                  PocketBase client, repositories, and mappers

lib/
  utils.ts                     Shared UI utilities
```

Notes:

- `core/` is legacy and should be reduced gradually.
- New application logic belongs in `application/`.
- New persistence logic belongs in `infrastructure/`.
- Domain entities must remain in `domain/entities/`.

## 7. Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

PocketBase must be running and must provide the collections used by the repositories, including songs and artists.

## 8. Important Decisions

### Clean Architecture

Clean Architecture is used to keep domain rules and application flow independent from PocketBase and Next.js rendering details. This makes persistence and UI changes less likely to corrupt the core song model.

### Chord Engine

Chord behavior is domain-driven because chord parsing, formatting, positioning, and transposition are core to the application. Stored chord indexes must remain stable even when the UI changes layout or font size.

### PDF as External Concern

PDF files are external file assets. They are handled by UI state during selection and by infrastructure during persistence. The domain entity only receives the resulting file reference.

### Repository Pattern

Repositories isolate persistence strategies behind contracts. The application layer can request songs or artists without knowing whether the data comes from PocketBase, localStorage, or another implementation.

### Functional Implementation

The project uses functional factories and functions. Classes are intentionally avoided to keep the architecture simple and consistent with project rules.

## 9. Future Improvements

- Continue reducing legacy responsibilities from `core/`.
- Add focused automated tests for chord rendering and editor flows.
- Improve typed contracts around PocketBase collection schemas.
- Expand mobile reading controls only if new high-frequency reading actions are introduced.
