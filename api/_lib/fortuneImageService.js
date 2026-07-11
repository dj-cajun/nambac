import path from 'path';
import { ensureZodiacFortuneImage } from './zodiacImageService.js';
import { IMAGES_DIR } from './saveQuizImage.js';
import { pickWesternZodiacFromFortuneIndex } from '../../shared/zodiacFortune.js';

/**
 * Fortune scene — static zodiac image from DOB + axis (no daily AI).
 */
export async function ensureFortuneSceneImage({ fortuneIndex, dateStr, host, dob, axis }) {
  return ensureZodiacFortuneImage({ dob, axis, fortuneIndex, dateStr, host });
}

/** Resolve scene for OG */
export async function resolveFortuneSceneForOg({ fortuneIndex, dateStr, host, dob, axis }) {
  const scene = await ensureZodiacFortuneImage({ dob, axis, fortuneIndex, dateStr, host });
  if (!scene.image_url && !scene.buffer) {
    throw new Error(`Fortune zodiac scene missing (idx=${fortuneIndex}, date=${dateStr})`);
  }
  return scene;
}

/** Legacy script helper — maps fortune idx → zodiac west file */
export function getFortuneImagePublicPath(_dateStr, fortuneIndex) {
  const west = pickWesternZodiacFromFortuneIndex(fortuneIndex);
  return `/images/zodiac_west_${west.id}.webp`;
}

export function getFortuneImageLocalPath(_dateStr, fortuneIndex) {
  const west = pickWesternZodiacFromFortuneIndex(fortuneIndex);
  return path.join(IMAGES_DIR, `zodiac_west_${west.id}.webp`);
}
