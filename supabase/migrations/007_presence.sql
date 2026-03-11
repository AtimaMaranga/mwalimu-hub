-- Add last_seen_at to profiles for student presence tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have a default
UPDATE profiles SET last_seen_at = NOW() WHERE last_seen_at IS NULL;
