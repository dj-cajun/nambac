import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } from './saveQuizImage.js';
import { getBrainScenePrompt } from '../../shared/brainImagePrompts.js';

/** Stable per-result image — /images/brain_{id}.webp (one per brain result) */
function safeId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function cacheFilename(id) {
  return `brain_${safeId(id)}.webp`;
}

function cacheFilePath(id) {
  return path.join(IMAGES_DIR, cacheFilename(id));
}

export function getBrainImagePublicPath(id) {
  return `/images/${cacheFilename(id)}`;
}

export function getBrainImageLocalPath(id) {
  return cacheFilePath(id);
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

/** Disk → CDN → AI generate → cache. Always returns image_url for the result. */
export async function ensureBrainSceneImage({ id, indexHint = 0, host }) {
  const cleanId = safeId(id);
  if (!cleanId) throw new Error('Brain image: id is required');

  const filePath = cacheFilePath(cleanId);
  const url = getBrainImagePublicPath(cleanId);

  if (fs.existsSync(filePath)) {
    return {
      image_url: url,
      buffer: fs.readFileSync(filePath),
      cached: true,
      source: 'disk',
    };
  }

  const fetchHost = resolveFetchHost(host);
  try {
    const buffer = await loadImageBuffer(url, fetchHost);
    if (buffer) {
      return { image_url: url, buffer, cached: true, source: 'cdn' };
    }
  } catch {
    /* not on CDN yet — generate below */
  }

  const prompt = getBrainScenePrompt(cleanId, indexHint);
  const { b64 } = await generateQuizImage(prompt);
  const buffer = await webpFromB64(b64);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  await fs.promises.writeFile(filePath, buffer);

  return { image_url: url, buffer, cached: false, source: 'generated' };
}
