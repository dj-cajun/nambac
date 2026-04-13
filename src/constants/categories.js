// Quiz Categories (공통 사용 - Home, Admin 모두 동일)
export const QUIZ_CATEGORIES = [
    { id: 'MBTI', label: 'MBTI 🧠', labelKo: 'MBTI', color: 'bg-purple-100', emoji: '🧠' },
    { id: 'Personality', label: 'Tính Cách 🎭', labelKo: '성격', color: 'bg-violet-100', emoji: '🎭' },
    { id: 'Fortune', label: 'Bói Toán 🔮', labelKo: '운세', color: 'bg-indigo-100', emoji: '🔮' },
    { id: 'PastLife', label: 'Kiếp Trước 🧞', labelKo: '전생', color: 'bg-orange-100', emoji: '🧞' },
    { id: 'Survival', label: 'Sinh Tồn 🏋️', labelKo: '생존', color: 'bg-lime-100', emoji: '🏋️' },
    { id: 'Trendy', label: 'Xu Hướng 🔥', labelKo: '트렌드', color: 'bg-yellow-100', emoji: '🔥' },
    { id: 'Delivery', label: 'Giao Hàng 🛵', labelKo: '배달', color: 'bg-green-100', emoji: '🛵' },
    { id: 'Lookalike', label: 'Ai Giống? 🔗', labelKo: '닮은꼴', color: 'bg-pink-100', emoji: '🔗' },
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
