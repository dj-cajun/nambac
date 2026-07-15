-- Security Advisor hardening for Supabase Postgres.
-- The app reads/writes through server APIs and service-role credentials, so
-- public REST access should stay narrow and explicit.

-- ── Enable RLS on every public table ───────────────────────────────────────
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_daily_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visit_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lienquan_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE lienquan_boasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lienquan_boast_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lienquan_khoe_images ENABLE ROW LEVEL SECURITY;

-- ── Drop broad/legacy public policies if they exist ────────────────────────
DROP POLICY IF EXISTS "Public quizzes are viewable by everyone." ON quizzes;
DROP POLICY IF EXISTS "Questions are viewable by everyone." ON questions;
DROP POLICY IF EXISTS "Results are viewable by everyone." ON results;
DROP POLICY IF EXISTS "Allow all operations for now" ON quizzes;
DROP POLICY IF EXISTS "Allow all operations for now" ON questions;
DROP POLICY IF EXISTS "Allow all operations for now" ON results;

DROP POLICY IF EXISTS "Khoe images public read" ON storage.objects;
DROP POLICY IF EXISTS "Khoe images service upload" ON storage.objects;
DROP POLICY IF EXISTS "Images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images." ON storage.objects;
DROP POLICY IF EXISTS "Quiz images public read" ON storage.objects;
DROP POLICY IF EXISTS "Quiz images service upload" ON storage.objects;
DROP POLICY IF EXISTS "Quiz images service update" ON storage.objects;
DROP POLICY IF EXISTS "Quiz images service delete" ON storage.objects;

-- ── Public read policies for intentionally public content/stats ────────────
CREATE POLICY "Public active quizzes read" ON quizzes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = 1 AND status = 'active');

CREATE POLICY "Public questions read for active quizzes" ON questions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.is_active = 1
        AND quizzes.status = 'active'
    )
  );

CREATE POLICY "Public results read for active quizzes" ON results
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM quizzes
      WHERE quizzes.id = results.quiz_id
        AND quizzes.is_active = 1
        AND quizzes.status = 'active'
    )
  );

CREATE POLICY "Public balance votes read" ON balance_votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public fortune stats read" ON fortune_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public feature stats read" ON feature_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public visible lienquan boasts read" ON lienquan_boasts
  FOR SELECT
  TO anon, authenticated
  USING (is_hidden = 0);

-- ── Service role can manage all app tables ─────────────────────────────────
CREATE POLICY "Service role manages quizzes" ON quizzes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages questions" ON questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages results" ON results
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages brand inquiries" ON brand_inquiries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages balance votes" ON balance_votes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages fortune stats" ON fortune_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages feature stats" ON feature_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages users" ON users
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages player progress" ON player_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages quiz completions" ON quiz_completions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages push subscriptions" ON push_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages site daily visitors" ON site_daily_visitors
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages site visit exclusions" ON site_visit_exclusions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages lienquan mastery" ON lienquan_mastery
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages lienquan boasts" ON lienquan_boasts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages lienquan boast likes" ON lienquan_boast_likes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages lienquan khoe images" ON lienquan_khoe_images
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Storage policies: public read, server-only upload ──────────────────────
CREATE POLICY "Khoe images public read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'khoe-images');

CREATE POLICY "Khoe images service upload" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'khoe-images');

CREATE POLICY "Quiz images public read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'quiz-images');

CREATE POLICY "Quiz images service upload" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'quiz-images');

CREATE POLICY "Quiz images service update" ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'quiz-images')
  WITH CHECK (bucket_id = 'quiz-images');

CREATE POLICY "Quiz images service delete" ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'quiz-images');
