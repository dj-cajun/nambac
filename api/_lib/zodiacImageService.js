/**
 * Static zodiac fortune images — no daily AI generation.
 */
import fs from 'fs';
import path from 'path';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR } from './saveQuizImage.js';
import { resolveFortuneZodiacAsset } from '../../shared/zodiacFortune.js';

function resolveFetchHost(host) {
  if (host) return host;
  const site = process.env.VITE_SITE_URL || 'https://nambac.xyz';
  return site.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function localPathForZodiac(imagePath) {
  const name = path.basename(imagePath);
  return path.join(IMAGES_DIR, name);
}

export async function ensureZodiacFortuneImage({ dob, axis, fortuneIndex, dateStr, host }) {
  const asset = resolveFortuneZodiacAsset({ dob, axis, fortuneIndex, dateStr });
  const filePath = localPathForZodiac(asset.path);
  const fetchHost = resolveFetchHost(host);

  if (fs.existsSync(filePath)) {
    return {
      image_url: asset.path,
      buffer: fs.readFileSync(filePath),
      cached: true,
      source: 'zodiac-disk',
      zodiac: asset,
    };
  }

  try {
    const buffer = await loadImageBuffer(asset.path, fetchHost);
    return {
      image_url: asset.path,
      buffer,
      cached: true,
      source: 'zodiac-cdn',
      zodiac: asset,
    };
  } catch {
    /* fall through */
  }

  // Last resort — any existing west aries placeholder
  const fallbackPath = localPathForZodiac('/images/zodiac_west_aries.webp');
  if (fs.existsSync(fallbackPath)) {
    return {
      image_url: '/images/zodiac_west_aries.webp',
      buffer: fs.readFileSync(fallbackPath),
      cached: true,
      source: 'zodiac-fallback',
      zodiac: asset,
    };
  }

  throw new Error(
    `Zodiac image missing: ${asset.path}. Run: npm run images:zodiac`,
  );
}

export async function resolveZodiacFortuneSceneForOg(opts) {
  return ensureZodiacFortuneImage(opts);
}
