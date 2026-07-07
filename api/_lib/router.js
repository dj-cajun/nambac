import quizzes from './handlers/quizzes.js';
import quizById from './handlers/quizById.js';
import quizStats from './handlers/quizStats.js';
import brandInquiries from './handlers/brandInquiries.js';
import generateImage from './handlers/generateImage.js';
import generateQuizImages from './handlers/generateQuizImages.js';
import adminGenerateArchetypeQuiz from './handlers/adminGenerateArchetypeQuiz.js';
import adminGenerateQuizContent from './handlers/adminGenerateQuizContent.js';
import adminQuizzes from './handlers/adminQuizzes.js';
import adminQuizById from './handlers/adminQuizById.js';
import adminBrandInquiries from './handlers/adminBrandInquiries.js';
import adminUpload from './handlers/adminUpload.js';
import adminAnalytics from './handlers/adminAnalytics.js';
import n8nQuiz from './handlers/n8nQuiz.js';
import pushSubscribe from './handlers/pushSubscribe.js';
import pushNotify from './handlers/pushNotify.js';
import brandStats from './handlers/brandStats.js';
import dailyQuiz from './handlers/dailyQuiz.js';
import og from './handlers/og.js';
import ogImage from './handlers/ogImage.js';
import balance from './handlers/balance.js';
import balanceImage from './handlers/balanceImage.js';
import balanceOg from './handlers/balanceOg.js';
import balanceShare from './handlers/balanceShare.js';
import roastOg from './handlers/roastOg.js';
import roastShare from './handlers/roastShare.js';
import roastImage from './handlers/roastImage.js';
import featureStats from './handlers/featureStats.js';
import fortuneImage from './handlers/fortuneImage.js';
import fortuneOg from './handlers/fortuneOg.js';
import fortuneShare from './handlers/fortuneShare.js';
import fortuneStats from './handlers/fortuneStats.js';

function stripPathQuery(query) {
  const q = { ...query };
  delete q.path;
  return q;
}

function withId(req, id, extra = {}) {
  return { ...req, query: { ...stripPathQuery(req.query), id, ...extra } };
}

/**
 * Route API requests from a single Vercel Serverless Function.
 * @param {object} req - Vercel request
 * @param {object} res - Vercel response
 * @param {string[]} segments - path after /api/
 */
export async function dispatch(req, res, segments = []) {
  const method = req.method;
  const [a, b, c, d] = segments;

  // ── Public quizzes ──
  if (a === 'quizzes' && !b && method === 'GET') return quizzes(req, res);
  if (a === 'quizzes' && b && c === 'stats' && method === 'POST') return quizStats(withId(req, b), res);
  if (a === 'quizzes' && b && !c && method === 'GET') return quizById(withId(req, b), res);

  // ── B2B inquiries ──
  if (a === 'brand-inquiries' && !b && method === 'POST') return brandInquiries(req, res);

  // ── Image generation ──
  if (a === 'generate-image' && !b && method === 'POST') return generateImage(req, res);
  if (a === 'admin' && b === 'generate-quiz-images' && !c && (method === 'POST' || method === 'OPTIONS')) {
    return generateQuizImages(req, res);
  }
  if (a === 'admin' && b === 'generate-archetype-quiz' && !c && (method === 'POST' || method === 'OPTIONS')) {
    return adminGenerateArchetypeQuiz(req, res);
  }
  if (a === 'admin' && b === 'generate-quiz-content' && !c && (method === 'POST' || method === 'OPTIONS')) {
    return adminGenerateQuizContent(req, res);
  }

  // ── Admin quizzes ──
  if (a === 'admin' && b === 'quizzes' && !c && (method === 'GET' || method === 'POST')) return adminQuizzes(req, res);
  if (a === 'admin' && b === 'quizzes' && c && !d && ['GET', 'PATCH', 'DELETE'].includes(method)) {
    return adminQuizById(withId(req, c), res);
  }

  // ── Admin brand inquiries ──
  if (a === 'admin' && b === 'brand-inquiries' && !c && ['GET', 'PATCH', 'DELETE'].includes(method)) {
    return adminBrandInquiries(req, res);
  }

  // ── Admin upload / analytics ──
  if (a === 'admin' && b === 'upload' && !c && method === 'POST') return adminUpload(req, res);
  if (a === 'admin' && b === 'analytics' && !c && method === 'GET') return adminAnalytics(req, res);

  // ── Webhooks / push / brand stats / cron ──
  if (a === 'webhooks' && b === 'n8n-quiz' && method === 'POST') return n8nQuiz(req, res);
  if (a === 'push' && b === 'subscribe' && (method === 'GET' || method === 'POST')) return pushSubscribe(req, res);
  if (a === 'push' && b === 'notify' && method === 'POST') return pushNotify(req, res);
  if (a === 'brand' && b === 'stats' && method === 'GET') return brandStats(req, res);
  if (a === 'cron' && b === 'daily-quiz' && (method === 'GET' || method === 'POST')) return dailyQuiz(req, res);

  // ── OG scraper (also reached via /share/* rewrites) ──
  if (a === 'og' && !b) return og(req, res);
  if (a === 'og-image' && !b && method === 'GET') return ogImage(req, res);

  // ── Balance game (A vs B votes) ──
  if (a === 'balance' && !b && (method === 'GET' || method === 'POST' || method === 'OPTIONS')) {
    return balance(req, res);
  }

  // ── Balance dilemma AI scene image ──
  if (a === 'balance-image' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return balanceImage(req, res);
  }

  // ── Balance share OG card ──
  if (a === 'balance-og' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return balanceOg(req, res);
  }

  // ── Balance crawler share page (bot → OG html, human → /balance) ──
  if (a === 'balance-share' && !b) return balanceShare(req, res);

  // ── Roast blacklist OG card + crawler share page ──
  if (a === 'roast-og' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return roastOg(req, res);
  }
  if (a === 'roast-image' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return roastImage(req, res);
  }
  if (a === 'roast-share' && !b) return roastShare(req, res);

  // ── Mini-app engagement stats (balance / roast) ──
  if (a === 'feature' && b === 'stats' && (method === 'GET' || method === 'POST' || method === 'OPTIONS')) {
    return featureStats(req, res);
  }

  // ── Daily fortune AI scene ──
  if (a === 'fortune' && b === 'stats' && (method === 'GET' || method === 'POST' || method === 'OPTIONS')) {
    return fortuneStats(req, res);
  }

  if (a === 'fortune-image' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return fortuneImage(req, res);
  }

  if (a === 'fortune-og' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return fortuneOg(req, res);
  }

  if (a === 'fortune-share' && !b) return fortuneShare(req, res);

  return res.status(404).json({ error: 'Not found', path: segments.join('/') });
}

export default dispatch;
