/** Lane tier boards — AOG-flavored meta snapshot (entertainment). */
export const LANES = [
  { id: 'top', label: 'Top' },
  { id: 'jungle', label: 'Rừng' },
  { id: 'mid', label: 'Mid' },
  { id: 'adc', label: 'AD' },
  { id: 'sp', label: 'Sp' },
];

/** S+ / featured picks per lane for hub strip */
export const TIER_BOARD = {
  updatedAt: '2026-07-10',
  label: 'Meta AOG (tham khảo)',
  byLane: {
    top: ['florentino', 'veres', 'arum', 'wiro'],
    jungle: ['nakroth', 'murad', 'airi', 'butterfly'],
    mid: ['raz', 'natalya', 'tulen', 'krixi'],
    adc: ['elsu', 'violet', 'yorn', 'slimz'],
    sp: ['xeniel', 'annette', 'grakk', 'ormarr'],
  },
};

export function getLaneHeroIds(laneId) {
  return TIER_BOARD.byLane[laneId] || [];
}
