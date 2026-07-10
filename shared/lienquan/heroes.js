/**
 * Liên Quân heroes — meta 15 from heroes.json + supplemental roster for search/counters.
 * Entertainment seed (no Garena API).
 */
import metaHeroes from './heroes.json' with { type: 'json' };

const POS_TO_LANE = {
  Top: 'top',
  Rừng: 'jungle',
  Mid: 'mid',
  AD: 'adc',
  SP: 'sp',
};

const META_ALIASES = {
  florentino: ['flo', 'kiếm sĩ'],
  yena: ['ye na'],
  omen: [],
  zuka: [],
  nakroth: ['nak'],
  keera: [],
  aoi: [],
  yan: [],
  liliana: ['lili', 'cáo'],
  raz: [],
  krixi: [],
  hayate: ['haya'],
  elsu: [],
  violet: ['vio'],
  thane: [],
};

/** Featured AOG-flavored meta (15) — source of truth: heroes.json */
const META_HEROES = metaHeroes.map((h) => ({
  id: h.id,
  name: h.name,
  aliases: META_ALIASES[h.id] || [],
  lane: POS_TO_LANE[h.position] || String(h.position || 'top').toLowerCase(),
  tier: h.tier,
  weakAgainst: h.counters || [],
  counterNotes: (h.counters || []).map(() => 'Khắc chế theo meta AOG (tham khảo).'),
  tip: h.tip,
  meta: true,
}));

