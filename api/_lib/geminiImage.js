import { isRetryableGeminiError, withGeminiKeys } from '../../shared/geminiKeys.js';

const IMAGEN_FAST = 'imagen-4.0-fast-generate-001';
const IMAGEN_STD = 'imagen-4.0-generate-001';

async function callImagen(apiKey, model, prompt, { aspectRatio = '1:1' } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio,
        safetyFilterLevel: 'BLOCK_ONLY_HIGH',
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || JSON.stringify(data.error || data).slice(0, 200);
    const err = new Error(`Imagen ${model} failed (${res.status}): ${msg}`);
    err.status = res.status;
    throw err;
  }

  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error(`Imagen ${model} returned no image bytes`);
  return b64;
}

/**
 * Google Imagen 4.0 via Gemini API — rotates across GEMINI_API_KEY / GEMINI_API_KEY_2.
 */
export async function generateGeminiImage(prompt, options = {}) {
  return withGeminiKeys(async (apiKey) => {
    try {
      const b64 = await callImagen(apiKey, IMAGEN_FAST, prompt, options);
      return { b64, provider: 'gemini-imagen', model: IMAGEN_FAST, cost: null };
    } catch (fastErr) {
      if (fastErr.status === 403 || !isRetryableGeminiError(fastErr)) {
        try {
          const b64 = await callImagen(apiKey, IMAGEN_STD, prompt, options);
          return { b64, provider: 'gemini-imagen', model: IMAGEN_STD, cost: null };
        } catch (stdErr) {
          throw stdErr;
        }
      }
      throw fastErr;
    }
  });
}
