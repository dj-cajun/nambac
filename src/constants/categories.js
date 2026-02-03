// Quiz Categories (공통 사용 - Home, Admin 모두 동일)
export const QUIZ_CATEGORIES = [
    { id: 'Love', label: 'Tình Yêu', labelKo: '연애', color: 'bg-pink-100', emoji: '💘', prompt: 'Create a romantic love compatibility test.' },
    { id: 'Personality', label: 'Tính Cách', labelKo: '성격', color: 'bg-purple-100', emoji: '🧠', prompt: 'Create a deep psychological personality test.' },
    { id: 'Career', label: 'Sự Nghiệp', labelKo: '커리어', color: 'bg-blue-100', emoji: '🚀', prompt: 'Create a career aptitude test for the future.' },
    { id: 'Trendy', label: 'Đu Trend', labelKo: '트렌디', color: 'bg-yellow-100', emoji: '✨', prompt: 'Create a viral gen-z trend test.' },
    { id: 'Food', label: 'Ăn Gì', labelKo: '음식', color: 'bg-orange-100', emoji: '🍳', prompt: 'Create a culinary taste preference test.' },
    { id: 'Travel', label: 'Vi Vu', labelKo: '여행', color: 'bg-green-100', emoji: '✈️', prompt: 'Create a travel destination personality test.' },
    { id: 'Pet', label: 'Boss & Sen', labelKo: '반려동물', color: 'bg-teal-100', emoji: '🐾', prompt: 'Create a pet companion compatibility test.' },
    { id: 'Survival', label: 'Sinh Tồn', labelKo: '서바이벌', color: 'bg-red-100', emoji: '🦸', prompt: 'Create a survival instinct and superpower test.' },
];

// Home-only special tabs (Magazine, All)
export const HOME_SPECIAL_TABS = [
    { id: 'Magazine', label: 'HCMC Guide', color: 'bg-lime-100' },
    { id: 'Total', label: 'Tất cả', color: 'bg-white' },
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
