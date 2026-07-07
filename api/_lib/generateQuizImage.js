import { generateGeminiImage } from './geminiImage.js';
import { generateOpenRouterImage, getOpenRouterImageModel } from './openrouterImage.js';

export function getCoverImageModel() {
  return process.env.OPENROUTER_COVER_IMAGE_MODEL || 'google/gemini-2.5-flash-image';
}

/** Cover + result images in one quiz set — same model/renderer for consistent tone. */
export async function generateQuizSetImage(prompt, options = {}) {
  return generateCoverImage(prompt, options);
}

/** Cover/intro images — Gemini Image on OpenRouter by default (Flux paints quiz titles as text). */
export async function generateCoverImage(prompt, options = {}) {
  const coverProvider = (process.env.COVER_IMAGE_PROVIDER || 'gemini-openrouter').toLowerCase();
  if (coverProvider === 'flux' || coverProvider === 'openrouter') {
    return generateQuizImage(prompt, options);
  }

  const coverModel = options.model || getCoverImageModel();
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await generateOpenRouterImage(prompt, { ...options, model: coverModel });
      return { ...result, provider: 'openrouter-cover' };
    } catch (err) {
      console.warn(`[cover] ${coverModel} failed → Flux (${err.message})`);
    }
  }

  const provider = getImageProvider();
  if (provider !== 'openrouter') {
    try {
      return await generateGeminiImage(prompt, options);
    } catch (err) {
      console.warn(`[cover] Imagen failed → Flux (${err.message})`);
    }
  }

  const result = await generateOpenRouterImage(prompt, {
    ...options,
    model: options.fallbackModel || getOpenRouterImageModel(),
  });
  return { ...result, provider: 'openrouter-fallback' };
}

/**
 * IMAGE_PROVIDER:
 *   gemini-then-openrouter (default) — Imagen 4.0, then Flux fallback
 *   gemini — Imagen only
 *   openrouter — Flux only (previous behaviour)
 */
export function getImageProvider() {
  return (process.env.IMAGE_PROVIDER || 'gemini-then-openrouter').toLowerCase();
}

export async function generateQuizImage(prompt, options = {}) {
  const provider = getImageProvider();

  if (provider === 'openrouter') {
    const result = await generateOpenRouterImage(prompt, options);
    return { ...result, provider: 'openrouter' };
  }

  if (provider === 'gemini') {
    return generateGeminiImage(prompt, options);
  }

  // gemini-then-openrouter
  try {
    return await generateGeminiImage(prompt, options);
  } catch (err) {
    console.warn(`[image] Imagen failed → OpenRouter Flux (${err.message})`);
    const result = await generateOpenRouterImage(prompt, options);
    return { ...result, provider: 'openrouter-fallback' };
  }
}
