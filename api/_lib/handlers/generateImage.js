import { requireAdmin } from '../adminAuth.js';
import { generateCoverImage, generateQuizImage } from '../generateQuizImage.js';
import { getOpenRouterImageModel } from '../openrouterImage.js';
import { applyImageStyle } from '../../../shared/imagePrompts.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { prompt, type, raw } = body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const fullPrompt = raw
      ? prompt.trim()
      : applyImageStyle(type || 'generic', prompt);

    const result = type === 'cover'
      ? await generateCoverImage(fullPrompt)
      : await generateQuizImage(fullPrompt);

    return res.status(200).json({
      b64_json: result.b64,
      model: result.model,
      provider: result.provider,
      cost_usd: result.cost,
    });
  } catch (err) {
    console.error('POST /api/generate-image', err);
    return res.status(500).json({ error: err.message || 'Image generation failed' });
  }
}

export { getOpenRouterImageModel };
