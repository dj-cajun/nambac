import { HEROES } from '../../../shared/lienquan/heroes.js';

export function searchHeroes(query, limit = 8) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const hero of HEROES) {
    const name = hero.name.toLowerCase();
    const aliases = (hero.aliases || []).map((a) => a.toLowerCase());
    let score = 0;
    if (name === q || aliases.includes(q)) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 50;
    else if (aliases.some((a) => a.startsWith(q) || a.includes(q))) score = 40;
    else if (hero.id.startsWith(q)) score = 30;
    if (score > 0) scored.push({ hero, score });
  }
  scored.sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name));
  return scored.slice(0, limit).map((s) => s.hero);
}
