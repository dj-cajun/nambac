/**
 * Zalo share helpers.
 *
 * Official SDK widget requires data-oaid (Official Account ID).
 * Without OA: use <a href> to button-share.zalo.me (window.open is blocked on mobile).
 */

export function getZaloOaId() {
  return String(import.meta.env.VITE_ZALO_OA_ID || '').trim();
}

/** Encode share payload for button-share.zalo.me (unicode-safe, compact JSON). */
export function encodeZaloSharePayload(pageUrl) {
  const json = JSON.stringify({ url: String(pageUrl || '').trim() });
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

/** Web share picker — no Official Account required. */
export function buildZaloShareExternalUrl(pageUrl) {
  const d = encodeZaloSharePayload(pageUrl);
  return `https://button-share.zalo.me/share_external?d=${encodeURIComponent(d)}`;
}

/**
 * Open Zalo share picker. Prefer real navigation over window.open (popup blockers).
 * Returns true when navigation was triggered.
 */
export function openZaloShare(pageUrl) {
  if (!pageUrl || typeof window === 'undefined') return false;
  const href = buildZaloShareExternalUrl(pageUrl);

  // Desktop: try sized popup first.
  const popup = window.open(href, '_blank', 'noopener,noreferrer,width=600,height=520');
  if (popup) return true;

  // Mobile / blocked popup: same-tab navigation (reliable on iOS & in-app browsers).
  window.location.assign(href);
  return true;
}
