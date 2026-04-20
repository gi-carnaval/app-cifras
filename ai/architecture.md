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