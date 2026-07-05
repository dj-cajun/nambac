import { requireAdmin } from '../adminAuth.js';
import { generateAllQuizImages } from '../quizImages.js';

/**
 * POST /api/admin/generate-quiz-images
 * Body: { title, description, category, questions[], results[], idPrefix?, skipQuestions?, withQuestions? }
 * Gemini → 9 manga prompts (cover + 8 results) → OpenRouter images.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { title, description, category, questions, results, idPrefix, skipQuestions, withQuestions, delayMs } = body;

    if (!title?.trim() || !questions?.length || !results?.length) {
      return res.status(400).json({ error: 'title, questions, and results are required' });
    }

    const quiz = {
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'Personality',
      questions,
      results,
    };

    const images = await generateAllQuizImages({
      quiz,
      idPrefix: idPrefix || 'editor',
      delayMs: delayMs ?? 2500,
      skipQuestions: withQuestions ? false : skipQuestions !== false,
    });

    return res.status(200).json({ ok: true, images });
  } catch (err) {
    console.error('POST /api/admin/generate-quiz-images', err);
    return res.status(500).json({ error: err.message || 'Quiz image generation failed' });
  }
}
