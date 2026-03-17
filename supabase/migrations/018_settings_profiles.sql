-- 018_settings_profiles.sql
-- Extended profile fields for settings page

-- ============================================================
-- 1. Extend profiles table with common user fields
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Kenya',
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Nairobi',
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
    "lesson_reminders": true,
    "new_messages": true,
    "payment_receipts": true,
    "payout_notifications": true,
    "marketing": false
  }'::jsonb;

-- ============================================================
-- 2. Add missing teacher fields for settings
-- ============================================================
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Kenya',
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
    "lesson_reminders": true,
    "new_messages": true,
    "payment_receipts": true,
    "payout_notifications": true,
    "marketing": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_status jsonb DEFAULT '{
    "certificate": "none",
    "education": "none",
    "government_id": "none",
    "intro_video": "none"
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS payout_settings jsonb;

-- ============================================================
-- 3. Storage bucket for avatars
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read avatars (public bucket)
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 4. Storage bucket for teacher verification documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-verification', 'teacher-verification', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Teachers read own verification docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'teacher-verification'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Teachers upload own verification docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'teacher-verification'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Teachers update own verification docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'teacher-verification'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
