-- ============================================================
-- Mwalimu Wangu — Initial Database Schema
-- Run this in your Supabase SQL editor or via Supabase CLI
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Teachers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                   TEXT UNIQUE NOT NULL,
  name                   TEXT NOT NULL,
  email                  TEXT UNIQUE NOT NULL,
  phone                  TEXT,
  profile_image_url      TEXT,
  tagline                TEXT,
  bio                    TEXT,
  teaching_approach      TEXT,
  experience_years       INTEGER DEFAULT 0,
  qualifications         TEXT,
  certifications         TEXT[] DEFAULT '{}',
  languages_spoken       JSONB DEFAULT '[]',
  specializations        TEXT[] DEFAULT '{}',
  hourly_rate            DECIMAL(10, 2),
  timezone               TEXT DEFAULT 'UTC',
  availability_description TEXT,
  video_intro_url        TEXT,
  is_native_speaker      BOOLEAN DEFAULT TRUE,
  is_published           BOOLEAN DEFAULT FALSE,
  rating                 DECIMAL(3, 2) DEFAULT 0,
  total_students         INTEGER DEFAULT 0,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Blog Posts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                 TEXT UNIQUE NOT NULL,
  title                TEXT NOT NULL,
  excerpt              TEXT,
  content              TEXT NOT NULL,
  featured_image_url   TEXT,
  author               TEXT DEFAULT 'Mwalimu Wangu Team',
  category             TEXT,
  tags                 TEXT[] DEFAULT '{}',
  read_time            INTEGER DEFAULT 5,
  is_published         BOOLEAN DEFAULT FALSE,
  published_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contact Submissions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  phone      TEXT,
  status     TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Teacher Applications ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_applications (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  experience           TEXT,
  qualifications       TEXT,
  available_hours      INTEGER,
  rate_expectation     DECIMAL(10, 2),
  teaching_philosophy  TEXT,
  cv_url               TEXT,
  status               TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Student Inquiries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_inquiries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id       UUID REFERENCES teachers(id) ON DELETE SET NULL,
  student_name     TEXT NOT NULL,
  student_email    TEXT NOT NULL,
  message          TEXT,
  preferred_times  TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_teachers_slug         ON teachers(slug);
CREATE INDEX IF NOT EXISTS idx_teachers_published    ON teachers(is_published);
CREATE INDEX IF NOT EXISTS idx_teachers_rate         ON teachers(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_blog_slug             ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published        ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_published_at     ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_category         ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_contact_status        ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_applications_status   ON teacher_applications(status);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE teachers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_inquiries   ENABLE ROW LEVEL SECURITY;

-- Public: read published teachers
CREATE POLICY "Public read teachers" ON teachers
  FOR SELECT USING (is_published = TRUE);

-- Public: read published blog posts
CREATE POLICY "Public read blog posts" ON blog_posts
  FOR SELECT USING (is_published = TRUE);

-- Authenticated (admin): full access
CREATE POLICY "Admin full access teachers" ON teachers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access blog_posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read contact_submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read teacher_applications" ON teacher_applications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read student_inquiries" ON student_inquiries
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous inserts for forms (service role handles these via API routes)
CREATE POLICY "Anon insert contact" ON contact_submissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon insert applications" ON teacher_applications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon insert inquiries" ON student_inquiries
  FOR INSERT WITH CHECK (TRUE);
