-- Nambac full schema (Turso-compatible → Supabase Postgres)
-- Run via: npm run db:migrate-supabase

-- Legacy uuid schema (old Supabase) 제거 후 Turso 스키마로 재생성
DROP TABLE IF EXISTS quiz_completions CASCADE;
DROP TABLE IF EXISTS lienquan_boast_likes CASCADE;
DROP TABLE IF EXISTS lienquan_boasts CASCADE;
DROP TABLE IF EXISTS lienquan_khoe_images CASCADE;
DROP TABLE IF EXISTS lienquan_mastery CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS player_progress CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS site_daily_visitors CASCADE;
DROP TABLE IF EXISTS site_visit_exclusions CASCADE;
DROP TABLE IF EXISTS balance_votes CASCADE;
DROP TABLE IF EXISTS brand_inquiries CASCADE;
DROP TABLE IF EXISTS feature_stats CASCADE;
DROP TABLE IF EXISTS fortune_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- ── Quizzes ──
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quiz_type TEXT DEFAULT 'binary_5q',
  image_url TEXT,
  config TEXT,
  design TEXT,
  is_active INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  order_number INTEGER,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  image_url TEXT,
  dimension TEXT,
  options TEXT
);

CREATE TABLE results (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  result_code INTEGER NOT NULL,
  title TEXT NOT NULL,
  type_name TEXT,
  description TEXT,
  traits TEXT,
  image_url TEXT
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_results_quiz_id ON results(quiz_id);
CREATE INDEX idx_quizzes_quiz_type ON quizzes(quiz_type);
CREATE INDEX idx_quizzes_participant ON quizzes(participant_count DESC);
CREATE INDEX idx_quizzes_active_created ON quizzes(is_active, status, created_at);

CREATE TABLE brand_inquiries (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  quiz_concept TEXT NOT NULL,
  target_audience TEXT,
  budget_tier TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (NOW()::TEXT)
);

CREATE TABLE balance_votes (
  question_id TEXT PRIMARY KEY,
  votes_a INTEGER NOT NULL DEFAULT 0,
  votes_b INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

CREATE TABLE fortune_stats (
  kind TEXT PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

INSERT INTO fortune_stats (kind, view_count, share_count, like_count)
VALUES ('love', 0, 0, 0)
ON CONFLICT (kind) DO NOTHING;

CREATE TABLE feature_stats (
  kind TEXT PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  picture_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  email_opt_in INTEGER NOT NULL DEFAULT 1,
  admin_note TEXT,
  login_count INTEGER NOT NULL DEFAULT 0,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (NOW()::TEXT),
  updated_at TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_login ON users(last_login_at);

CREATE TABLE player_progress (
  player_key TEXT PRIMARY KEY,
  is_logged_in INTEGER NOT NULL DEFAULT 0,
  unique_quizzes INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  grade_level INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

CREATE TABLE quiz_completions (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER,
  completed_at TEXT NOT NULL DEFAULT (NOW()::TEXT),
  UNIQUE(player_key, quiz_id)
);

CREATE INDEX idx_quiz_completions_player ON quiz_completions(player_key);
CREATE INDEX idx_quiz_completions_quiz ON quiz_completions(quiz_id);

CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  locale TEXT DEFAULT 'vi',
  created_at TEXT DEFAULT (NOW()::TEXT)
);

CREATE INDEX idx_push_subscriptions_created ON push_subscriptions(created_at DESC);

CREATE TABLE site_daily_visitors (
  visit_date TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  is_logged_in INTEGER NOT NULL DEFAULT 0,
  ip_key TEXT,
  PRIMARY KEY (visit_date, visitor_key)
);

CREATE INDEX idx_site_visitors_date ON site_daily_visitors(visit_date);
CREATE INDEX idx_site_visitors_ip ON site_daily_visitors(visit_date, ip_key);

CREATE TABLE site_visit_exclusions (
  visitor_key TEXT PRIMARY KEY,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

-- ── Liên Quân ──
CREATE TABLE lienquan_mastery (
  player_key TEXT PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

CREATE TABLE lienquan_boasts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  display_name TEXT NOT NULL,
  caption TEXT NOT NULL,
  hero_id TEXT,
  image_url TEXT,
  tiktok_url TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

CREATE TABLE lienquan_boast_likes (
  boast_id TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  PRIMARY KEY (boast_id, visitor_key)
);

CREATE INDEX idx_lq_boasts_created ON lienquan_boasts(created_at DESC);

-- ── Khoe images (legacy Turso BLOB — 신규는 Storage) ──
CREATE TABLE lienquan_khoe_images (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'image/webp',
  data BYTEA NOT NULL,
  created_at TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

-- ── Storage: khoe-images bucket ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('khoe-images', 'khoe-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Khoe images public read" ON storage.objects;
DROP POLICY IF EXISTS "Khoe images service upload" ON storage.objects;

CREATE POLICY "Khoe images service upload" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'khoe-images');
