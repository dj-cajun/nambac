import { ensureFortuneSceneImage } from '../fortuneImageService.js';
import { getDateStr, normalizeFortuneDob } from '../../../shared/fortuneEngine.js';
import { normalizeFortuneAxis } from '../../../shared/fortuneMeta.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : 0;
    const dateStr = (req.query?.date || getDateStr()).trim();
    const dob = normalizeFortuneDob(req.query?.dob);
    const axis = normalizeFortuneAxis(req.query?.axis);
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const { buffer: _buffer, source: _source, ...result } = await ensureFortuneSceneImage({
      fortuneIndex,
      dateStr,
      host,
      dob,
      axis,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('GET /api/fortune-image', err);
    return res.status(500).json({ error: err.message || 'Fortune image failed' });
  }
}
