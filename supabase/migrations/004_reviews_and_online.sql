-- ── Online presence ────────────────────────────────────────────────────────
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;

-- ── Reviews table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_name    TEXT NOT NULL,
  student_email   TEXT NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  is_approved     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_teacher_id_idx ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS reviews_approved_idx   ON reviews(teacher_id, is_approved);

-- ── Auto-update teacher.rating when a review changes ──────────────────────
CREATE OR REPLACE FUNCTION update_teacher_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_teacher_id UUID;
BEGIN
  target_teacher_id := COALESCE(NEW.teacher_id, OLD.teacher_id);

  UPDATE teachers
  SET rating = COALESCE(
    (SELECT ROUND(AVG(rating)::NUMERIC, 2)
     FROM reviews
     WHERE teacher_id = target_teacher_id
       AND is_approved = true),
    0
  )
  WHERE id = target_teacher_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_teacher_rating ON reviews;
CREATE TRIGGER trg_update_teacher_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_teacher_rating();

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Anyone can submit a review (no auth required)
CREATE POLICY "Anyone can submit review"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Admins can do everything (service-role key bypasses RLS anyway)
