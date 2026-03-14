-- 009_classroom_and_billing.sql
-- Per-minute billing, wallets, lessons, and dialect support

-- Add dialect and rate_per_minute to teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS dialect text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS rate_per_minute decimal(6,4);

-- Wallets — one per student
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance decimal(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Wallet transactions ledger
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('top_up', 'lesson_charge', 'refund')),
  description text,
  lesson_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds int NOT NULL DEFAULT 0,
  rate_per_minute decimal(6,4) NOT NULL,
  total_charged decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key from wallet_transactions.lesson_id to lessons
ALTER TABLE wallet_transactions
  ADD CONSTRAINT fk_wallet_transactions_lesson
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;

-- RLS policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Wallets: users can only see their own
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet transactions: users can view their own
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));

-- Lessons: students and teachers can view their own
CREATE POLICY "Students can view own lessons" ON lessons
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view own lessons" ON lessons
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE id = teacher_id)
  );

CREATE POLICY "Students can insert lessons" ON lessons
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own lessons" ON lessons
  FOR UPDATE USING (auth.uid() = student_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
