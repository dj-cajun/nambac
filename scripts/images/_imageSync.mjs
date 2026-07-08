/**
 * Shared image-sync helpers.
 *
 * The daily-quiz / backfill GitHub Actions generate images, update the remote
 * Turso DB to point at them, and commit the files to git. When you run backfill
 * locally without those files present, the old logic treated them as "missing"
 * and regenerated brand-new timestamped files — overwriting the DB pointer and
 * leaving orphan images. Instead we hydrate the already-generated file from the
 * live site so local matches what CI produced (no regeneration, no new filename).
 */
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

export const SITE_BASE = (process.env.VITE_SITE_URL || 'https://nambac.xyz').replace(/\/$/, '');

const PLACEHOLDER_PATTERNS = ['default_cover', 'grandma_roast', 'placeholder', 'img_177'];

export function isPlaceholder(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

export function imagePathFromUrl(url) {
  if (!url) return null;
  const filename = url.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  return path.join(PROJECT_ROOT, 'public', 'images', filename);
}

/** True when the referenced image is present locally. */
export function fileExistsLocally(url) {
  const fp = imagePathFromUrl(url);
  return !!fp && fs.existsSync(fp);
}

function remoteUrlFor(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Ensure a DB-referenced image exists locally. If it is already on disk, do
 * nothing. If it is a real generated image that is simply not pulled yet, try
 * to download it from the live site. Returns true when the file ends up
 * present locally (i.e. no regeneration needed).
 *
 * @param {string} url - DB image_url (e.g. "/images/backfill_ab12_cover_123.webp")
 * @param {{ log?: boolean }} [opts]
 */
export async function hydrateFromRemote(url, opts = {}) {
  const { log = true } = opts;
  if (!url || isPlaceholder(url)) return false;
  const fp = imagePathFromUrl(url);
  if (!fp) return false;
  if (fs.existsSync(fp)) return true;

  const remote = remoteUrlFor(url);
  const filename = path.basename(fp);
  try {
    const res = await fetch(remote);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return false;
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, buf);
    if (log) console.log(`   ⬇️  synced ${filename} from live site (${buf.length} B)`);
    return true;
  } catch {
    return false;
  }
}
