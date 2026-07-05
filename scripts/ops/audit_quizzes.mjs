#!/usr/bin/env node
/**
 * Audit all quizzes: structure, A/B options, language hints.
 * Run: npm run audit:quizzes
 */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF]/;
const CJK = /[\u4E00-\u9FFF]/;

function issuesForQuestion(q, idx, quizType) {
  const issues = [];
  const n = idx + 1;

  if (!q.question_text?.trim()) issues.push(`Q${n}: empty question_text`);
  if (!q.option_a?.trim()) issues.push(`Q${n}: empty option_a`);
  if (!q.option_b?.trim()) issues.push(`Q${n}: empty option_b`);

  const fields = [q.question_text, q.option_a, q.option_b].filter(Boolean);
  for (const f of fields) {
    if (HANGUL.test(f)) issues.push(`Q${n}: Korean (hangul) in text`);
    if (CJK.test(f)) issues.push(`Q${n}: CJK characters detected`);
  }

  if (q.option_a?.trim() === q.option_b?.trim()) issues.push(`Q${n}: option_a === option_b`);

  const a = q.option_a?.trim();
  const b = q.option_b?.trim();
  if (/^[ABab]$/.test(a) && /^[ABab]$/.test(b)) {
    issues.push(`Q${n}: placeholder options (A/B labels only, no real text)`);
  }
  if ((a?.length || 0) <= 2 || (b?.length || 0) <= 2) {
    issues.push(`Q${n}: option too short (${JSON.stringify(a)} / ${JSON.stringify(b)})`);
  }

  if (quizType === 'binary_5q') {
    const sa = Number(q.score_a);
    const sb = Number(q.score_b);
    if (Number.isNaN(sa) || Number.isNaN(sb)) issues.push(`Q${n}: invalid scores`);
  }

  if (q.options) {
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      if (Array.isArray(opts) && opts.length < 2) issues.push(`Q${n}: multi-choice has <2 options`);
    } catch {
      issues.push(`Q${n}: invalid options JSON`);
    }
  }

  return issues;
}

function issuesForResult(r, idx) {
  const issues = [];
  if (!r.title?.trim()) issues.push(`R${idx}: empty title`);
  const text = [r.title, r.description, r.type_name].filter(Boolean).join(' ');
  if (HANGUL.test(text)) issues.push(`R${idx}: Korean in result`);
  return issues;
}

async function main() {
  const { getTurso, rowToQuiz, rowToQuestion, rowToResult } = await import('../../api/_lib/turso.js');
  const db = getTurso();

  const rs = await db.execute({
    sql: `SELECT * FROM quizzes WHERE is_active = 1 ORDER BY datetime(created_at) DESC`,
  });
  const quizzes = rs.rows.map(rowToQuiz);

  let totalIssues = 0;
  const summary = [];

  for (const quiz of quizzes) {
    const [qRs, rRs] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC', args: [quiz.id] }),
      db.execute({ sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC', args: [quiz.id] }),
    ]);
    const questions = qRs.rows.map(rowToQuestion);
    const results = rRs.rows.map(rowToResult);
    const quizType = quiz.quiz_type || 'binary_5q';
    const issues = [];

    if (quizType !== 'name_input' && questions.length === 0) issues.push('no questions');
    if (results.length === 0) issues.push('no results');

    if (quizType === 'binary_5q' && questions.length !== 5) {
      issues.push(`binary_5q expects 5 questions, has ${questions.length}`);
    }
    if (quizType === 'binary_5q' && results.length !== 8) {
      issues.push(`binary_5q expects 8 results, has ${results.length}`);
    }
    if (quizType === 'mbti_12q' && questions.length !== 12) {
      issues.push(`mbti_12q expects 12 questions, has ${questions.length}`);
    }

    const titleText = [quiz.title, quiz.description].filter(Boolean).join(' ');
    if (HANGUL.test(titleText)) issues.push('Korean in quiz title/description');

    questions.forEach((q, i) => issues.push(...issuesForQuestion(q, i, quizType)));
    results.forEach((r, i) => issues.push(...issuesForResult(r, r.result_code ?? i)));

    if (issues.length) {
      totalIssues += issues.length;
      summary.push({
        id: quiz.id.slice(0, 8),
        title: quiz.title?.slice(0, 55),
        type: quizType,
        category: quiz.category,
        qCount: questions.length,
        rCount: results.length,
        issues,
      });
    }
  }

  console.log(`\n📋 Quiz audit — ${quizzes.length} active quiz(es)\n`);

  if (summary.length === 0) {
    console.log('✅ No structural issues found.\n');
    return;
  }

  for (const s of summary) {
    console.log(`❌ [${s.id}] ${s.title}`);
    console.log(`   type=${s.type} cat=${s.category} Q=${s.qCount} R=${s.rCount}`);
    for (const i of s.issues) console.log(`   • ${i}`);
    console.log('');
  }

  console.log(`Total: ${summary.length} quiz(es) with ${totalIssues} issue(s)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
