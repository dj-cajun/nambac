/**
 * GitHub-inspired quiz archetypes (topics: personality-test, mbti).
 * Used by Admin one-click factory + Gemini prompts.
 */

export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export const MBTI_DIMENSIONS = ['EI', 'SN', 'TF', 'JP'];

/** @typedef {'mbti' | 'personality'} ArchetypeGroup */

/**
 * @type {Array<{
 *   id: string,
 *   group: ArchetypeGroup,
 *   label: string,
 *   labelKo: string,
 *   emoji: string,
 *   category: string,
 *   quiz_type: 'binary_5q' | 'mbti_12q',
 *   githubTopic: string,
 *   topicPrompt: string,
 *   resultFramework: string,
 * }>}
 */
export const PERSONALITY_ARCHETYPES = [
  {
    id: 'mbti_ei_battery',
    group: 'mbti',
    label: 'E/I Pin Xã Hội',
    labelKo: 'E/I 소셜 배터리',
    emoji: '🔋',
    category: 'MBTI',
    quiz_type: 'binary_5q',
    githubTopic: 'mbti',
    topicPrompt:
      'Social battery / Introvert vs Extrovert test inspired by GitHub MBTI repos. Ho Chi Minh weekend habits: Thao Dien rooftop vs home recharge, Grab small talk, Zalo reply speed.',
    resultFramework:
      '8 levels (score 0–7): introvert hermit → extrovert party main. Reference MBTI I/E energy. Titles may include MBTI-style nicknames (e.g. INTJ Hermit, ESTP Party Main).',
  },
  {
    id: 'mbti_sn_reality',
    group: 'mbti',
    label: 'S/N Thực Tế vs Mơ',
    labelKo: 'S/N 현실 vs 상상',
    emoji: '🎯',
    category: 'MBTI',
    quiz_type: 'binary_5q',
    githubTopic: 'mbti',
    topicPrompt:
      'Sensing vs Intuition (S/N) lite test — practical vs visionary. Saigon context: TikTok cafe hype vs spreadsheet budgeting, flood routes vs aesthetic stories.',
    resultFramework:
      '8 levels from pure S (facts, checklist, grounded) to pure N (ideas, vibes, vision). Use MBTI S/N personality nicknames in titles.',
  },
  {
    id: 'mbti_tf_logic',
    group: 'mbti',
    label: 'T/F Logic vs Cảm Xúc',
    labelKo: 'T/F 논리 vs 감정',
    emoji: '⚖️',
    category: 'MBTI',
    quiz_type: 'binary_5q',
    githubTopic: 'mbti',
    topicPrompt:
      'Thinking vs Feeling (T/F) lite — logic vs empathy in relationships and work. Saigon: friend drama advice, office conflict, family Zalo group.',
    resultFramework:
      '8 levels from cold logic (T) to emotional reactor (F). MBTI-style result titles with T/F flavor.',
  },
  {
    id: 'mbti_jp_planner',
    group: 'mbti',
    label: 'J/P Kế Hoạch vs Spontaneous',
    labelKo: 'J/P 계획 vs 즉흥',
    emoji: '📅',
    category: 'MBTI',
    quiz_type: 'binary_5q',
    githubTopic: 'mbti',
    topicPrompt:
      'Judging vs Perceiving (J/P) lite — planner vs spontaneous. Saigon: trip planning, deadline culture, "đi đâu cũng được" energy.',
    resultFramework:
      '8 levels from strict planner (J) to chaos spontaneous (P). MBTI J/P nicknames in titles.',
  },
  {
    id: 'mbti_full_16',
    group: 'mbti',
    label: 'MBTI 16 Kiểu (12 câu)',
    labelKo: 'MBTI 16유형 (12문항)',
    emoji: '🧠',
    category: 'MBTI',
    quiz_type: 'mbti_12q',
    githubTopic: 'mbti',
    topicPrompt:
      'Full 16-type MBTI test like popular GitHub mbti repos: 12 questions (3 per dimension EI, SN, TF, JP). Ho Chi Minh Gen Z daily situations.',
    resultFramework:
      'Exactly 16 results — one per MBTI type (INTJ … ESFP). Each title MUST start with the 4-letter code, e.g. "ENFP — Main Character Sài Gòn".',
  },
  {
    id: 'personality_love_language',
    group: 'personality',
    label: 'Love Language Việt',
    labelKo: '러브 랭귀지',
    emoji: '💌',
    category: 'Personality',
    quiz_type: 'binary_5q',
    githubTopic: 'personality-test',
    topicPrompt:
      'Love language quiz (words, acts, gifts, time, touch) trending on GitHub personality-test topic. Vietnamese dating culture: Grab surprise, Zalo meme, hand-hold, rooftop dates.',
    resultFramework:
      '8 love-language mixes from minimal expresser (0) to chaos romance (7). Reference acts of service, quality time, words, gifts, physical touch.',
  },
  {
    id: 'personality_attachment',
    group: 'personality',
    label: 'Attachment Style',
    labelKo: '애착 유형',
    emoji: '🧲',
    category: 'Personality',
    quiz_type: 'binary_5q',
    githubTopic: 'personality-test',
    topicPrompt:
      'Attachment style (secure, anxious, avoidant, fearful) — viral on personality-test GitHub repos. Saigon dating: Zalo seen anxiety, "need space", ghosting vs secure.',
    resultFramework:
      '8 levels from secure chill (0) to chaos attached (7). Use attachment style labels in titles.',
  },
  {
    id: 'personality_main_character',
    group: 'personality',
    label: 'Main Character Energy',
    labelKo: '주인공 에너지',
    emoji: '🎬',
    category: 'Personality',
    quiz_type: 'binary_5q',
    githubTopic: 'personality-test',
    topicPrompt:
      'Main character energy / protagonist vs NPC meme quizzes popular on GitHub personality-test. Saigon: TikTok flex, drama queen/king, background friend energy.',
    resultFramework:
      '8 levels from NPC background (0) to full main character (7). Dramatic, shareable titles.',
  },
];

export function getArchetypeById(id) {
  return PERSONALITY_ARCHETYPES.find((a) => a.id === id) || null;
}

export function getArchetypesByGroup(group) {
  return PERSONALITY_ARCHETYPES.filter((a) => a.group === group);
}
