import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuizImagePrompts } from '../../shared/imagePromptEngine.js';
import { finalizeImagePrompt, finalizeQuestionImagePrompt, finalizeResultImagePrompt, coverPrompt, resultPrompt, questionPrompt } from '../../shared/imagePrompts.js';
import { generateOpenRouterImage } from './openrouterImage.js';
import { getGeminiKey, getOpenRouterKey } from '../../shared/llmJson.js';
import { getOpenRouterTextModel } from '../../shared/openrouterText.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../public/images');

function saveImageB64(b64, prefix) {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const filename = `${prefix}_${Date.now()}.png`;
  fs.writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(b64, 'base64'));
  return `/images/${filename}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fallbackPrompts(quiz) {
  return {
    cover: coverPrompt({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
    }),
    questions: (quiz.questions || []).slice(0, 5).map((q) =>
      questionPrompt({
        questionText: q.question_text,
        optionA: q.option_a,
        optionB: q.option_b,
        quizTitle: quiz.title,
        category: quiz.category,
      }),
    ),
    results: (quiz.results || []).slice(0, 8).map((r) =>
      resultPrompt({
        title: r.title || r.type_name,
        description: r.description,
        quizTitle: quiz.title,
        category: quiz.category,
      }),
    ),
  };
}

/**
 * Gemini writes cover + 8 result prompts by default; OpenRouter renders each image.
 * @param {{ quiz: object, idPrefix?: string, delayMs?: number, skipQuestions?: boolean, onProgress?: Function }} opts
 */
export async function generateAllQuizImages({
  quiz,
  idPrefix = 'quiz',
  delayMs = 3500,
  skipQuestions = true,
  onProgress,
}) {
  const prefix = idPrefix.slice(0, 8);
  let prompts;

  try {
    const generated = await generateQuizImagePrompts({
      geminiKey: getGeminiKey(),
      openrouterKey: getOpenRouterKey(),
      quiz,
      skipQuestions,
    });
    if (generated.provider === 'openrouter') {
      console.warn(`Image prompts via OpenRouter fallback (${getOpenRouterTextModel()})`);
    }
    prompts = {
      cover: finalizeImagePrompt(generated.cover),
      questions: skipQuestions ? [] : generated.questions.map(finalizeQuestionImagePrompt),
      results: generated.results.map(finalizeResultImagePrompt),
    };
  } catch (err) {
    console.warn('LLM image prompts failed, using fallback templates:', err.message);
    prompts = fallbackPrompts(quiz);
  }

  const out = { cover_url: null, questions: [], results: [], costs: [] };
  const report = (msg) => onProgress?.(msg);

  // Cover
  report('cover');
  const coverRes = await generateOpenRouterImage(prompts.cover);
  out.cover_url = saveImageB64(coverRes.b64, `${prefix}_cover`);
  out.costs.push(coverRes.cost);
  await sleep(delayMs);

  // Questions (5)
  if (!skipQuestions) {
    for (let i = 0; i < 5; i++) {
      report(`question ${i + 1}`);
      const { b64, cost } = await generateOpenRouterImage(prompts.questions[i]);
      out.questions.push({ order_number: i + 1, image_url: saveImageB64(b64, `${prefix}_q${i + 1}`) });
      out.costs.push(cost);
      await sleep(delayMs);
    }
  }

  // Results (8) — share/OG images
  for (let i = 0; i < 8; i++) {
    report(`result ${i}`);
    const { b64, cost } = await generateOpenRouterImage(prompts.results[i]);
    out.results.push({ result_code: i, image_url: saveImageB64(b64, `${prefix}_r${i}`) });
    out.costs.push(cost);
    await sleep(delayMs);
  }

  return out;
}
