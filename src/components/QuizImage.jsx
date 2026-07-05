import { useState } from 'react';
import { getImageUrl } from '../lib/apiConfig';

const DEFAULT_COVER = '/images/default_cover.png';

export default function QuizImage({
  src,
  alt = '',
  fallback = DEFAULT_COVER,
  seed,
  className,
  ...props
}) {
  const dicebear = seed
    ? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`
    : fallback;
  const initial = getImageUrl(src) || dicebear;
  const [url, setUrl] = useState(initial);

  return (
    <img
      {...props}
      src={url}
      alt={alt}
      className={className}
      onError={() => {
        if (url === dicebear) return;
        setUrl(url === fallback ? dicebear : fallback);
      }}
    />
  );
}
