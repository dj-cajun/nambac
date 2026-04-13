// Supabase REST API - no library dependency needed
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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

function getImageUrl(path) {
  if (!path) return 'https://nambac.xyz/og-default.png';
  if (path.startsWith('http')) return path;
  const filename = path.split('/').pop();
  return `${SUPABASE_URL}/storage/v1/object/public/quiz-images/${filename}`;
}

async function supabaseQuery(table, params) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
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
      return res.redirect(302, 'https://nambac.xyz/');
    }

    // Non-bot → redirect to quiz
    if (!isBot(ua)) {
      return res.redirect(302, `https://nambac.xyz/quiz/${quizId}`);
    }

    // Detect host to keep protocol/domain consistent (important for og:url)
    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    // Bot → serve OG HTML
    // Try result share first
    if (scoreCode !== null) {
      const results = await supabaseQuery('results',
        `quiz_id=eq.${quizId}&result_code=eq.${scoreCode}&select=title,description,image_url,traits`
      );

      if (results && results.length > 0) {
        const r = results[0];
        const fullShareUrl = `${currentBase}/share/${quizId}/${scoreCode}`;
        const html = ogHtml({
          title: `Kết quả: ${r.title} — Bạn thử đi! 🔥`,
          description: r.description || 'Trắc nghiệm tính cách AI',
          image: getImageUrl(r.image_url),
          url: fullShareUrl,
          redirectUrl: `${currentBase}/quiz/${quizId}`,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
      }
    }

    // Quiz share (or result not found fallback)
    const quizzes = await supabaseQuery('quizzes',
      `id=eq.${quizId}&select=title,description,image_url`
    );

    if (quizzes && quizzes.length > 0) {
      const q = quizzes[0];
      const fullShareUrl = `${currentBase}/share/${quizId}`;
      const html = ogHtml({
        title: `${q.title} | nambac.xyz`,
        description: q.description || 'Trắc nghiệm tính cách AI — Bạn là kiểu người nào?',
        image: getImageUrl(q.image_url),
        url: fullShareUrl,
        redirectUrl: `${currentBase}/quiz/${quizId}`,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).send(html);
    }

    // Fallback
    return res.redirect(302, `https://nambac.xyz/`);
  } catch (err) {
    console.error('OG Error:', err);
    return res.redirect(302, 'https://nambac.xyz/');
  }
}
