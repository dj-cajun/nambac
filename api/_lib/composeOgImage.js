import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../public/images');
const FONT_REGULAR = path.join(__dirname, 'fonts/NotoSans-Regular.ttf');
const FONT_BOLD = path.join(__dirname, 'fonts/NotoSans-Bold.ttf');

// librsvg on Vercel cannot load file:// fonts — embed as data URLs once at startup.
const FONT_REGULAR_B64 = fs.readFileSync(FONT_REGULAR).toString('base64');
const FONT_BOLD_B64 = fs.readFileSync(FONT_BOLD).toString('base64');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMAGE_HEIGHT = 420;
const PANEL_HEIGHT = OG_HEIGHT - IMAGE_HEIGHT;
const RESULT_BOTTOM_CROP = 0.12;

export function resolveImagePath(imageUrl) {
  if (!imageUrl) return null;
  const filename = imageUrl.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  const fp = path.join(IMAGES_DIR, filename);
  return fs.existsSync(fp) ? fp : null;
}

export function imageUrlToAbsolute(imageUrl, host) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const base = host
    ? `${protocol}://${host}`
    : (process.env.VITE_SITE_URL || 'https://nambac.vercel.app');
  return `${base}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

/** Load quiz cover/result image from disk (dev) or static CDN (Vercel). */
export async function loadImageBuffer(imageUrl, host) {
  const localPath = resolveImagePath(imageUrl);
  if (localPath) {
    return fs.readFileSync(localPath);
  }
  const url = imageUrlToAbsolute(imageUrl, host);
  if (!url) throw new Error(`Invalid image URL: ${imageUrl}`);
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
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
  return `
    @font-face {
      font-family: 'OgSans';
      src: url('data:font/ttf;base64,${FONT_REGULAR_B64}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'OgSans';
      src: url('data:font/ttf;base64,${FONT_BOLD_B64}') format('truetype');
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

function renderPanelPng(svgBuffer) {
  const resvg = new Resvg(svgBuffer.toString('utf8'), {
    fitTo: { mode: 'width', value: OG_WIDTH },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: 'OgSans',
    },
  });
  return Buffer.from(resvg.render().asPng());
}

async function loadTopImage(imageBuffer, { cropBottom = false } = {}) {
  const meta = await sharp(imageBuffer).metadata();
  let pipeline = sharp(imageBuffer);
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
    .resize(OG_WIDTH, IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
    .toBuffer();
}

/**
 * Compose 1200×630 OG card: AI image + quiz title + answer + #hashtags.
 * @param {'intro'|'result'} mode
 */
export async function composeOgImage({
  imageUrl,
  host,
  imagePath,
  quizTitle,
  headline,
  description,
  hashtags = [],
  mode = 'result',
}) {
  let imageBuffer;
  if (imageUrl) {
    imageBuffer = await loadImageBuffer(imageUrl, host);
  } else if (imagePath && fs.existsSync(imagePath)) {
    imageBuffer = fs.readFileSync(imagePath);
  } else {
    throw new Error(`Image not found: ${imageUrl || imagePath}`);
  }

  const topImage = await loadTopImage(imageBuffer, { cropBottom: mode === 'result' });
  const panelSvg = buildPanelSvg({
    quizTitle,
    headline,
    description: stripHtml(description),
    hashtags,
    mode,
  });

  const panelBuffer = renderPanelPng(panelSvg);

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
  const params = new URLSearchParams({ path: 'og-image', quizId });
  if (scoreCode !== null && scoreCode !== undefined && !Number.isNaN(scoreCode)) {
    params.set('score', String(scoreCode));
  }
  const path = host.includes('localhost')
    ? `/api/og-image?${new URLSearchParams({ quizId, ...(scoreCode != null && !Number.isNaN(scoreCode) ? { score: String(scoreCode) } : {}) })}`
    : `/api/handler?${params}`;
  return `${protocol}://${host}${path}`;
}
