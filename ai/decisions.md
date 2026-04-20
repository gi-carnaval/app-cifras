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