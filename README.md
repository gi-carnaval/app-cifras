# CifrasApp — Motor de Cifras V2

Sistema de exibição e edição de cifras musicais com renderização responsiva, modelo estruturado de acordes e transposição.

## Estrutura

```
/core
  chord-engine.ts        # Motor puro (sem DOM/CSS)
  chord-engine.test.ts   # Testes Vitest
  run-tests.mjs          # Runner Node puro (sem deps)
  song-store.ts          # Persistência localStorage

/types
  index.ts               # Chord, ChordPlacement, Line, Section, Song, RenderChunk

/components
  CifraLine.tsx          # Renderização responsiva por chunks (ResizeObserver)
  SongViewer.tsx         # Exibe música completa
  SongEditor.tsx         # Editor com popup contextual + transposição

/app
  layout.tsx             # Layout raiz + navbar
  page.tsx               # Lista de músicas
  /admin/page.tsx        # Criar / editar música
  /song/[id]/page.tsx    # Visualizar cifra com controle de tom
```

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest (32 testes)
node core/run-tests.mjs  # Runner sem deps
```

## Modelo de Acorde (V2)

```ts
type Chord = {
  root: string           // A–G
  accidental?: '#' | 'b'
  quality?: string       // m, maj7, dim, sus2 …
  extension?: string     // (9), (11) …
  bass?: { root: string; accidental?: '#' | 'b' }
}
```

## Regras de Renderização Responsiva

- `index` na string original **nunca é alterado**
- `splitLineForRender(line, containerWidth)` divide em `RenderChunk[]`
- Por chunk: `relativeIndex = chord.index - chunk.startIndex`
- Posição CSS: `left = (relativeIndex / chunk.text.length) * 100%`
- `ResizeObserver` recalcula chunks ao redimensionar a janela

## Transposição

```ts
transposeChord(chord, steps)   // +/- semitons, preserva quality/extension
transposeLine(line, steps)     // imutável, preserva indexes
transposeSong(sections, steps) // conveniente para toda a música
```

Escala cromática com enarmônicos: bemóis (Bb, Eb…) normalizados para sustenidos antes do cálculo.
