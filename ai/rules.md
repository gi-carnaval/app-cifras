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

* Use Tailwind Classes to stylize the app
* Components should not contain business logic
* Keep state minimal and local when possible
* UI must not call PocketBase directly
* UI must NOT define Song shape
* Prefer using pre-built components from @/components/ui (shadcn/ui)
* Do not reimplement existing UI primitives if an equivalent exists
* Custom components should be composed on top of existing UI components
* Keep styling consistent with the design system defined by shadcn/ui
* File uploads:
  * handled in UI
  * sent on save
  * never stored in domain

Exceptions:
* If no suitable component exists
* If the required behavior cannot be achieved through composition

