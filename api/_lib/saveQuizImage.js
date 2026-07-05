import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const IMAGES_DIR = path.join(__dirname, '../../public/images');

/** WebP quality — visually matches PNG at thumbnail/hero sizes. */
export const WEBP_QUALITY = 85;
/** Keep AI output resolution; only downscale if larger than this. */
export const WEBP_MAX_SIZE = 1024;

const webpOptions = { quality: WEBP_QUALITY, effort: 4 };

function ensureImagesDir(dir = IMAGES_DIR) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function webpPipeline(input) {
  return sharp(input)
    .rotate()
    .resize(WEBP_MAX_SIZE, WEBP_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
    .webp(webpOptions);
}

/**
 * Save base64 PNG/JPEG from OpenRouter as optimized WebP.
 * @returns {Promise<string>} public path e.g. `/images/prefix_123.webp`
 */
export async function saveImageB64AsWebp(b64, prefix, imagesDir = IMAGES_DIR) {
  ensureImagesDir(imagesDir);
  const filename = `${prefix}_${Date.now()}.webp`;
  const filepath = path.join(imagesDir, filename);
  await webpPipeline(Buffer.from(b64, 'base64')).toFile(filepath);
  return `/images/${filename}`;
}

/**
 * Convert an on-disk PNG/JPEG to WebP (same basename).
 * @returns {Promise<{ webpPath: string, publicPath: string, bytesBefore: number, bytesAfter: number }>}
 */
export async function convertFileToWebp(srcPath, imagesDir = IMAGES_DIR) {
  const ext = path.extname(srcPath).toLowerCase();
  if (ext === '.webp') {
    const bytes = fs.statSync(srcPath).size;
    const name = path.basename(srcPath);
    return {
      webpPath: srcPath,
      publicPath: `/images/${name}`,
      bytesBefore: bytes,
      bytesAfter: bytes,
    };
  }

  const bytesBefore = fs.statSync(srcPath).size;
  const base = path.basename(srcPath, ext);
  const webpPath = path.join(imagesDir, `${base}.webp`);
  await webpPipeline(srcPath).toFile(webpPath);
  const bytesAfter = fs.statSync(webpPath).size;
  return { webpPath, publicPath: `/images/${base}.webp`, bytesBefore, bytesAfter };
}

/** Save uploaded base64 (any image type) as WebP with a safe filename stem. */
export async function saveUploadB64AsWebp(data, filenameStem, imagesDir = IMAGES_DIR) {
  ensureImagesDir(imagesDir);
  const safeStem = filenameStem.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.(png|jpe?g|webp)$/i, '');
  const filename = `${safeStem}.webp`;
  const filepath = path.join(imagesDir, filename);
  await webpPipeline(Buffer.from(data, 'base64')).toFile(filepath);
  return `/images/${filename}`;
}
