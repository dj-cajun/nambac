#!/usr/bin/env node
/** Validate Liên Quân quiz pool: 5 tiers × 10Q, single correct each. */
import { buildAllTierStubs } from '../../shared/lienquan/quizTemplates.js';
import { QUIZ_DIFFICULTIES, getTierQuestions } from '../../shared/lienquan/quizPool.js';
import { scoreTierToMastery } from '../../shared/lienquan/quizQuestions.js';

const EXPECTED = 10;
let errors = [];

function checkQuestion(q, tier) {
  if (!q.id) errors.push(`tier${tier}: missing id`);
  if (!q.text?.trim()) errors.push(`${q.id}: empty text`);
  const opts = q.options || [];
  if (opts.length !== 3) errors.push(`${q.id}: expected 3 options, got ${opts.length}`);
  const correct = opts.filter((o) => o.correct);
  if (correct.length !== 1) errors.push(`${q.id}: expected 1 correct, got ${correct.length}`);
  opts.forEach((o) => {
    if (!o.label?.trim()) errors.push(`${q.id}: empty option ${o.id}`);
  });
}

const allIds = new Set();
for (const d of QUIZ_DIFFICULTIES) {
  const raw = buildAllTierStubs()[d.id] || [];
  const pub = getTierQuestions(d.id);
  if (raw.length !== EXPECTED) errors.push(`tier ${d.id}: expected ${EXPECTED} stubs, got ${raw.length}`);
  if (pub.length !== EXPECTED) errors.push(`tier ${d.id}: expected ${EXPECTED} public, got ${pub.length}`);
  pub.forEach((q) => {
    if (allIds.has(q.id)) errors.push(`duplicate id ${q.id}`);
    allIds.add(q.id);
    checkQuestion(q, d.id);
  });
}

// Scoring smoke
if (scoreTierToMastery(5, 10) !== 7) errors.push('scoreTierToMastery(5,10) should be 7');
if (scoreTierToMastery(1, 0) !== 0) errors.push('scoreTierToMastery(1,0) should be 0');

if (errors.length) {
  console.error('❌ Liên Quân quiz validation failed:\n');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('✅ Liên Quân quiz pool OK');
console.log(`   ${QUIZ_DIFFICULTIES.length} tiers × ${EXPECTED} questions = ${allIds.size} total`);
QUIZ_DIFFICULTIES.forEach((d) => {
  const qs = getTierQuestions(d.id);
  console.log(`   Tier ${d.id} ${d.label}: ${qs[0]?.text?.slice(0, 42)}…`);
});
