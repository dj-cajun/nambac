/** Pro-style giáo án + match list (curated, entertainment).
 * Item names use common Vietnamese Liên Quân shop labels (tham khảo).
 */
export const MATCHES = [
  {
    id: 'sgp-1s-2026-07-10',
    title: 'SGP vs 1S',
    date: '2026-07-10',
    note: 'Giao hữu / meta mẫu',
  },
  {
    id: 'fl-sgp-2026-07-08',
    title: 'FL vs SGP',
    date: '2026-07-08',
    note: 'Giao hữu / meta mẫu',
  },
];

function buildCopy(hero, items, arcana, spell) {
  return `${hero} | ${items.join(' > ')} | Arcana: ${arcana} | Spell: ${spell} | nambac giáo án`;
}

export const GIAO_ANS = [
  {
    id: 'ga-flo-sgp',
    matchId: 'sgp-1s-2026-07-10',
    player: 'SGP · Top',
    team: 'Saigon Phantom',
    heroId: 'florentino',
    items: [
      'Giày Hermes',
      'Thương Long Đao',
      'Giáp Thịnh Nộ',
      'Lưỡi Hái Tử Thần',
      'Nanh Fenrir',
      'Khiên Hy Lạp',
    ],
    arcana: 'Công · Xuyên giáp · Tốc đánh',
    spell: 'Cấp tốc',
    copyCode: '',
  },
  {
    id: 'ga-nak-1s',
    matchId: 'sgp-1s-2026-07-10',
    player: '1S · Jungle',
    team: 'One Star',
    heroId: 'nakroth',
    items: [
      'Giày Hermes',
      'Lưỡi Dao Manraban',
      'Nanh Fenrir',
      'Cung Tà Thần',
      'Xà Cốt',
      'Giáp Thịnh Nộ',
    ],
    arcana: 'Công · Xuyên giáp · Tốc đánh',
    spell: 'Trừng trị',
    copyCode: '',
  },
  {
    id: 'ga-raz-fl',
    matchId: 'fl-sgp-2026-07-08',
    player: 'FL · Mid',
    team: 'Team Flash',
    heroId: 'raz',
    items: [
      'Giày Thuật Sĩ',
      'Tháp Cổ',
      'Quyền Trượng Băng',
      'Sách Thánh',
      'Vương Miện Hecate',
      'Giáp Solomon',
    ],
    arcana: 'Phép · Xuyên phép · Giảm CD',
    spell: 'Cấp tốc',
    copyCode: '',
  },
  {
    id: 'ga-elsu-sgp',
    matchId: 'fl-sgp-2026-07-08',
    player: 'SGP · AD',
    team: 'Saigon Phantom',
    heroId: 'elsu',
    items: [
      'Giày Hermes',
      'Cung Tà Thần',
      'Lưỡi Dao Manraban',
      'Nanh Fenrir',
      'Xà Cốt',
      'Giáp Thịnh Nộ',
    ],
    arcana: 'Công · Xuyên giáp · Tốc đánh',
    spell: 'Làm chậm',
    copyCode: '',
  },
  {
    id: 'ga-xen-1s',
    matchId: 'sgp-1s-2026-07-10',
    player: '1S · Sp',
    team: 'One Star',
    heroId: 'xeniel',
    items: [
      'Giày Kiên Cường',
      'Khiên Hy Lạp',
      'Giáp Solomon',
      'Áo Choàng Băng',
      'Khiên Hộ Mệnh',
      'Huyền Thoại Medusa',
    ],
    arcana: 'Máu · Giáp · Giảm CD',
    spell: 'Cấp tốc',
    copyCode: '',
  },
  {
    id: 'ga-murad-fl',
    matchId: 'fl-sgp-2026-07-08',
    player: 'FL · Jungle',
    team: 'Team Flash',
    heroId: 'murad',
    items: [
      'Giày Hermes',
      'Lưỡi Dao Manraban',
      'Nanh Fenrir',
      'Cung Tà Thần',
      'Thương Long Đao',
      'Giáp Thịnh Nộ',
    ],
    arcana: 'Công · Xuyên giáp · Tốc đánh',
    spell: 'Trừng trị',
    copyCode: '',
  },
];

for (const g of GIAO_ANS) {
  const heroName = {
    florentino: 'Florentino',
    nakroth: 'Nakroth',
    raz: 'Raz',
    elsu: 'Elsu',
    xeniel: 'Xeniel',
    murad: 'Murad',
  }[g.heroId] || g.heroId;
  g.copyCode = buildCopy(heroName, g.items, g.arcana, g.spell);
}

export function getMatch(id) {
  return MATCHES.find((m) => m.id === id) || null;
}

export function getGiaoAnsForMatch(matchId) {
  return GIAO_ANS.filter((g) => g.matchId === matchId);
}

export function getGiaoAn(id) {
  return GIAO_ANS.find((g) => g.id === id) || null;
}
