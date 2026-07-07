-- Balance game vote counts (A vs B)
CREATE TABLE IF NOT EXISTS balance_votes (
  question_id TEXT PRIMARY KEY,
  votes_a INTEGER NOT NULL DEFAULT 0,
  votes_b INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
