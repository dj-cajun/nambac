import { openZaloShare } from '../lib/zaloShare';
import './ZaloShareButton.css';

function ZaloIcon() {
  return (
    <svg className="zalo-share-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M7.2 8.4h9.6c.3 0 .5.2.5.5v.3c0 .3-.2.5-.5.5H11l4.8 4.2c.2.2.2.5 0 .7l-.2.2c-.2.2-.5.2-.7 0L9.8 10.2v3.5c0 .3-.2.5-.5.5h-.3c-.3 0-.5-.2-.5-.5V8.9c0-.3.2-.5.5-.5h-.3z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * @param {object} props
 * @param {string} props.url - Page URL to share (OG preview comes from og:* meta on that URL)
 * @param {() => void} [props.onShared]
 * @param {string} [props.className]
 * @param {'icon'|'pill'} [props.variant]
 * @param {string} [props.label] - Visible label for pill variant
 * @param {boolean} [props.disabled]
 */
export default function ZaloShareButton({
  url,
  onShared,
  className = '',
  variant = 'icon',
  label = 'Zalo',
  disabled = false,
}) {
  const handleClick = () => {
    if (!url || disabled) return;
    openZaloShare(url);
    onShared?.();
  };

  return (
    <button
      type="button"
      className={`zalo-share-btn zalo-share-btn--${variant}${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      disabled={disabled || !url}
      aria-label="Chia sẻ qua Zalo"
    >
      <ZaloIcon />
      {variant === 'pill' && <span className="zalo-share-label">{label}</span>}
    </button>
  );
}
