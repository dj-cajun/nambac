import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
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

/**
 * Daily fortune scene — one cached AI image per archetype per day.
 * Returns { image_url } when disk cache works, else { b64 } for client display.
 */
export async function ensureFortuneSceneImage({ fortuneIndex, dateStr }) {
  const idx = ((Number(fortuneIndex) % 8) + 8) % 8;
  const filePath = cacheFilePath(dateStr, idx);
  const url = publicPath(dateStr, idx);

  if (fs.existsSync(filePath)) {
    return { image_url: url, cached: true };
  }

  const prompt = getFortuneScenePrompt(idx);
  const { b64 } = await generateQuizImage(prompt);

  try {
    if (!fs.existsSync(FORTUNE_IMAGES_DIR)) {
      fs.mkdirSync(FORTUNE_IMAGES_DIR, { recursive: true });
    }
    await sharp(Buffer.from(b64, 'base64'))
      .rotate()
      .resize(WEBP_MAX_SIZE, WEBP_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(filePath);
    return { image_url: url, cached: false };
  } catch (err) {
    console.warn('[fortune-image] disk cache failed, returning b64', err.message);
    return { b64, cached: false };
  }
}
