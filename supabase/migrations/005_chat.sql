CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  student_unread INT NOT NULL DEFAULT 0,
  teacher_unread INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, teacher_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'teacher')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON conversations(student_id);
CREATE INDEX ON conversations(teacher_id);
CREATE INDEX ON messages(conversation_id, created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversation access: student can access own, teacher can access via profiles
CREATE POLICY "student_conversations" ON conversations
  USING (student_id = auth.uid());

CREATE POLICY "teacher_conversations" ON conversations
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.teacher_id = conversations.teacher_id
  ));

-- Allow participants to update conversations (unread counts etc)
CREATE POLICY "participants_update_conversations" ON conversations FOR UPDATE
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND teacher_id = conversations.teacher_id)
  );

-- Allow students to insert conversations
CREATE POLICY "student_insert_conversations" ON conversations FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Messages: participants can read
CREATE POLICY "participants_read_messages" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        conversations.student_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND teacher_id = conversations.teacher_id)
      )
  ));

-- Messages: authenticated sender can insert
CREATE POLICY "sender_insert_messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          conversations.student_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND teacher_id = conversations.teacher_id)
        )
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
