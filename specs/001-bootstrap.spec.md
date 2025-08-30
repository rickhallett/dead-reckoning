# Dead Reckoning: Master Specification

This document provides an overview of the project and links to the detailed, parallelized specifications for development.

## Project Overview

**Dead Reckoning** is a pirate-flavoured, single-user **runway calculator**. It's a tiny web app that shows your financial runway in days and helps you understand how changes in your budget affect it.

- **Tech Stack**: Vite, React, TypeScript, Bun, Turso (SQLite/libSQL), Tailwind CSS
- **Architecture**: Client-side SPA with a direct database connection (no backend server).

## Parallel Development Specs

The project has been broken down into smaller, parallelizable specs to enable faster development by multiple agents. The core dependency is **Spec 1**, which must be completed before the others can begin.

- **[Spec 1: Core Backend and Data Layer](./002-spec-1-core-backend.spec.md)**
  - **Status**: Foundational, must be completed first.
  - **Scope**: Database schema, migrations, seeding, data access layer, core types, and math logic.

- **[Spec 2: Runway Display and Core Views](./003-spec-2-runway-display.spec.md)**
  - **Status**: Parallel, depends on Spec 1.
  - **Scope**: The main UI for displaying runway days, end date, and daily burn.

- **[Spec 3: Budget Management](./004-spec-3-budget-management.spec.md)**
  - **Status**: Parallel, depends on Spec 1.
  - **Scope**: The interactive list of budget categories, including updates and the special "Food" double-binding.

- **[Spec 4: Transactions and Plan Mode](./005-spec-4-transactions-plan-mode.spec.md)**
  - **Status**: Parallel, depends on Specs 1 & 3.
  - **Scope**: Adding one-off income/expenses and the "what-if" planning mode.

- **[Spec 5: Settings and History](./006-spec-5-settings-history.spec.md)**
  - **Status**: Parallel, depends on Spec 1.
  - **Scope**: The settings panel and the history view of changes.

---
*This master spec replaces the original monolithic `001-bootstrap.spec.md`.*
