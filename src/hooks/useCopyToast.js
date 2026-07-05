import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 2600;

/**
 * Comic-style copy feedback toast (replaces native alert on share buttons).
 * @returns {{ toast: { message: string, type: 'success'|'error' } | null, showToast: Function }}
 */
export function useCopyToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  return { toast, showToast };
}
