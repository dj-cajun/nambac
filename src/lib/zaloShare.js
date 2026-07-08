/**
 * Zalo share helpers.
 *
 * Official social share widget REQUIRES data-oaid (Official Account ID).
 * Without it, ZaloSocialSDK silently skips rendering (see sdk.js validate()).
 *
 * Fallback (no OA): open Zalo's share_external web picker with a base64 payload.
 */

export function getZaloOaId() {
  return String(import.meta.env.VITE_ZALO_OA_ID || '').trim();
}

/** Encode share payload for button-share.zalo.me (unicode-safe). */
export function encodeZaloSharePayload(pageUrl) {
  const json = JSON.stringify({ url: String(pageUrl || '').trim() });
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

/** Web share picker URL — works without Official Account registration. */
export function buildZaloShareExternalUrl(pageUrl) {
  const d = encodeZaloSharePayload(pageUrl);
  return `https://button-share.zalo.me/share_external?d=${encodeURIComponent(d)}`;
}

export function openZaloShare(pageUrl) {
  if (!pageUrl) return;
  const href = buildZaloShareExternalUrl(pageUrl);
  window.open(href, '_blank', 'noopener,noreferrer');
}
