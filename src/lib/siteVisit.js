import { apiUrl } from './apiConfig';

const VID_COOKIE = 'nambac_vid';
const SENT_KEY = 'nambac_site_visit_sent';
const OWNER_MARKED_KEY = 'nambac_owner_device_marked';

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

/**
 * Record one site visit per browser session.
 * Admin sessions register the device as owner (excluded from analytics).
 * @param {{ force?: boolean }} [opts]
 */
export async function recordSiteVisit(opts = {}) {
  if (typeof window === 'undefined') return;

  const force = Boolean(opts.force);

  try {
    if (!force && sessionStorage.getItem(SENT_KEY)) return;
    sessionStorage.setItem(SENT_KEY, '1');
  } catch {
    /* private mode */
  }

  try {
    const res = await fetch(apiUrl('/visit'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.skipped === 'owner') {
      try {
        localStorage.setItem(OWNER_MARKED_KEY, '1');
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* network errors are non-fatal */
  }
}

/** Call after admin login so this phone/laptop is excluded even when logged out later. */
export async function markOwnerDevice() {
  try {
    sessionStorage.removeItem(SENT_KEY);
  } catch {
    /* ignore */
  }
  return recordSiteVisit({ force: true });
}
