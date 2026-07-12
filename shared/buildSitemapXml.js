/**
 * Shared urlset builder for /api/sitemap and scripts/ops/generate_sitemap.mjs
 */
import { QUIZ_CATEGORY_IDS, normalizeCategory } from './categories.js';
import { CANONICAL_SITE_ORIGIN } from './siteOrigin.js';
import { HEROES } from './lienquan/heroes.js';
import { BLOG_POSTS } from '../src/content/blogPosts.js';

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0', lastmodKey: 'newestQuiz' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9', lastmodKey: 'newestBlog' },
  ...BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.85',
    lastmod: p.date,
  })),
  { path: '/explore', changefreq: 'daily', priority: '0.9', lastmodKey: 'newestQuiz' },
  { path: '/leaderboard', changefreq: 'weekly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/faq', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/privacy-policy', changefreq: 'monthly', priority: '0.7' },
  { path: '/cookie-policy', changefreq: 'monthly', priority: '0.7' },
  { path: '/terms-of-service', changefreq: 'monthly', priority: '0.7' },
  { path: '/editorial-policy', changefreq: 'monthly', priority: '0.6' },
  { path: '/brands', changefreq: 'monthly', priority: '0.6' },
  { path: '/fortune', changefreq: 'daily', priority: '0.85', lastmodKey: 'today' },
  { path: '/fortune/tomorrow', changefreq: 'daily', priority: '0.8', lastmodKey: 'today' },
  { path: '/balance', changefreq: 'weekly', priority: '0.85' },
  { path: '/roast-card', changefreq: 'weekly', priority: '0.8' },
  { path: '/brain', changefreq: 'weekly', priority: '0.8' },
  { path: '/lienquan', changefreq: 'daily', priority: '0.9' },
  { path: '/lienquan/giao-an', changefreq: 'weekly', priority: '0.85' },
  { path: '/lienquan/khoe', changefreq: 'daily', priority: '0.8', lastmodKey: 'today' },
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

/** W3C Datetime (date-only) for sitemap lastmod — omit if unknown. */
export function formatSitemapLastmod(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // SQLite datetime: "YYYY-MM-DD HH:MM:SS" or ISO
  const normalized = raw.includes('T')
    ? raw
    : raw.replace(' ', 'T');
  const withZone = /Z$|[+-]\d{2}:\d{2}$/.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const d = new Date(withZone);
  if (Number.isNaN(d.getTime())) {
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }
  return d.toISOString().slice(0, 10);
}

function todayIctDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function maxLastmod(dates) {
  let best = null;
  for (const value of dates) {
    const formatted = formatSitemapLastmod(value);
    if (!formatted) continue;
    if (!best || formatted > best) best = formatted;
  }
  return best;
}

export function urlEntry(loc, changefreq, priority, lastmod) {
  const parts = [`<loc>${escapeXml(loc)}</loc>`];
  const lm = formatSitemapLastmod(lastmod);
  if (lm) parts.push(`<lastmod>${lm}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`<priority>${priority}</priority>`);
  return `  <url>${parts.join('')}</url>`;
}

/**
 * @param {Array<{ id?: string, created_at?: string, category?: string }>} quizzes
 * @returns {{ xml: string, quizCount: number, heroCount: number }}
 */
export function buildSitemapXml(quizzes = []) {
  const origin = CANONICAL_SITE_ORIGIN;
  const newestQuiz = maxLastmod(quizzes.map((q) => q.created_at));
  const newestBlog = maxLastmod(BLOG_POSTS.map((p) => p.date));
  const today = todayIctDate();
  const resolveKey = {
    newestQuiz,
    newestBlog,
    today,
  };

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const item of STATIC_PATHS) {
    const lastmod = item.lastmod
      ?? (item.lastmodKey ? resolveKey[item.lastmodKey] : null);
    lines.push(urlEntry(`${origin}${item.path}`, item.changefreq, item.priority, lastmod));
  }

  const metaHeroes = HEROES.filter((h) => h.meta);
  for (const hero of metaHeroes) {
    lines.push(urlEntry(`${origin}/lienquan/tuong/${hero.id}`, 'weekly', '0.8'));
  }

  for (const categoryId of QUIZ_CATEGORY_IDS) {
    const catLastmod = maxLastmod(
      quizzes
        .filter((q) => normalizeCategory(q.category) === categoryId)
        .map((q) => q.created_at),
    );
    lines.push(urlEntry(`${origin}/category/${categoryId}`, 'weekly', '0.75', catLastmod));
  }

  for (const quiz of quizzes) {
    if (!quiz?.id) continue;
    lines.push(urlEntry(`${origin}/quiz/${quiz.id}`, 'weekly', '0.8', quiz.created_at));
  }

  lines.push('</urlset>');
  return {
    xml: `${lines.join('\n')}\n`,
    quizCount: quizzes.filter((q) => q?.id).length,
    heroCount: metaHeroes.length,
  };
}
