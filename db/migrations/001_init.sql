-- Migration: 001_init.sql

-- Profiles Table: Stores the main user profile and balance.
CREATE TABLE profiles (
    profile_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    share_code TEXT,
    initial_balance_p INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Settings Table: Stores user-specific settings.
CREATE TABLE settings (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(profile_id),
    currency_code TEXT NOT NULL DEFAULT 'GBP',
    days_in_month_basis REAL NOT NULL DEFAULT 30,
    penny_step INTEGER NOT NULL DEFAULT 100
);

-- Categories Table: Stores recurring income/expense categories.
CREATE TABLE categories (
    category_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(profile_id),
    name TEXT NOT NULL,
    amount_p INTEGER NOT NULL,
    frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly')) NOT NULL,
    optional INTEGER NOT NULL DEFAULT 0,
    step_p INTEGER NOT NULL DEFAULT 100,
    min_p INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    updated_by_device_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Transactions Table: Stores one-off income/expense events.
CREATE TABLE transactions (
    tx_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(profile_id),
    amount_p INTEGER NOT NULL,
    note TEXT,
    occurred_at TEXT NOT NULL,
    created_by_device_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Audit Log Table: Records significant changes for the user's history.
CREATE TABLE audit_log (
    audit_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(profile_id),
    kind TEXT NOT NULL,
    detail_json TEXT,
    delta_days REAL,
    created_by_device_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Oplog Table (for future CRDT-based sync): A low-level operation log.
CREATE TABLE op_log (
    op_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(profile_id),
    table_name TEXT NOT NULL,
    row_id TEXT NOT NULL,
    op_type TEXT CHECK(op_type IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    payload_json TEXT,
    client_id TEXT,
    client_seq INTEGER,
    server_time TEXT DEFAULT (datetime('now'))
);

-- VIEWS --

-- View: settings_expanded
-- Purpose: Provides settings with defaults for easy access.
CREATE VIEW settings_expanded AS
SELECT
    p.profile_id,
    COALESCE(s.currency_code, 'GBP') as currency_code,
    COALESCE(s.days_in_month_basis, 30) as days_in_month_basis,
    COALESCE(s.penny_step, 100) as penny_step
FROM profiles p
LEFT JOIN settings s ON p.profile_id = s.profile_id;

-- View: category_daily_p
-- Purpose: Normalizes all category amounts to a daily value in pence.
CREATE VIEW category_daily_p AS
SELECT
    c.category_id,
    c.profile_id,
    c.name,
    CASE c.frequency
        WHEN 'daily' THEN c.amount_p
        WHEN 'weekly' THEN ROUND(c.amount_p / 7.0)
        WHEN 'monthly' THEN ROUND(c.amount_p / s.days_in_month_basis)
    END AS daily_p
FROM categories c
JOIN settings_expanded s ON c.profile_id = s.profile_id
WHERE c.is_active = 1;

-- View: daily_burn_view
-- Purpose: Calculates the total daily spend.
CREATE VIEW daily_burn_view AS
SELECT
    profile_id,
    SUM(daily_p) AS daily_burn_p
FROM category_daily_p
GROUP BY profile_id;

-- View: balance_view
-- Purpose: Calculates the current cash balance.
CREATE VIEW balance_view AS
SELECT
    p.profile_id,
    p.initial_balance_p + COALESCE(SUM(t.amount_p), 0) AS balance_p
FROM profiles p
LEFT JOIN transactions t ON p.profile_id = t.profile_id
GROUP BY p.profile_id;

-- View: runway_view
-- Purpose: The core view calculating runway days and end date.
CREATE VIEW runway_view AS
SELECT
    b.profile_id,
    b.balance_p,
    d.daily_burn_p,
    CASE
        WHEN d.daily_burn_p <= 0 THEN NULL
        ELSE b.balance_p / CAST(d.daily_burn_p AS REAL)
    END AS runway_days,
    CASE
        WHEN d.daily_burn_p <= 0 THEN NULL
        ELSE date('now', '+' || CAST(b.balance_p / d.daily_burn_p AS INTEGER) || ' days')
    END AS runway_ends_at
FROM balance_view b
JOIN daily_burn_view d ON b.profile_id = d.profile_id;

-- View: penny_to_minutes_view
-- Purpose: Calculates how many minutes of runway a single penny buys.
CREATE VIEW penny_to_minutes_view AS
SELECT
    profile_id,
    CASE
        WHEN daily_burn_p <= 0 THEN NULL
        ELSE (24.0 * 60.0) / daily_burn_p
    END AS minutes_per_penny
FROM daily_burn_view;
