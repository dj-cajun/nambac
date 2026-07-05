import { getQuizById, getResultsByQuizId } from './_lib/quizDb.js';

const BOT_AGENTS = [
  'facebookexternalhit', 'facebot',
  'zalosharebot', 'zalo',
  'twitterbot', 'linkedinbot',
  'googlebot', 'slackbot',
  'discordbot', 'whatsapp',
  'telegrambot', 'viber',
];

function isBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(bot => lower.includes(bot));
}

function getOgImageUrl(path, host) {
  if (!path) return `${host.includes('localhost') ? 'http' : 'https'}://${host}/og-default.png`;
  if (path.startsWith('http')) return path;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const filename = path.split('/').pop();
  return `${protocol}://${host}/images/${filename}`;
}

function ogHtml({ title, description, image, url, redirectUrl }) {
  // Escape HTML special chars
  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
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
<meta http-equiv="refresh" content="0;url=${esc(redirectUrl)}">
</head>
<body><p>Redirecting...</p></body>
</html>`;
}

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const url = req.url || '';

    // Parse path using Vercel injected query params first, or fallback to regex
    let quizId = req.query?.id || null;
    let scoreCode = req.query?.score ? parseInt(req.query.score) : null;

    if (!quizId) {
      const shareMatch = url.match(/\/share\/([^/]+)\/(\d+)/);
      const shareQuizMatch = url.match(/\/share\/([^/?]+)/); // removed $ to allow query params

      if (shareMatch) {
        quizId = shareMatch[1];
        scoreCode = parseInt(shareMatch[2]);
      } else if (shareQuizMatch) {
        quizId = shareQuizMatch[1];
      }
    }

    if (!quizId) {
      const host = req.headers.host || 'nambac.vercel.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return res.redirect(302, `${protocol}://${host}/`);
    }

    // Detect host to keep protocol/domain consistent (important for og:url)
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    // Non-bot → redirect to share-view page so they can see their friend's result!
    if (!isBot(ua)) {
      const redirectPath = scoreCode !== null 
        ? `/share-view/${quizId}/${scoreCode}`
        : `/share-view/${quizId}`;
      return res.redirect(302, `${currentBase}${redirectPath}`);
    }

    // Bot → serve OG HTML
    // Try result share first
    if (scoreCode !== null) {
      const results = await getResultsByQuizId(quizId);
      const r = results.find((row) => parseInt(row.result_code) === scoreCode);

      if (r) {
        const fullShareUrl = `${currentBase}/share/${quizId}/${scoreCode}`;
        const html = ogHtml({
          title: `Kết quả: ${r.title} — Bạn thử đi! 🔥`,
          description: r.description || 'Trắc nghiệm tính cách AI',
          image: getOgImageUrl(r.image_url, host),
          url: fullShareUrl,
          redirectUrl: `${currentBase}/quiz/${quizId}`,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
      }
    }

    // Quiz share (or result not found fallback)
    const q = await getQuizById(quizId);

    if (q) {
      const fullShareUrl = `${currentBase}/share/${quizId}`;
      const html = ogHtml({
        title: `${q.title} | nambac.xyz`,
        description: q.description || 'Trắc nghiệm tính cách AI — Bạn là kiểu người nào?',
        image: getOgImageUrl(q.image_url, host),
        url: fullShareUrl,
        redirectUrl: `${currentBase}/quiz/${quizId}`,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).send(html);
    }

    const fallbackHost = req.headers.host || 'nambac.vercel.app';
    const fallbackProtocol = fallbackHost.includes('localhost') ? 'http' : 'https';
    const fallbackBase = `${fallbackProtocol}://${fallbackHost}`;

    // Fallback
    return res.redirect(302, `${fallbackBase}/`);
  } catch (err) {
    console.error('OG Error:', err);
    const errHost = req.headers.host || 'nambac.vercel.app';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/`);
  }
}
