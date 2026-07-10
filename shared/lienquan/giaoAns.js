/** Pro-style giáo án + match list (curated, entertainment). */
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

export const GIAO_ANS = [
  {
    id: 'ga-flo-sgp',
    matchId: 'sgp-1s-2026-07-10',
    player: 'SGP · Top',
    team: 'Saigon Phantom',
    heroId: 'florentino',
    items: ['Giày', 'Kiếm máu', 'Giáp', 'Dame', 'Pen', 'Máy hồi'],
    arcana: 'Công · Xuyên · Tốc đánh',
    spell: 'Cấp tốc',
    copyCode:
      'Florentino | Giày > Kiếm máu > Giáp > Dame > Pen > Máy hồi | Arcana: Công/Xuyên/TĐ | Spell: Cấp tốc | nambac giáo án',
  },
  {
    id: 'ga-nak-1s',
    matchId: 'sgp-1s-2026-07-10',
    player: '1S · Jungle',
    team: 'One Star',
    heroId: 'nakroth',
    items: ['Giày', 'Dame', 'Pen', 'Máu', 'Crit', 'Giáp'],
    arcana: 'Công · Xuyên · Tốc đánh',
    spell: 'Trừng trị',
    copyCode:
      'Nakroth | Giày > Dame > Pen > Máu > Crit > Giáp | Arcana: Công/Xuyên/TĐ | Spell: Trừng trị | nambac giáo án',
  },
  {
    id: 'ga-raz-fl',
    matchId: 'fl-sgp-2026-07-08',
    player: 'FL · Mid',
    team: 'Team Flash',
    heroId: 'raz',
    items: ['Giày', 'AP', 'Pen phép', 'Máu', 'CD', 'Giáp phép'],
    arcana: 'Phép · Xuyên phép · CD',
    spell: 'Cấp tốc',
    copyCode:
      'Raz | Giày > AP > Pen phép > Máu > CD > Giáp phép | Arcana: Phép/Xuyên/CD | Spell: Cấp tốc | nambac giáo án',
  },
  {
    id: 'ga-elsu-sgp',
    matchId: 'fl-sgp-2026-07-08',
    player: 'SGP · AD',
    team: 'Saigon Phantom',
    heroId: 'elsu',
    items: ['Giày', 'Công', 'Crit', 'Pen', 'Máu', 'Giáp'],
    arcana: 'Công · Xuyên · Tốc đánh',
    spell: 'Làm chậm',
    copyCode:
      'Elsu | Giày > Công > Crit > Pen > Máu > Giáp | Arcana: Công/Xuyên/TĐ | Spell: Làm chậm | nambac giáo án',
  },
  {
    id: 'ga-xen-1s',
    matchId: 'sgp-1s-2026-07-10',
    player: '1S · Sp',
    team: 'One Star',
    heroId: 'xeniel',
    items: ['Giày', 'Giáp', 'Máu', 'CD', 'Giáp phép', 'Aura'],
    arcana: 'Máu · Giáp · CD',
    spell: 'Cấp tốc',
    copyCode:
      'Xeniel | Giày > Giáp > Máu > CD > Giáp phép > Aura | Arcana: Máu/Giáp/CD | Spell: Cấp tốc | nambac giáo án',
  },
  {
    id: 'ga-murad-fl',
    matchId: 'fl-sgp-2026-07-08',
    player: 'FL · Jungle',
    team: 'Team Flash',
    heroId: 'murad',
    items: ['Giày', 'Dame', 'Pen', 'Crit', 'Máu', 'Giáp'],
    arcana: 'Công · Xuyên · Tốc đánh',
    spell: 'Trừng trị',
    copyCode:
      'Murad | Giày > Dame > Pen > Crit > Máu > Giáp | Arcana: Công/Xuyên/TĐ | Spell: Trừng trị | nambac giáo án',
  },
];

export function getMatch(id) {
  return MATCHES.find((m) => m.id === id) || null;
}

export function getGiaoAnsForMatch(matchId) {
  return GIAO_ANS.filter((g) => g.matchId === matchId);
}

export function getGiaoAn(id) {
  return GIAO_ANS.find((g) => g.id === id) || null;
}
