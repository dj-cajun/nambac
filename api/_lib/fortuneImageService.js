import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } from './saveQuizImage.js';
import { getFortuneScenePrompt } from '../../shared/fortuneImagePrompts.js';

export const FORTUNE_IMAGES_DIR = path.join(IMAGES_DIR, 'fortune');

function cacheFilename(dateStr, fortuneIndex) {
  const idx = ((Number(fortuneIndex) % 8) + 8) % 8;
  return `fortune_${dateStr}_idx${idx}.webp`;
}

function cacheFilePath(dateStr, fortuneIndex) {
  return path.join(FORTUNE_IMAGES_DIR, cacheFilename(dateStr, fortuneIndex));
}

function publicPath(dateStr, fortuneIndex) {
  return `/images/fortune/${cacheFilename(dateStr, fortuneIndex)}`;
}

export function getFortuneImagePublicPath(dateStr, fortuneIndex) {
  return publicPath(dateStr, fortuneIndex);
}

export function getFortuneImageLocalPath(dateStr, fortuneIndex) {
  return cacheFilePath(dateStr, fortuneIndex);
}

function resolveFetchHost(host) {
  if (host) return host;
  const site = process.env.VITE_SITE_URL || 'https://nambac.xyz';
  return site.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

async function webpFromB64(b64) {
  return sharp(Buffer.from(b64, 'base64'))
    .rotate()
    .resize(WEBP_MAX_SIZE, WEBP_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

/** Disk (dev) → CDN static (prod deploy) — same asset the result page shows. */
async function tryLoadFortuneSceneBuffer({ dateStr, idx, host }) {
  const filePath = cacheFilePath(dateStr, idx);
  if (fs.existsSync(filePath)) {
    return { buffer: fs.readFileSync(filePath), source: 'disk' };
  }

  try {
    const buffer = await loadImageBuffer(publicPath(dateStr, idx), resolveFetchHost(host));
    return { buffer, source: 'cdn' };
  } catch {
    return null;
  }
}

/**
 * Daily fortune scene — one image per archetype per day.
 * Same source for result card + OG. Always materializes a WebP buffer when possible.
 */
export async function ensureFortuneSceneImage({ fortuneIndex, dateStr, host }) {
  const idx = ((Number(fortuneIndex) % 8) + 8) % 8;
  const filePath = cacheFilePath(dateStr, idx);
  const url = publicPath(dateStr, idx);

  const cached = await tryLoadFortuneSceneBuffer({ dateStr, idx, host });
  if (cached?.buffer) {
    return {
      image_url: url,
      buffer: cached.buffer,
      cached: true,
      source: cached.source,
    };
  }

  const prompt = getFortuneScenePrompt(idx);
  const { b64 } = await generateQuizImage(prompt);
  const buffer = await webpFromB64(b64);

  try {
    if (!fs.existsSync(FORTUNE_IMAGES_DIR)) {
      fs.mkdirSync(FORTUNE_IMAGES_DIR, { recursive: true });
    }
    await fs.promises.writeFile(filePath, buffer);
    return { image_url: url, buffer, cached: false, source: 'generated' };
  } catch (err) {
    console.warn('[fortune-image] disk cache failed, returning b64', err.message);
    return {
      b64: buffer.toString('base64'),
      buffer,
      cached: false,
      source: 'generated',
    };
  }
}

/** Guaranteed scene buffer for OG — never falls back to generic site OG. */
export async function loadFortuneSceneForOg({ fortuneIndex, dateStr, host }) {
  const scene = await ensureFortuneSceneImage({ fortuneIndex, dateStr, host });
  if (!scene.buffer) {
    throw new Error(`Fortune scene buffer missing (idx=${fortuneIndex}, date=${dateStr})`);
  }
  return scene.buffer;
}
