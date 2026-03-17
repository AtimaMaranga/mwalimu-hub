-- 017_production_payments.sql
-- Production payment system: Paystack integration, teacher earnings, payouts, receipts

-- ============================================================
-- 1. Extend wallet_transactions with payment provider fields
-- ============================================================
ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'paystack',
  ADD COLUMN IF NOT EXISTS provider_reference text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Add 'payout' and 'commission' to the type check
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check
  CHECK (type IN ('top_up', 'lesson_charge', 'refund', 'payout', 'commission'));

-- Index on reference for idempotency lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_transactions_reference
  ON wallet_transactions(reference) WHERE reference IS NOT NULL;

-- ============================================================
-- 2. Teacher earnings — one row per completed lesson
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id),
  gross_amount decimal(10,2) NOT NULL,          -- full lesson charge
  commission_rate decimal(5,4) NOT NULL DEFAULT 0.4000,  -- 40%
  commission_amount decimal(10,2) NOT NULL,     -- platform's cut
  net_amount decimal(10,2) NOT NULL,            -- teacher receives
  status text NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('unpaid', 'processing', 'paid', 'reversed')),
  payout_id uuid,                               -- links to teacher_payouts when paid
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_earnings_teacher ON teacher_earnings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_earnings_lesson ON teacher_earnings(lesson_id);
CREATE INDEX IF NOT EXISTS idx_teacher_earnings_status ON teacher_earnings(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_earnings_lesson_unique ON teacher_earnings(lesson_id);

-- ============================================================
-- 3. Teacher payouts — biweekly batch payouts
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method text,          -- 'mpesa', 'bank_transfer'
  provider_reference text,      -- Paystack transfer reference
  payout_period_start date NOT NULL,
  payout_period_end date NOT NULL,
  processed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_payouts_teacher ON teacher_payouts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_payouts_status ON teacher_payouts(status);

-- ============================================================
-- 4. Platform revenue — tracks commission per lesson
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  teacher_earning_id uuid REFERENCES teacher_earnings(id),
  amount decimal(10,2) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_lesson ON platform_revenue(lesson_id);

-- ============================================================
-- 5. Receipts — PDF receipts for every financial transaction
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES wallet_transactions(id),
  teacher_earning_id uuid REFERENCES teacher_earnings(id),
  receipt_number text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('top_up', 'lesson_charge', 'refund', 'payout')),
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  description text,
  pdf_url text,                 -- Supabase Storage path
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);

-- ============================================================
-- 6. Paystack payment references — tracks payment initialization
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'abandoned')),
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payment_references_reference ON payment_references(reference);
CREATE INDEX IF NOT EXISTS idx_payment_references_user ON payment_references(user_id);

-- ============================================================
-- 7. Teacher bank/payout details
-- ============================================================
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS payout_method text DEFAULT 'mpesa',
  ADD COLUMN IF NOT EXISTS payout_phone text,      -- M-Pesa number
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_account_name text;

-- ============================================================
-- 8. RLS policies
-- ============================================================
ALTER TABLE teacher_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_references ENABLE ROW LEVEL SECURITY;

-- Teacher earnings: teachers see their own
CREATE POLICY "Teachers can view own earnings" ON teacher_earnings
  FOR SELECT USING (
    teacher_id IN (
      SELECT t.id FROM teachers t
      JOIN profiles p ON p.teacher_id = t.id
      WHERE p.id = auth.uid()
    )
  );

-- Teacher payouts: teachers see their own
CREATE POLICY "Teachers can view own payouts" ON teacher_payouts
  FOR SELECT USING (
    teacher_id IN (
      SELECT t.id FROM teachers t
      JOIN profiles p ON p.teacher_id = t.id
      WHERE p.id = auth.uid()
    )
  );

-- Receipts: users see their own
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Payment references: users see their own
CREATE POLICY "Users can view own payment refs" ON payment_references
  FOR SELECT USING (auth.uid() = user_id);

-- Platform revenue: no user access (admin only via service role)

-- ============================================================
-- 9. Storage bucket for receipts
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated users can read their own receipts
CREATE POLICY "Users can read own receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
