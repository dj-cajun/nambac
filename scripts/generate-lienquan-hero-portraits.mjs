#!/usr/bin/env node
/**
 * Generate copyright-free archetype SVG portraits for meta 15 Liên Quân heroes.
 * Run: node scripts/generate-lienquan-hero-portraits.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import metaHeroes from '../shared/lienquan/heroes.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/images/lienquan/heroes');

/** @type {Record<string, { bg: [string, string], accent: string, draw: (id: string) => string }>} */
const ARCHETYPES = {
  florentino: {
    bg: ['#2a1520', '#5c2038'],
    accent: '#f5c542',
    draw: () => `
      <line x1="88" y1="200" x2="168" y2="56" stroke="#f5c542" stroke-width="8" stroke-linecap="round"/>
      <line x1="168" y1="200" x2="88" y2="56" stroke="#ff2d85" stroke-width="8" stroke-linecap="round"/>
      <circle cx="128" cy="128" r="18" fill="#f5c542" opacity="0.35"/>
    `,
  },
  yena: {
    bg: ['#2d1a08', '#6b3a12'],
    accent: '#fb923c',
    draw: () => `
      <circle cx="128" cy="128" r="62" fill="none" stroke="#fb923c" stroke-width="6" stroke-dasharray="18 10"/>
      <circle cx="128" cy="128" r="38" fill="none" stroke="#fde68a" stroke-width="5" stroke-dasharray="12 8"/>
      <polygon points="128,70 142,110 182,110 150,134 162,174 128,150 94,174 106,134 74,110 114,110" fill="#fb923c" opacity="0.85"/>
    `,
  },
  omen: {
    bg: ['#12081f', '#2d1654'],
    accent: '#a78bfa',
    draw: () => `
      <path d="M48 190 Q128 40 208 190" fill="none" stroke="#a78bfa" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="128" cy="170" rx="52" ry="16" fill="#1e1038" stroke="#c4b5fd" stroke-width="3"/>
      <circle cx="128" cy="92" r="10" fill="#c4b5fd"/>
    `,
  },
  zuka: {
    bg: ['#0f2418', '#1f5c34'],
    accent: '#4ade80',
    draw: () => `
      <circle cx="128" cy="118" r="44" fill="#166534" stroke="#4ade80" stroke-width="5"/>
      <path d="M92 170 Q128 210 164 170" fill="none" stroke="#86efac" stroke-width="8" stroke-linecap="round"/>
      <path d="M70 96 L92 72 M186 96 L164 72" stroke="#4ade80" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  nakroth: {
    bg: ['#08141c', '#12324a'],
    accent: '#22d3ee',
    draw: () => `
      <path d="M72 188 L108 68 L128 120 L148 68 L184 188" fill="none" stroke="#22d3ee" stroke-width="7" stroke-linejoin="round"/>
      <path d="M96 140 L160 140" stroke="#67e8f9" stroke-width="4" stroke-linecap="round"/>
      <circle cx="128" cy="156" r="8" fill="#22d3ee"/>
    `,
  },
  keera: {
    bg: ['#1a0824', '#4a1258'],
    accent: '#e879f9',
    draw: () => `
      <path d="M60 170 Q90 90 128 110 Q166 90 196 170" fill="none" stroke="#e879f9" stroke-width="7"/>
      <path d="M78 130 Q128 60 178 130" fill="none" stroke="#f0abfc" stroke-width="5" opacity="0.7"/>
      <circle cx="128" cy="128" r="14" fill="#e879f9" opacity="0.5"/>
    `,
  },
  aoi: {
    bg: ['#2a1020', '#6b2048'],
    accent: '#fb7185',
    draw: () => `
      <path d="M56 150 Q128 40 200 150 Q128 190 56 150Z" fill="#9f1239" stroke="#fda4af" stroke-width="4"/>
      <path d="M80 138 Q128 90 176 138" fill="none" stroke="#ffe4e6" stroke-width="3"/>
      <circle cx="128" cy="118" r="8" fill="#fda4af"/>
    `,
  },
  yan: {
    bg: ['#2a0a0a', '#6b1515'],
    accent: '#f87171',
    draw: () => `
      <path d="M88 180 L128 70 L168 180" fill="none" stroke="#f87171" stroke-width="8" stroke-linejoin="round"/>
      <ellipse cx="128" cy="188" rx="48" ry="12" fill="#fca5a5" opacity="0.35"/>
      <path d="M108 120 L148 120" stroke="#fecaca" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  liliana: {
    bg: ['#2a1808', '#6b3d10'],
    accent: '#f59e0b',
    draw: () => `
      <path d="M88 170 Q108 90 128 100 Q148 90 168 170" fill="#b45309" stroke="#fcd34d" stroke-width="4"/>
      <path d="M100 80 Q128 50 156 80 Q140 110 128 120 Q116 110 100 80Z" fill="#f59e0b"/>
      <circle cx="128" cy="140" r="16" fill="#fde68a" opacity="0.6"/>
    `,
  },
  raz: {
    bg: ['#081428', '#12306a'],
    accent: '#38bdf8',
    draw: () => `
      <rect x="96" y="96" width="32" height="56" rx="8" fill="#0ea5e9"/>
      <rect x="128" y="96" width="32" height="56" rx="8" fill="#38bdf8"/>
      <path d="M80 72 L96 96 M176 72 L160 96 M72 180 L96 152 M184 180 L160 152" stroke="#7dd3fc" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  krixi: {
    bg: ['#0a1830', '#1e3a6e'],
    accent: '#93c5fd',
    draw: () => `
      <line x1="128" y1="56" x2="128" y2="190" stroke="#93c5fd" stroke-width="6" stroke-linecap="round"/>
      <polygon points="128,48 140,72 164,72 146,88 154,112 128,98 102,112 110,88 92,72 116,72" fill="#fde047"/>
      <circle cx="96" cy="100" r="6" fill="#bfdbfe"/><circle cx="160" cy="100" r="6" fill="#bfdbfe"/>
    `,
  },
  hayate: {
    bg: ['#101820', '#243040'],
    accent: '#94a3b8',
    draw: () => `
      <polygon points="128,64 148,108 196,108 156,136 172,180 128,152 84,180 100,136 60,108 108,108" fill="#64748b" stroke="#e2e8f0" stroke-width="4"/>
      <circle cx="128" cy="128" r="20" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>
    `,
  },
  elsu: {
    bg: ['#0a1420', '#1a3050'],
    accent: '#60a5fa',
    draw: () => `
      <circle cx="128" cy="128" r="56" fill="none" stroke="#60a5fa" stroke-width="5"/>
      <line x1="128" y1="72" x2="128" y2="184" stroke="#93c5fd" stroke-width="3"/>
      <line x1="72" y1="128" x2="184" y2="128" stroke="#93c5fd" stroke-width="3"/>
      <circle cx="128" cy="128" r="10" fill="#ef4444"/>
      <rect x="168" y="108" width="40" height="16" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
    `,
  },
  violet: {
    bg: ['#1a0828', '#4a1868'],
    accent: '#c084fc',
    draw: () => `
      <rect x="72" y="120" width="88" height="28" rx="6" fill="#581c87" stroke="#d8b4fe" stroke-width="3"/>
      <circle cx="168" cy="134" r="22" fill="#fbbf24" opacity="0.85"/>
      <path d="M168 112 L168 156 M156 134 L180 134" stroke="#fef3c7" stroke-width="3"/>
    `,
  },
  thane: {
    bg: ['#101828', '#243b5c'],
    accent: '#94a3b8',
    draw: () => `
      <path d="M88 72 L88 184 Q128 200 168 184 L168 72 Q128 56 88 72Z" fill="#334155" stroke="#cbd5e1" stroke-width="5"/>
      <path d="M108 96 L148 96 L148 160 L108 160Z" fill="#1e293b" stroke="#e2e8f0" stroke-width="3"/>
      <line x1="128" y1="72" x2="128" y2="48" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>
    `,
  },
};

function buildSvg(heroId, archetype) {
  const uid = heroId.replace(/[^a-z]/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${heroId} archetype portrait">
  <defs>
    <linearGradient id="bg-${uid}" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
      <stop stop-color="${archetype.bg[0]}"/>
      <stop offset="1" stop-color="${archetype.bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow-${uid}" cx="50%" cy="40%" r="60%">
      <stop stop-color="${archetype.accent}" stop-opacity="0.25"/>
      <stop offset="1" stop-color="${archetype.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bg-${uid})"/>
  <rect width="256" height="256" fill="url(#glow-${uid})"/>
  ${archetype.draw(uid)}
  <circle cx="128" cy="128" r="118" fill="none" stroke="${archetype.accent}" stroke-width="4" opacity="0.55"/>
</svg>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const hero of metaHeroes) {
  const archetype = ARCHETYPES[hero.id];
  if (!archetype) {
    console.warn(`skip ${hero.id}: no archetype`);
    continue;
  }
  const outPath = path.join(OUT_DIR, `${hero.id}.svg`);
  fs.writeFileSync(outPath, buildSvg(hero.id, archetype));
  written += 1;
}

console.log(`Wrote ${written} portraits to ${OUT_DIR}`);
