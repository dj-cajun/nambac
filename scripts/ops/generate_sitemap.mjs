#!/usr/bin/env node
/**
 * Writes public/sitemap.xml for crawlers (GET/HEAD) and as build fallback.
 * Dynamic API route stays in sync; regenerate on quiz changes or via prebuild.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PROJECT_ROOT } from '../_root.mjs';
import { listActiveQuizzes } from '../../api/_lib/quizDb.js';
import { QUIZ_CATEGORY_IDS } from '../../shared/categories.js';
import { CANONICAL_SITE_ORIGIN } from '../../shared/siteOrigin.js';
import { HEROES } from '../../shared/lienquan/heroes.js';
import { BLOG_POSTS } from '../../src/content/blogPosts.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  ...BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.85',
  })),
  { path: '/explore', changefreq: 'daily', priority: '0.9' },
  { path: '/leaderboard', changefreq: 'weekly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/faq', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy-policy', changefreq: 'monthly', priority: '0.7' },
  { path: '/cookie-policy', changefreq: 'monthly', priority: '0.7' },
  { path: '/terms-of-service', changefreq: 'monthly', priority: '0.7' },
  { path: '/editorial-policy', changefreq: 'monthly', priority: '0.6' },
  { path: '/brands', changefreq: 'monthly', priority: '0.6' },
  { path: '/fortune', changefreq: 'daily', priority: '0.85' },
  { path: '/fortune/tomorrow', changefreq: 'daily', priority: '0.8' },
  { path: '/balance', changefreq: 'weekly', priority: '0.85' },
  { path: '/roast-card', changefreq: 'weekly', priority: '0.8' },
  { path: '/brain', changefreq: 'weekly', priority: '0.8' },
  { path: '/lienquan', changefreq: 'daily', priority: '0.9' },
  { path: '/lienquan/giao-an', changefreq: 'weekly', priority: '0.85' },
  { path: '/lienquan/khoe', changefreq: 'daily', priority: '0.8' },
  { path: '/lienquan/quiz', changefreq: 'weekly', priority: '0.85' },
  { path: '/lienquan/tu-dien', changefreq: 'monthly', priority: '0.75' },
  { path: '/vbti', changefreq: 'weekly', priority: '0.9' },
  { path: '/vbti/test', changefreq: 'weekly', priority: '0.85' },
  { path: '/vbti/types', changefreq: 'weekly', priority: '0.85' },
  { path: '/vbti/mbti', changefreq: 'monthly', priority: '0.75' },
  { path: '/vbti/x-mbti', changefreq: 'monthly', priority: '0.75' },
  { path: '/vbti/x-cung', changefreq: 'monthly', priority: '0.75' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, changefreq, priority) {
  return `  <url><loc>${escapeXml(loc)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

async function main() {
  const origin = CANONICAL_SITE_ORIGIN;
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const item of STATIC_PATHS) {
    lines.push(urlEntry(`${origin}${item.path}`, item.changefreq, item.priority));
  }

  for (const hero of HEROES.filter((h) => h.meta)) {
    lines.push(urlEntry(`${origin}/lienquan/tuong/${hero.id}`, 'weekly', '0.8'));
  }

  for (const categoryId of QUIZ_CATEGORY_IDS) {
    lines.push(urlEntry(`${origin}/category/${categoryId}`, 'weekly', '0.75'));
  }

  const quizzes = await listActiveQuizzes();
  for (const quiz of quizzes) {
    if (!quiz?.id) continue;
    lines.push(urlEntry(`${origin}/quiz/${quiz.id}`, 'weekly', '0.8'));
  }

  lines.push('</urlset>', '');
  const xml = lines.join('\n');

  const outPath = path.join(PROJECT_ROOT, 'public/sitemap.xml');
  fs.writeFileSync(outPath, xml);

  const allDir = path.join(PROJECT_ROOT, 'public/sitemaps');
  fs.mkdirSync(allDir, { recursive: true });
  const allPath = path.join(allDir, 'all.xml');
  fs.writeFileSync(allPath, xml);

  console.log(`✅ wrote ${outPath} (${quizzes.length} quizzes, ${HEROES.length} heroes)`);
  console.log(`✅ wrote ${allPath}`);
}

main().catch((err) => {
  console.error('❌ sitemap generation failed:', err.message);
  process.exit(1);
});
