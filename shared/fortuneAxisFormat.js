/**
 * Per-axis fortune display — reframes shared archetype pool for love/money/health/general.
 * Base text: fortuneData.js (20). Axis lead + compat labels applied at read time.
 */
import { getFortuneBrand, normalizeFortuneAxis } from './fortuneMeta.js';

const AXIS_BODY_LEADS = Object.freeze({
  love: [],
  money: [
    'Tài lộc hôm nay ping đỏ: ',
    'Ví tiền & chi tiêu đang drama: ',
    'Chỉ số tài chính Gen Z: ',
    'Vũ trụ ví mỏng báo động: ',
    'Cashflow Sài Gòn hôm nay: ',
  ],
  health: [
    'Năng lượng & sức khỏe hôm nay: ',
    'Pin cơ thể + tinh thần: ',
    'Chỉ số burnout Gen Z: ',
    'Vũ trụ bảo bạn nghỉ ngơi: ',
    'Social battery & giấc ngủ: ',
  ],
  general: [
    'Vận tổng quan hôm nay: ',
    'Tổng thể ngày của bạn: ',
    'Big picture Sài Gòn: ',
    'Plot twist tổng hợp: ',
    'Vibe chung hôm nay: ',
  ],
});

const AXIS_COMPAT_LABELS = Object.freeze({
  love: { good: 'Cứu tinh tình yêu', bad: 'Báo thủ tình cảm' },
  money: { good: 'Quý nhân tài lộc', bad: 'Hố đen chi tiêu' },
  health: { good: 'Người cho bạn nạp pin', bad: 'Kẻ hút social battery' },
  general: { good: 'Vận đỏ', bad: 'Vận xui' },
});

/** @param {import('./fortuneData.js').FORTUNE_ARCHETYPES[0]} fortune */
export function formatFortuneForAxis(fortune, axis = 'love') {
  if (!fortune) return fortune;
  const ax = normalizeFortuneAxis(axis);
  const brand = getFortuneBrand(ax);
  const leads = AXIS_BODY_LEADS[ax] || [];
  const lead = leads.length ? leads[fortune.id % leads.length] : '';
  const labels = AXIS_COMPAT_LABELS[ax] || AXIS_COMPAT_LABELS.general;

  return {
    ...fortune,
    axis: ax,
    axisLabel: brand.label,
    axisEmoji: brand.emoji,
    body: lead ? `${lead}${fortune.body}` : fortune.body,
    compatGoodLabel: labels.good,
    compatBadLabel: labels.bad,
  };
}
