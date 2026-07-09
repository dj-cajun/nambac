import { useEffect, useState } from 'react';
import { ensureZaloSdk, reloadZaloShareButtons } from '../lib/zaloSdk';
import {
  buildZaloShareExternalUrl,
  getZaloOaId,
  shareToZalo,
} from '../lib/zaloShare';
import './ZaloShareButton.css';

/**
 * Zalo share control that actually works without Official Account.
 *
 * Priority:
 * 1. Official SDK widget when VITE_ZALO_OA_ID is set
 * 2. Click cascade: Web Share → Zalo share_external → copy link
 *
 * @param {object} props
 * @param {string} props.url
 * @param {() => void} [props.onShared]
 * @param {(msg: string, type?: 'success'|'error') => void} [props.onToast]
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {string} [props.title]
 * @param {string} [props.text]
 * @param {boolean} [props.fillParent] stretch to fill .tag-friends-zalo-wrap
 */
export default function ZaloShareButton({
  url,
  onShared,
  onToast,
  className = '',
  label = 'Chia sẻ Zalo',
  title = 'nambac.xyz',
  text = 'Xem kết quả trên nambac — tag bạn bè ngay!',
  fillParent = false,
}) {
  const oaId = getZaloOaId();
  const useOfficialWidget = Boolean(oaId && url);
  const shareHref = url ? buildZaloShareExternalUrl(url) : '';
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!useOfficialWidget) return undefined;
    let alive = true;
    let retryTimer = 0;

    ensureZaloSdk()
      .then(() => {
        if (!alive) return;
        requestAnimationFrame(() => reloadZaloShareButtons());
        retryTimer = window.setTimeout(() => {
          if (alive) reloadZaloShareButtons();
        }, 400);
      })
      .catch(() => {});

    return () => {
      alive = false;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [useOfficialWidget, url, oaId]);

  if (!url) return null;

  if (useOfficialWidget) {
    return (
      <div
        className={`zalo-share-wrap${fillParent ? ' zalo-share-wrap--fill' : ''}${className ? ` ${className}` : ''}`}
        onClick={onShared}
        role="presentation"
      >
        <div
          key={`${oaId}-${url}`}
          className="zalo-share-button"
          data-href={url}
          data-oaid={oaId}
          data-layout="2"
          data-color="blue"
          data-customize="false"
        />
      </div>
    );
  }

  const handleClick = async (e) => {
    // Keep <a href> as progressive enhancement; we drive the cascade ourselves.
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    onShared?.();

    try {
      const result = await shareToZalo(url, { title, text });

      if (result.method === 'native' && result.ok) {
        onToast?.('Chọn Zalo trong danh sách chia sẻ nhé!', 'success');
        return;
      }
      if (result.method === 'native' && !result.ok) {
        // User cancelled share sheet.
        return;
      }
      if (result.method === 'copy' && result.ok) {
        onToast?.('Đã copy link! Mở Zalo → dán vào chat / đăng story', 'success');
        return;
      }
      if (result.method === 'zalo_url' && result.ok) {
        onToast?.('Đã mở Zalo share', 'success');
        return;
      }

      onToast?.('Không chia sẻ được. Hãy copy link thủ công.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <a
      href={shareHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`zalo-share-link${fillParent ? ' zalo-share-link--fill' : ''}${className ? ` ${className}` : ''}${busy ? ' is-busy' : ''}`}
      onClick={handleClick}
      aria-label={label}
      aria-busy={busy}
    >
      <span className="zalo-share-link-icon" aria-hidden="true">
        Z
      </span>
      <span className="zalo-share-link-text">{busy ? 'Đang mở…' : label}</span>
    </a>
  );
}
