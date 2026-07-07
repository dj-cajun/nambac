/** Reset window scroll — use when landing on home or tab switches */
export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}
