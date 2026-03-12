-- Add personal detail fields to teacher_applications
ALTER TABLE teacher_applications
  ADD COLUMN IF NOT EXISTS gender       TEXT,
  ADD COLUMN IF NOT EXISTS age_bracket  TEXT,
  ADD COLUMN IF NOT EXISTS country      TEXT,
  ADD COLUMN IF NOT EXISTS city         TEXT;
