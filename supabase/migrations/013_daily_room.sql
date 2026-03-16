-- Add Daily.co room fields to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS daily_room_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS daily_room_name TEXT;
