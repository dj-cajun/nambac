import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local then .env for CLI scripts
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or Supabase key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const loadJson = (filename) => {
  const filePath = path.join(__dirname, 'backend', 'data', filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

async function migrate() {
  console.log('🚀 Starting Data Migration to Supabase...');

  const quizzes = loadJson('quizzes.json') || [];
  const questionsData = loadJson('questions.json') || {};
  const resultsData = loadJson('results.json') || {};

  console.log(`Found ${quizzes.length} quizzes to migrate.`);

  for (const quiz of quizzes) {
    console.log(`Migrating quiz: ${quiz.title}`);
    
    // 1. Insert Quiz
    const { data: insertedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .upsert({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        quiz_type: quiz.quiz_type || 'binary_5q',
        image_url: quiz.image_url,
        config: quiz.config || {},
        design: quiz.design || {},
        is_active: quiz.is_active !== false,
        view_count: quiz.view_count || 0,
        share_count: quiz.share_count || 0,
        created_at: quiz.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (quizError) {
      console.error(`❌ Error inserting quiz ${quiz.id}:`, quizError.message);
      continue;
    }

    // 2. Insert Questions
    const questions = questionsData[quiz.id] || [];
    if (questions.length > 0) {
      const qBatch = questions.map((q, idx) => ({
        quiz_id: quiz.id,
        order_number: idx + 1,
        question_text: q.question_text || q.text, // Handle both formats
        option_a: q.option_a || (q.options ? q.options[0]?.text : ''),
        option_b: q.option_b || (q.options ? q.options[1]?.text : ''),
        score_a: q.score_a || 0,
        score_b: q.score_b || 0,
        image_url: q.image_url || null,
        dimension: q.dimension || null,
        options: q.options || null
      }));

      const { error: qError } = await supabase.from('questions').insert(qBatch);
      if (qError) console.error(`❌ Error inserting questions for quiz ${quiz.id}:`, qError.message);
    }

    // 3. Insert Results
    const results = resultsData[quiz.id] || [];
    if (results.length > 0) {
      const rBatch = results.map(r => ({
        id: r.id || undefined, // Let supabase generate UUID if missing
        quiz_id: quiz.id,
        result_code: r.result_code || 0,
        title: r.title,
        description: r.description,
        traits: r.traits || [],
        image_url: r.image_url || null
      }));

      const { error: rError } = await supabase.from('results').insert(rBatch);
      if (rError) console.error(`❌ Error inserting results for quiz ${quiz.id}:`, rError.message);
    }
  }

  console.log('✅ Migration Complete!');
}

migrate();
