// Quiz Categories — single source of truth (Home, Admin, QuizEditor, Gemini)
// Normalization: shared/categories.js (not under /api — Vite proxy conflict)

import {
  QUIZ_CATEGORY_IDS,
  LEGACY_CATEGORY_ALIASES,
  normalizeCategory,
} from '../../shared/categories.js';

export { QUIZ_CATEGORY_IDS, LEGACY_CATEGORY_ALIASES, normalizeCategory };

export const QUIZ_CATEGORIES = [
  { id: 'MBTI', label: 'MBTI 🧠', labelKo: 'MBTI', color: 'bg-purple-100', emoji: '🧠', prompt: 'MBTI' },
  { id: 'Personality', label: 'Tính Cách 🎭', labelKo: '성격', color: 'bg-violet-100', emoji: '🎭', prompt: 'Personality' },
  { id: 'PastLife', label: 'Kiếp Trước 🧞', labelKo: '전생', color: 'bg-orange-100', emoji: '🧞', prompt: 'PastLife' },
  { id: 'Fortune', label: 'Bói Toán 🔮', labelKo: '운세', color: 'bg-indigo-100', emoji: '🔮', prompt: 'Fortune' },
  { id: 'Survival', label: 'Sinh Tồn 🏋️', labelKo: '생존', color: 'bg-lime-100', emoji: '🏋️', prompt: 'Survival' },
  { id: 'Trendy', label: 'Xu Hướng 🔥', labelKo: '트렌드', color: 'bg-yellow-100', emoji: '🔥', prompt: 'Trendy' },
  { id: 'Delivery', label: 'Giao Hàng 🛵', labelKo: '배달', color: 'bg-green-100', emoji: '🛵', prompt: 'Delivery' },
  { id: 'Lookalike', label: 'Ai Giống? 🔗', labelKo: '닮은꼴', color: 'bg-pink-100', emoji: '🔗', prompt: 'Lookalike' },
];

export const DEFAULT_QUIZ_CATEGORY = 'Personality';

export function matchesCategory(quizCategory, filterId) {
  if (!filterId || filterId === 'all') return true;
  return normalizeCategory(quizCategory) === filterId;
}

export const HOME_SPECIAL_TABS = [
  { id: 'all', label: 'Tất cả', color: 'bg-white' },
];

export const getFilterTypes = () => ['all', ...QUIZ_CATEGORY_IDS];

export const getCategoryLabel = (id) => {
  const canonical = normalizeCategory(id);
  const cat = QUIZ_CATEGORIES.find((c) => c.id === canonical);
  return cat ? cat.label : canonical;
};

export function getCategoryMeta(id) {
  if (!id) return null;
  const canonical = normalizeCategory(id);
  return QUIZ_CATEGORIES.find((c) => c.id === canonical) || null;
}

export const getPersonas = () => QUIZ_CATEGORIES.map((cat) => ({
  name: cat.id,
  prompt: cat.prompt,
  category: cat.id,
  emoji: cat.emoji,
  labelKo: cat.labelKo,
}));
