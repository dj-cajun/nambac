import { generateQuizImagePrompts } from '../../shared/imagePromptEngine.js';
import { finalizeCoverImagePrompt, finalizeQuestionImagePrompt, finalizeResultImagePrompt, coverPrompt, resultPrompt, questionPrompt } from '../../shared/imagePrompts.js';
import { generateCoverImage, generateQuizSetImage } from './generateQuizImage.js';
import { getGeminiKey, getOpenRouterKey } from '../../shared/llmJson.js';
import { getOpenRouterTextModel } from '../../shared/openrouterText.js';
import { saveImageB64AsWebp } from './saveQuizImage.js';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function quizStyleCtx(quiz) {
  return { id: quiz.id, title: quiz.title, category: quiz.category };
}

function fallbackPrompts(quiz) {
  return {
    cover: coverPrompt({
      id: quiz.id,
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
        id: quiz.id,
      }),
    ),
    results: (quiz.results || []).slice(0, 8).map((r, i) =>
      resultPrompt({
        title: r.title || r.type_name,
        description: r.description,
        quizTitle: quiz.title,
        category: quiz.category,
        resultCode: r.result_code ?? i,
        id: quiz.id,
      }),
    ),
  };
}

/**
 * Gemini prompts + same image model for cover + results (tone-matched set) → WebP save.
 * @param {{ quiz: object, idPrefix?: string, delayMs?: number, skipQuestions?: boolean, onProgress?: Function }} opts
 */
export async function generateAllQuizImages({
  quiz,
  idPrefix = 'quiz',
  delayMs = 3500,
  skipQuestions = true,
  onProgress,
  onCoverSaved,
  onResultSaved,
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
      cover: finalizeCoverImagePrompt(generated.cover, { quiz: quizStyleCtx(quiz) }),
      questions: skipQuestions ? [] : generated.questions.map((p) =>
        finalizeQuestionImagePrompt(p, { quiz: quizStyleCtx(quiz) }),
      ),
      results: generated.results.map((p, i) =>
        finalizeResultImagePrompt(p, {
          resultCode: i,
          quizTitle: quiz.title,
          category: quiz.category,
          quiz: quizStyleCtx(quiz),
        }),
      ),
    };
  } catch (err) {
    console.warn('LLM image prompts failed, using fallback templates:', err.message);
    prompts = fallbackPrompts(quiz);
  }

  const out = { cover_url: null, questions: [], results: [], costs: [] };
  const report = (msg) => onProgress?.(msg);

  // Cover
  report('cover');
  const coverRes = await generateCoverImage(prompts.cover);
  out.cover_url = await saveImageB64AsWebp(coverRes.b64, `${prefix}_cover`);
  out.costs.push(coverRes.cost);
  if (onCoverSaved) await onCoverSaved(out.cover_url);
  await sleep(delayMs);

  // Questions (5)
  if (!skipQuestions) {
    for (let i = 0; i < 5; i++) {
      report(`question ${i + 1}`);
      const { b64, cost } = await generateQuizSetImage(prompts.questions[i]);
      out.questions.push({ order_number: i + 1, image_url: await saveImageB64AsWebp(b64, `${prefix}_q${i + 1}`) });
      out.costs.push(cost);
      await sleep(delayMs);
    }
  }

  // Results (8) — share/OG images
  for (let i = 0; i < 8; i++) {
    report(`result ${i}`);
      const { b64, cost } = await generateQuizSetImage(prompts.results[i]);
      const image_url = await saveImageB64AsWebp(b64, `${prefix}_r${i}`);
      out.results.push({ result_code: i, image_url });
      out.costs.push(cost);
      if (onResultSaved) await onResultSaved(i, image_url);
      await sleep(delayMs);
  }

  return out;
}
