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
      const cdn = res.headers.get('cdn-cache-control') || res.headers.get('vercel-cdn-cache-control') || '';
      if (process.env.REQUIRE_QUIZ_CACHE === '1') {
        const ok = cache.includes('s-maxage') || cdn.includes('s-maxage');
        if (!ok) throw new Error(`missing cache-control: ${cache || cdn || '(empty)'}`);
      }
      return `quizzes=${quizzes.length} cache=${(cdn || cache).slice(0, 48)}`;
    },
  },
  {
    name: 'GET /api/push/subscribe',
    url: `${base}/push/subscribe`,
    assert: async (res) => {
      const data = await res.json().catch(() => ({}));
      if (process.env.REQUIRE_VAPID === '1' && !data.publicKey) {
        throw new Error('missing VAPID publicKey (set VAPID_* on host env)');
      }
      return data.publicKey ? 'vapid=set' : 'vapid=missing';
    },
  },
  { name: 'GET /api/balance', url: `${base}/balance` },
  { name: 'GET /api/fortune/stats', url: `${base}/fortune/stats` },
  { name: 'GET /api/feature/stats?kind=roast', url: `${base}/feature/stats?kind=roast` },
  { name: 'GET /api/player/grade', url: `${base}/player/grade?visitorId=smoke-guest` },
  {
    name: 'GET /api/auth/me',
    url: `${base}/auth/me`,
    assert: async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!('user' in data)) throw new Error('expected { user }');
      return 'session=ok';
    },
  },
  {
    name: 'GET /api/auth/google',
    url: `${base}/auth/google?returnTo=%2F`,
    redirect: 'manual',
    assert: async (res) => {
      if (res.status !== 302 && res.status !== 503) {
        throw new Error(`expected 302 or 503, got ${res.status}`);
      }
      const loc = res.headers.get('location') || '';
      if (res.status === 302 && !loc.includes('accounts.google.com')) {
        throw new Error(`unexpected redirect: ${loc.slice(0, 80)}`);
      }
      if (res.status === 302) {
        const uri = new URL(loc).searchParams.get('redirect_uri') || '';
        if (!uri.includes('nambac.xyz/api/auth/google/callback')) {
          throw new Error(`unexpected redirect_uri: ${uri}`);
        }
      }
      return res.status === 302 ? 'oauth=configured' : 'oauth=not_configured';
    },
  },
  {
    name: 'GET /sitemap.xml',
    url: `${siteBase}/sitemap.xml`,
    assert: async (res) => {
      const text = await res.text();
      // Production serves a sitemap index; /api/sitemap still returns a full urlset.
      if (text.includes('<sitemapindex')) {
        if (!text.includes('/sitemaps/all.xml')) throw new Error('sitemap index missing all.xml');
        return `index bytes=${text.length}`;
      }
      if (!text.includes('<urlset')) throw new Error('invalid sitemap');
      if (!text.includes('/quiz/')) {
        if (!text.includes('nambac.xyz')) throw new Error('sitemap missing quiz urls');
        throw new Error('sitemap missing quiz urls');
      }
      if (!text.includes('<lastmod>')) throw new Error('sitemap missing lastmod');
      return `bytes=${text.length}`;
    },
  },
  {
    name: 'GET /sitemaps/all.xml',
    url: `${siteBase}/sitemaps/all.xml`,
    assert: async (res) => {
      const text = await res.text();
      if (!text.includes('<urlset')) throw new Error('invalid all.xml');
      if (!text.includes('/quiz/')) throw new Error('all.xml missing quiz urls');
      if (!text.includes('<lastmod>')) throw new Error('all.xml missing lastmod');
      return `bytes=${text.length}`;
    },
  },
  {
    name: 'GET /quiz/:id (Googlebot SEO)',
    url: `${base}/quiz-seo?id=67fc1b12-2a95-4d6b-a7ab-f224b45c4b7d`,
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    assert: async (res) => {
      const text = await res.text();
      if (!text.includes('rel="canonical"') && !text.includes("rel='canonical'")) {
        // 404 page for missing quiz is still ok if HTML
        if (!text.includes('Quiz không tồn tại') && !text.includes('<title>')) {
          throw new Error('quiz-seo missing canonical/title');
        }
      }
      return `bytes=${text.length}`;
    },
  },
];

let failed = 0;
for (const c of checks) {
  try {
    const res = await fetch(c.url, {
      redirect: c.redirect || 'follow',
      headers: c.headers || undefined,
    });
    const ok = c.redirect === 'manual'
      ? (res.status === 302 || res.status === 503 || res.ok)
      : res.ok;
    if (!ok) throw new Error(`HTTP ${res.status}`);
    const detail = c.assert ? await c.assert(res) : '';
    console.log('✅', c.name, res.status, detail || '');
  } catch (e) {
    console.log('❌', c.name, e.message);
    failed += 1;
  }
}

process.exit(failed ? 1 : 0);
