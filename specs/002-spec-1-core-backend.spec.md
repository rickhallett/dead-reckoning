# Spec 1: Core Backend and Data Layer

**Status: Not Started**
**Owner: Unassigned**

This is the foundational spec for the Dead Reckoning project. Everything else depends on this. The goal is to define the database schema, create migrations, and provide a typed client to interact with the database.

---

## 1) Goal

- Define the database schema for Turso (SQLite/libSQL).
- Create and apply initial database migrations for schema and seed data.
- Implement a typed client-side DB wrapper.
- Define all core domain types in TypeScript.
- Implement the core financial calculation logic as pure functions.

---

## 2) Tech Stack (Relevant)

*   **Runtime:** Bun (for migration script)
*   **DB:** Turso (libSQL over HTTP) — browser client: `@libSQL/client/web`
*   **Tests:** Vitest

---

## 3) Environment & Secrets

*   `VITE_TURSO_URL` — Turso database URL
*   `VITE_TURSO_TOKEN` — Turso auth token
*   `VITE_DEFAULT_PROFILE_ID` — UUID for the singleton budget profile
*   `VITE_DAYS_IN_MONTH_BASIS` — default `30`

---

## 4) Data Model (SQLite on Turso)

*   **profiles(profile_id PK, name, share_code, initial_balance_p, created/updated)**
*   **settings(profile_id PK → profiles, currency_code, days_in_month_basis, penny_step)**
*   **categories(category_id PK, profile_id FK, name, amount_p, frequency[daily|weekly|monthly], optional, step_p, min_p, is_active, version, updated_by_device_id, created/updated)**
*   **transactions(tx_id PK, profile_id FK, amount_p, note, occurred_at, created_by_device_id, created_at)**
*   **audit_log(audit_id PK, profile_id FK, kind, detail_json, delta_days, created_by_device_id, created_at)**
*   **op_log(op_id PK, profile_id FK, table_name, row_id, op_type, payload_json, client_id, client_seq, server_time)**

**Views** (precomputed so UI is simple):

*   `settings_expanded`, `category_daily_p`, `daily_burn_view`, `balance_view`, `runway_view`, `penny_to_minutes_view`

> **Amounts are in pence (integers)** to avoid float drift.

---

## 5) Migrations & Seeding (Bun)

*   `db/migrations/001_init.sql` — full DDL (tables + views).
*   `db/migrations/002_seed.sql` — create profile with:
    *   `profile_id = VITE_DEFAULT_PROFILE_ID`
    *   `initial_balance_p = 382600`
    *   `settings.days_in_month_basis = VITE_DAYS_IN_MONTH_BASIS (default 30)`
    *   Seed categories totalling ~£1,409/month.
*   `db/migrate.ts` — reads all `migrations/*.sql` in order and executes against Turso using **server-side Bun**.

---

## 6) Client DB Wrapper (`lib/db.ts`)

*   Use `@libsql/client/web` in the browser.
*   Create a singleton client with env vars.
*   Provide small helpers: `query<T>(sql, params)`, `exec(sql, params)` that return typed rows.

```ts
import { createClient } from '@libsql/client/web';

export const db = createClient({
  url: import.meta.env.VITE_TURSO_URL!,
  authToken: import.meta.env.VITE_TURSO_TOKEN!,
});
```

---

## 7) Domain Types (`lib/types.ts`)

```ts
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Category {
  category_id: string;
  profile_id: string;
  name: string;
  amount_p: number;        // as entered with frequency
  frequency: Frequency;
  optional: 0 | 1;
  step_p: number;
  min_p: number;
  is_active: 0 | 1;
  version: number;
  updated_by_device_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryDaily {
  category_id: string;
  name: string;
  daily_p: number;         // computed
}

export interface RunwayRow {
  balance_p: number;
  daily_burn_p: number;
  runway_days: number | null;
  runway_ends_at: string | null;
  minutes_per_penny: number | null; // from view
}

export interface Transaction {
  tx_id: string;
  profile_id: string;
  amount_p: number;        // + income, - expense
  note?: string;
  occurred_at: string;     // ISO
  created_by_device_id?: string;
  created_at: string;
}
```

---

## 8) Math (`lib/math.ts`)

Let:

*   `cash_balance_p = initial_balance_p + Σ transactions.amount_p`
*   `daily_burn_p = Σ category_daily_p.daily_p`
    *   daily: `amount_p`
    *   weekly: `round(amount_p / 7)`
    *   monthly: `round(amount_p / days_in_month_basis)`
*   **Runway days:**
    *   if `daily_burn_p <= 0` → unlimited (null in view)
    *   else `runway_days = cash_balance_p / daily_burn_p`
*   **End date:** `now + runway_days`
*   **Penny to minutes:** `minutes_per_penny = (1 / daily_burn_p) * 24 * 60`

**Delta calculations (for previews):**

*   For a cash delta `Δ£` (in pence `Δp`): `Δdays = Δp / daily_burn_p`
*   For a daily spend delta `Δp_day`:
    `Δdays = balance_p * (1/(daily_burn_p + Δp_day) - 1/daily_burn_p)`

---

## 9) Test Plan

**Unit (Vitest)**

*   `math.spec.ts`
    *   daily/weekly/monthly conversions (basis 30 vs 30.436875)
    *   runway days formula
    *   delta formulas (cash and daily burn deltas)

---

## 10) Definition of Done

*   All DDL is in `db/migrations/001_init.sql`.
*   Seed data is in `db/migrations/002_seed.sql`.
*   `bun run migrate` successfully applies migrations to a fresh Turso DB.
*   `lib/db.ts` exports a working client.
*   `lib/types.ts` contains all necessary domain types.
*   `lib/math.ts` is implemented with 100% unit test coverage.
