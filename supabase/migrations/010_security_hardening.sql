-- 010_security_hardening.sql
-- Fixes broken RLS, adds CHECK constraints, missing indexes

-- ────────────────────────────────────────────────────────────────
-- 1. Fix broken teacher RLS on lessons table
-- ────────────────────────────────────────────────────────────────

-- Drop the broken policy (WHERE id = teacher_id compares column to itself)
DROP POLICY IF EXISTS "Teachers can view own lessons" ON lessons;

-- Correct policy: teacher can view lessons where their profile's teacher_id matches
CREATE POLICY "Teachers can view own lessons" ON lessons
  FOR SELECT USING (
    teacher_id IN (
      SELECT teacher_id FROM profiles WHERE profiles.id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────
-- 2. CHECK constraints to prevent invalid data
-- ────────────────────────────────────────────────────────────────

-- Prevent negative wallet balances (defence in depth — app logic also prevents this)
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_balance_non_negative;
ALTER TABLE wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);

-- Lesson rate must be positive
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_rate_positive;
ALTER TABLE lessons ADD CONSTRAINT lessons_rate_positive CHECK (rate_per_minute > 0);

-- Lesson duration cannot be negative
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_duration_non_negative;
ALTER TABLE lessons ADD CONSTRAINT lessons_duration_non_negative CHECK (duration_seconds >= 0);

-- Lesson total_charged cannot be negative
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_total_non_negative;
ALTER TABLE lessons ADD CONSTRAINT lessons_total_non_negative CHECK (total_charged >= 0);

-- Wallet transactions amount must not be zero
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_amount_nonzero;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_amount_nonzero CHECK (amount <> 0);

-- ────────────────────────────────────────────────────────────────
-- 3. Missing indexes for query performance
-- ────────────────────────────────────────────────────────────────

-- Wallet transactions by lesson (for billing history lookups)
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_lesson_id
  ON wallet_transactions(lesson_id) WHERE lesson_id IS NOT NULL;

-- Messages by sender (for user deletion cascades)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Conversation ordering by last message time (used in inbox)
CREATE INDEX IF NOT EXISTS idx_conversations_student_last_msg
  ON conversations(student_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_teacher_last_msg
  ON conversations(teacher_id, last_message_at DESC);

-- Active lessons lookup (common query in heartbeat/start)
CREATE INDEX IF NOT EXISTS idx_lessons_student_active
  ON lessons(student_id, status) WHERE status = 'active';
