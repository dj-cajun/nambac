import { getQuizById, listActiveQuizzes } from '../quizDb.js';
import { buildOgImageApiUrl } from '../composeOgImage.js';
import { CANONICAL_SITE_ORIGIN } from '../../../shared/siteOrigin.js';
import { isBot } from './og.js';
import { sendSpaHtml } from '../serveSpaHtml.js';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function quizSeoHtml({ title, description, image, url, related }) {
  const relatedLinks = (related || [])
    .map(
      (q) =>
        `<li><a href="${esc(`${CANONICAL_SITE_ORIGIN}/quiz/${q.id}`)}">${esc(q.title)}</a></li>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>${esc(title)} | nambac.xyz</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="nambac.xyz">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
</head>
<body>
<main>
  <h1>${esc(title)}</h1>
  <p>${esc(description)}</p>
  <p><a href="${esc(url)}">Làm quiz ngay trên nambac.xyz</a></p>
  ${
    relatedLinks
      ? `<nav aria-label="Quiz liên quan"><h2>Quiz khác</h2><ul>${relatedLinks}</ul></nav>`
      : ''
  }
  <nav>
    <a href="${esc(CANONICAL_SITE_ORIGIN)}/">Trang chủ</a> ·
    <a href="${esc(CANONICAL_SITE_ORIGIN)}/explore">Khám phá</a> ·
    <a href="${esc(CANONICAL_SITE_ORIGIN)}/blog">Blog</a>
  </nav>
</main>
</body>
</html>`;
}

/**
 * /quiz/:id — bots get crawlable HTML; humans get the SPA shell.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ua = req.headers['user-agent'] || '';
  const quizId = req.query?.id || null;

  if (!quizId) {
    return res.redirect(302, `${CANONICAL_SITE_ORIGIN}/explore`);
  }

  if (!isBot(ua)) {
    return sendSpaHtml(res);
  }

  try {
    const quiz = await getQuizById(quizId);
    if (!quiz || quiz.is_active === false) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(
        `<!DOCTYPE html><html lang="vi"><head><title>Không tìm thấy</title></head><body><h1>Quiz không tồn tại</h1><a href="${CANONICAL_SITE_ORIGIN}/explore">Khám phá</a></body></html>`,
      );
    }

    const host = (req.headers.host || 'www.nambac.xyz').replace(/:\d+$/, '');
    const playUrl = `${CANONICAL_SITE_ORIGIN}/quiz/${quizId}`;
    const description =
      stripHtml(quiz.description) || 'Trắc nghiệm tính cách AI — Bạn là kiểu người nào?';

    let related = [];
    try {
      const all = await listActiveQuizzes();
      related = all.filter((q) => q.id && q.id !== quizId).slice(0, 8);
    } catch {
      related = [];
    }

    const html = quizSeoHtml({
      title: quiz.title,
      description,
      image: buildOgImageApiUrl(host, quizId),
      url: playUrl,
      related,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (err) {
    console.error('GET /quiz/:id SEO', err);
    return sendSpaHtml(res);
  }
}
