import { useState } from 'react';
import { copyGiaoAnText } from '../../../lib/lienquan/copyGiaoAn.js';

export default function CopyButton({ text, label = 'Sao chép' }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const onCopy = async () => {
    try {
      await copyGiaoAnText(text);
      setDone(true);
      setError(false);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setError(true);
      window.setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <button type="button" className="lq-copy-btn" onClick={onCopy}>
      {done ? 'Đã sao chép!' : error ? 'Thử lại' : label}
    </button>
  );
}
