import { requireAdmin } from '../adminAuth.js';
import { createQuiz, insertQuestions, insertResults } from '../quizDb.js';
import { generateAllQuizImages } from '../quizImages.js';
import { getArchetypeById } from '../../../shared/personalityArchetypes.js';
import {
  generateArchetypeQuizContent,
  validateArchetypePayload,
} from '../../../shared/quizPrompts.js';

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

/**
 * POST /api/admin/generate-archetype-quiz
 * Body: { archetypeId: string, generateImages?: boolean }
 * One-click GitHub-style MBTI / personality quiz factory.
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

    let coverUrl = '/images/default_cover.png';
    let resultsWithImages = payload.results.map((r) => ({
      ...r,
      image_url: '/images/default_cover.png',
    }));

    if (generateImages && process.env.OPENROUTER_API_KEY) {
      try {
        if (archetype.quiz_type === 'mbti_12q') {
          const { generateOpenRouterImage } = await import('../openrouterImage.js');
          const { finalizeImagePrompt, coverPrompt } = await import('../../../shared/imagePrompts.js');
          const { generateQuizImagePrompts } = await import('../../../shared/imagePromptEngine.js');
          let coverPromptText;
          try {
            const generated = await generateQuizImagePrompts({
              geminiKey: apiKey,
              openrouterKey: process.env.OPENROUTER_API_KEY,
              quiz: {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                questions: [],
                results: payload.results.slice(0, 8),
              },
              skipQuestions: true,
            });
            coverPromptText = finalizeImagePrompt(generated.cover);
          } catch {
            coverPromptText = finalizeImagePrompt(
              coverPrompt({
                title: payload.title,
                description: payload.description,
                category: payload.category,
              }),
            );
          }
          const { b64 } = await generateOpenRouterImage(coverPromptText);
          const fs = await import('fs');
          const path = await import('path');
          const { fileURLToPath } = await import('url');
          const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
          const filename = `arch_${archetypeId.slice(0, 8)}_cover_${Date.now()}.png`;
          fs.writeFileSync(path.join(root, 'public', 'images', filename), Buffer.from(b64, 'base64'));
          coverUrl = `/images/${filename}`;
        } else {
          const images = await generateAllQuizImages({
            quiz: {
              title: payload.title,
              description: payload.description,
              category: payload.category,
              questions: payload.questions,
              results: payload.results,
            },
            idPrefix: `arch_${archetypeId.slice(0, 8)}`,
            delayMs: 2500,
            skipQuestions: true,
          });
          if (images.cover_url) coverUrl = images.cover_url;
          resultsWithImages = payload.results.map((r) => {
            const img = images.results.find((x) => x.result_code === r.result_code);
            return { ...r, image_url: img?.image_url || '/images/default_cover.png' };
          });
        }
      } catch (imgErr) {
        console.warn('Archetype quiz images skipped:', imgErr.message);
      }
    }

    const quiz = await createQuiz({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quiz_type: payload.quiz_type || archetype.quiz_type,
      image_url: coverUrl,
    });
    await insertQuestions(quiz.id, payload.questions);
    await insertResults(quiz.id, resultsWithImages);

    return res.status(201).json({
      ok: true,
      id: quiz.id,
      title: payload.title,
      category: payload.category,
      quiz_type: payload.quiz_type,
      archetypeId: archetype.id,
      playUrl: `/quiz/${quiz.id}`,
    });
  } catch (err) {
    console.error('POST /api/admin/generate-archetype-quiz', err);
    return res.status(500).json({ error: err.message || 'Archetype quiz generation failed' });
  }
}
