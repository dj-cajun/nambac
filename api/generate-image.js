import { requireAdmin } from './_lib/adminAuth.js';
import { generateOpenRouterImage, getOpenRouterImageModel } from './_lib/openrouterImage.js';

const STYLE_PREFIX = 'Korean webtoon manhwa style, clean digital line art, vibrant colors, masterpiece, best quality, highly detailed, cinematic lighting. ';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { prompt, type } = body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    let fullPrompt = prompt.trim();
    if (type === 'cover') {
      fullPrompt = `${STYLE_PREFIX}Quiz cover image. ${fullPrompt} Professional webtoon cover, no text, no letters.`;
    } else if (type === 'result') {
      fullPrompt = `${STYLE_PREFIX}Character portrait on the LEFT side of frame. ${fullPrompt} No text, no letters, no numbers.`;
    } else {
      fullPrompt = `${STYLE_PREFIX}${fullPrompt}`;
    }

    const result = await generateOpenRouterImage(fullPrompt);

    return res.status(200).json({
      b64_json: result.b64,
      model: result.model,
      cost_usd: result.cost,
    });
  } catch (err) {
    console.error('POST /api/generate-image', err);
    return res.status(500).json({ error: err.message || 'Image generation failed' });
  }
}

export { getOpenRouterImageModel };
