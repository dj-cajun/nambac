import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { composeOgImageOnly } from '../composeOgImage.js';
import { isValidFortuneDateLabel } from '../../../shared/fortuneEngine.js';
import {
  ensureFortuneSceneImage,
  getFortuneImageLocalPath,
  getFortuneImagePublicPath,
} from '../fortuneImageService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_OG = path.join(__dirname, '../og-default.png');

async function composeFortuneSceneOg({ dateStr, idx, host }) {
  const publicUrl = getFortuneImagePublicPath(dateStr, idx);
  const localPath = getFortuneImageLocalPath(dateStr, idx);

  try {
    return await composeOgImageOnly({
      imageUrl: publicUrl,
      host,
      imagePath: fs.existsSync(localPath) ? localPath : undefined,
    });
  } catch (fetchErr) {
    console.warn('[fortune-og] static miss, generating scene', fetchErr.message);
    const generated = await ensureFortuneSceneImage({ fortuneIndex: idx, dateStr });

    if (generated.b64) {
      return composeOgImageOnly({
        imageBuffer: Buffer.from(generated.b64, 'base64'),
      });
    }

    if (generated.image_url) {
      return composeOgImageOnly({
        imageUrl: generated.image_url,
        host,
      });
    }

    throw fetchErr;
  }
}

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

    let buffer;
    try {
      buffer = await composeFortuneSceneOg({ dateStr, idx, host });
    } catch (err) {
      console.warn('[fortune-og] fallback to default OG', err.message);
      buffer = await composeOgImageOnly({ imagePath: FALLBACK_OG });
    }

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/fortune-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