/** Extra roster so search / counters still resolve */
const EXTRA_HEROES = [
  {
    id: 'murad',
    name: 'Murad',
    aliases: [],
    lane: 'jungle',
    tier: 'S',
    weakAgainst: ['airi', 'zuka', 'taara'],
    counterNotes: [
      'Mobility + trade nhanh hơn early.',
      'Bay vào backline đối đầu Murad.',
      'Tank chịu burst ult của Murad.',
    ],
    tip: 'Murad cần stack trước khi all-in. Đừng 1v1 khi chưa đủ dấu ấn.',
  },
  {
    id: 'airi',
    name: 'Airi',
    aliases: ['airy'],
    lane: 'jungle',
    tier: 'A',
    weakAgainst: ['nakroth', 'zill', 'veres'],
    counterNotes: [
      'Gank / duel mạnh hơn early.',
      'Burst nhanh trước combo Airi.',
      'Đấu sĩ cứng chống dive.',
    ],
    tip: 'Airi combo nhanh — luyện skill 2 → 1 → ult cho mượt trước khi leo rank.',
  },
  {
    id: 'veres',
    name: 'Veres',
    aliases: [],
    lane: 'top',
    tier: 'S',
    weakAgainst: ['arthur', 'ormarr', 'taara'],
    counterNotes: [
      'Ổn định, chống Veres mid.',
      'CC + tank ép Veres.',
      'Tank đường chịu sát thương.',
    ],
    tip: 'Veres mạnh mid-game. Tránh 1v1 quá sớm nếu đối phương có giáp.',
  },
  {
    id: 'aleister',
    name: 'Aleister',
    aliases: ['ale'],
    lane: 'mid',
    tier: 'A',
    weakAgainst: ['krixi', 'raz', 'natalya'],
    counterNotes: [
      'Poke / clear trước khi Ale set.',
      'Burst mid đua sát thương.',
      'Mage poke khoảng cách.',
    ],
    tip: 'Aleister set combat bằng ult — báo team trước khi thả vòng.',
  },
  {
    id: 'arum',
    name: 'Arum',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: ['wiro', 'xeniel', 'ormarr'],
    counterNotes: [
      'Chống ôm / peel Arum.',
      'Ult cứu đồng đội khỏi ôm.',
      'Engage cắt nhịp Arum.',
    ],
    tip: 'Arum ôm mục tiêu trong bụi — đừng ult lộ khi team chưa sẵn sàng.',
  },
  {
    id: 'taara',
    name: 'Taara',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: ['arthur', 'slimz', 'elsu'],
    counterNotes: [
      'Ổn định chống tank đường.',
      'Tầm xa kite Taara.',
      'Sniper / poke từ xa.',
    ],
    tip: 'Taara tank đường — nhường farm cho AD, giữ skill hồi máu cho combat.',
  },
  {
    id: 'xeniel',
    name: 'Xeniel',
    aliases: ['xen'],
    lane: 'sp',
    tier: 'S',
    weakAgainst: ['grakk', 'krizzix', 'annette'],
    counterNotes: [
      'Hook cắt bay cứu.',
      'Bẫy / CC trước khi Xen ult.',
      'Peel tranh chấp với Xen.',
    ],
    tip: 'Xeniel ult cứu đồng đội — đếm CD địch trước khi bay vào.',
  },
  {
    id: 'grakk',
    name: 'Grakk',
    aliases: [],
    lane: 'sp',
    tier: 'A',
    weakAgainst: ['annette', 'krizzix', 'zip'],
    counterNotes: [
      'Peel / chống hook.',
      'Bẫy phản hook.',
      'Cứu đồng đội khỏi hook.',
    ],
    tip: 'Grakk hook trong bụi — một hook trượt là mất tempo, kiên nhẫn.',
  },
  {
    id: 'natalya',
    name: 'Natalya',
    aliases: ['nata'],
    lane: 'mid',
    tier: 'S',
    weakAgainst: ['gildur', 'raz', 'zill'],
    counterNotes: [
      'CC khóa Nata đứng sai.',
      'Poke ép vị trí Nata.',
      'Dive backline Nata.',
    ],
    tip: 'Natalya cần vị trí an toàn — luôn đứng sau tank khi teamfight.',
  },
  {
    id: 'yorn',
    name: 'Yorn',
    aliases: [],
    lane: 'adc',
    tier: 'A',
    weakAgainst: ['wiro', 'elsu', 'violet'],
    counterNotes: [
      'Engage cứng vào AD.',
      'Sniper góc đối đầu.',
      'Kiting / đua tầm.',
    ],
    tip: 'Yorn tầm xa: giữ khoảng cách tối đa, đừng chase vào bụi.',
  },
  {
    id: 'wiro',
    name: 'Wiro',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: ['florentino', 'veres', 'arthur'],
    counterNotes: [
      'Đấu sĩ mạnh hơn early.',
      'Ép nhịp mid-game.',
      'Ổn định chống Wiro.',
    ],
    tip: 'Wiro chống AD tốt — build giáp theo meta trận đấu.',
  },
  {
    id: 'arthur',
    name: 'Arthur',
    aliases: [],
    lane: 'top',
    tier: 'B',
    weakAgainst: ['florentino', 'veres', 'murad'],
    counterNotes: [
      'Đấu sĩ mạnh hơn Arthur.',
      'Ép nhịp mid.',
      'Dive / burst Arthur.',
    ],
    tip: 'Arthur ổn định cho người mới — tập engage đúng lúc ult.',
  },
  {
    id: 'zill',
    name: 'Zill',
    aliases: [],
    lane: 'jungle',
    tier: 'A',
    weakAgainst: ['taara', 'xeniel', 'grakk'],
    counterNotes: [
      'Tank chịu burst Zill.',
      'Ult cứu / chống dive.',
      'Hook cắt nhịp gank.',
    ],
    tip: 'Zill gank bằng tốc độ — đừng farm quá lâu nếu lane đang thua.',
  },
  {
    id: 'tulen',
    name: 'Tulen',
    aliases: [],
    lane: 'mid',
    tier: 'A',
    weakAgainst: ['raz', 'natalya', 'gildur'],
    counterNotes: [
      'Poke / trade mid.',
      'Burst đua sát thương.',
      'CC set Tulen.',
    ],
    tip: 'Tulen burst cao — chờ skill CD rồi mới all-in.',
  },
  {
    id: 'gildur',
    name: 'Gildur',
    aliases: [],
    lane: 'mid',
    tier: 'B',
    weakAgainst: ['krixi', 'elsu', 'yorn'],
    counterNotes: [
      'Poke trước khi Gildur set.',
      'Tầm xa kite tường.',
      'AD kite / tránh ult.',
    ],
    tip: 'Gildur set bằng ult — báo team trước khi đóng tường.',
  },
  {
    id: 'ormarr',
    name: 'Ormarr',
    aliases: [],
    lane: 'sp',
    tier: 'A',
    weakAgainst: ['annette', 'zip', 'krizzix'],
    counterNotes: [
      'Peel chống engage.',
      'Cứu carry khỏi Ormarr.',
      'Bẫy / CC phản engage.',
    ],
    tip: 'Ormarr engage thẳng — đừng ult khi team còn ở base.',
  },
  {
    id: 'annette',
    name: 'Annette',
    aliases: ['anne'],
    lane: 'sp',
    tier: 'S',
    weakAgainst: ['grakk', 'ormarr', 'zip'],
    counterNotes: [
      'Hook ép Annette.',
      'Engage thẳng vào Anne.',
      'Peel tranh chấp.',
    ],
    tip: 'Annette peel cho AD — ưu tiên cứu carry hơn là chase kill.',
  },
  {
    id: 'krizzix',
    name: 'Krizzix',
    aliases: ['kris'],
    lane: 'sp',
    tier: 'A',
    weakAgainst: ['xeniel', 'annette', 'grakk'],
    counterNotes: [
      'Ult cứu khỏi bẫy.',
      'Peel / chống set.',
      'Hook trước khi Kris bẫy.',
    ],
    tip: 'Krizzix bẫy trong bụi — một set tốt đổi cả trận.',
  },
  {
    id: 'zip',
    name: 'Zip',
    aliases: [],
    lane: 'sp',
    tier: 'B',
    weakAgainst: ['grakk', 'ormarr', 'annette'],
    counterNotes: [
      'Hook cắt bóng cứu.',
      'Engage trước Zip cứu.',
      'Peel tranh chấp.',
    ],
    tip: 'Zip cứu đồng đội bằng bóng — canh timing skill địch.',
  },
  {
    id: 'slimz',
    name: 'Slimz',
    aliases: [],
    lane: 'adc',
    tier: 'B',
    weakAgainst: ['violet', 'yorn', 'elsu'],
    counterNotes: [
      'Đua farm / kiting.',
      'Tầm xa ép Slimz.',
      'Sniper góc.',
    ],
    tip: 'Slimz cần farm — tránh fight sớm nếu chưa có đồ.',
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    aliases: ['bf'],
    lane: 'jungle',
    tier: 'A',
    weakAgainst: ['taara', 'arthur', 'xeniel'],
    counterNotes: [
      'Tank chịu late BF.',
      'Ổn định chống scale.',
      'Ult cứu / chống dive BF.',
    ],
    tip: 'Butterfly late-game mạnh — sống sót early rồi scale.',
  },
  {
    id: 'roxie',
    name: 'Roxie',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Roxie tank đường — giữ skill cho combat.',
  },
  {
    id: 'joker',
    name: 'Joker',
    aliases: [],
    lane: 'adc',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Joker poke tầm xa — đừng đứng im.',
  },
  {
    id: 'valhein',
    name: 'Valhein',
    aliases: [],
    lane: 'adc',
    tier: 'B',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Valhein ổn định early — farm rồi scale.',
  },
  {
    id: 'wukong',
    name: 'Wukong',
    aliases: ['ngộ không'],
    lane: 'jungle',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Wukong dive backline — chọn mục tiêu AD.',
  },
  // Counter stubs referenced by meta 15
  {
    id: 'maloch',
    name: 'Maloch',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Maloch tank / engage — canh chiêu cuối diện rộng.',
  },
  {
    id: 'richter',
    name: 'Richter',
    aliases: [],
    lane: 'top',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Richter cơ động — đừng lãng phí CC khi hắn dash.',
  },
  {
    id: 'baldum',
    name: 'Baldum',
    aliases: [],
    lane: 'sp',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Baldum set trong bụi — tránh đứng gần tường.',
  },
  {
    id: 'kriknak',
    name: 'Kriknak',
    aliases: [],
    lane: 'jungle',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Kriknak gank nhanh — ward bụi và giữ khoảng cách.',
  },
  {
    id: 'lorion',
    name: 'Lorion',
    aliases: [],
    lane: 'mid',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Lorion poke / zone — né skill vùng.',
  },
  {
    id: 'chaugnar',
    name: 'Chaugnar',
    aliases: [],
    lane: 'sp',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Chaugnar chống mage — ưu tiên peel cho carry.',
  },
  {
    id: 'max',
    name: 'Max',
    aliases: [],
    lane: 'sp',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Max engage thẳng — đừng đứng gần tường khi hắn có ult.',
  },
  {
    id: 'lauriel',
    name: 'Lauriel',
    aliases: [],
    lane: 'mid',
    tier: 'A',
    weakAgainst: [],
    counterNotes: [],
    tip: 'Lauriel cơ động cao — giữ CC cho lúc hắn dash vào.',
  },
];

const metaIds = new Set(META_HEROES.map((h) => h.id));

export const HEROES = [
  ...META_HEROES,
  ...EXTRA_HEROES.filter((h) => !metaIds.has(h.id)),
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export function getHero(id) {
  return HERO_BY_ID[String(id || '').toLowerCase()] || null;
}

export function resolveCounters(hero) {
  if (!hero?.weakAgainst?.length) return [];
  return hero.weakAgainst
    .map((id, i) => {
      const c = getHero(id);
      if (!c) return null;
      return {
        ...c,
        why: hero.counterNotes?.[i] || 'Khó trade / bị ép nhịp.',
      };
    })
    .filter(Boolean);
}

export function searchHeroes(query) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return HEROES.filter((h) => h.meta);
  return HEROES.filter((h) => {
    if (h.id.includes(q) || h.name.toLowerCase().includes(q)) return true;
    return (h.aliases || []).some((a) => String(a).toLowerCase().includes(q));
  });
}
