-- Lesson messages (in-classroom chat)
CREATE TABLE IF NOT EXISTS lesson_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-lesson queries
CREATE INDEX idx_lesson_messages_lesson ON lesson_messages(lesson_id, created_at);

-- RLS
ALTER TABLE lesson_messages ENABLE ROW LEVEL SECURITY;

-- Participants (student or teacher) can read messages for their lesson
CREATE POLICY "Lesson participants can read messages"
  ON lesson_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_messages.lesson_id
        AND (
          l.student_id = auth.uid()
          OR l.teacher_id IN (
            SELECT teacher_id FROM profiles WHERE id = auth.uid()
          )
        )
    )
  );

-- Participants can insert their own messages
CREATE POLICY "Lesson participants can send messages"
  ON lesson_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_messages.lesson_id
        AND (
          l.student_id = auth.uid()
          OR l.teacher_id IN (
            SELECT teacher_id FROM profiles WHERE id = auth.uid()
          )
        )
    )
  );

-- Enable realtime for lesson_messages
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_messages;

-- Storage bucket for lesson files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lesson-files', 'lesson-files', true, 10485760) -- 10MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies: participants can upload
CREATE POLICY "Lesson participants can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-files'
    AND auth.role() = 'authenticated'
  );

-- Anyone authenticated can read lesson files
CREATE POLICY "Authenticated users can read lesson files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lesson-files'
    AND auth.role() = 'authenticated'
  );
