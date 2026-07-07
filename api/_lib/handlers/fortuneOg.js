import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { composeFortuneOgImage } from '../composeOgImage.js';
import { getFortuneByIndex } from '../../../shared/fortuneData.js';
import { formatFortuneDateShort, isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import {
  getFortuneImageLocalPath,
  getFortuneImagePublicPath,
} from '../fortuneImageService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_OG = path.join(__dirname, '../og-default.png');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const name = (req.query?.name || 'Bạn thân').trim().slice(0, 24);
    const idxRaw = req.query?.idx;
    const fortuneIndex = idxRaw !== undefined && idxRaw !== '' ? Number(idxRaw) : 0;
    const dateStr = String(req.query?.date || '').trim();
    if (!isValidFortuneDateLabel(dateStr)) {
      return res.status(400).json({ error: 'date query required (YYYY-MM-DD)' });
    }
    const idx = ((fortuneIndex % 8) + 8) % 8;
    const fortune = getFortuneByIndex(idx);
    const host = req.headers['x-forwarded-host'] || req.headers.host;

    const localPath = getFortuneImageLocalPath(dateStr, idx);
    const imageUrl = fs.existsSync(localPath)
      ? getFortuneImagePublicPath(dateStr, idx)
      : null;
    const imagePath = fs.existsSync(localPath) ? localPath : FALLBACK_OG;

    let buffer;
    try {
      buffer = await composeFortuneOgImage({
        imageUrl,
        imagePath: imageUrl ? localPath : imagePath,
        host,
        name,
        fortuneTitle: `${formatFortuneDateShort(dateStr)} · ${fortune.title}`,
        emoji: fortune.emoji,
        dateStr,
      });
    } catch {
      buffer = await composeFortuneOgImage({
        imagePath: FALLBACK_OG,
        host,
        name,
        fortuneTitle: `${formatFortuneDateShort(dateStr)} · ${fortune.title}`,
        emoji: fortune.emoji,
        dateStr,
      });
    }

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/fortune-og', err);
    return res.status(500).json({ error: err.message || 'Fortune OG image failed' });
  }
}
