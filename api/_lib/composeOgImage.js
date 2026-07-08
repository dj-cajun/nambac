import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import sharp from 'sharp';
import { formatFortuneDateShort } from '../../shared/fortuneEngine.js';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../../public/images');
const FONT_REGULAR = path.join(__dirname, 'fonts/NotoSans-Regular.ttf');
const FONT_BOLD = path.join(__dirname, 'fonts/NotoSans-Bold.ttf');
const RESVG_WASM = path.join(__dirname, '../../node_modules/@resvg/resvg-wasm/index_bg.wasm');

// resvg-wasm ignores @font-face data URLs — load raw buffers and pass via fontBuffers.
const FONT_REGULAR_BUF = fs.readFileSync(FONT_REGULAR);
const FONT_BOLD_BUF = fs.readFileSync(FONT_BOLD);
const FONT_REGULAR_B64 = FONT_REGULAR_BUF.toString('base64');
const FONT_BOLD_B64 = FONT_BOLD_BUF.toString('base64');

async function ensureResvgReady() {
  if (globalThis.__nambacResvgInit) return;
  try {
    await initWasm(fs.readFileSync(RESVG_WASM));
  } catch (err) {
    if (!String(err.message).includes('Already initialized')) throw err;
  }
  globalThis.__nambacResvgInit = true;
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMAGE_HEIGHT = 420;
const PANEL_HEIGHT = OG_HEIGHT - IMAGE_HEIGHT;
const RESULT_BOTTOM_CROP = 0.12;
const OG_BG = { r: 255, g: 249, b: 252, alpha: 1 };

async function loadImageBufferFromSources({ imageUrl, host, imagePath, imageBuffer }) {
  if (imageBuffer) return imageBuffer;
  if (imagePath && fs.existsSync(imagePath)) {
    return fs.readFileSync(imagePath);
  }
  if (imageUrl) {
    return loadImageBuffer(imageUrl, host);
  }
  throw new Error(`Image not found: ${imageUrl || imagePath}`);
}

/**
 * SNS OG preview — full quiz/result image visible (contain), no baked-in text.
 * Title/description come from og:title / og:description meta tags.
 */
export async function composeOgImageOnly({ imageUrl, host, imagePath, imageBuffer }) {
  const buffer = await loadImageBufferFromSources({ imageUrl, host, imagePath, imageBuffer });

  return sharp(buffer)
    .resize(OG_WIDTH, OG_HEIGHT, {
      fit: 'contain',
      background: OG_BG,
    })
    .webp({ quality: 88 })
    .toBuffer();
}

export function resolveImagePath(imageUrl) {
  if (!imageUrl) return null;
  const normalized = String(imageUrl).split('?')[0];
  const rel = normalized.replace(/^\/?images\//, '');
  if (!rel) return null;
  const fp = path.join(IMAGES_DIR, rel);
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

function isLikelyImageBuffer(buffer, contentType) {
  if (contentType && !contentType.startsWith('image/') && contentType !== 'application/octet-stream') {
    return false;
  }
  if (!buffer || buffer.length < 12) return false;
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return true;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return true;
  return Boolean(contentType?.startsWith('image/'));
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
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type');
  if (!isLikelyImageBuffer(buffer, contentType)) {
    throw new Error(`Not an image: ${url} (${contentType || 'unknown'})`);
  }
  return buffer;
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

// NotoSans has no color-emoji glyphs → strip them so they don't render as tofu boxes.
function stripEmoji(text) {
  return String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
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
  const quizLabel = truncate(stripEmoji(quizTitle), 72);
  const title = truncate(stripEmoji(headline), 56);
  const descLines = wrapLines(stripEmoji(description), 68, 2);
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

async function renderPanelPng(svgBuffer) {
  await ensureResvgReady();
  const resvg = new Resvg(svgBuffer.toString('utf8'), {
    fitTo: { mode: 'width', value: OG_WIDTH },
    font: {
      loadSystemFonts: false,
      fontBuffers: [FONT_REGULAR_BUF, FONT_BOLD_BUF],
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
  let imageBuffer = await loadImageBufferFromSources({ imageUrl, host, imagePath });

  const topImage = await loadTopImage(imageBuffer, { cropBottom: mode === 'result' });
  const panelSvg = buildPanelSvg({
    quizTitle,
    headline,
    description: stripHtml(description),
    hashtags,
    mode,
  });

  const panelBuffer = await renderPanelPng(panelSvg);

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

const FORTUNE_OG_WIDTH = 1200;
const FORTUNE_OG_HEIGHT = 630;
const FORTUNE_IMAGE_HEIGHT = 450;
const FORTUNE_PANEL_HEIGHT = FORTUNE_OG_HEIGHT - FORTUNE_IMAGE_HEIGHT;

function buildFortunePanelSvg({ name, fortuneTitle, dateStr }) {
  const who = truncate(stripEmoji(name || 'Bạn thân'), 26);
  const title = truncate(stripEmoji(fortuneTitle || FORTUNE_BRAND.labelFull), 58);
  const dateLine = truncate(formatFortuneDateShort(dateStr), 24);

  return Buffer.from(`<svg width="${FORTUNE_OG_WIDTH}" height="${FORTUNE_PANEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect width="100%" height="100%" fill="#1e0a14"/>
  <rect width="100%" height="6" fill="#FF2D85"/>
  <text x="48" y="38" fill="#fda4af" font-size="20" font-weight="700">TỬ VI TÌNH YÊU · NAMBAC.XYZ</text>
  <text x="${FORTUNE_OG_WIDTH - 48}" y="38" fill="#fda4af" font-size="18" text-anchor="end">${escapeXml(dateLine)}</text>
  <text x="48" y="90" fill="#FF2D85" font-size="42" font-weight="700">Thẻ tình yêu của: ${escapeXml(who)}</text>
  <text x="48" y="134" fill="#fde047" font-size="27" font-weight="700">${escapeXml(title)}</text>
  <text x="48" y="${FORTUNE_PANEL_HEIGHT - 20}" fill="#94a3b8" font-size="18">Cùng ngày cùng tên = cùng kết quả · nambac.xyz/fortune</text>
</svg>`);
}

/**
 * Fortune share OG — cached AI scene + name/title burn-in (no @vercel/og dep).
 */
export async function composeFortuneOgImage({
  imageUrl,
  host,
  imagePath,
  imageBuffer: inputBuffer,
  name,
  fortuneTitle,
  dateStr,
}) {
  let imageBuffer;
  try {
    imageBuffer = await loadImageBufferFromSources({
      imageUrl,
      host,
      imagePath,
      imageBuffer: inputBuffer,
    });
  } catch {
    const fallback = path.join(__dirname, 'og-default.png');
    imageBuffer = fs.readFileSync(fallback);
  }

  const topImage = await sharp(imageBuffer)
    .resize(FORTUNE_OG_WIDTH, FORTUNE_IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
    .toBuffer();

  const panelSvg = buildFortunePanelSvg({ name, fortuneTitle, dateStr });
  const panelBuffer = await renderPanelPng(panelSvg);

  return sharp({
    create: {
      width: FORTUNE_OG_WIDTH,
      height: FORTUNE_OG_HEIGHT,
      channels: 3,
      background: '#1e0a14',
    },
  })
    .composite([
      { input: topImage, top: 0, left: 0 },
      { input: panelBuffer, top: FORTUNE_IMAGE_HEIGHT, left: 0 },
    ])
    .webp({ quality: 88 })
    .toBuffer();
}

const BALANCE_OG_WIDTH = 1200;
const BALANCE_OG_HEIGHT = 630;
const BALANCE_IMAGE_HEIGHT = 360;
const BALANCE_PANEL_HEIGHT = BALANCE_OG_HEIGHT - BALANCE_IMAGE_HEIGHT;

function buildBalancePanelSvg({ title, optionA, optionB, choice }) {
  const titleLines = wrapLines(title, 58, 2);
  const titleSvg = titleLines
    .map((line, i) => `<tspan x="48" dy="${i === 0 ? 0 : 40}">${escapeXml(line)}</tspan>`)
    .join('');

  const rowY = titleLines.length > 1 ? 168 : 132;
  const optA = truncate(stripHtml(optionA), 62);
  const optB = truncate(stripHtml(optionB), 62);
  const pickedA = choice === 'a';
  const pickedB = choice === 'b';

  const optionRow = (label, text, y, picked) => {
    const chipFill = label === 'A' ? '#FF2D85' : '#7c3aed';
    const rowFill = picked ? '#fff' : '#f4eef9';
    const rowStroke = picked ? chipFill : '#e0d4ee';
    const badgeW = 150;
    const badgeX = BALANCE_OG_WIDTH - 60 - badgeW;
    const check = picked
      ? `<rect x="${badgeX}" y="${y + 14}" width="${badgeW}" height="36" rx="18" fill="${chipFill}"/>
    <text x="${badgeX + badgeW / 2}" y="${y + 39}" fill="#fff" font-size="21" font-weight="700" text-anchor="middle">TÔI CHỌN</text>`
      : '';
    return `
    <rect x="40" y="${y}" width="${BALANCE_OG_WIDTH - 80}" height="64" rx="14" fill="${rowFill}" stroke="${rowStroke}" stroke-width="${picked ? 3 : 2}"/>
    <rect x="52" y="${y + 14}" width="36" height="36" rx="10" fill="${chipFill}"/>
    <text x="70" y="${y + 41}" fill="#fff" font-size="24" font-weight="700" text-anchor="middle">${label}</text>
    <text x="104" y="${y + 41}" fill="#3f3350" font-size="24" font-weight="${picked ? 700 : 400}">${escapeXml(text)}</text>
    ${check}`;
  };

  return Buffer.from(`<svg width="${BALANCE_OG_WIDTH}" height="${BALANCE_PANEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect width="100%" height="100%" fill="#fff9fc"/>
  <rect width="100%" height="6" fill="#FF2D85"/>
  <text x="48" y="40" fill="#94a3b8" font-size="20" font-weight="700">CHỌN 1 TRONG 2 · NAMBAC.XYZ</text>
  <text x="48" y="86" fill="#3f3350" font-size="34" font-weight="700">${titleSvg}</text>
  ${optionRow('A', optA, rowY, pickedA)}
  ${optionRow('B', optB, rowY + 76, pickedB)}
</svg>`);
}

/** Balance (Chọn 1 trong 2) OG — scene image + question + A/B with picked side highlighted. */
export async function composeBalanceOgImage({
  imageUrl,
  host,
  imagePath,
  imageBuffer: inputBuffer,
  title,
  optionA,
  optionB,
  choice,
}) {
  let imageBuffer;
  try {
    imageBuffer = await loadImageBufferFromSources({
      imageUrl,
      host,
      imagePath,
      imageBuffer: inputBuffer,
    });
  } catch {
    const fallback = path.join(__dirname, 'og-default.png');
    imageBuffer = fs.readFileSync(fallback);
  }

  const topImage = await sharp(imageBuffer)
    .resize(BALANCE_OG_WIDTH, BALANCE_IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
    .toBuffer();

  const panelSvg = buildBalancePanelSvg({ title, optionA, optionB, choice });
  const panelBuffer = await renderPanelPng(panelSvg);

  return sharp({
    create: {
      width: BALANCE_OG_WIDTH,
      height: BALANCE_OG_HEIGHT,
      channels: 3,
      background: '#fff9fc',
    },
  })
    .composite([
      { input: topImage, top: 0, left: 0 },
      { input: panelBuffer, top: BALANCE_IMAGE_HEIGHT, left: 0 },
    ])
    .webp({ quality: 88 })
    .toBuffer();
}

const ROAST_OG_WIDTH = 1200;
const ROAST_OG_HEIGHT = 630;
const ROAST_IMAGE_HEIGHT = 372;
const ROAST_PANEL_HEIGHT = ROAST_OG_HEIGHT - ROAST_IMAGE_HEIGHT;

/** Name callout burned onto the scene image (top-left), mirrors the in-app overlay. */
function buildRoastNameOverlaySvg({ name }) {
  const who = truncate(stripEmoji(name || 'Bạn thân'), 20);
  const charW = 22;
  const pillW = Math.min(560, Math.max(160, who.length * charW + 56));
  return Buffer.from(`<svg width="${ROAST_OG_WIDTH}" height="${ROAST_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <g>
    <rect x="48" y="40" width="${pillW}" height="62" rx="31" fill="#fde047" stroke="#0f172a" stroke-width="4"/>
    <text x="${48 + pillW / 2}" y="82" fill="#0f172a" font-size="34" font-weight="700" text-anchor="middle">${escapeXml(who)}</text>
    <path d="M${68} 108 C ${96} 150 ${118} 176 ${132} 214" stroke="#ff2d55" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M132 214 L112 194 M132 214 L150 196" stroke="#ff2d55" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`);
}

function buildRoastPanelSvg({ name, traitTitle, description }) {
  const who = truncate(stripEmoji(name || 'Bạn thân'), 22);
  const crime = truncate(stripEmoji(traitTitle || 'Tội danh bí ẩn'), 40);
  const descLines = wrapLines(stripEmoji(description), 74, 2);
  const descSvg = descLines
    .map((line, i) => `<tspan x="60" dy="${i === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`)
    .join('');

  return Buffer.from(`<svg width="${ROAST_OG_WIDTH}" height="${ROAST_PANEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect width="100%" height="100%" fill="#1e1220"/>
  <rect width="100%" height="6" fill="#ff2d55"/>
  <text x="60" y="52" fill="#ff8fa3" font-size="22" font-weight="700">THẺ ĐEN BÓC PHỐT · NAMBAC.XYZ</text>
  <rect x="${ROAST_OG_WIDTH - 220}" y="26" width="160" height="42" rx="21" fill="#ff2d55"/>
  <text x="${ROAST_OG_WIDTH - 140}" y="55" fill="#fff" font-size="20" font-weight="700" text-anchor="middle">ĐỘC HẠI</text>
  <text x="60" y="104" fill="#ffd166" font-size="40" font-weight="700">${escapeXml(who)} — ${escapeXml(crime)}</text>
  ${descLines.length ? `<text x="60" y="152" fill="#d6c9de" font-size="24">${descSvg}</text>` : ''}
  <text x="60" y="${ROAST_PANEL_HEIGHT - 22}" fill="#8a7590" font-size="19">Vào làm thẻ trả đũa · nambac.xyz</text>
  <text x="${ROAST_OG_WIDTH - 60}" y="${ROAST_PANEL_HEIGHT - 22}" fill="#8a7590" font-size="19" text-anchor="end">#SAIGON-GENZ-2026</text>
</svg>`);
}

/** Roast blacklist OG — AI scene image + name callout + crime panel (matches app card). */
export async function composeRoastOgImage({ name, traitTitle, description, imageUrl, imagePath, host }) {
  let topImage;
  try {
    const imageBuffer = await loadImageBufferFromSources({ imageUrl, host, imagePath });
    const sceneOnly = await sharp(imageBuffer)
      .resize(ROAST_OG_WIDTH, ROAST_IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
      .toBuffer();
    const overlayPng = await renderPanelPng(buildRoastNameOverlaySvg({ name }));
    topImage = await sharp(sceneOnly)
      .composite([{ input: overlayPng, top: 0, left: 0 }])
      .toBuffer();
  } catch {
    topImage = await renderPanelPng(buildRoastNameOverlaySvg({ name }));
  }

  const panelBuffer = await renderPanelPng(buildRoastPanelSvg({ name, traitTitle, description }));

  return sharp({
    create: {
      width: ROAST_OG_WIDTH,
      height: ROAST_OG_HEIGHT,
      channels: 3,
      background: '#1e1220',
    },
  })
    .composite([
      { input: topImage, top: 0, left: 0 },
      { input: panelBuffer, top: ROAST_IMAGE_HEIGHT, left: 0 },
    ])
    .webp({ quality: 90 })
    .toBuffer();
}

export function buildRoastOgImageApiUrl(host, { name, trait }) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const devQuery = new URLSearchParams({ name: String(name), trait: String(trait) });
  const prodQuery = new URLSearchParams({ path: 'roast-og', name: String(name), trait: String(trait) });
  const path = host.includes('localhost')
    ? `/api/roast-og?${devQuery}`
    : `/api/handler?${prodQuery}`;
  return `${protocol}://${host}${path}`;
}

const BRAIN_OG_WIDTH = 1200;
const BRAIN_OG_HEIGHT = 630;
const BRAIN_IMAGE_HEIGHT = 372;
const BRAIN_PANEL_HEIGHT = BRAIN_OG_HEIGHT - BRAIN_IMAGE_HEIGHT;

/** "Não {name}" callout burned onto the scene image (top-left). */
function buildBrainNameOverlaySvg({ label }) {
  const who = truncate(stripEmoji(label || 'Não bạn'), 22);
  const charW = 22;
  const pillW = Math.min(620, Math.max(180, who.length * charW + 56));
  return Buffer.from(`<svg width="${BRAIN_OG_WIDTH}" height="${BRAIN_IMAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <g>
    <rect x="48" y="40" width="${pillW}" height="62" rx="31" fill="#c4b5fd" stroke="#0f172a" stroke-width="4"/>
    <text x="${48 + pillW / 2}" y="82" fill="#0f172a" font-size="34" font-weight="700" text-anchor="middle">${escapeXml(who)}</text>
    <path d="M${68} 108 C ${96} 150 ${118} 176 ${132} 214" stroke="#7c3aed" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M132 214 L112 194 M132 214 L150 196" stroke="#7c3aed" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`);
}

function buildBrainPanelSvg({ name, resultTitle, segments = [] }) {
  const who = truncate(stripEmoji(name || 'Bạn thân'), 24);
  const title = truncate(stripEmoji(resultTitle || 'Bộ não bí ẩn'), 40);
  const segRow = segments
    .slice(0, 3)
    .map((s, i) => {
      const label = truncate(stripEmoji(s.label || ''), 26);
      return `<text x="60" y="${140 + i * 34}" fill="#ddd6fe" font-size="24" font-weight="700">${escapeXml(`${s.pct}%`)} <tspan fill="#c4b5fd" font-weight="400">${escapeXml(label)}</tspan></text>`;
    })
    .join('');

  return Buffer.from(`<svg width="${BRAIN_OG_WIDTH}" height="${BRAIN_PANEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>${fontFaceCss()}</style></defs>
  <rect width="100%" height="100%" fill="#241141"/>
  <rect width="100%" height="6" fill="#7c3aed"/>
  <text x="60" y="48" fill="#c4b5fd" font-size="21" font-weight="700">TRONG ĐẦU BẠN CÓ GÌ · NAMBAC.XYZ</text>
  <text x="60" y="98" fill="#fde047" font-size="36" font-weight="700">${escapeXml(who)} — ${escapeXml(title)}</text>
  ${segRow}
  <text x="${BRAIN_OG_WIDTH - 60}" y="${BRAIN_PANEL_HEIGHT - 20}" fill="#a78bda" font-size="18" text-anchor="end">Quét sóng não bạn bè · #SAIGON-GENZ</text>
</svg>`);
}

/** Brain OG — AI scene image + "Não {name}" callout + result panel (matches app card). */
export async function composeBrainOgImage({ name, resultTitle, segments, imageUrl, imagePath, host }) {
  const label = String(name || '').trim() ? `Não ${String(name).trim()}` : 'Não bạn';
  let topImage;
  try {
    const imageBuffer = await loadImageBufferFromSources({ imageUrl, host, imagePath });
    const sceneOnly = await sharp(imageBuffer)
      .resize(BRAIN_OG_WIDTH, BRAIN_IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
      .toBuffer();
    const overlayPng = await renderPanelPng(buildBrainNameOverlaySvg({ label }));
    topImage = await sharp(sceneOnly)
      .composite([{ input: overlayPng, top: 0, left: 0 }])
      .toBuffer();
  } catch {
    topImage = await renderPanelPng(buildBrainNameOverlaySvg({ label }));
  }

  const panelBuffer = await renderPanelPng(buildBrainPanelSvg({ name, resultTitle, segments }));

  return sharp({
    create: {
      width: BRAIN_OG_WIDTH,
      height: BRAIN_OG_HEIGHT,
      channels: 3,
      background: '#241141',
    },
  })
    .composite([
      { input: topImage, top: 0, left: 0 },
      { input: panelBuffer, top: BRAIN_IMAGE_HEIGHT, left: 0 },
    ])
    .webp({ quality: 90 })
    .toBuffer();
}

export function buildBrainOgImageApiUrl(host, { name, result }) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const devQuery = new URLSearchParams({ name: String(name), result: String(result) });
  const prodQuery = new URLSearchParams({ path: 'brain-og', name: String(name), result: String(result) });
  const path = host.includes('localhost')
    ? `/api/brain-og?${devQuery}`
    : `/api/handler?${prodQuery}`;
  return `${protocol}://${host}${path}`;
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

/** Balance share OG — same handler routing as quiz og-image */
export function buildBalanceOgImageApiUrl(host, { id, choice }) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const side = choice === 'a' ? 'A' : choice === 'b' ? 'B' : '';
  const devQuery = new URLSearchParams({ q: String(id) });
  if (side) devQuery.set('voted', side);
  const prodQuery = new URLSearchParams({ path: 'balance-og', q: String(id) });
  if (side) prodQuery.set('voted', side);
  const path = host.includes('localhost')
    ? `/api/balance-og?${devQuery}`
    : `/api/handler?${prodQuery}`;
  return `${protocol}://${host}${path}`;
}

/** Fortune result OG — same handler routing as quiz og-image */
export function buildFortuneOgImageApiUrl(host, { name, idx, date }) {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const query = new URLSearchParams({
    name: String(name).trim(),
    idx: String(idx),
    date: String(date),
  });
  const path = host.includes('localhost')
    ? `/api/fortune-og?${query}`
    : `/api/handler?${new URLSearchParams({ path: 'fortune-og', name: String(name).trim(), idx: String(idx), date: String(date) })}`;
  return `${protocol}://${host}${path}`;
}
