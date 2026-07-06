import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllQuizImages } from './quizImages.js';
import { getResultsByQuizId, updateQuizImageUrl, updateResultImageUrl } from './quizDb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../public/images');

function assertOnDisk(imageUrl) {
  const filename = imageUrl?.split('/').pop();
  const fp = path.join(IMAGES_DIR, filename);
  if (!filename || !fs.existsSync(fp)) {
    throw new Error(`Image file missing after save: ${imageUrl}`);
  }
  return imageUrl;
}

function idPrefixForQuiz(quizId) {
  return `backfill_${quizId.replace(/-/g, '').slice(0, 8)}`;
}

/**
 * Generate cover + result images after quiz text is already saved.
 * Updates Turso after each file is verified on disk.
 */
export async function enrichArchetypeQuizImages({ quizId, archetype, payload, apiKey }) {
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';
  const prefix = idPrefixForQuiz(quizId);
  const dbResults = await getResultsByQuizId(quizId);

  const onCover = async (url) => {
    const ok = assertOnDisk(url);
    await updateQuizImageUrl(quizId, ok);
    console.log(`[archetype-images] cover → ${ok}`);
  };

  const onResult = async (code, url) => {
    const ok = assertOnDisk(url);
    const row = dbResults.find((r) => parseInt(r.result_code, 10) === code);
    if (row) {
      await updateResultImageUrl(row.id, ok);
      console.log(`[archetype-images] result ${code} → ${ok}`);
    }
  };

  if (archetype.quiz_type === 'mbti_12q') {
    const { generateQuizImage } = await import('./generateQuizImage.js');
    const { finalizeCoverImagePrompt, coverPrompt } = await import('../../shared/imagePrompts.js');
    const { generateQuizImagePrompts } = await import('../../shared/imagePromptEngine.js');
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
    const { saveImageB64AsWebp } = await import('./saveQuizImage.js');
    const coverUrl = await saveImageB64AsWebp(b64, `${prefix}_cover`);
    await onCover(coverUrl);
  } else {
    await generateAllQuizImages({
      quiz: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        questions: payload.questions,
        results: payload.results,
      },
      idPrefix: prefix,
      delayMs: 1500,
      skipQuestions: true,
      onCoverSaved: onCover,
      onResultSaved: onResult,
    });
  }

  console.log(`[archetype-images] done quiz=${quizId}`);
}
