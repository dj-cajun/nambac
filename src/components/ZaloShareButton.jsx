import { useEffect } from 'react';
import { ensureZaloSdk, reloadZaloShareButtons } from '../lib/zaloSdk';
import './ZaloShareButton.css';

/**
 * Official Zalo "Chia sẻ" widget (icon + text).
 * Requires og:* meta on data-href URL for preview card.
 *
 * @param {object} props
 * @param {string} props.url
 * @param {() => void} [props.onShared] — best-effort tap on wrapper (iframe may not bubble)
 * @param {string} [props.className]
 */
export default function ZaloShareButton({ url, onShared, className = '' }) {
  useEffect(() => {
    if (!url) return undefined;
    let alive = true;

    ensureZaloSdk()
      .then(() => {
        if (!alive) return;
        // SDK scans DOM on load; re-scan after React paints the widget node.
        requestAnimationFrame(() => reloadZaloShareButtons());
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [url]);

  if (!url) return null;

  return (
    <div
      className={`zalo-share-wrap${className ? ` ${className}` : ''}`}
      onClick={onShared}
      role="presentation"
    >
      <div
        key={url}
        className="zalo-share-button"
        data-href={url}
        data-layout="2"
        data-color="blue"
        data-customize="false"
      />
    </div>
  );
}
