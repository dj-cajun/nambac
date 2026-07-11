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

if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.error('❌ GEMINI_API_KEY or OPENROUTER_API_KEY required');
  process.exit(1);
}

const { generateFortuneArchetypes } = await import('../../shared/fortunePrompts.js');
const { getDateStr } = await import('../../shared/fortuneEngine.js');

console.log(`\n🔮 Fortune axis batch — axis=${axis}, count=${count}${dryRun ? ' [DRY]' : ''}\n`);

if (dryRun) {
  console.log('Would call generateFortuneArchetypes() — merge into fortuneData manually or via future DB.');
  process.exit(0);
}

const items = await generateFortuneArchetypes({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  openrouterKey: process.env.OPENROUTER_API_KEY,
  axis,
  dateLabel: getDateStr(),
});

console.log(JSON.stringify(items.slice(0, count), null, 2));
console.log(`\n✅ Generated ${Math.min(count, items.length)} item(s). Review JSON before merging.\n`);
