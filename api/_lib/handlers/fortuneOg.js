import { composeFortuneOgImage } from '../composeOgImage.js';
import { getDateStr, isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import { getFortuneByIndex, FORTUNE_COUNT } from '../../../shared/fortuneData.js';
import { resolveFortuneSceneForOg } from '../fortuneImageService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : 0;
    const name = String(req.query?.name || 'Bạn thân').trim().slice(0, 24);
    const dateStr = (() => {
      const raw = String(req.query?.date || '').trim();
      return isValidFortuneDateLabel(raw) ? raw : getDateStr();
    })();

    const idx = ((fortuneIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
    const fortune = getFortuneByIndex(idx);
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const scene = await resolveFortuneSceneForOg({ fortuneIndex: idx, dateStr, host });

    const buffer = await composeFortuneOgImage({
      imageUrl: scene.image_url,
      host,
      imageBuffer: scene.buffer,
      name,
      fortuneTitle: fortune.title,
      emoji: fortune.emoji,
      dateStr,
    });

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/fortune-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
