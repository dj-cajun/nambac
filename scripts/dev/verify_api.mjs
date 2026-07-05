#!/usr/bin/env node
/** Local API smoke test — npm run verify:api */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const port = process.env.VITE_DEV_PORT || 5173;
const base = (process.env.TEST_API_URL || `http://localhost:${port}/api`).replace(/\/$/, '');

const checks = [
  { name: 'GET /api/quizzes', url: `${base}/quizzes` },
  { name: 'GET /api/push/subscribe', url: `${base}/push/subscribe` },
];

let failed = 0;
for (const c of checks) {
  try {
    const res = await fetch(c.url);
    const ok = res.ok;
    console.log(ok ? '✅' : '❌', c.name, res.status);
    if (!ok) failed += 1;
  } catch (e) {
    console.log('❌', c.name, e.message);
    failed += 1;
  }
}

process.exit(failed ? 1 : 0);
