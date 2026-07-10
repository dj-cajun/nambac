/**
 * Original archetype portraits for Liên Quân meta heroes.
 * Not official Garena art — generic MOBA role silhouettes only.
 */
import metaHeroes from './heroes.json' with { type: 'json' };

const META_HERO_IDS = new Set(metaHeroes.map((h) => h.id));

/** @param {string} heroId */
export function getHeroPortraitPath(heroId) {
  const id = String(heroId || '').trim().toLowerCase();
  if (!id || !META_HERO_IDS.has(id)) return null;
  return `/images/lienquan/heroes/${id}.svg`;
}

export function hasHeroPortrait(heroId) {
  return Boolean(getHeroPortraitPath(heroId));
}
