# Spec 3: Budget Management

**Status: Not Started**
**Owner: Unassigned**

This spec focuses on implementing the budget list, which allows users to view and modify their recurring income and expense categories. It includes the special "double-binding" logic for the Food category.

---

## 1) Goal

- Implement the budget list component to display all active categories.
- Allow users to modify the amount and frequency of each category.
- Implement the "Food" category's special daily/monthly double-binding feature.
- Create a React hook (`useCategories`) for category data fetching and mutation.

---

## 2) Dependencies

*   **Spec 1: Core Backend and Data Layer** - This spec requires the database schema and data access layer to be complete.

---

## 3) UX Requirements

**Budget List**

*   Each category: `Name • Amount • Frequency • Daily≈£ • Optional toggle • [−][value][+]`.
*   Keyboard increments: Left/Right = ± step; Shift = ×5.
*   Food row supports **Daily/Monthly toggle** with mirrored field (show computed counterpart).

---

## 4) Components (React)

*   `BudgetList`: maps categories, shows daily/monthly equivalents, handles frequency changes.
*   `CategoryRow`:
    *   `frequency: 'daily'|'weekly'|'monthly'`
    *   step/min from DB (`step_p`, `min_p`)
    *   emits provisional deltas for Plan mode

---

## 5) Hooks

*   `useCategories`: Fetches all active categories, provides methods to update a category.

---

## 6) Food Double-Binding (UI Contract)

*   One category is designated **Food** (id “food” by default).
*   UI shows **two inputs**:
    *   Daily amount (pounds)
    *   Monthly amount (pounds)
*   Editing either **round-trips** to the DB representation chosen in config:
    *   **Canonical frequency = daily** (recommended):
        *   When monthly edited: `daily_p = round((monthly_p * 100) / basis)`, write `amount_p = daily_p` with `frequency='daily'`.
        *   The UI displays the monthly counterpart using `basis`.
*   Prevent jitter by debouncing to 250ms and showing exact formulas in a tooltip.

---

## 7) SQL Contract

**Categories (active)**

```sql
SELECT category_id, name, amount_p, frequency, optional, step_p, min_p, is_active
FROM categories
WHERE profile_id = ? AND is_active = 1
ORDER BY name ASC;
```

**Update category**

```sql
UPDATE categories
SET amount_p = ?, frequency = ?, updated_by_device_id = ?, updated_at = datetime('now')
WHERE profile_id = ? AND category_id = ?;
```

---

## 8) Acceptance Criteria (AC)

1.  **Instant feedback**
    *   Adjusting any category updates **daily burn**, **runway**, **end date**, and **£1 ⇒ minutes** within one animation frame (<100ms perceived).
2.  **Food double-bind**
    *   Editing `Food (monthly)` updates `Food (daily)` as `round(monthly_p / basis)`; reverse direction also correct.

---

## 9) Test Plan

**Unit (Vitest)**

*   `doubleBind.spec.ts`
    *   monthly→daily and daily→monthly transformations; rounding to pence

**Component (Testing Library)**

*   `CategoryRow`: increments, frequency switch, optional toggle.

**E2E (Playwright)**

1.  **Happy path**
    *   Reduce Food by £1/day → runway increases (capture exact delta).
