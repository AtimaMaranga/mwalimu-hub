-- ============================================================
-- Migration 019: Metered pricing system
-- All new teachers start at $7/hr. Teachers can change their
-- rate only after 50+ hours of completed sessions AND an
-- average review score >= 4.0. Max rate is $25/hr.
-- ============================================================

-- Add total_hours_taught to teachers for tracking session hours
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS total_hours_taught DECIMAL(10, 2) DEFAULT 0;

-- Set default hourly_rate to 7 for the column
ALTER TABLE teachers
  ALTER COLUMN hourly_rate SET DEFAULT 7;

-- Normalize all existing rates into the $7–$25 range
UPDATE teachers SET hourly_rate = 7 WHERE hourly_rate IS NULL OR hourly_rate < 7;
UPDATE teachers SET hourly_rate = 25 WHERE hourly_rate > 25;

-- Sync rate_per_minute for all teachers
UPDATE teachers SET rate_per_minute = ROUND(hourly_rate / 60, 4);

-- Add constraints for rate boundaries
ALTER TABLE teachers
  ADD CONSTRAINT teachers_hourly_rate_max CHECK (hourly_rate <= 25);

ALTER TABLE teachers
  ADD CONSTRAINT teachers_hourly_rate_min CHECK (hourly_rate >= 7);
