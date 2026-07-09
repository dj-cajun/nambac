const NAMBAC_OAUTH_ORIGIN = 'https://nambac.xyz';

function normalizeNambacOrigin(siteUrl) {
  return String(siteUrl || '')
    .replace(/\/$/, '')
    .replace('://www.nambac.xyz', '://nambac.xyz');
}

function resolveSiteUrl(req) {
  const explicitRedirect = (process.env.GOOGLE_REDIRECT_URI || '').trim();
  if (explicitRedirect) {
    const siteUrl = explicitRedirect.replace(/\/api\/auth\/google\/callback\/?$/, '');
    return {
      siteUrl: siteUrl || 'http://localhost:5173',
      redirectUri: explicitRedirect,
    };
  }

  if (process.env.VERCEL) {
    const siteUrl = normalizeNambacOrigin(process.env.VITE_SITE_URL || NAMBAC_OAUTH_ORIGIN);
    return {
      siteUrl,
      redirectUri: `${siteUrl}/api/auth/google/callback`,
    };
  }

  let siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

  if (req) {
    const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
    if (host && (host.startsWith('localhost') || host.startsWith('127.0.0.1'))) {
      const proto = req.headers?.['x-forwarded-proto'] || 'http';
      siteUrl = `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  return {
    siteUrl,
    redirectUri: `${siteUrl}/api/auth/google/callback`,
  };
}

/** Where to send the user after OAuth (pretty URL). */
export function getPostLoginOrigin(req) {
  if (process.env.VERCEL) {
    return 'https://www.nambac.xyz';
  }
  return getGoogleOAuthConfig(req).siteUrl;
}

export function getGoogleOAuthConfig(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const { siteUrl, redirectUri } = resolveSiteUrl(req);
  return { clientId, clientSecret, redirectUri, siteUrl };
}

export function isGoogleOAuthConfigured() {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  return Boolean(clientId && clientSecret);
}

export function buildGoogleAuthUrl(state, req) {
  const { clientId, redirectUri } = getGoogleOAuthConfig(req);
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code, req) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig(req);
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google token exchange failed');
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json().catch(() => ({}));
  if (!profileRes.ok || !profile.sub) {
    throw new Error('Failed to load Google profile');
  }

  return {
    googleSub: profile.sub,
    email: profile.email || '',
    name: profile.name || profile.given_name || '',
    pictureUrl: profile.picture || '',
  };
}

export function getAdminAllowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
