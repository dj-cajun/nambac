#!/usr/bin/env node
/**
 * Batch-generate fortune archetypes per axis (admin / one-time expansion).
 * Appends to fortune pool via fortunePrompts — not wired to daily cron.
 *
 * Usage:
 *   npm run fortune:axis-batch -- --axis=money --count=5
 *   npm run fortune:axis-batch -- --axis=health --dry-run
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const axisArg = args.find((a) => a.startsWith('--axis='));
const countArg = args.find((a) => a.startsWith('--count='));
const dryRun = args.includes('--dry-run');
const axis = axisArg ? axisArg.split('=')[1] : 'money';
const count = countArg ? parseInt(countArg.split('=')[1], 10) : 5;

if (!dryRun && !process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.error('❌ GEMINI_API_KEY or OPENROUTER_API_KEY required');
  process.exit(1);
}

const { generateFortuneArchetypes, buildFortuneGeneratorUserPrompt } = await import('../../shared/fortunePrompts.js');
const { getDateStr } = await import('../../shared/fortuneEngine.js');

const dateLabel = getDateStr();

console.log(`\n🔮 Fortune axis batch — axis=${axis}, count=${count}${dryRun ? ' [DRY]' : ''}\n`);

if (dryRun) {
  console.log('Would call generateFortuneArchetypes() with:');
  console.log(`  axis: ${axis}`);
  console.log(`  date: ${dateLabel}`);
  console.log(`  prompt: ${buildFortuneGeneratorUserPrompt(axis, dateLabel).slice(0, 120)}…`);
  console.log('\nOutput would be saved to data/fortune-batch/ (gitignored). Merge into fortuneData.js after review.\n');
  process.exit(0);
}

const items = await generateFortuneArchetypes({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  openrouterKey: process.env.OPENROUTER_API_KEY,
  axis,
  dateLabel,
});

const slice = items.slice(0, count);
const outDir = path.join(PROJECT_ROOT, 'data', 'fortune-batch');
fs.mkdirSync(outDir, { recursive: true });
let outPath = path.join(outDir, `${axis}-${dateLabel}.json`);
if (fs.existsSync(outPath)) {
  outPath = path.join(outDir, `${axis}-${dateLabel}-${Date.now()}.json`);
}
fs.writeFileSync(outPath, `${JSON.stringify(slice, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(slice, null, 2));
console.log(`\n✅ Generated ${slice.length} item(s) → ${path.relative(PROJECT_ROOT, outPath)}`);
console.log('   Review JSON before merging into shared/fortuneData.js\n');
