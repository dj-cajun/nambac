import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } from './saveQuizImage.js';
import { getSbtiScenePrompt, sbtiCodeSlug } from '../../shared/vbti/imagePrompts.js';

function cacheFilename(code) {
  return `sbti_${sbtiCodeSlug(code)}.webp`;
}

function cacheFilePath(code) {
  return path.join(IMAGES_DIR, cacheFilename(code));
}

export function getSbtiImagePublicPath(code) {
  return `/images/${cacheFilename(code)}`;
}

export function getSbtiImageLocalPath(code) {
  return cacheFilePath(code);
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

/** Disk → CDN → AI generate → cache. Returns public image_url for the SBTI type. */
export async function ensureSbtiSceneImage({ code, indexHint = 0, host, force = false }) {
  const cleanCode = String(code || '').trim();
  if (!cleanCode) throw new Error('SBTI image: code is required');

  const filePath = cacheFilePath(cleanCode);
  const url = getSbtiImagePublicPath(cleanCode);

  if (!force && fs.existsSync(filePath)) {
    return {
      image_url: url,
      buffer: fs.readFileSync(filePath),
      cached: true,
      source: 'disk',
    };
  }

  if (!force) {
    const fetchHost = resolveFetchHost(host);
    try {
      const buffer = await loadImageBuffer(url, fetchHost);
      if (buffer) {
        return { image_url: url, buffer, cached: true, source: 'cdn' };
      }
    } catch {
      /* not on CDN yet — generate below */
    }
  }

  const prompt = getSbtiScenePrompt(cleanCode, indexHint);
  const { b64 } = await generateQuizImage(prompt);
  const buffer = await webpFromB64(b64);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  await fs.promises.writeFile(filePath, buffer);

  return { image_url: url, buffer, cached: false, source: 'generated' };
}
