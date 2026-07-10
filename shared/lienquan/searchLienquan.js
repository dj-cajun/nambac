/**
 * Unified Liên Quân hub search — heroes, giáo án, glossary, matches, pages, khoe seed.
 */
import { HEROES, getHero } from './heroes.js';
import { GIAO_ANS, MATCHES } from './giaoAns.js';
import { LQ_GLOSSARY } from './glossary.js';
import { LANES } from './tiers.js';
import { LQ_UI } from './uiText.js';
import { KHOE_SEED } from './khoeSeed.js';

const GLOSSARY_SECTIONS = [
  { key: 'physical', label: 'Vật lý' },
  { key: 'magic', label: 'Phép thuật' },
  { key: 'defense', label: 'Giáp & thủ' },
  { key: 'boots_support', label: 'Giày & hỗ trợ' },
  { key: 'lanes', label: 'Đường' },
  { key: 'terms', label: 'Thuật ngữ' },
];

export const LQ_SEARCH_TYPE_LABELS = {
  hero: 'Tướng',
  giaoan: 'Giáo án',
  glossary: 'Từ điển',
  match: 'Trận đấu',
  page: 'Trang',
  khoe: 'Khoe',
};

function laneLabel(laneId) {
  return LANES.find((l) => l.id === laneId)?.label || laneId;
}

function scoreToken(q, text) {
  const hay = String(text || '').trim().toLowerCase();
  if (!hay) return 0;
  if (hay === q) return 100;
  if (hay.startsWith(q)) return 80;
  if (hay.includes(q)) return 50;
  const parts = hay.split(/[\s·|,>]+/).filter(Boolean);
  if (parts.some((p) => p.startsWith(q))) return 45;
  if (parts.some((p) => p.includes(q))) return 35;
  return 0;
}

function scoreEntry(q, fields) {
  return Math.max(0, ...fields.map((f) => scoreToken(q, f)));
}

function buildIndex() {
  const entries = [];
  const tierLabel = 'Meta AOG 2026 (tham khảo)';

  for (const hero of HEROES) {
    const counters = (hero.weakAgainst || [])
      .map((id) => getHero(id)?.name)
      .filter(Boolean);
    const lane = laneLabel(hero.lane);
    entries.push({
      type: 'hero',
      title: hero.name,
      subtitle: `${lane} · ${hero.tier}`,
      to: `/lienquan/tuong/${hero.id}`,
      fields: [
        hero.name,
        hero.id,
        ...(hero.aliases || []),
        hero.lane,
        lane,
        hero.tier,
        hero.tip,
        ...counters,
      ],
    });
  }

  for (const ga of GIAO_ANS) {
    const hero = getHero(ga.heroId);
    const match = MATCHES.find((m) => m.id === ga.matchId);
    entries.push({
      type: 'giaoan',
      title: `${ga.player} — ${hero?.name || ga.heroId}`,
      subtitle: `${ga.team}${match ? ` · ${match.title}` : ''}`,
      to: `/lienquan/giao-an#${ga.id}`,
      fields: [
        ga.player,
        ga.team,
        ga.heroId,
        hero?.name,
        ...(ga.items || []),
        ga.arcana,
        ga.spell,
        ga.copyCode,
        match?.title,
        match?.note,
      ],
    });
  }

  for (const sec of GLOSSARY_SECTIONS) {
    for (const [vi, ko] of Object.entries(LQ_GLOSSARY[sec.key] || {})) {
      entries.push({
        type: 'glossary',
        title: vi,
        subtitle: `${sec.label} · ${ko}`,
        to: `/lienquan/tu-dien?q=${encodeURIComponent(vi)}`,
        fields: [vi, ko, sec.label, sec.key],
      });
    }
  }

  for (const match of MATCHES) {
    entries.push({
      type: 'match',
      title: match.title,
      subtitle: match.note,
      to: `/lienquan/giao-an#match-${match.id}`,
      fields: [match.title, match.note, match.date, 'giáo án', 'aog'],
    });
  }

  const pages = [
    {
      title: LQ_UI.tabGiaoAn,
      subtitle: 'Sao chép build pro',
      to: '/lienquan/giao-an',
      fields: ['giáo án', 'giao an', 'build', 'sgp', '1s', 'maris', 'copy', 'item', 'ngọc', 'rune'],
    },
    {
      title: LQ_UI.tabKhoe,
      subtitle: 'MVP · clip · cộng đồng',
      to: '/lienquan/khoe',
      fields: ['khoe', 'mvp', 'clip', 'tiktok', 'chiến tích', 'quadra'],
    },
    {
      title: LQ_UI.tabTuDien,
      subtitle: LQ_UI.glossarySub,
      to: '/lienquan/tu-dien',
      fields: ['từ điển', 'item', 'ngọc', 'thuật ngữ', 'arcana', 'glossary'],
    },
    {
      title: 'Thi Thông Thạo',
      subtitle: LQ_UI.quizIntro,
      to: '/lienquan#quiz',
      fields: ['quiz', 'thông thạo', 'thi', 'mark', 'đồng', 'test', 'cấp độ'],
    },
    {
      title: LQ_UI.tabCounterTier,
      subtitle: tierLabel,
      to: '/lienquan#tier',
      fields: ['tier', 'khắc chế', 'meta', 'aog', 'top', 'rừng', 'mid', 'adc', 'sp', 'lane', 'đường'],
    },
  ];

  for (const page of pages) {
    entries.push({
      type: 'page',
      title: page.title,
      subtitle: page.subtitle,
      to: page.to,
      fields: [page.title, page.subtitle, ...page.fields],
    });
  }

  for (const post of KHOE_SEED) {
    const hero = getHero(post.hero_id);
    entries.push({
      type: 'khoe',
      title: post.display_name,
      subtitle: post.caption?.slice(0, 72) || hero?.name || 'Khoe',
      to: '/lienquan/khoe',
      fields: [post.display_name, post.caption, post.hero_id, hero?.name],
    });
  }

  return entries;
}

const SEARCH_INDEX = buildIndex();

/** @param {string} query @param {number} [limit] */
export function searchLienquan(query, limit = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const entry of SEARCH_INDEX) {
    const score = scoreEntry(q, entry.fields);
    if (score > 0) {
      scored.push({
        type: entry.type,
        title: entry.title,
        subtitle: entry.subtitle,
        to: entry.to,
        score,
      });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const typeOrder = { hero: 0, giaoan: 1, glossary: 2, match: 3, page: 4, khoe: 5 };
    return (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
      || a.title.localeCompare(b.title);
  });

  return scored.slice(0, limit);
}

/** Back-compat: hero-only results */
export function searchHeroesFromIndex(query, limit = 8) {
  return searchLienquan(query, 24)
    .filter((r) => r.type === 'hero')
    .slice(0, limit)
    .map((r) => getHero(r.to.split('/').pop()))
    .filter(Boolean);
}
