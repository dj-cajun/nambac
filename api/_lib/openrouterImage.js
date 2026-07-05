const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images';

export function getOpenRouterImageModel() {
  return process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';
}

export async function generateOpenRouterImage(prompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const model = options.model || getOpenRouterImageModel();
  const payload = {
    model,
    prompt,
    aspect_ratio: options.aspect_ratio || '1:1',
    resolution: options.resolution || '1K',
    output_format: options.output_format || 'png',
  };

  const res = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://nambac.vercel.app',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'nambac',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || JSON.stringify(data.error || data);
    throw new Error(`OpenRouter image failed (${res.status}): ${msg}`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenRouter returned no image data');
  }

  return {
    b64,
    model,
    cost: data.usage?.cost ?? null,
  };
}
