import { next, rewrite } from '@vercel/functions';

/** Must run before static index.html — vercel.json UA rewrites lose to filesystem. */
const BOT_UA =
  /googlebot|bingbot|yandex|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|viber|kakaotalk|kakaostory|zalosharebot|gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic|perplexitybot|bytespider/i;

const STATIC_PAGES = new Set([
  '',
  'explore',
  'blog',
  'vbti',
  'lienquan',
  'fortune',
  'balance',
  'roast-card',
  'brain',
  'about',
  'faq',
  'contact',
  'privacy-policy',
  'terms-of-service',
  'cookie-policy',
  'editorial-policy',
  'leaderboard',
  'brands',
]);

export const config = {
  matcher: [
    '/',
    '/explore',
    '/blog',
    '/vbti',
    '/lienquan',
    '/fortune',
    '/balance',
    '/roast-card',
    '/brain',
    '/about',
    '/faq',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/editorial-policy',
    '/leaderboard',
    '/brands',
  ],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const { pathname } = new URL(request.url);
  const page = pathname === '/' ? '' : pathname.replace(/^\//, '');
  if (!STATIC_PAGES.has(page)) return next();

  const dest = new URL('/api/handler', request.url);
  dest.searchParams.set('path', 'page-seo');
  dest.searchParams.set('page', page);
  return rewrite(dest);
}
