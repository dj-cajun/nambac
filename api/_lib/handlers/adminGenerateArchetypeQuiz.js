import { requireAdmin } from '../adminAuth.js';
import { createQuiz, insertQuestions, insertResults } from '../quizDb.js';
import { enrichArchetypeQuizImages } from '../enrichArchetypeImages.js';
import { canPersistQuizImages } from '../imagePersistence.js';
import { getArchetypeById } from '../../../shared/personalityArchetypes.js';
import {
  generateArchetypeQuizContent,
  validateArchetypePayload,
} from '../../../shared/quizPrompts.js';

import { getGeminiKey } from '../../../shared/geminiKeys.js';

/**
 * POST /api/admin/generate-archetype-quiz
 * Body: { archetypeId: string, generateImages?: boolean }
 * Saves quiz text first (~1–2 min), returns immediately; images run in background.
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
    const { archetypeId, generateImages = true } = body;

    const archetype = getArchetypeById(archetypeId);
    if (!archetype) {
      return res.status(400).json({ error: `Unknown archetypeId: ${archetypeId}` });
    }

    const apiKey = getGeminiKey();
    const openrouterKey = process.env.OPENROUTER_API_KEY || '';
    if (!apiKey && !openrouterKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY or OPENROUTER_API_KEY not configured' });
    }

    const payload = await generateArchetypeQuizContent({ apiKey, openrouterKey, archetype });
    const validationErrors = validateArchetypePayload(payload, archetype.quiz_type);
    if (validationErrors.length) {
      return res.status(422).json({ error: 'Quiz validation failed', details: validationErrors });
    }

    const placeholderResults = payload.results.map((r) => ({
      ...r,
      image_url: '/images/default_cover.png',
    }));

    const quiz = await createQuiz({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quiz_type: payload.quiz_type || archetype.quiz_type,
      image_url: '/images/default_cover.png',
    });
    await insertQuestions(quiz.id, payload.questions);
    await insertResults(quiz.id, placeholderResults);

    const response = {
      ok: true,
      id: quiz.id,
      title: payload.title,
      category: payload.category,
      quiz_type: payload.quiz_type,
      archetypeId: archetype.id,
      playUrl: `/quiz/${quiz.id}`,
      imagesPending: false,
    };

    const persistImages = canPersistQuizImages();
    const canGenerateImages = generateImages && (openrouterKey || apiKey) && persistImages;
    if (generateImages && !persistImages) {
      response.imagesSkippedReason =
        'Images must be generated locally: npm run images:backfill -- --quiz-id=' + quiz.id;
    }
    if (canGenerateImages) {
      response.imagesPending = true;
      res.status(201).json(response);
      enrichArchetypeQuizImages({
        quizId: quiz.id,
        archetype,
        payload,
        apiKey,
      }).catch((err) => {
        console.error('[archetype-images] background failed:', err.message || err);
      });
      return;
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error('POST /api/admin/generate-archetype-quiz', err);
    return res.status(500).json({ error: err.message || 'Archetype quiz generation failed' });
  }
}
