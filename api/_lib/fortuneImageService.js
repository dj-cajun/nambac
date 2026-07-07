import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateQuizImage } from './generateQuizImage.js';
import { loadImageBuffer } from './composeOgImage.js';
import { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } from './saveQuizImage.js';
import { getFortuneScenePrompt } from '../../shared/fortuneImagePrompts.js';
import { FORTUNE_COUNT } from '../../shared/fortuneData.js';

/** Same root as quiz images — `/images/*.webp` */
const LEGACY_FORTUNE_DIR = path.join(IMAGES_DIR, 'fortune');

function normalizeIdx(fortuneIndex) {
  return ((Number(fortuneIndex) % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
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

function formatDateLabel(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseFortuneFileMeta(fileName) {
  const m = /^fortune_(\d{4}-\d{2}-\d{2})_idx(\d+)\.webp$/.exec(fileName);
  if (!m) return null;
  return { dateStr: m[1], idx: Number(m[2]) };
}

function imageUrlMatchesIdx(imageUrl, idx) {
  if (!imageUrl) return false;
  const m = /_idx(\d+)\.webp$/.exec(imageUrl);
  if (!m) return false;
  return Number(m[1]) === idx;
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
    `/images/fortune/${cacheFilename(dateStr, idx)}`,
    getFortuneImagePublicPath(dateStr, idx),
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

async function tryLoadRecentFortuneSceneBuffer({ dateStr, idx, host, maxDaysBack = 30 }) {
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  for (let i = 1; i <= maxDaysBack; i += 1) {
    const probe = new Date(base);
    probe.setDate(base.getDate() - i);
    const probeDate = formatDateLabel(probe);
    const hit = await tryLoadFortuneSceneBuffer({ dateStr: probeDate, idx, host });
    if (hit?.buffer) {
      return {
        ...hit,
        source: `recent-${hit.source}`,
      };
    }
  }
  return null;
}

function findLatestFortuneSceneFileByIdx(idx) {
  const dirs = [IMAGES_DIR, LEGACY_FORTUNE_DIR];
  let best = null;

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const fileName of files) {
        const meta = parseFortuneFileMeta(fileName);
        if (!meta || meta.idx !== idx) continue;
        if (!best || meta.dateStr > best.dateStr) {
          best = {
            dateStr: meta.dateStr,
            filePath: path.join(dir, fileName),
          };
        }
      }
    } catch {
      // ignore unreadable directory
    }
  }

  return best;
}

function tryLoadLatestFortuneSceneByIdx(idx) {
  const best = findLatestFortuneSceneFileByIdx(idx);
  if (!best) return null;
  try {
    const buffer = fs.readFileSync(best.filePath);
    return {
      image_url: getFortuneImagePublicPath(best.dateStr, idx),
      buffer,
      source: 'latest-idx-disk',
    };
  } catch {
    return null;
  }
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
    if (!imageUrlMatchesIdx(cached.image_url || url, idx)) {
      console.warn('[fortune-image] cached image idx mismatch, ignoring', cached.image_url, idx);
    } else {
      return {
        image_url: cached.image_url || url,
        buffer: cached.buffer,
        cached: true,
        source: cached.source,
      };
    }
  }

  const recent = await tryLoadRecentFortuneSceneBuffer({ dateStr, idx, host });
  if (recent?.buffer) {
    if (!imageUrlMatchesIdx(recent.image_url, idx)) {
      console.warn('[fortune-image] recent image idx mismatch, ignoring', recent.image_url, idx);
    } else {
      return {
        image_url: recent.image_url,
        buffer: recent.buffer,
        cached: true,
        source: recent.source,
      };
    }
  }

  const latestIdx = tryLoadLatestFortuneSceneByIdx(idx);
  if (latestIdx?.buffer) {
    if (!imageUrlMatchesIdx(latestIdx.image_url, idx)) {
      console.warn('[fortune-image] latest idx image mismatch, ignoring', latestIdx.image_url, idx);
    } else {
      return {
        image_url: latestIdx.image_url,
        buffer: latestIdx.buffer,
        cached: true,
        source: latestIdx.source,
      };
    }
  }

  try {
    const prompt = getFortuneScenePrompt(idx);
    const { b64 } = await generateQuizImage(prompt);
    const buffer = await webpFromB64(b64);

    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    await fs.promises.writeFile(filePath, buffer);
    if (!imageUrlMatchesIdx(url, idx)) {
      throw new Error(`Generated image_url idx mismatch: ${url} (expected idx=${idx})`);
    }
    return { image_url: url, buffer, cached: false, source: 'generated' };
  } catch (err) {
    const fallbackRecent = await tryLoadRecentFortuneSceneBuffer({ dateStr, idx, host, maxDaysBack: 90 });
    if (fallbackRecent?.buffer) {
      console.warn('[fortune-image] generation failed, using recent fallback', err.message);
      if (!imageUrlMatchesIdx(fallbackRecent.image_url, idx)) {
        throw new Error(`Fallback recent idx mismatch: ${fallbackRecent.image_url} (expected idx=${idx})`);
      }
      return {
        image_url: fallbackRecent.image_url,
        buffer: fallbackRecent.buffer,
        cached: true,
        source: fallbackRecent.source,
      };
    }
    const fallbackLatestIdx = tryLoadLatestFortuneSceneByIdx(idx);
    if (fallbackLatestIdx?.buffer) {
      console.warn('[fortune-image] generation failed, using latest idx fallback', err.message);
      if (!imageUrlMatchesIdx(fallbackLatestIdx.image_url, idx)) {
        throw new Error(`Fallback latest idx mismatch: ${fallbackLatestIdx.image_url} (expected idx=${idx})`);
      }
      return {
        image_url: fallbackLatestIdx.image_url,
        buffer: fallbackLatestIdx.buffer,
        cached: true,
        source: fallbackLatestIdx.source,
      };
    }
    throw err;
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
