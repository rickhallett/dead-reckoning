# Spec 5: Settings and History

**Status: Not Started**
**Owner: Unassigned**

This spec covers the implementation of the settings and history panels, which provide configuration options and a log of past changes.

---

## 1) Goal

- Implement a `HistoryPanel` to display the `audit_log` in a human-readable format.
- Implement a `SettingsPanel` for application configuration.
- Allow users to export their data to CSV.

---

## 2) Dependencies

*   **Spec 1: Core Backend and Data Layer**: Required for the `audit_log` table and `settings` table.

---

## 3) UX Requirements

**History**

*   List of applied changes: timestamp, kind, human text (“Reduced Food by £1/d → +0.51 days”).

**Settings**

*   Currency (display only in v1), `days_in_month_basis` picker (30 vs calendar average).
*   Export CSV (transactions + categories).

---

## 4) Components (React)

*   `SettingsPanel`: basis toggle; triggers recomputation warning.
*   `HistoryPanel`: reads `audit_log`.

---

## 5) SQL Contract

*   The `HistoryPanel` will read from the `audit_log` table.
*   The `SettingsPanel` will read from and write to the `settings` table.

---

## 6) Acceptance Criteria (AC)

1.  **History**
    *   Changes applied via "Plan Mode" appear in the history panel with human-readable summaries and timestamps.
2.  **Settings**
    *   Changing the `days_in_month_basis` setting correctly triggers a recalculation of the runway.

---

## 7) Test Plan

**E2E (Playwright)**

1.  **Happy path**
    *   After applying a change in Plan Mode, verify the change appears in the History panel.
2.  **Edge**
    *   Toggle basis from 30 → 30.436875 → recalculated values are displayed.
