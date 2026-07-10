/** Lane tier boards — AOG-flavored meta snapshot from heroes.json (entertainment). */
export const LANES = [
  { id: 'top', label: 'Top' },
  { id: 'jungle', label: 'Rừng' },
  { id: 'mid', label: 'Mid' },
  { id: 'adc', label: 'AD' },
  { id: 'sp', label: 'Sp' },
];

/** Featured picks per lane — 15 meta heroes */
export const TIER_BOARD = {
  updatedAt: '2026-07-10',
  label: 'Meta AOG 2026 (tham khảo)',
  byLane: {
    top: ['florentino', 'yena', 'zuka', 'omen'],
    jungle: ['keera', 'aoi', 'nakroth', 'yan'],
    mid: ['liliana', 'raz', 'krixi'],
    adc: ['hayate', 'elsu', 'violet'],
    sp: ['thane'],
  },
};

export function getLaneHeroIds(laneId) {
  return TIER_BOARD.byLane[laneId] || [];
}
