function hashHue(code) {
  let h = 0;
  for (let i = 0; i < code.length; i += 1) h = (h * 31 + code.charCodeAt(i)) % 360;
  return h;
}

export default function TypePoster({ type, size = 'md' }) {
  if (!type?.code) return null;
  const cls = size === 'lg' ? 'sbti-poster-lg' : 'sbti-poster-md';
  const hue = hashHue(type.code);
  return (
    <div
      className={`sbti-poster ${cls}`}
      data-code={type.code}
      style={{
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 22%), hsl(${(hue + 42) % 360}, 36%, 36%))`,
      }}
    >
      <span className="sbti-poster-code">{type.code}</span>
      {type.name ? <span className="sbti-poster-name">{type.name}</span> : null}
    </div>
  );
}
