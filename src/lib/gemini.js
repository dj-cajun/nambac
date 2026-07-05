import { generateQuizContent as generateQuizContentShared } from '../../shared/quizPrompts.js';

/**
 * Gemini quiz generation — browser (Admin / QuizEditor).
 * Prompt source of truth: shared/quizPrompts.js
 */
export async function generateQuizContent(categoryId, customTopic = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please add it to your environment variables.');
  }

  try {
    return await generateQuizContentShared({ apiKey, categoryId, customTopic });
  } catch (error) {
    if (error.message?.includes('JSON')) {
      throw new Error('AI 생성 내용에 오류가 있습니다. 다시 시도해주세요. (JSON Parse Error)');
    }
    console.error('Gemini Generation Error:', error);
    throw error;
  }
}

export { formatQuizForDb, validateQuizPayload } from '../../shared/quizPrompts.js';
