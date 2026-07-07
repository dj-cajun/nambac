import { ensureFortuneSceneImage } from '../fortuneImageService.js';
import { getDateStr } from '../../../shared/fortuneEngine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : NaN;
    if (Number.isNaN(fortuneIndex)) {
      return res.status(400).json({ error: 'idx is required' });
    }

    const dateStr = (req.query?.date || getDateStr()).trim();
    const result = await ensureFortuneSceneImage({ fortuneIndex, dateStr });
    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /api/fortune-image', err);
    return res.status(500).json({ error: err.message || 'Fortune image generation failed' });
  }
}
