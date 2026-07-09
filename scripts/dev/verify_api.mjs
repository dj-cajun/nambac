#!/usr/bin/env node
/** API smoke test — local or production via TEST_API_URL */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const port = process.env.VITE_DEV_PORT || 5173;
const base = (process.env.TEST_API_URL || `http://localhost:${port}/api`).replace(/\/$/, '');
const siteBase = base.replace(/\/api$/, '');

const checks = [
  {
    name: 'GET /api/quizzes',
    url: `${base}/quizzes`,
    assert: async (res) => {
      const data = await res.json();
      const quizzes = data.quizzes || [];
      if (!Array.isArray(quizzes) || quizzes.length < 1) throw new Error('expected quizzes[]');
      if (quizzes[0].config != null && typeof quizzes[0].config === 'object' && Object.keys(quizzes[0].config || {}).length > 20) {
        // list endpoint should omit heavy config; null/undefined is fine
      }
      const cache = res.headers.get('cache-control') || '';
      if (process.env.REQUIRE_QUIZ_CACHE === '1' && !cache.includes('s-maxage')) {
        throw new Error(`missing cache-control: ${cache}`);
      }
      return `quizzes=${quizzes.length}`;
    },
  },
  { name: 'GET /api/push/subscribe', url: `${base}/push/subscribe` },
  { name: 'GET /api/balance', url: `${base}/balance` },
  { name: 'GET /api/player/grade', url: `${base}/player/grade?visitorId=smoke-guest` },
  {
    name: 'GET /sitemap.xml',
    url: `${siteBase}/sitemap.xml`,
    assert: async (res) => {
      const text = await res.text();
      if (!text.includes('<urlset') || !text.includes('/quiz/')) {
        throw new Error('sitemap missing quiz urls');
      }
      return `bytes=${text.length}`;
    },
  },
];

let failed = 0;
for (const c of checks) {
  try {
    const res = await fetch(c.url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const detail = c.assert ? await c.assert(res) : '';
    console.log('✅', c.name, res.status, detail || '');
  } catch (e) {
    console.log('❌', c.name, e.message);
    failed += 1;
  }
}

process.exit(failed ? 1 : 0);
