import { useEffect } from 'react';
import { ensureZaloSdk, reloadZaloShareButtons } from '../lib/zaloSdk';
import { getZaloOaId, openZaloShare } from '../lib/zaloShare';
import './ZaloShareButton.css';

/**
 * Zalo share control.
 * - With VITE_ZALO_OA_ID: official "Chia sẻ" iframe widget
 * - Without OA ID: blue "Chia sẻ Zalo" button → share_external picker
 *
 * @param {object} props
 * @param {string} props.url
 * @param {() => void} [props.onShared]
 * @param {string} [props.className]
 * @param {string} [props.label]
 */
export default function ZaloShareButton({
  url,
  onShared,
  className = '',
  label = 'Chia sẻ Zalo',
}) {
  const oaId = getZaloOaId();
  const useOfficialWidget = Boolean(oaId && url);

  useEffect(() => {
    if (!useOfficialWidget) return undefined;
    let alive = true;
    let retryTimer = 0;

    ensureZaloSdk()
      .then(() => {
        if (!alive) return;
        requestAnimationFrame(() => reloadZaloShareButtons());
        // SPA: SDK often loads before the button mounts — retry once.
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
        className={`zalo-share-wrap${className ? ` ${className}` : ''}`}
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

  return (
    <button
      type="button"
      className={`zalo-share-fallback${className ? ` ${className}` : ''}`}
      onClick={() => {
        openZaloShare(url);
        onShared?.();
      }}
      aria-label={label}
    >
      <span className="zalo-share-fallback-icon" aria-hidden="true">
        Z
      </span>
      <span className="zalo-share-fallback-text">{label}</span>
    </button>
  );
}
