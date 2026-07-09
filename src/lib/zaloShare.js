/**
 * Zalo share helpers.
 *
 * Official SDK widget needs VITE_ZALO_OA_ID.
 * Without OA (current prod): cascade that does not strand the user on a dead page:
 *   1) navigator.share — user picks Zalo (best on VN Android/iOS)
 *   2) copy link + toast — always works; paste into Zalo chat
 *   3) optional: open share_external in a new tab (desktop / when popup allowed)
 */

import { copyShareLink } from './copyShareLink';

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

/** Web share picker URL — no Official Account required (may be geo/network flaky). */
export function buildZaloShareExternalUrl(pageUrl) {
  const d = encodeZaloSharePayload(pageUrl);
  return `https://button-share.zalo.me/share_external?d=${encodeURIComponent(d)}`;
}

export function canUseWebShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Try native share sheet (Android/iOS often lists Zalo).
 * @returns {Promise<'shared'|'cancel'|'unsupported'|'error'>}
 */
export async function tryNativeShare({ url, title, text } = {}) {
  if (!canUseWebShare() || !url) return 'unsupported';
  try {
    await navigator.share({
      title: title || 'nambac.xyz',
      text: text || title || 'Xem kết quả trên nambac',
      url,
    });
    return 'shared';
  } catch (err) {
    if (err?.name === 'AbortError') return 'cancel';
    return 'error';
  }
}

/**
 * Open Zalo web share in a new tab/window only (never same-tab — avoids dead-end).
 * Returns true if a window/tab was opened.
 */
export function openZaloShareExternal(pageUrl) {
  if (!pageUrl || typeof window === 'undefined') return false;
  const href = buildZaloShareExternalUrl(pageUrl);
  const popup = window.open(href, '_blank', 'noopener,noreferrer,width=600,height=520');
  return Boolean(popup);
}

/** @deprecated use shareToZalo */
export function openZaloShare(pageUrl) {
  return openZaloShareExternal(pageUrl);
}

/**
 * Best-effort Zalo share without OA.
 * Prefer native sheet, then copy (reliable), then optional new-tab Zalo URL.
 * @returns {Promise<{ method: 'native'|'copy'|'zalo_url'|'none', ok: boolean }>}
 */
export async function shareToZalo(pageUrl, { title, text } = {}) {
  if (!pageUrl) return { method: 'none', ok: false };

  const native = await tryNativeShare({ url: pageUrl, title, text });
  if (native === 'shared') return { method: 'native', ok: true };
  if (native === 'cancel') return { method: 'native', ok: false };

  // Reliable path: copy so user can paste into Zalo (works in every in-app browser).
  const copied = await copyShareLink(pageUrl);
  if (copied) {
    // Best-effort: also try Zalo web picker in a new tab (desktop / when allowed).
    openZaloShareExternal(pageUrl);
    return { method: 'copy', ok: true };
  }

  // Copy failed — last chance navigate via popup only.
  if (openZaloShareExternal(pageUrl)) {
    return { method: 'zalo_url', ok: true };
  }

  return { method: 'none', ok: false };
}
