import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } from './saveQuizImage.js';
import { getFortuneScenePrompt } from '../../shared/fortuneImagePrompts.js';

/** Same root as quiz images — `/images/*.webp` */
const LEGACY_FORTUNE_DIR = path.join(IMAGES_DIR, 'fortune');

function normalizeIdx(fortuneIndex) {
  return ((Number(fortuneIndex) % 8) + 8) % 8;
}

function cacheFilename(dateStr, fortuneIndex) {
  return `fortune_${dateStr}_idx${normalizeIdx(fortuneIndex)}.webp`;
}

function cacheFilePath(dateStr, fortuneIndex) {
  return path.join(IMAGES_DIR, cacheFilename(dateStr, fortuneIndex));
}

function legacyCacheFilePath(dateStr, fortuneIndex) {
  return path.join(LEGACY_FORTUNE_DIR, cacheFilename(dateStr, fortuneIndex));
}

/** Public path — flat under /images/ like quiz result art */
export function getFortuneImagePublicPath(dateStr, fortuneIndex) {
  return `/images/${cacheFilename(dateStr, fortuneIndex)}`;
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

/** Disk → CDN — quiz OG와 동일한 /images/ 경로 (구 서브폴더 호환) */
async function tryLoadFortuneSceneBuffer({ dateStr, idx, host }) {
  const diskPaths = [
    cacheFilePath(dateStr, idx),
    legacyCacheFilePath(dateStr, idx),
  ];
  for (const filePath of diskPaths) {
    if (fs.existsSync(filePath)) {
      return { buffer: fs.readFileSync(filePath), source: 'disk', image_url: getFortuneImagePublicPath(dateStr, idx) };
    }
  }

  const fetchHost = resolveFetchHost(host);
  const urls = [
    getFortuneImagePublicPath(dateStr, idx),
    `/images/fortune/${cacheFilename(dateStr, idx)}`,
  ];
  for (const imageUrl of urls) {
    try {
      const buffer = await loadImageBuffer(imageUrl, fetchHost);
      return { buffer, source: 'cdn', image_url: getFortuneImagePublicPath(dateStr, idx) };
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * Daily fortune scene — same pipeline as quiz result images:
 * cached /images/*.webp → else AI generate → always returns image_url for OG.
 */
export async function ensureFortuneSceneImage({ fortuneIndex, dateStr, host }) {
  const idx = normalizeIdx(fortuneIndex);
  const filePath = cacheFilePath(dateStr, idx);
  const url = getFortuneImagePublicPath(dateStr, idx);

  const cached = await tryLoadFortuneSceneBuffer({ dateStr, idx, host });
  if (cached?.buffer) {
    return {
      image_url: cached.image_url || url,
      buffer: cached.buffer,
      cached: true,
      source: cached.source,
    };
  }

  const prompt = getFortuneScenePrompt(idx);
  const { b64 } = await generateQuizImage(prompt);
  const buffer = await webpFromB64(b64);

  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    await fs.promises.writeFile(filePath, buffer);
    return { image_url: url, buffer, cached: false, source: 'generated' };
  } catch (err) {
    console.warn('[fortune-image] disk cache failed, returning b64', err.message);
    return {
      image_url: url,
      b64: buffer.toString('base64'),
      buffer,
      cached: false,
      source: 'generated',
    };
  }
}

/** Resolve scene for OG — same contract as quiz og-image (image_url + CDN fetch). */
export async function resolveFortuneSceneForOg({ fortuneIndex, dateStr, host }) {
  const scene = await ensureFortuneSceneImage({ fortuneIndex, dateStr, host });
  if (!scene.image_url && !scene.buffer) {
    throw new Error(`Fortune scene missing (idx=${fortuneIndex}, date=${dateStr})`);
  }
  return scene;
}
