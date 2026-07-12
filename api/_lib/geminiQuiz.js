import {
  generateQuizContent as generateQuizContentShared,
  formatQuizForDb,
  pickDailyCategory,
  validateQuizPayload,
  QUIZ_AI_VALIDATE_OPTS,
} from '../../shared/quizPrompts.js';

export { formatQuizForDb, pickDailyCategory, validateQuizPayload, QUIZ_AI_VALIDATE_OPTS };

function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

export async function generateQuizContent(categoryId, customTopic = '') {
  return generateQuizContentShared({
    apiKey: getApiKey(),
    openrouterKey: process.env.OPENROUTER_API_KEY || '',
    categoryId,
    customTopic,
  });
}
