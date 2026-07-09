import { apiUrl } from './apiConfig';

const VID_COOKIE = 'nambac_vid';
const SENT_KEY = 'nambac_site_visit_sent';

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function writeCookie(name, value) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function getVisitorId() {
  let id = readCookie(VID_COOKIE);
  if (!id) {
    id = crypto.randomUUID();
    writeCookie(VID_COOKIE, id);
  }
  return id;
}

/** Record one site visit per browser session (logged-in or guest). */
export async function recordSiteVisit() {
  if (typeof window === 'undefined') return;

  try {
    if (sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, '1');
  } catch {
    /* private mode */
  }

  try {
    await fetch(apiUrl('/visit'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    });
  } catch {
    /* network errors are non-fatal */
  }
}
