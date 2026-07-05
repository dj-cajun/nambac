#!/usr/bin/env node
/**
 * Manual daily quiz trigger (local or CI).
 * Usage: npm run daily:quiz
 *        npm run daily:quiz -- --category Trendy
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error('❌ CRON_SECRET missing in .env.local');
  process.exit(1);
}

const categoryArg = process.argv.find((a) => a.startsWith('--category='))?.split('=')[1];
const base = process.env.VITE_SITE_URL || `http://localhost:${process.env.TURSO_API_PORT || 8787}`;

const url = new URL('/api/cron/daily-quiz', base.replace(/\/$/, ''));
if (categoryArg) url.searchParams.set('category', categoryArg);

const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(categoryArg ? { category: categoryArg } : {}),
});

const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error('❌ Daily quiz failed:', data.error || res.status);
  process.exit(1);
}

console.log('✅ Daily quiz created:', data.quiz?.title);
console.log('   ID:', data.quiz?.id);
console.log('   Category:', data.category);
if (data.push) console.log('   Push:', data.push);
