/** Active fortune vertical — shared engine; multi-axis support */

export const FORTUNE_KIND = 'love';

export const FORTUNE_AXES = Object.freeze({
  love: {
    id: 'love',
    label: 'Tình yêu',
    labelFull: 'Tử vi tình yêu bóc phốt',
    emoji: '💘',
    kicker: 'Tử vi tình yêu hàng ngày',
    heroLine: 'Điền tên + ngày sinh — Rút bài — Xem sự thật tình yêu tàn nhẫn hôm nay.',
    submitCta: 'Xem tình yêu hôm nay ⚡',
    compatTitle: '🔥 Cung hoàn sinh tồn tình yêu Sài Gòn hôm nay',
    metaDefault:
      'Nhập tên và ngày sinh — xem tình yêu hôm nay (hay drama tình cảm) Gen Z Sài Gòn. Cùng ngày cùng tên = cùng kết quả.',
    cardBadge: 'Tử vi tình yêu',
  },
  money: {
    id: 'money',
    label: 'Tiền bạc',
    labelFull: 'Tử vi tiền bạc',
    emoji: '💸',
    kicker: 'Tử vi tiền bạc hàng ngày',
    heroLine: 'Điền tên + ngày sinh — Xem ví và tài lộc hôm nay có drama gì.',
    submitCta: 'Xem tiền bạc hôm nay 💰',
    compatTitle: '💰 Chỉ số tài lộc Sài Gòn hôm nay',
    metaDefault:
      'Nhập tên và ngày sinh — xem vận tiền bạc Gen Z Sài Gòn. Cùng ngày cùng tên = cùng kết quả.',
    cardBadge: 'Tử vi tiền bạc',
  },
  health: {
    id: 'health',
    label: 'Sức khỏe',
    labelFull: 'Tử vi sức khỏe',
    emoji: '🧘',
    kicker: 'Tử vi sức khỏe hàng ngày',
    heroLine: 'Điền tên + ngày sinh — Xem năng lượng và sức khỏe hôm nay.',
    submitCta: 'Xem sức khỏe hôm nay 🌿',
    compatTitle: '🌿 Chỉ số năng lượng Sài Gòn hôm nay',
    metaDefault:
      'Nhập tên và ngày sinh — xem vận sức khỏe Gen Z Sài Gòn. Cùng ngày cùng tên = cùng kết quả.',
    cardBadge: 'Tử vi sức khỏe',
  },
  general: {
    id: 'general',
    label: 'Tổng quan',
    labelFull: 'Tử vi tổng quan',
    emoji: '✨',
    kicker: 'Tử vi tổng quan hàng ngày',
    heroLine: 'Điền tên + ngày sinh — Xem vận tổng thể hôm nay.',
    submitCta: 'Xem tổng quan hôm nay ✨',
    compatTitle: '✨ Vận tổng quan Sài Gòn hôm nay',
    metaDefault:
      'Nhập tên và ngày sinh — xem tử vi tổng quan Gen Z Sài Gòn. Cùng ngày cùng tên = cùng kết quả.',
    cardBadge: 'Tử vi tổng quan',
  },
});

export const FORTUNE_AXIS_IDS = Object.freeze(Object.keys(FORTUNE_AXES));

/** @deprecated use FORTUNE_AXES[axis] — kept for existing imports */
export const FORTUNE_BRAND = FORTUNE_AXES.love;

export function normalizeFortuneAxis(raw) {
  const key = String(raw || FORTUNE_KIND).trim().toLowerCase();
  return FORTUNE_AXES[key] ? key : FORTUNE_KIND;
}

export function getFortuneBrand(axis = FORTUNE_KIND) {
  return FORTUNE_AXES[normalizeFortuneAxis(axis)];
}
