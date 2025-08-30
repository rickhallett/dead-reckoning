-- Migration: 002_seed.sql

-- This migration seeds the database with initial data for a default profile.
-- It uses environment variables for the profile ID and basis days, which will be
-- substituted by the migration script.

-- 1. Insert the default profile
-- Using a placeholder '${VITE_DEFAULT_PROFILE_ID}' which the migration script will replace.
INSERT INTO profiles (profile_id, name, initial_balance_p)
VALUES ('${VITE_DEFAULT_PROFILE_ID}', 'Default Profile', 382600);

-- 2. Insert settings for the default profile
-- Using placeholders for profile ID and days in month basis.
INSERT INTO settings (profile_id, days_in_month_basis)
VALUES ('${VITE_DEFAULT_PROFILE_ID}', ${VITE_DAYS_IN_MONTH_BASIS});

-- 3. Seed Categories
-- These categories total ~£1,409/month.
-- All IDs are UUIDs for consistency.
INSERT INTO categories (category_id, profile_id, name, amount_p, frequency, optional, step_p, min_p)
VALUES
    ('c0f7e3f0-1d7c-4e8f-8e2b-5e6f1a2b3c4d', '${VITE_DEFAULT_PROFILE_ID}', 'Rent', 85000, 'monthly', 0, 5000, 0),
    ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '${VITE_DEFAULT_PROFILE_ID}', 'Groceries', 8000, 'weekly', 0, 1000, 0),
    ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '${VITE_DEFAULT_PROFILE_ID}', 'Utilities', 6000, 'monthly', 0, 500, 0),
    ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '${VITE_DEFAULT_PROFILE_ID}', 'Transport', 7500, 'monthly', 1, 500, 0),
    ('d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', '${VITE_DEFAULT_PROFILE_ID}', 'Internet', 3500, 'monthly', 0, 100, 0),
    ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '${VITE_DEFAULT_PROFILE_ID}', 'Phone', 2500, 'monthly', 0, 100, 0),
    ('f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c', '${VITE_DEFAULT_PROFILE_ID}', 'Subscriptions', 2500, 'monthly', 1, 100, 0),
    ('a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d', '${VITE_DEFAULT_PROFILE_ID}', 'Gym', 3000, 'monthly', 1, 500, 0),
    ('b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e', '${VITE_DEFAULT_PROFILE_ID}', 'Entertainment', 10000, 'monthly', 1, 1000, 0);
