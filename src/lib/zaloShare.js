/**
 * Zalo web share — no SDK or OA approval needed.
 * @see https://sp.zalo.me/share_to_zalo
 */

export function buildZaloShareUrl(url) {
  const shareUrl = String(url || '').trim();
  if (!shareUrl) return 'https://sp.zalo.me/share_to_zalo';
  return `https://sp.zalo.me/share_to_zalo?url=${encodeURIComponent(shareUrl)}`;
}

/** Open Zalo share picker in a new tab/window (mobile opens Zalo app when installed). */
export function openZaloShare(url) {
  const href = buildZaloShareUrl(url);
  window.open(href, '_blank', 'noopener,noreferrer');
}
