import { getQuizById, getResultsByQuizId } from '../quizDb.js';
import { buildOgImageApiUrl, parseTraits } from '../composeOgImage.js';

const BOT_AGENTS = [
  'facebookexternalhit', 'facebot',
  'zalosharebot',
  'twitterbot', 'linkedinbot',
  'googlebot', 'bingbot', 'yandex',
  'slackbot',
  'discordbot', 'whatsapp',
  'telegrambot', 'viber',
  'kakaotalk', 'kakaostory',
  // OpenAI / ChatGPT / Claude / Perplexity — need crawlable HTML (SPA shell is empty)
  'gptbot', 'chatgpt-user', 'oai-searchbot',
  'claudebot', 'anthropic-ai',
  'perplexitybot', 'bytespider',
];

export function isBot(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(bot => lower.includes(bot));
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildResultDescription(result) {
  const traits = parseTraits(result.traits);
  const tags = traits.map((t) => `#${String(t).replace(/^#/, '')}`).join(' ');
  const body = stripHtml(result.description);
  return tags ? `${body}\n\n${tags}` : body;
}

export function ogHtml({ title, description, image, url, redirectUrl }) {
  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const refresh = redirectUrl
    ? `<meta http-equiv="refresh" content="0;url=${esc(redirectUrl)}">`
    : '';
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
<meta property="og:image:type" content="image/png">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="nambac.xyz">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
${refresh}
</head>
<body><p>Redirecting...</p></body>
</html>`;
}

export default async function handler(req, res) {
  try {
    const ua = req.headers['user-agent'] || '';
    const url = req.url || '';

    let quizId = req.query?.id || null;
    let scoreCode = req.query?.score ? parseInt(req.query.score) : null;

    if (!quizId) {
      const shareMatch = url.match(/\/share\/([^/]+)\/(\d+)/);
      const shareQuizMatch = url.match(/\/share\/([^/?]+)/);

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

    const host = req.headers.host || 'nambac.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentBase = `${protocol}://${host}`;

    if (!isBot(ua)) {
      const redirectPath = scoreCode !== null
        ? `/share-view/${quizId}/${scoreCode}`
        : `/share-view/${quizId}`;
      return res.redirect(302, `${currentBase}${redirectPath}`);
    }

    const quiz = await getQuizById(quizId);

    if (scoreCode !== null && !Number.isNaN(scoreCode)) {
      const results = await getResultsByQuizId(quizId);
      const r = results.find((row) => parseInt(row.result_code) === scoreCode);

      if (r && quiz) {
        const resultTitle = r.title || r.type_name || 'Kết quả';
        const fullShareUrl = `${currentBase}/share/${quizId}/${scoreCode}`;
        const html = ogHtml({
          title: `[${resultTitle}] — ${quiz.title}`,
          description: buildResultDescription(r),
          image: buildOgImageApiUrl(host, quizId, scoreCode),
          url: fullShareUrl,
          redirectUrl: `${currentBase}/quiz/${quizId}`,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
      }
    }

    if (quiz) {
      const fullShareUrl = `${currentBase}/share/${quizId}`;
      const html = ogHtml({
        title: `${quiz.title} | nambac.xyz`,
        description: stripHtml(quiz.description) || 'Trắc nghiệm tính cách AI — Bạn là kiểu người nào?',
        image: buildOgImageApiUrl(host, quizId),
        url: fullShareUrl,
        redirectUrl: `${currentBase}/quiz/${quizId}`,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).send(html);
    }

    const fallbackHost = req.headers.host || 'nambac.vercel.app';
    const fallbackProtocol = fallbackHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${fallbackProtocol}://${fallbackHost}/`);
  } catch (err) {
    console.error('OG Error:', err);
    const errHost = req.headers.host || 'nambac.vercel.app';
    const errProtocol = errHost.includes('localhost') ? 'http' : 'https';
    return res.redirect(302, `${errProtocol}://${errHost}/`);
  }
}
