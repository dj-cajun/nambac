import { enrichQuizImages, idPrefixForQuiz } from './enrichQuizImages.js';
import { updateQuizImageUrl } from './quizDb.js';

/**
 * Generate cover (+ result images for binary quizzes) after archetype text is saved.
 */
export async function enrichArchetypeQuizImages({ quizId, archetype, payload, apiKey }) {
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';
  const prefix = idPrefixForQuiz(quizId, 'backfill');

  if (archetype.quiz_type === 'mbti_12q') {
    const { generateQuizImage } = await import('./generateQuizImage.js');
    const { finalizeCoverImagePrompt, coverPrompt } = await import('../../shared/imagePrompts.js');
    const { generateQuizImagePrompts } = await import('../../shared/imagePromptEngine.js');
    const { saveImageB64AsWebp } = await import('./saveQuizImage.js');

    let coverPromptText;
    try {
      const generated = await generateQuizImagePrompts({
        geminiKey: apiKey,
        openrouterKey,
        quiz: {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          questions: [],
          results: payload.results.slice(0, 8),
        },
        skipQuestions: true,
      });
      coverPromptText = finalizeCoverImagePrompt(generated.cover);
    } catch {
      coverPromptText = coverPrompt({
        title: payload.title,
        description: payload.description,
        category: payload.category,
      });
    }

    const { b64 } = await generateQuizImage(coverPromptText);
    const coverUrl = await saveImageB64AsWebp(b64, `${prefix}_cover`);
    await updateQuizImageUrl(quizId, coverUrl);
    console.log(`[archetype-images] cover → ${coverUrl}`);
    console.log(`[archetype-images] done quiz=${quizId}`);
    return { cover_url: coverUrl, results: [], questions: [] };
  }

  return enrichQuizImages({
    quizId,
    payload,
    idLabel: 'backfill',
    delayMs: 1500,
    skipQuestions: true,
    logPrefix: '[archetype-images]',
  });
}
