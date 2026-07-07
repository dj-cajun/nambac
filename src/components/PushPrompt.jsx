import { useState } from 'react';
import { isPushSupported, isPushSubscribed, subscribeToPush } from '../lib/pushNotifications';
import './PushPrompt.css';

const DISMISS_KEY = 'nambac_push_dismissed';

export default function PushPrompt() {
  const [visible, setVisible] = useState(() => {
    if (!isPushSupported() || isPushSubscribed()) return false;
    try {
      return localStorage.getItem(DISMISS_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      setVisible(false);
    } catch (err) {
      console.warn(err);
      dismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="push-prompt">
      <button type="button" className="push-prompt-close" onClick={dismiss} aria-label="Đóng">
        <X size={16} />
      </button>
      <div className="push-prompt-icon"><Bell size={20} /></div>
      <div className="push-prompt-text">
        <strong>Quiz mới mỗi ngày!</strong>
        <span>Nhận thông báo khi có trắc nghiệm viral mới.</span>
      </div>
      <button type="button" className="push-prompt-btn" onClick={handleSubscribe} disabled={loading}>
        {loading ? '...' : 'Bật'}
      </button>
    </div>
  );
}
