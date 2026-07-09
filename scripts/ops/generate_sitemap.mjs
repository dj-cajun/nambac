#!/usr/bin/env node
/** Generate public/sitemap.xml (static pages + categories + active quizzes). */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PROJECT_ROOT } from '../_root.mjs';
import { listActiveQuizzes } from '../../api/_lib/quizDb.js';
import { QUIZ_CATEGORY_IDS } from '../../shared/categories.js';
import { CANONICAL_SITE_ORIGIN } from '../../shared/siteOrigin.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog/xu-huong-di-dong-gen-z-sai-gon', changefreq: 'monthly', priority: '0.85' },
  { path: '/blog/lich-su-quiz-truc-tuyen-viet-nam', changefreq: 'monthly', priority: '0.85' },
  { path: '/blog/ung-dung-ai-sang-tao-noi-dung-giai-tri', changefreq: 'monthly', priority: '0.85' },
  { path: '/blog/van-hoa-meme-va-ap-luc-cot-song-gen-z', changefreq: 'monthly', priority: '0.85' },
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
  for (const categoryId of QUIZ_CATEGORY_IDS) {
    lines.push(urlEntry(`${origin}/category/${categoryId}`, 'weekly', '0.75'));
  }

  const quizzes = await listActiveQuizzes();
  for (const quiz of quizzes) {
    if (!quiz?.id) continue;
    lines.push(urlEntry(`${origin}/quiz/${quiz.id}`, 'weekly', '0.8'));
  }

  lines.push('</urlset>', '');
  const outPath = path.join(PROJECT_ROOT, 'public/sitemap.xml');
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`✅ wrote ${outPath} (${quizzes.length} quizzes)`);
}

main().catch((err) => {
  console.error('❌ sitemap generation failed:', err.message);
  process.exit(1);
});
