export function typePosterSrc(code) {
  const safe = encodeURIComponent(code);
  return `/sbti/types/${safe}.svg`;
}
