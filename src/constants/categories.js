// Quiz Categories (공통 사용 - Home, Admin 모두 동일)
export const QUIZ_CATEGORIES = [
    { id: 'MBTI', label: 'Tính Cách (MBTI)', labelKo: 'MBTI', color: 'bg-purple-100', emoji: '🧠', prompt: 'Create a deep psychological MBTI personality test.' },
    { id: 'Fortune', label: 'Bói Toán (Tarot)', labelKo: '운세', color: 'bg-indigo-100', emoji: '🔮', prompt: 'Create a fortune telling tarot reading quiz.' },
    { id: 'PastLife', label: 'Kiếp Trước', labelKo: '전생', color: 'bg-orange-100', emoji: '👻', prompt: 'Create a past life regression test.' },
    { id: 'Trend_Hunter', label: 'Đu Trend', labelKo: '트렌드', color: 'bg-yellow-100', emoji: '✨', prompt: 'Create a viral gen-z trend test.' },
    { id: 'Linker_Lookalike', label: 'Ai Giống Tui?', labelKo: '닮은꼴', color: 'bg-pink-100', emoji: '👯', prompt: 'Create a celebrity lookalike visual test.' },
    { id: 'Delivery_King', label: 'Ông Hoàng Delivery', labelKo: '배달왕', color: 'bg-green-100', emoji: '🛵', prompt: 'Create a food delivery preference test.' },
    { id: 'HCMC_Guide', label: 'HCMC Guide', labelKo: '호치민 가이드', color: 'bg-lime-100', emoji: '🏙️', prompt: 'Create a city guide quiz for HCMC.' },
];

// Home-only special tabs (Magazine, All)
export const HOME_SPECIAL_TABS = [
    { id: 'all', label: 'Tất cả', color: 'bg-white' },
];

// AI Service Categories (Admin only)
export const SERVICE_CATEGORIES = [
    { id: 'Visual', label: 'Visual / Face' },
    { id: 'Fortune', label: 'Fortune / Tarot' },
    { id: 'Fun', label: 'Fun / Anime' },
    { id: 'Utility', label: 'Utility' },
];

// Helper: Get all filter types for Admin (includes 'all')
export const getFilterTypes = () => ['all', ...QUIZ_CATEGORIES.map(c => c.id)];

// Helper: Get category label by ID
export const getCategoryLabel = (id) => {
    const cat = QUIZ_CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : id;
};

// Helper: Get personas for Admin AI Generation (derived from QUIZ_CATEGORIES)
export const getPersonas = () => QUIZ_CATEGORIES.map(cat => ({
    name: `${cat.emoji} ${cat.labelKo}`,
    prompt: cat.prompt,
    category: cat.id,
    emoji: cat.emoji,
}));
