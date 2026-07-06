import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllQuizImages } from './quizImages.js';
import { getResultsByQuizId, updateQuizImageUrl, updateResultImageUrl } from './quizDb.js';
import { getGeminiKey, getOpenRouterKey } from '../../shared/llmJson.js';

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

export function idPrefixForQuiz(quizId, label = 'cron') {
  return `${label}_${quizId.replace(/-/g, '').slice(0, 8)}`;
}

export function hasImageGenerationKeys() {
  return Boolean(getGeminiKey() || getOpenRouterKey());
}

/**
 * Generate cover + 8 result images after quiz text is saved.
 * Updates Turso incrementally as each file is verified on disk.
 */
export async function enrichQuizImages({
  quizId,
  payload,
  idLabel = 'cron',
  delayMs = 1500,
  skipQuestions = true,
  logPrefix = '[quiz-images]',
}) {
  const prefix = idPrefixForQuiz(quizId, idLabel);
  const dbResults = await getResultsByQuizId(quizId);

  const onCover = async (url) => {
    const ok = assertOnDisk(url);
    await updateQuizImageUrl(quizId, ok);
    console.log(`${logPrefix} cover → ${ok}`);
  };

  const onResult = async (code, url) => {
    const ok = assertOnDisk(url);
    const row = dbResults.find((r) => parseInt(r.result_code, 10) === code);
    if (row) {
      await updateResultImageUrl(row.id, ok);
      console.log(`${logPrefix} result ${code} → ${ok}`);
    }
  };

  const images = await generateAllQuizImages({
    quiz: {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      questions: payload.questions,
      results: payload.results,
    },
    idPrefix: prefix,
    delayMs,
    skipQuestions,
    onCoverSaved: onCover,
    onResultSaved: onResult,
  });

  console.log(`${logPrefix} done quiz=${quizId}`);
  return images;
}
