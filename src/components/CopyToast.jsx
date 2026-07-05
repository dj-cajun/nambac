import './CopyToast.css';

export default function CopyToast({ toast, anchored = false }) {
  if (!toast?.message) return null;

  return (
    <div
      className={`copy-toast copy-toast--${toast.type || 'success'}${anchored ? ' copy-toast--anchored' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="copy-toast-icon" aria-hidden="true">
        {toast.type === 'error' ? '!' : '✓'}
      </span>
      <span className="copy-toast-text">{toast.message}</span>
    </div>
  );
}
