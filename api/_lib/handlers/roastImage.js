import { ensureRoastSceneImage } from '../roastImageService.js';
import { ROAST_TRAITS } from '../../../shared/roastData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const id = (req.query?.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });

    const indexHint = Math.max(0, ROAST_TRAITS.findIndex((t) => t.id === id));
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const { buffer: _buffer, source: _source, ...result } = await ensureRoastSceneImage({
      id,
      indexHint,
      host,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /api/roast-image', err);
    return res.status(500).json({ error: err.message || 'Roast image generation failed' });
  }
}
