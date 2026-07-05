import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../public/images');
const FONT_REGULAR = path.join(__dirname, 'fonts/NotoSans-Regular.ttf');
const FONT_BOLD = path.join(__dirname, 'fonts/NotoSans-Bold.ttf');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMAGE_HEIGHT = 400;
const PANEL_HEIGHT = OG_HEIGHT - IMAGE_HEIGHT;
const RESULT_BOTTOM_CROP = 0.22;

export function resolveImagePath(imageUrl) {
  if (!imageUrl) return null;
  const filename = imageUrl.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  const fp = path.join(IMAGES_DIR, filename);
  return fs.existsSync(fp) ? fp : null;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseTraits(traits) {
  if (!traits) return [];
  if (Array.isArray(traits)) return traits.filter(Boolean);
  try {
    const parsed = JSON.parse(traits);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function truncate(text, maxLen) {
  const s = String(text || '').trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1)}…`;
}

function wrapLines(text, maxLen, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLen) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(truncate(current, maxLen));
  return lines.slice(0, maxLines);
}

function fontFaceCss() {
  const regular = FONT_REGULAR.replace(/\\/g, '/');
  const bold = FONT_BOLD.replace(/\\/g, '/');
  return `
    @font-face {
      font-family: 'OgSans';
      src: url('file://${regular}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'OgSans';
      src: url('file://${bold}') format('truetype');
      font-weight: 700;
      font-style: normal;
    }
    text { font-family: 'OgSans', sans-serif; }
  `;
}

function buildPanelSvg({ quizTitle, headline, description, hashtags, mode }) {
  const quizLabel = truncate(quizTitle, 72);
  const title = truncate(headline, 56);
  const descLines = wrapLines(description, 68, 2);
  const tagLine = hashtags.map((t) => `#${String(t).replace(/^#/, '')}`).join('  ');
  const tagText = truncate(tagLine, 90);

  const descSvg = descLines
    .map((line, i) => `<tspan x="48" dy="${i === 0 ? 0 : 28}">${escapeXml(line)}</tspan>`)
    .join('');

  const badge = mode === 'intro' ? 'QUIZ NAMBAC.XYZ' : 'KẾT QUẢ NAMBAC.XYZ';

  return Buffer.from(`<svg width="${OG_WIDTH}" height="${PANEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect width="100%" height="100%" fill="#fff9fc"/>
  <rect width="100%" height="6" fill="#FF2D85"/>
  <text x="48" y="34" fill="#94a3b8" font-size="20" font-weight="700">${escapeXml(badge)}</text>
  <text x="${OG_WIDTH - 48}" y="34" fill="#94a3b8" font-size="18" text-anchor="end">${escapeXml(quizLabel)}</text>
  <text x="48" y="82" fill="#5c4d72" font-size="34" font-weight="700">${escapeXml(title)}</text>
  ${descLines.length ? `<text x="48" y="124" fill="#6b5c80" font-size="22">${descSvg}</text>` : ''}
  ${tagText ? `<text x="48" y="${PANEL_HEIGHT - 36}" fill="#FF2D85" font-size="22" font-weight="700">${escapeXml(tagText)}</text>` : ''}
</svg>`);
}

async function loadTopImage(imagePath, { cropBottom = false } = {}) {
  const meta = await sharp(imagePath).metadata();
  let pipeline = sharp(imagePath);
  if (cropBottom && meta.height) {
    const keepH = Math.max(1, Math.round(meta.height * (1 - RESULT_BOTTOM_CROP)));
    pipeline = pipeline.extract({
      left: 0,
      top: 0,
      width: meta.width || keepH,
      height: Math.min(keepH, meta.height),
    });
  }
  return pipeline
    .resize(OG_WIDTH, IMAGE_HEIGHT, { fit: 'cover', position: 'top' })
    .toBuffer();
}

/**
 * Compose 1200×630 OG card: AI image + quiz title + answer + #hashtags.
 * @param {'intro'|'result'} mode
 */
export async function composeOgImage({
  imagePath,
  quizTitle,
  headline,
  description,
  hashtags = [],
  mode = 'result',
}) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const topImage = await loadTopImage(imagePath, { cropBottom: mode === 'result' });
  const panelSvg = buildPanelSvg({
    quizTitle,
    headline,
    description: stripHtml(description),
    hashtags,
    mode,
  });

  const panelBuffer = await sharp(panelSvg).png().toBuffer();

  return sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: '#fff9fc',
    },
  })
    .composite([
      { input: topImage, top: 0, left: 0 },
      { input: panelBuffer, top: IMAGE_HEIGHT, left: 0 },
    ])
    .webp({ quality: 88 })
    .toBuffer();
}

export function buildOgImageApiUrl(host, quizId, scoreCode = null) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const base = `${protocol}://${host}/api/og-image?quizId=${encodeURIComponent(quizId)}`;
  return scoreCode !== null && scoreCode !== undefined && !Number.isNaN(scoreCode)
    ? `${base}&score=${scoreCode}`
    : base;
}
