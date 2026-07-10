import { listActiveQuizzes } from '../quizDb.js';
import { QUIZ_CATEGORY_IDS } from '../../../shared/categories.js';
import { CANONICAL_SITE_ORIGIN } from '../../../shared/siteOrigin.js';
import { HEROES } from '../../../shared/lienquan/heroes.js';

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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    lines.push('</urlset>');
    const xml = `${lines.join('\n')}\n`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('GET /api/sitemap', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
