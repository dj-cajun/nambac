import { generateQuizContent, BINARY_5Q_SCORES } from '../../../shared/quizPrompts.js';
import { getGeminiKeys } from '../../../shared/geminiKeys.js';
import { getOpenRouterKey } from '../../../shared/llmJson.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const topic = req.query?.topic || req.body?.topic || '';
  if (!topic?.trim()) {
    return res.status(400).json({ error: 'topic is required' });
  }

  try {
    const geminiKeys = getGeminiKeys();
    const openrouterKey = getOpenRouterKey();

    const quizContent = await generateQuizContent({
      apiKey: geminiKeys[0] || '',
      openrouterKey,
      categoryId: 'Personality',
      customTopic: topic.trim(),
    });

    const quizId = `instant-${Date.now()}`;

    const formattedQuiz = {
      id: quizId,
      title: quizContent.title,
      description: quizContent.description,
      category: quizContent.category,
      quiz_type: 'binary_5q',
      image_url: '/images/default_cover.png',
    };

    const formattedQuestions = quizContent.questions.map((q, index) => {
      const [score_a, score_b] = BINARY_5Q_SCORES[index] || [0, 0];
      return {
        id: `${quizId}-q-${index + 1}`,
        quiz_id: quizId,
        order_number: index + 1,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        score_a,
        score_b,
      };
    });

    const formattedResults = quizContent.results.map((r) => ({
      id: `${quizId}-r-${r.score}`,
      quiz_id: quizId,
      result_code: r.score,
      title: r.type_name,
      type_name: r.type_name,
      description: r.description,
      traits: r.traits,
      image_url: '/images/default_cover.png',
    }));

    return res.status(200).json({
      quiz: formattedQuiz,
      questions: formattedQuestions,
      results: formattedResults,
    });
  } catch (err) {
    console.error('[AI Instant Quiz]', err);
    return res.status(500).json({ error: 'Failed to generate instant quiz', details: err.message });
  }
}
