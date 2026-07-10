/**
 * Liên Quân quiz question builders — facts from heroes/glossary/giaoAns only.
 */
import metaHeroes from './heroes.json' with { type: 'json' };
import glossary from './glossary-items.json' with { type: 'json' };
import { HEROES, HERO_BY_ID, getHero } from './heroes.js';
import { GIAO_ANS } from './giaoAns.js';

const META = metaHeroes.map((h) => ({
  ...h,
  counterNotes: HERO_BY_ID[h.id]?.counterNotes || [],
}));

const LANE_LABELS = Object.keys(glossary.lanes || {});

/** Deterministic shuffle — same seed → same order */
export function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickWrongHeroes(excludeIds, count, seed) {
  const pool = HEROES.filter((h) => !excludeIds.has(h.id) && h.name);
  return seededShuffle(pool, seed).slice(0, count).map((h) => h.name);
}

function pickWrongLanes(correctLane, seed) {
  const pool = LANE_LABELS.filter((l) => l !== correctLane);
  return seededShuffle(pool, seed).slice(0, 2);
}

function buildQuestion(id, text, correctLabel, wrongLabels, seed, source) {
  const wrongs = wrongLabels.filter((w) => w && w !== correctLabel).slice(0, 2);
  while (wrongs.length < 2) wrongs.push('Không liên quan meta AOG');
  const shuffled = seededShuffle(
    [
      { label: correctLabel, correct: true },
      { label: wrongs[0], correct: false },
      { label: wrongs[1], correct: false },
    ],
    seed,
  );
  return {
    id,
    text,
    source,
    options: shuffled.map((o, i) => ({
      id: ['a', 'b', 'c'][i],
      label: o.label,
      correct: o.correct,
    })),
  };
}

/** Tier 1 — Đồng: glossary + basics */
export function buildTier1Questions() {
  const facts = [
    {
      text: '“Giáo án” trong Liên Quân VN thường nghĩa là?',
      correct: 'Build / trang bị theo pro hoặc guide',
      wrong: ['Bài tập về nhà', 'Tên map mới'],
      source: 'glossary:Giáo Án',
    },
    {
      text: 'AOG trong cộng đồng Liên Quân VN là gì?',
      correct: 'Giải đấu / meta pro Việt Nam',
      wrong: ['Tên một tướng', 'Loại giày trong shop'],
      source: 'term:AOG',
    },
    {
      text: 'Nakroth đi rừng nên mang spell nào?',
      correct: 'Trừng trị',
      wrong: ['Hồi máu', 'Tàng hình'],
      source: 'basic:jungle-smite',
    },
    {
      text: '“Khắc chế” (counter) trong meta nghĩa là?',
      correct: 'Chọn tướng có lợi thế đối đầu',
      wrong: ['Mua đồ rẻ hơn địch', 'Chat all để toxic'],
      source: 'glossary:Khắc chế',
    },
    {
      text: '“Bùa xanh” thường chỉ buff nào?',
      correct: 'Buff rừng xanh (blue) cho carry/mage',
      wrong: ['Buff Baron', 'Buff trụ'],
      source: 'glossary:Bùa xanh',
    },
    {
      text: '“Giao tranh tổng” nghĩa là?',
      correct: 'Teamfight 5v5 quyết định trận',
      wrong: ['Farm lane một mình', 'Đẩy lính không ai'],
      source: 'glossary:Giao tranh tổng',
    },
    {
      text: 'Ngọc / Arcana trong Liên Quân là gì?',
      correct: 'Bảng ngọc tăng chỉ số trước trận',
      wrong: ['Skin trang phục', 'Spell trừng trị'],
      source: 'glossary:Arcana',
    },
    {
      text: 'Thane trong meta AOG thường đi đường nào?',
      correct: 'SP',
      wrong: ['Mid', 'Rừng'],
      source: 'hero:thane:lane',
    },
    {
      text: '“Đẩy lén / trộm trụ” nghĩa là?',
      correct: 'Split push / ăn trụ khi địch mất tập trung',
      wrong: ['All-in 1v5 giữa đường', 'Bán đồ khi thua'],
      source: 'glossary:Đẩy lén',
    },
    {
      text: 'Raz mid early nên ưu tiên gì?',
      correct: 'Poke bằng skill, giữ khoảng cách',
      wrong: ['Melee trade liên tục', 'Bỏ lane đi support từ phút 1'],
      source: 'hero:raz:tip',
    },
  ];

  return facts.map((f, i) =>
    buildQuestion(`t1-q${i + 1}`, f.text, f.correct, f.wrong, 1000 + i, f.source),
  );
}

/** Tier 2 — lane + tier basics (meta 15) */
export function buildTier2Questions() {
  const picks = seededShuffle(META, 2000).slice(0, 10);
  return picks.map((h, i) => {
    const wrong = pickWrongLanes(h.position, 2100 + i);
    return buildQuestion(
      `t2-q${i + 1}`,
      `${h.name} trong meta AOG nambac thường đi đường nào?`,
      h.position,
      wrong,
      2200 + i,
      `hero:${h.id}:lane`,
    );
  });
}

