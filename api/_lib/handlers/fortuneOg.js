import { composeOgImageOnly } from '../composeOgImage.js';
import { isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import { resolveFortuneSceneForOg } from '../fortuneImageService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : 0;
    const dateStr = String(req.query?.date || '').trim();
    if (!isValidFortuneDateLabel(dateStr)) {
      return res.status(400).json({ error: 'Thiếu tham số date (YYYY-MM-DD)' });
    }

    const idx = ((fortuneIndex % 8) + 8) % 8;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const scene = await resolveFortuneSceneForOg({ fortuneIndex: idx, dateStr, host });

    let buffer;
    if (scene.image_url) {
      try {
        buffer = await composeOgImageOnly({ imageUrl: scene.image_url, host });
      } catch (fetchErr) {
        if (!scene.buffer) throw fetchErr;
        buffer = await composeOgImageOnly({ imageBuffer: scene.buffer });
      }
    } else {
      buffer = await composeOgImageOnly({ imageBuffer: scene.buffer });
    }

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/fortune-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
