#!/usr/bin/env node
/**
 * Generate SBTI type poster SVGs (original nambac assets).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const types = JSON.parse(
  fs.readFileSync(path.join(root, 'shared/sbti/types.vi.json'), 'utf8'),
);
const outDir = path.join(root, 'public/sbti/types');
fs.mkdirSync(outDir, { recursive: true });

const hues = [
  8, 18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148,
  158, 168, 178, 188, 198, 208, 218, 228, 238, 248, 258, 268,
];

const codes = Object.keys(types);
codes.forEach((code, i) => {
  const hue = hues[i % hues.length];
  const safe = encodeURIComponent(code);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 42%, 22%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360}, 38%, 34%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <text x="200" y="150" text-anchor="middle" font-family="system-ui, sans-serif" font-size="72" font-weight="900" fill="rgba(255,255,255,0.92)">${code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
  <text x="200" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="rgba(255,255,255,0.75)">${(types[code].name || '').slice(0, 24).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
  <text x="200" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">nambac · SBTI</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${safe}.svg`), svg);
});

const hubThumb = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#2b2235"/>
  <text x="160" y="95" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" font-weight="900" fill="#e85d4c">SBTI</text>
  <text x="160" y="130" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#fff">27 types · meme test</text>
</svg>`;
fs.writeFileSync(path.join(root, 'public/images/sbti-hub-thumb.svg'), hubThumb);

console.log(`Generated ${codes.length} posters + hub thumb`);
