/**
 * Pro giáo án — seeded from heroes.json (AOG-flavored VN meta).
 * Entertainment / tham khảo — không phải dữ liệu chính thức Garena.
 */
import metaHeroes from './heroes.json' with { type: 'json' };

function slugMatch(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'aog-meta';
}

const matchTitles = [...new Set(metaHeroes.map((h) => h.giao_an?.match).filter(Boolean))];

export const MATCHES = matchTitles.map((title, i) => ({
  id: slugMatch(title),
  title,
  date: `2026-07-${String(10 - (i % 9)).padStart(2, '0')}`,
  note: 'Giáo án pro · meta AOG (tham khảo)',
}));

const MATCH_BY_LABEL = Object.fromEntries(MATCHES.map((m) => [m.title, m.id]));

export const GIAO_ANS = metaHeroes.map((h) => {
  const ga = h.giao_an || {};
  return {
    id: `ga-${h.id}-meta`,
    matchId: MATCH_BY_LABEL[ga.match] || MATCHES[0]?.id,
    player: ga.author || 'Pro',
    team: String(ga.author || '').split(' ')[0] || 'AOG',
    heroId: h.id,
    items: ga.items || [],
    arcana: ga.arcana || '',
    spell: ga.rune || '',
    copyCode:
      ga.copy_code
      || `${h.name} | ${(ga.items || []).join(' > ')} | ${ga.arcana || ''} | ${ga.rune || ''} | nambac`,
  };
});

export function getMatch(id) {
  return MATCHES.find((m) => m.id === id) || null;
}

export function getGiaoAnsForMatch(matchId) {
  return GIAO_ANS.filter((g) => g.matchId === matchId);
}

export function getGiaoAn(id) {
  return GIAO_ANS.find((g) => g.id === id) || null;
}

export function getGiaoAnForHero(heroId) {
  return GIAO_ANS.find((g) => g.heroId === heroId) || null;
}

/** Hub highlight — pro picks featured on /lienquan */
export const HIGHLIGHT_GIAO_AN_IDS = [
  'ga-florentino-meta',
  'ga-nakroth-meta',
  'ga-keera-meta',
];

export function getHighlightGiaoAns() {
  return HIGHLIGHT_GIAO_AN_IDS.map((id) => getGiaoAn(id)).filter(Boolean);
}
