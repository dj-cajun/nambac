#!/usr/bin/env node
/** Local API smoke test — npm run verify:api */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const base = `http://localhost:${process.env.TURSO_API_PORT || 8787}`;

const checks = [
  { name: 'GET /api/quizzes', url: `${base}/api/quizzes` },
  { name: 'GET /api/push/subscribe', url: `${base}/api/push/subscribe` },
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
