export { SBTI_UI } from './ui-text.vi.js';
export {
  scoreAnswers,
  computeResult,
  getType,
  getAllTypes,
  DRUNK_TRIGGER_QUESTION_ID,
  DIMENSION_ORDER,
} from './scoring.js';
export { computeMbtiType, getCrossMbti, MBTI_NICKNAMES } from './cross-mbti.js';
export { ZODIAC_SIGNS, getCrossZodiac, getAllCrossZodiacForType } from './cross-zodiac.js';

export { default as SBTI_QUESTIONS } from './questions.vi.json' with { type: 'json' };
export { default as SBTI_SPECIAL_QUESTIONS } from './special-questions.vi.json' with { type: 'json' };
export { default as SBTI_TYPES } from './types.vi.json' with { type: 'json' };
export { default as SBTI_PATTERNS } from './patterns.json' with { type: 'json' };
export { default as SBTI_DIMENSIONS } from './dimensions.vi.json' with { type: 'json' };
export { default as SBTI_MBTI_QUESTIONS } from './mbti-questions.vi.json' with { type: 'json' };
