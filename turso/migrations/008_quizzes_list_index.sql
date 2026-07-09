-- Speed up active quiz listing
CREATE INDEX IF NOT EXISTS idx_quizzes_active_created
  ON quizzes(is_active, status, created_at);
