import './SceneNameOverlay.css';

/** Meme-style name callout + arrow burned into the scene image area. */
export default function SceneNameOverlay({ label, variant = 'roast' }) {
  const text = String(label || '').trim();
  if (!text) return null;

  return (
    <div className={`scene-name-overlay scene-name-overlay--${variant}`} aria-hidden="true">
      <div className="scene-name-callout">
        <span className="scene-name-text">{text}</span>
        <svg
          className="scene-name-arrow"
          viewBox="0 0 72 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 6 C28 34 40 52 48 78"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M48 78 L36 64 M48 78 L58 66"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
