import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Known bot/crawler User-Agents
const BOT_AGENTS = [
  'facebookexternalhit', 'Facebot',
  'ZaloShareBot', 'zalo',
  'Twitterbot',
  'LinkedInBot',
  'Googlebot',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'Viber',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

function getImageUrl(path) {
  if (!path) return 'https://nambac.xyz/og-default.png';
  if (path.startsWith('http')) return path;
  const filename = path.split('/').pop();
  return `${SUPABASE_URL}/storage/v1/object/public/quiz-images/${filename}`;
}

function buildOgHtml({ title, description, image, url, redirectUrl }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="nambac.xyz">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Redirect for humans (fallback) -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url;
  const referer = req.headers['referer'] || '';

  // Parse the path: /share/:quizId/:score or /quiz/:quizId
  // Check both the actual URL and the referer (middleware rewrites to /api/og)
  let quizId = null;
  let scoreCode = null;
  let isShareRoute = false;

  const pathsToCheck = [url, referer];
  for (const path of pathsToCheck) {
    const shareMatch = path.match(/\/share\/([^/]+)\/(\d+)/);
    const quizMatch = path.match(/\/quiz\/([^/?]+)/);

    if (shareMatch) {
      quizId = shareMatch[1];
      scoreCode = parseInt(shareMatch[2]);
      isShareRoute = true;
      break;
    } else if (quizMatch) {
      quizId = quizMatch[1];
      break;
    }
  }

  if (!quizId) {
    return res.redirect(302, 'https://nambac.xyz/');
  }

  // If not a bot, redirect immediately
  if (!isBot(userAgent)) {
    const redirectTo = `/quiz/${quizId}`;
    return res.redirect(302, redirectTo);
  }

  // Bot detected — fetch data and return OG HTML
  try {
    if (isShareRoute && scoreCode !== null) {
      // ===== RESULT SHARE =====
      const { data: result } = await supabase
        .from('results')
        .select('*, quizzes(title)')
        .eq('quiz_id', quizId)
        .eq('result_code', scoreCode)
        .single();

      if (result) {
        const hashtags = result.traits ? result.traits.map(t => `#${t}`).join(' ') : '';
        const html = buildOgHtml({
          title: `Kết quả của tôi: [${result.title}]! Bạn thử đi 🔥`,
          description: `${result.description || ''} ${hashtags}`.trim(),
          image: getImageUrl(result.image_url),
          url: `https://nambac.xyz/share/${quizId}/${scoreCode}`,
          redirectUrl: `https://nambac.xyz/quiz/${quizId}`,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return res.status(200).send(html);
      }
    }

    // ===== QUIZ START SHARE (or fallback) =====
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quiz) {
      const html = buildOgHtml({
        title: `${quiz.title} | nambac.xyz`,
        description: quiz.description || 'Trắc nghiệm tính cách AI — Bạn là kiểu người nào?',
        image: getImageUrl(quiz.image_url),
        url: `https://nambac.xyz/quiz/${quizId}`,
        redirectUrl: `https://nambac.xyz/quiz/${quizId}`,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).send(html);
    }

    // Fallback — quiz not found
    return res.redirect(302, `https://nambac.xyz/quiz/${quizId || ''}`);
  } catch (error) {
    console.error('OG handler error:', error);
    return res.redirect(302, `https://nambac.xyz/`);
  }
}
