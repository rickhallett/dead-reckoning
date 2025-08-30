# Spec 2: Runway Display and Core Views

**Status: Not Started**
**Owner: Unassigned**

This spec covers the primary UI for displaying the user's financial runway. It focuses on fetching and presenting the core calculated values from the database.

---

## 1) Goal

- Create the main header component to display runway days and end date.
- Create a "converter chip" to show the real-time value of saving money.
- Implement a React hook (`useRunway`) to fetch and subscribe to the `runway_view`.

---

## 2) Dependencies

*   **Spec 1: Core Backend and Data Layer** - This spec cannot be started until the database schema, views, and data access layer from Spec 1 are complete and available.

---

## 3) UX Requirements

**Dashboard**

*   Big **Runway Days** (floor), subline **Ends on DATE** (Europe/London).
*   **Daily Burn** line: `£X.XX/day (≈ £Y / month)`.
*   **Converter Chip:** `£1 saved ⇒ +M minutes` (live).
*   **Cash balance**.

---

## 4) Components (React)

*   `RunwayHeader`: reads `runway_view`, formats days & end date.
*   `ConverterChip`: shows minutes per £1 using `penny_to_minutes_view`.

---

## 5) Hooks

*   `useRunway`: Reads the `runway_view` and `penny_to_minutes_view` from the database and subscribes to changes.

---

## 6) SQL Contract (Core Queries)

**Dashboard**

```sql
-- runway, burn, balance, minutes per penny
SELECT
  r.balance_p, r.daily_burn_p, r.runway_days, r.runway_ends_at,
  p2m.minutes_per_penny
FROM runway_view r
JOIN penny_to_minutes_view p2m USING (profile_id)
WHERE r.profile_id = ?;
```

---

## 7) Acceptance Criteria (AC)

1.  **Runway correctness**
    *   Given seed values (cash £3,826; monthly £1,409; basis 30), the header shows **81 days** (±0.5 day rounding) and a correct end date (Europe/London).
2.  **Zero-burn guard**
    *   If daily burn ≤ 0, UI displays “Unlimited” and disables countdown animation.

---

## 8) Test Plan

**Component (Testing Library)**

*   `RunwayHeader`: renders values from a mocked `useRunway` hook.

**E2E (Playwright)**

1.  **Happy path**
    *   Load app with seed data → shows 81 days.
2.  **Edge**
    *   Modify data to make daily burn zero → UI shows “Unlimited”.
