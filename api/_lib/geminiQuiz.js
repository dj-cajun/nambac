import {
  generateQuizContent as generateQuizContentShared,
  formatQuizForDb,
  pickDailyCategory,
  validateQuizPayload,
} from '../../shared/quizPrompts.js';

export { formatQuizForDb, pickDailyCategory, validateQuizPayload };

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

export async function generateQuizContent(categoryId, customTopic = '') {
  return generateQuizContentShared({
    apiKey: getApiKey(),
    categoryId,
    customTopic,
  });
}