/** Tier 3 — counter pick (meta 15) */
export function buildTier3Questions() {
  const picks = seededShuffle(META, 3000).slice(0, 10);
  return picks.map((h, i) => {
    const counterId = h.counters?.[0];
    const counter = getHero(counterId);
    const correct = counter?.name || 'Không rõ';
    const exclude = new Set([h.id, ...(h.counters || [])]);
    const wrong = pickWrongHeroes(exclude, 2, 3100 + i);
    return buildQuestion(
      `t3-q${i + 1}`,
      `Theo cẩm nang nambac, tướng nào counter ${h.name} phổ biến?`,
      correct,
      wrong,
      3200 + i,
      `hero:${h.id}:counter:${counterId}`,
    );
  });
}

/** Tier 4 — tips & counter notes */
export function buildTier4Questions() {
  const stubs = [];
  META.forEach((h) => {
    if (h.tip) {
      stubs.push({
        hero: h,
        text: `Mẹo đối đầu ${h.name}: điều nào đúng nhất?`,
        correct: shortenTip(h.tip),
        wrong: [
          'All-in level 1 bất kể trang bị',
          'Bỏ qua wave, chỉ đi rừng địch',
        ],
        source: `hero:${h.id}:tip`,
        seed: 4000 + stubs.length,
      });
    }
    (h.counters || []).forEach((cid, idx) => {
      const note = h.counterNotes?.[idx];
      const counter = getHero(cid);
      if (!note || !counter) return;
      stubs.push({
        hero: h,
        text: `Gặp ${h.name}, ${counter.name} nên làm gì?`,
        correct: note,
        wrong: [
          'Đứng giữa đường farm không né skill',
          'Bay vào 1v5 khi chưa có vision',
        ],
        source: `hero:${h.id}:note:${cid}`,
        seed: 4100 + stubs.length,
      });
    });
  });

  return seededShuffle(stubs, 4200)
    .slice(0, 10)
    .map((s, i) =>
      buildQuestion(`t4-q${i + 1}`, s.text, s.correct, s.wrong, s.seed + i, s.source),
    );
}

function shortenTip(tip) {
  const t = String(tip || '').trim();
  if (t.length <= 90) return t;
  const cut = t.slice(0, 87);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trim()}…`;
}

/** Tier 5 — pro giáo án */
export function buildTier5Questions() {
  const giaoByHero = Object.fromEntries(GIAO_ANS.map((g) => [g.heroId, g]));
  const stubs = [];

  META.forEach((h) => {
    const ga = giaoByHero[h.id];
    if (!ga) return;
    const boots = ga.items?.find((it) => it.startsWith('Giày') || it.startsWith('Đại Địa'))
      || ga.items?.[1]
      || ga.items?.[0];
    stubs.push({
      text: `Giáo án pro ${h.name} trên nambac — giày/support đầu tiên thường là?`,
      correct: boots || 'Giày Kiên Cường',
      wrong: pickWrongItems([boots], 2, 5000 + stubs.length),
      source: `giao:${h.id}:boots`,
      seed: 5100 + stubs.length,
    });
    stubs.push({
      text: `Ai là tác giả giáo án ${h.name} trên nambac?`,
      correct: ga.player || h.giao_an?.author,
      wrong: ['Pro ẩn danh', 'Garena Official'],
      source: `giao:${h.id}:author`,
      seed: 5200 + stubs.length,
    });
    if (ga.spell) {
      stubs.push({
        text: `Phù hiệu (rune) trong giáo án ${h.name}?`,
        correct: ga.spell,
        wrong: ['Không cần rune', 'Rune ngẫu nhiên'],
        source: `giao:${h.id}:rune`,
        seed: 5300 + stubs.length,
      });
    }
  });

  return seededShuffle(stubs, 5400)
    .slice(0, 10)
    .map((s, i) =>
      buildQuestion(`t5-q${i + 1}`, s.text, s.correct, s.wrong, s.seed + i, s.source),
    );
}

const ALL_ITEMS = [
  ...Object.keys(glossary.physical || {}),
  ...Object.keys(glossary.magic || {}),
  ...Object.keys(glossary.defense || {}),
  ...Object.keys(glossary.boots_support || {}),
];

function pickWrongItems(exclude, count, seed) {
  const ex = new Set(exclude.filter(Boolean));
  const pool = ALL_ITEMS.filter((it) => !ex.has(it));
  return seededShuffle(pool, seed).slice(0, count);
}

export function buildAllTierStubs() {
  return {
    1: buildTier1Questions(),
    2: buildTier2Questions(),
    3: buildTier3Questions(),
    4: buildTier4Questions(),
    5: buildTier5Questions(),
  };
}
