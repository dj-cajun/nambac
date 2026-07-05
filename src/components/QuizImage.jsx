import { useState, useEffect, useMemo } from 'react';
import { getImageUrl } from '../lib/apiConfig';

/** Legacy placeholder — avoid showing on thumbnail error. */
const LEGACY_PLACEHOLDER = '/images/default_cover.png';

export default function QuizImage({
  src,
  alt = '',
  fallback = LEGACY_PLACEHOLDER,
  seed,
  className,
  ...props
}) {
  const dicebear = useMemo(
    () =>
      seed
        ? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`
        : null,
    [seed],
  );

  const resolvedSrc = getImageUrl(src) || dicebear || fallback;

  const [url, setUrl] = useState(resolvedSrc);

  useEffect(() => {
    setUrl(getImageUrl(src) || dicebear || fallback);
  }, [src, dicebear, fallback]);

  return (
    <img
      {...props}
      src={url}
      alt={alt}
      className={className}
      onError={() => {
        if (dicebear && url !== dicebear) {
          setUrl(dicebear);
          return;
        }
        if (url !== fallback && fallback !== LEGACY_PLACEHOLDER) {
          setUrl(fallback);
        }
      }}
    />
  );
}
