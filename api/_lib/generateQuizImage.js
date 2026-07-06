import { generateGeminiImage } from './geminiImage.js';
import { generateOpenRouterImage } from './openrouterImage.js';

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
