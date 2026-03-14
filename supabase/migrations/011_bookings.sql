-- Booking / scheduling system
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  proposed_date date NOT NULL,
  proposed_time time NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60 CHECK (duration_minutes IN (30, 60, 90)),
  message text CHECK (char_length(message) <= 1000),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  teacher_note text CHECK (char_length(teacher_note) <= 500),
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_bookings_student ON bookings(student_id, status);
CREATE INDEX idx_bookings_teacher ON bookings(teacher_id, status);
CREATE INDEX idx_bookings_date ON bookings(proposed_date, proposed_time);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their bookings" ON bookings
  FOR SELECT USING (
    teacher_id IN (
      SELECT p.teacher_id FROM profiles p WHERE p.id = auth.uid() AND p.teacher_id IS NOT NULL
    )
  );

CREATE POLICY "Students can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can update their bookings" ON bookings
  FOR UPDATE USING (
    teacher_id IN (
      SELECT p.teacher_id FROM profiles p WHERE p.id = auth.uid() AND p.teacher_id IS NOT NULL
    )
  );
