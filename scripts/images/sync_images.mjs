/**
 * Sync local quiz images with what production (GitHub Actions) already generated.
 *
 * The daily-quiz / backfill workflows update the shared remote Turso DB and
 * commit images. Run this before working locally so you DON'T end up
 * regenerating images the cron already made (which creates duplicate/orphan
 * files and overwrites the DB pointer).
 *
 * For every image the DB references, if it's missing locally it is downloaded
 * from the live site into public/images/. Nothing is generated and the DB is
 * never modified.
 *
 * Run: npm run images:sync
 * Options: --quiz-id=xxx   only sync one quiz
 */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';
import { hydrateFromRemote, fileExistsLocally, isPlaceholder, SITE_BASE } from './_imageSync.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const quizIdArg = args.find((a) => a.startsWith('--quiz-id='));
const filterQuizId = quizIdArg ? quizIdArg.split('=')[1] : null;

async function main() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* required in .env.local');
    process.exit(1);
  }

  const { getTurso, rowToQuiz, rowToQuestion, rowToResult } = await import('../../api/_lib/turso.js');
  const db = getTurso();

  let sql = 'SELECT * FROM quizzes WHERE is_active = 1 ORDER BY datetime(created_at) DESC';
  const queryArgs = [];
  if (filterQuizId) {
    sql = 'SELECT * FROM quizzes WHERE id = ? LIMIT 1';
    queryArgs.push(filterQuizId);
  }
  const quizzes = (await db.execute({ sql, args: queryArgs })).rows.map(rowToQuiz);

  console.log(`\n🔄 Syncing images from ${SITE_BASE} for ${quizzes.length} quiz(es)\n`);

  let present = 0;
  let synced = 0;
  const missing = [];

  for (const quiz of quizzes) {
    const [questionsRs, resultsRs] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC', args: [quiz.id] }),
      db.execute({ sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC', args: [quiz.id] }),
    ]);
    const questions = questionsRs.rows.map(rowToQuestion);
    const results = resultsRs.rows.map(rowToResult);

    const entries = [
      { label: 'cover', url: quiz.image_url },
      ...questions.map((q) => ({ label: `Q${q.order_number}`, url: q.image_url })),
      ...results.map((r) => ({ label: `R${r.result_code}`, url: r.image_url })),
    ];

    for (const { label, url } of entries) {
      if (!url || isPlaceholder(url)) continue;
      if (fileExistsLocally(url)) {
        present++;
        continue;
      }
      const ok = await hydrateFromRemote(url, { log: false });
      if (ok) {
        synced++;
      } else {
        missing.push({ quiz: quiz.title?.slice(0, 40), id: quiz.id.slice(0, 8), label, url });
      }
    }
  }

  console.log(`✅ Already local: ${present}`);
  console.log(`⬇️  Downloaded from live site: ${synced}`);
  if (missing.length) {
    console.log(`\n⚠️  ${missing.length} image(s) referenced by DB but NOT on the live site yet:`);
    for (const m of missing) console.log(`   • [${m.id}] ${m.quiz} → ${m.label} (${m.url})`);
    console.log('\n   These genuinely need generation. Run: npm run images:backfill');
  } else {
    console.log('\n🎉 Local images fully match production. No regeneration needed.');
  }
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
