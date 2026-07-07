import { ensureBrainSceneImage } from '../brainImageService.js';
import { BRAIN_RESULTS } from '../../../shared/brainData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const id = (req.query?.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });

    const indexHint = Math.max(0, BRAIN_RESULTS.findIndex((r) => r.id === id));
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const { buffer: _buffer, source: _source, ...result } = await ensureBrainSceneImage({
      id,
      indexHint,
      host,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /api/brain-image', err);
    return res.status(500).json({ error: err.message || 'Brain image generation failed' });
  }
}
