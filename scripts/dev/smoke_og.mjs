#!/usr/bin/env node
/** Local OG smoke test — npm run smoke:og (dev server must be running) */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const port = process.env.VITE_DEV_PORT || 5173;
const base = `http://localhost:${port}`;
const botUa = 'facebookexternalhit/1.1';

let failed = 0;

function pass(msg) {
  console.log('✅', msg);
}

function fail(msg, detail = '') {
  console.log('❌', msg, detail ? `— ${detail}` : '');
  failed += 1;
}

async function main() {
  let quizId;
  try {
    const res = await fetch(`${base}/api/quizzes`);
    if (!res.ok) throw new Error(`quizzes ${res.status}`);
    const data = await res.json();
    quizId = data.quizzes?.[0]?.id;
    if (!quizId) throw new Error('no quizzes');
    pass(`quiz list (${data.quizzes.length} quizzes)`);
  } catch (e) {
    fail('GET /api/quizzes', e.message);
    process.exit(1);
  }

  try {
    const html = await fetch(`${base}/share/${quizId}`, { headers: { 'User-Agent': botUa } }).then((r) => r.text());
    if (!html.includes('og:image') || !html.includes('og:title')) {
      fail('OG HTML (quiz intro)', 'missing og meta tags');
    } else {
      pass('OG HTML (quiz intro)');
    }
  } catch (e) {
    fail('OG HTML (quiz intro)', e.message);
  }

  let score = 0;
  try {
    const bundle = await fetch(`${base}/api/quizzes/${quizId}`).then((r) => r.json());
    score = bundle.results?.[0]?.result_code ?? 0;
    const html = await fetch(`${base}/share/${quizId}/${score}`, { headers: { 'User-Agent': botUa } }).then((r) => r.text());
    if (!html.includes('og:image') || !html.includes(`score=${score}`)) {
      fail('OG HTML (result share)', 'missing result og meta');
    } else {
      pass(`OG HTML (result share, score=${score})`);
    }
  } catch (e) {
    fail('OG HTML (result share)', e.message);
  }

  for (const [label, url] of [
    ['OG image (intro)', `${base}/api/og-image?quizId=${quizId}`],
    ['OG image (result)', `${base}/api/og-image?quizId=${quizId}&score=${score}`],
  ]) {
    try {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!res.ok || buf.length < 1000) {
        fail(label, `${res.status}, ${buf.length} bytes`);
      } else {
        pass(`${label} (${Math.round(buf.length / 1024)}KB)`);
      }
    } catch (e) {
      fail(label, e.message);
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
