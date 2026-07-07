-- Nambac quiz platform (Turso / SQLite)

CREATE TABLE IF NOT EXISTS quizzes (
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
  participant_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
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

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  result_code INTEGER NOT NULL,
  title TEXT NOT NULL,
  type_name TEXT,
  description TEXT,
  traits TEXT,
  image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_results_quiz_id ON results(quiz_id);

CREATE TABLE IF NOT EXISTS brand_inquiries (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  quiz_concept TEXT NOT NULL,
  target_audience TEXT,
  budget_tier TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS balance_votes (
  question_id TEXT PRIMARY KEY,
  votes_a INTEGER NOT NULL DEFAULT 0,
  votes_b INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
