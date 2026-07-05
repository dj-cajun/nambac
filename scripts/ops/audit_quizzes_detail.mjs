#!/usr/bin/env node
/** Detailed Q/A content review — npm run audit:quizzes:detail */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const HANGUL = /[\uAC00-\uD7AF]/;
const VIET = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

async function main() {
  const { getTurso, rowToQuiz, rowToQuestion } = await import('../../api/_lib/turso.js');
  const db = getTurso();
  const rs = await db.execute(`SELECT * FROM quizzes WHERE is_active = 1 ORDER BY datetime(created_at) DESC`);
  const quizzes = rs.rows.map(rowToQuiz);

  const warnings = [];
  let qTotal = 0;

  for (const quiz of quizzes) {
    const qRs = await db.execute({
      sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC',
      args: [quiz.id],
    });
    const questions = qRs.rows.map(rowToQuestion);
    qTotal += questions.length;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const label = `[${quiz.id.slice(0, 8)}] Q${i + 1}`;
      const blob = `${q.question_text}|${q.option_a}|${q.option_b}`;

      if (HANGUL.test(blob)) warnings.push({ level: 'ERROR', label, quiz: quiz.title?.slice(0, 40), msg: '한글 포함', q: q.question_text?.slice(0, 60), a: q.option_a?.slice(0, 40), b: q.option_b?.slice(0, 40) });
      if (!VIET.test(blob) && /[a-zA-Z]{4,}/.test(blob) && !HANGUL.test(blob)) {
        warnings.push({ level: 'WARN', label, quiz: quiz.title?.slice(0, 40), msg: '베트남어 diacritic 없음 (영어 위주?)', q: q.question_text?.slice(0, 60), a: q.option_a, b: q.option_b });
      }
      if ((q.option_a?.length || 0) < 4 || (q.option_b?.length || 0) < 4) {
        warnings.push({ level: 'WARN', label, quiz: quiz.title?.slice(0, 40), msg: '선택지 너무 짧음', a: q.option_a, b: q.option_b });
      }
      if (q.question_text?.length > 120) {
        warnings.push({ level: 'WARN', label, quiz: quiz.title?.slice(0, 40), msg: '질문 120자 초과', q: q.question_text?.slice(0, 80) + '…' });
      }
    }

    const texts = questions.map((q) => q.question_text?.trim()).filter(Boolean);
    const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
    if (dupes.length) warnings.push({ level: 'WARN', label: quiz.id.slice(0, 8), quiz: quiz.title?.slice(0, 40), msg: `중복 질문 ${dupes.length}개` });
  }

  const errors = warnings.filter((w) => w.level === 'ERROR');
  const warns = warnings.filter((w) => w.level === 'WARN');

  console.log(`\n📊 ${quizzes.length} quizzes, ${qTotal} questions\n`);
  console.log(`ERROR: ${errors.length} | WARN: ${warns.length}\n`);

  if (errors.length) {
    console.log('=== 한글/구조 오류 ===');
    errors.forEach((w) => console.log(`${w.label} ${w.msg}\n  Q: ${w.q}\n  A: ${w.a}\n  B: ${w.b}\n`));
  }

  if (warns.length) {
    console.log('=== 주의 (샘플 최대 15건) ===');
    warns.slice(0, 15).forEach((w) => {
      console.log(`${w.label} — ${w.msg}`);
      if (w.q) console.log(`  Q: ${w.q}`);
      if (w.a) console.log(`  A: ${w.a} | B: ${w.b}`);
    });
    if (warns.length > 15) console.log(`\n… 외 ${warns.length - 15}건`);
  }

  if (!errors.length && !warns.length) console.log('✅ 질문/선택지 이상 없음\n');

  // Print full Q/A for placeholder-option quizzes
  const badIds = new Set(['979c85fe', 'dd8131c1', '63c1dba1']);
  console.log('=== 문제 퀴즈 상세 ===\n');
  for (const quiz of quizzes) {
    if (!badIds.has(quiz.id.slice(0, 8))) continue;
    const qRs = await db.execute({ sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number', args: [quiz.id] });
    const questions = qRs.rows.map(rowToQuestion);
    console.log(`[${quiz.id.slice(0, 8)}] ${quiz.title}`);
    if (!questions.length) console.log('  (문항 없음)\n');
    questions.forEach((q, i) => {
      console.log(`  Q${i + 1}: ${q.question_text}`);
      console.log(`    A: ${q.option_a} | B: ${q.option_b} (score ${q.score_a}/${q.score_b})`);
    });
    console.log('');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
