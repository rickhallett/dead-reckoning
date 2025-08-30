# Spec 4: Transactions and Plan Mode

**Status: Not Started**
**Owner: Unassigned**

This spec covers the functionality for adding one-off transactions (income/expense) and the "Plan vs Live" mode, which allows for sandboxed what-if scenarios.

---

## 1) Goal

- Implement a modal to add one-off income or expense transactions.
- Implement the "Plan" mode state management using Zustand.
- Create a UI to show the potential impact of planned changes and allow applying or discarding them.
- Implement React hooks for transactions (`useTransactions`) and plan mode (`usePlanMode`).

---

## 2) Dependencies

*   **Spec 1: Core Backend and Data Layer**: Required for transaction and audit log tables.
*   **Spec 3: Budget Management**: The Plan mode directly interacts with and overlays changes on the category data managed in Spec 3.

---

## 3) UX Requirements

**Dashboard**
*   **Quick “Add income”** button.

**Plan vs Live**

*   Toggle to **Plan** (changes are sandboxed).
*   Sticky footer shows **Net change: +N days** with **Apply** / **Discard**.
*   On Apply: write to DB and append to **audit_log** with `delta_days` and a diff snapshot.

---

## 4) Components (React)

*   `AddIncomeModal`: amount (+/−), note; writes a transaction.
*   `PlanBar`: shows **+days** delta, Apply/Discard.

---

## 5) Hooks

*   `useTransactions`: Provides a method to add a new income/expense transaction.
*   `usePlanMode`: Manages the sandboxed state, computes deltas, and handles Apply/Discard logic.

---

## 6) State & Plan Mode (Zustand)

*   **Live state** is the DB.
*   **Plan state** is a client-side overlay (Zustand):
    *   Holds a map of `category_id -> proposed amount_p/frequency`.
    *   Holds a list of proposed transactions not yet applied.
    *   Exposes selectors to compute **previewed** `daily_burn_p`, `runway_days`, and `Δdays` using the math module.
*   **Apply** = write changed categories / transactions, then add one `audit_log` entry with the human diff + `delta_days`. Clear plan state.

---

## 7) SQL Contract

**Add transaction (income/expense)**

```sql
INSERT INTO transactions (tx_id, profile_id, amount_p, note, occurred_at, created_by_device_id)
VALUES (?, ?, ?, ?, datetime('now'), ?);
```

**Audit entry**

```sql
INSERT INTO audit_log (audit_id, profile_id, kind, detail_json, delta_days, created_by_device_id)
VALUES (?, ?, ?, ?, ?, ?);
```

---

## 8) Acceptance Criteria (AC)

1.  **Plan mode**
    *   Toggling to Plan isolates edits; **Apply** persists and logs one `audit_log` row with `delta_days`.
2.  **Income**
    *   Adding an income transaction immediately increases cash and runway; toast shows `+N days`.

---

## 9) Test Plan

**E2E (Playwright)**

1.  **Happy path**
    *   Add +£100 income → runway increases by `100 / daily_burn`.
    *   Switch to Plan, make edits, Apply → History shows one item with `delta_days`.
