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
import quizSeo from './handlers/quizSeo.js';
import pageSeo from './handlers/pageSeo.js';
import ogImage from './handlers/ogImage.js';
import balance from './handlers/balance.js';
import balanceImage from './handlers/balanceImage.js';
import balanceOg from './handlers/balanceOg.js';
import balanceShare from './handlers/balanceShare.js';
import roastOg from './handlers/roastOg.js';
import roastShare from './handlers/roastShare.js';
import roastImage from './handlers/roastImage.js';
import brainImage from './handlers/brainImage.js';
import brainOg from './handlers/brainOg.js';
import brainShare from './handlers/brainShare.js';
import featureStats from './handlers/featureStats.js';
import fortuneImage from './handlers/fortuneImage.js';
import fortuneOg from './handlers/fortuneOg.js';
import fortuneShare from './handlers/fortuneShare.js';
import fortuneStats from './handlers/fortuneStats.js';
import lienquanOg from './handlers/lienquanOg.js';
import lienquanShare from './handlers/lienquanShare.js';
import vbtiOg from './handlers/vbtiOg.js';
import vbtiShare from './handlers/vbtiShare.js';
import { authGoogleStart, authGoogleCallback } from './handlers/authGoogle.js';
import authSession, { authLogout } from './handlers/authSession.js';
import authAdminLogin from './handlers/authAdminLogin.js';
import adminUsers from './handlers/adminUsers.js';
import siteVisit from './handlers/siteVisit.js';
import { playerGradeGet, playerGradeComplete } from './handlers/playerGrade.js';
import sitemap from './handlers/sitemap.js';
import lienquanMastery from './handlers/lienquan/mastery.js';
import lienquanBoast from './handlers/lienquan/boast.js';
import lienquanKhoeImage from './handlers/lienquan/khoeImage.js';
import lienquanQuizMeta from './handlers/lienquan/quizMeta.js';
import aiInterpretResult from './handlers/aiInterpretResult.js';
import aiInstantQuiz from './handlers/aiInstantQuiz.js';
import aiCompatibility from './handlers/aiCompatibility.js';
import aiCharacterMatch from './handlers/aiCharacterMatch.js';

function stripPathQuery(query) {
  const q = { ...query };
  delete q.path;
  return q;
}

function withId(req, id, extra = {}) {
  // Mutate query in place — spreading `req` drops non-enumerable `headers` on
  // Vercel/Node IncomingMessage, which breaks requireAdmin / session cookies.
  const prev = req.query && typeof req.query === 'object' ? req.query : {};
  req.query = { ...stripPathQuery(prev), id, ...extra };
  return req;
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

  // ── Site visit (daily unique visitors) ──
  if (a === 'visit' && !b && method === 'POST') return siteVisit(req, res);

  // ── Player grade (quiz completion tiers) ──
  if (a === 'player' && b === 'grade' && !c && method === 'GET') return playerGradeGet(req, res);
  if (a === 'player' && b === 'complete' && !c && method === 'POST') return playerGradeComplete(req, res);

  // ── Dynamic sitemap (static pages + categories + quizzes) ──
  if (a === 'sitemap' && !b && (method === 'GET' || method === 'HEAD')) return sitemap(req, res);

  // ── Google OAuth / session ──
  if (a === 'auth' && b === 'google' && c === 'callback' && method === 'GET') {
    return authGoogleCallback(req, res);
  }
  if (a === 'auth' && b === 'google' && !c && method === 'GET') return authGoogleStart(req, res);
  if (a === 'auth' && b === 'me' && !c && method === 'GET') return authSession(req, res);
  if (a === 'auth' && b === 'logout' && !c && method === 'POST') return authLogout(req, res);
  if (a === 'auth' && b === 'admin' && c === 'login' && method === 'POST') return authAdminLogin(req, res);

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
  if (a === 'admin' && b === 'quizzes' && !c && (method === 'GET' || method === 'POST' || method === 'OPTIONS')) {
    return adminQuizzes(req, res);
  }
  if (
    a === 'admin' &&
    b === 'quizzes' &&
    c &&
    !d &&
    ['GET', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)
  ) {
    return adminQuizById(withId(req, c), res);
  }

  // ── Admin brand inquiries ──
  if (a === 'admin' && b === 'brand-inquiries' && !c && ['GET', 'PATCH', 'DELETE'].includes(method)) {
    return adminBrandInquiries(req, res);
  }

  // ── Admin users ──
  if (a === 'admin' && b === 'users' && !c && ['GET', 'PATCH'].includes(method)) {
    return adminUsers(req, res);
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

  // ── Quiz SEO for crawlers (/quiz/:id rewrite) ──
  if (a === 'quiz-seo' && !b && (method === 'GET' || method === 'HEAD')) {
    return quizSeo(req, res);
  }

  // ── Static page SEO for crawlers (bot → crawlable HTML, human → SPA) ──
  if (a === 'page-seo' && !b && (method === 'GET' || method === 'HEAD')) {
    return pageSeo(req, res);
  }

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

  // ── Brain (What's in your head) scene image + OG card + crawler share page ──
  if (a === 'brain-image' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return brainImage(req, res);
  }
  if (a === 'brain-og' && !b && (method === 'GET' || method === 'OPTIONS')) {
    return brainOg(req, res);
  }
  if (a === 'brain-share' && !b) return brainShare(req, res);

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

  // ── Liên Quân / VBTI hub OG cards ──
  if (a === 'lienquan-og' && !b && (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')) {
    return lienquanOg(req, res);
  }
  if (a === 'vbti-og' && !b && (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')) {
    return vbtiOg(req, res);
  }
  if (a === 'lienquan-share' && !b) return lienquanShare(req, res);
  if (a === 'vbti-share' && !b) return vbtiShare(req, res);

  // ── Liên Quân mastery + khoe feed ──
  if (a === 'lienquan' && b === 'mastery' && !c && (method === 'GET' || method === 'POST' || method === 'OPTIONS')) {
    return lienquanMastery(req, res);
  }
  if (
    a === 'lienquan' &&
    b === 'quiz-meta' &&
    !c &&
    (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')
  ) {
    return lienquanQuizMeta(req, res);
  }
  if (
    a === 'lienquan' &&
    b === 'boast' &&
    !c &&
    ['GET', 'POST', 'PATCH', 'OPTIONS'].includes(method)
  ) {
    return lienquanBoast(req, res);
  }
  if (
    a === 'lienquan' &&
    (b === 'khoe-image' || b === 'khoe-upload') &&
    !c &&
    ['GET', 'POST', 'OPTIONS'].includes(method)
  ) {
    return lienquanKhoeImage(req, res);
  }

  // ── AI Entertainment Platform routes ──
  if (a === 'ai' && b === 'interpret') return aiInterpretResult(req, res);
  if (a === 'ai' && b === 'instant-quiz') return aiInstantQuiz(req, res);
  if (a === 'ai' && b === 'compatibility') return aiCompatibility(req, res);
  if (a === 'ai' && b === 'character-match') return aiCharacterMatch(req, res);

  return res.status(404).json({ error: 'Not found', path: segments.join('/') });
}

export default dispatch;
