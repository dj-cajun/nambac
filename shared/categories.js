/**
 * Shared category normalization (API, frontend, migration scripts)
 * Must live outside /api — Vite proxies /api/* to the dev backend.
 */

export const QUIZ_CATEGORY_IDS = [
  'MBTI', 'Personality', 'PastLife', 'Fortune', 'Survival', 'Trendy', 'Delivery', 'Lookalike',
];

export const LEGACY_CATEGORY_ALIASES = {
  MBTI: ['mbti', 'MBTI', 'Tính Cách (MBTI)'],
  Personality: ['personality', 'Personality', 'Tính Cách', 'Lifestyle', 'lifestyle'],
  PastLife: ['pastlife', 'PastLife', 'Kiếp Trước', 'Tiền Kiếp'],
  Fortune: ['fortune', 'Fortune', 'Bói Toán', 'Bói', 'Bói Toán (Tarot)', 'tarot'],
  Survival: ['survival', 'Survival', 'Sinh Tồn', 'HCMC_Guide', 'hcmc_guide'],
  Trendy: ['trendy', 'Trendy', 'fun', 'Fun', 'trend', 'Trend', 'Xu Hướng', 'Trend_Hunter', 'Giải trí - Trà sữa'],
  Delivery: ['delivery', 'Delivery', 'Giao Hàng', 'Delivery_King'],
  Lookalike: ['lookalike', 'Lookalike', 'Ai Giống?', 'Linker_Lookalike', 'Tướng Mặt'],
};

const ALIAS_TO_CANONICAL = (() => {
  const map = new Map();
  for (const id of QUIZ_CATEGORY_IDS) map.set(id.toLowerCase(), id);
  for (const [canonical, aliases] of Object.entries(LEGACY_CATEGORY_ALIASES)) {
    for (const alias of aliases) map.set(String(alias).trim().toLowerCase(), canonical);
  }
  return map;
})();

export function normalizeCategory(raw) {
  if (!raw) return 'Personality';
  return ALIAS_TO_CANONICAL.get(String(raw).trim().toLowerCase()) || 'Personality';
}
