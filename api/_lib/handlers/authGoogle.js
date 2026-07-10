import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  getPostLoginOrigin,
  isGoogleOAuthConfigured,
} from '../googleOAuth.js';
import { upsertUserFromGoogle } from '../userDb.js';
import {
  setSessionCookie,
  signOAuthState,
  verifyOAuthState,
} from '../session.js';

function siteOrigin(req) {
  return getPostLoginOrigin(req);
}

function redirectWithError(req, res, message) {
  const url = `${siteOrigin(req)}/?auth_error=${encodeURIComponent(message)}`;
  return res.redirect(302, url);
}

export async function authGoogleStart(req, res) {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({ error: 'Google OAuth is not configured' });
  }

  const returnTo = req.query?.returnTo || '/';
  const state = signOAuthState(returnTo);

  try {
    const url = buildGoogleAuthUrl(state, req);
    return res.redirect(302, url);
  } catch (err) {
    console.error('/api/auth/google', err);
    return res.status(500).json({ error: err.message || 'OAuth start failed' });
  }
}

export async function authGoogleCallback(req, res) {
  if (!isGoogleOAuthConfigured()) {
    return redirectWithError(req, res, 'oauth_not_configured');
  }

  const code = req.query?.code;
  const state = req.query?.state;
  const oauthError = req.query?.error;

  if (oauthError) {
    return redirectWithError(req, res, oauthError);
  }
  if (!code || !state) {
    return redirectWithError(req, res, 'missing_code');
  }

  const returnTo = verifyOAuthState(state) || '/';

  try {
    const profile = await exchangeGoogleCode(code, req);
    if (!profile.email) {
      return redirectWithError(req, res, 'email_required');
    }

    const user = await upsertUserFromGoogle({
      googleSub: profile.googleSub,
      email: profile.email,
      name: profile.name,
      pictureUrl: profile.pictureUrl,
    });

    setSessionCookie(res, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.redirect(302, `${siteOrigin(req)}${returnTo}`);
  } catch (err) {
    console.error('/api/auth/google/callback', err);
    const msg = String(err.message || '');
    if (msg.includes('redirect_uri_mismatch') || msg.includes('redirect_uri')) {
      return redirectWithError(req, res, 'redirect_uri_mismatch');
    }
    return redirectWithError(req, res, 'login_failed');
  }
}
