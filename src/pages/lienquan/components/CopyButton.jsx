import { useState } from 'react';
import { copyGiaoAnText } from '../../../lib/lienquan/copyGiaoAn.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';

export default function CopyButton({
  text,
  label = LQ_UI.copyButton,
  doneLabel = LQ_UI.copyToast,
}) {
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
      {done ? doneLabel : error ? 'Thử lại' : label}
    </button>
  );
}
