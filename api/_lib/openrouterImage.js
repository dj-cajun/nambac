const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function getOpenRouterImageModel() {
  return process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image';
}

function orHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://nambac.vercel.app',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'nambac',
  };
}

function dataUrlToB64(url) {
  if (!url) return '';
  const idx = url.indexOf(',');
  return idx !== -1 ? url.slice(idx + 1) : url;
}

/**
 * Generate an image via OpenRouter's chat/completions image modality.
 * Gemini/GPT image models return the image as a data-URL in message.images.
 * (The dedicated /images endpoint reserves credits up-front and often 402s;
 *  chat completions bills actual usage, so it works on low balances.)
 */
async function generateViaChat(apiKey, model, prompt) {
  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: orHeaders(apiKey),
    body: JSON.stringify({
      model,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || JSON.stringify(data.error || data);
    throw new Error(`OpenRouter image failed (${res.status}): ${msg}`);
  }

  const images = data.choices?.[0]?.message?.images;
  const url = images?.[0]?.image_url?.url || images?.[0]?.url;
  const b64 = dataUrlToB64(url);
  if (!b64) throw new Error('OpenRouter returned no image data');

  return { b64, model, cost: data.usage?.cost ?? null };
}

async function generateViaImagesEndpoint(apiKey, model, options) {
  const res = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: orHeaders(apiKey),
    body: JSON.stringify({
      model,
      prompt: options.prompt,
      aspect_ratio: options.aspect_ratio || '1:1',
      resolution: options.resolution || '1K',
      output_format: options.output_format || 'png',
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || JSON.stringify(data.error || data);
    throw new Error(`OpenRouter image failed (${res.status}): ${msg}`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenRouter returned no image data');
  return { b64, model, cost: data.usage?.cost ?? null };
}

export async function generateOpenRouterImage(prompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const model = options.model || getOpenRouterImageModel();

  // Chat-modality models (Gemini/GPT image) — the reliable path on low balances.
  if (/gemini|gpt-.*image|image/i.test(model) && !/flux|stable-diffusion|sdxl/i.test(model)) {
    return generateViaChat(apiKey, model, prompt);
  }

  // Flux / SD style models still use the dedicated images endpoint.
  return generateViaImagesEndpoint(apiKey, model, { ...options, prompt });
}
