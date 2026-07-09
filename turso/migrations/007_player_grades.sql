-- Player quiz grades (logged-in + guest via visitor_key)

CREATE TABLE IF NOT EXISTS player_progress (
  player_key TEXT PRIMARY KEY,
  is_logged_in INTEGER NOT NULL DEFAULT 0,
  unique_quizzes INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  grade_level INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_completions (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(player_key, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_completions_player ON quiz_completions(player_key);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_quiz ON quiz_completions(quiz_id);
