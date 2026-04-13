const BOT_AGENTS = [
  'facebookexternalhit', 'facebot',
  'zalosharebot', 'zalo',
  'twitterbot',
  'linkedinbot',
  'googlebot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'viber',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

export const config = {
  matcher: ['/quiz/:path*'],
};

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Only intercept bots on /quiz/ routes → rewrite to OG handler
  if (isBot(userAgent)) {
    const url = new URL(request.url);
    url.pathname = '/api/og';
    return fetch(new Request(url.toString(), request));
  }

  // Normal users → pass through to SPA (no change)
  return undefined;
}
