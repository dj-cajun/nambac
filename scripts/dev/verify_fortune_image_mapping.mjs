#!/usr/bin/env node
/**
 * Verify static zodiac fortune image pool (24 files) and DOB/axis mapping.
 * Replaces legacy per-fortune-index backfill checks.
 */
import fs from 'fs';
import path from 'path';
import { ensureFortuneSceneImage } from '../../api/_lib/fortuneImageService.js';
import { IMAGES_DIR } from '../../api/_lib/saveQuizImage.js';
import { FORTUNE_AXIS_IDS } from '../../shared/fortuneMeta.js';
import {
  CHINESE_ZODIAC_ANIMALS,
  resolveFortuneZodiacAsset,
} from '../../shared/zodiacFortune.js';
import { ZODIAC_SIGNS } from '../../shared/vbti/cross-zodiac.js';

function toDateLabel(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1];
  return { dateArg };
}

function assertFileExists(relPath) {
  const filePath = path.join(IMAGES_DIR, path.basename(relPath));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing zodiac asset: ${relPath} (run: npm run images:zodiac)`);
  }
  const stat = fs.statSync(filePath);
  if (stat.size < 500) {
    throw new Error(`Zodiac asset too small: ${relPath} (${stat.size} bytes)`);
  }
}

async function verifyScenario(label, opts) {
  const expected = resolveFortuneZodiacAsset(opts);
  const r = await ensureFortuneSceneImage({
    fortuneIndex: opts.fortuneIndex ?? 0,
    dateStr: opts.dateStr,
    host: 'localhost:5173',
    dob: opts.dob,
    axis: opts.axis,
  });

  if (r.image_url !== expected.path) {
    throw new Error(
      `${label}: path mismatch expected=${expected.path} got=${r.image_url || '-'}`,
    );
  }
  if (!r.buffer || r.buffer.length < 500) {
    throw new Error(`${label}: missing or tiny buffer for ${expected.path}`);
  }
  console.log(`OK   ${label} → ${expected.path} (${expected.label})`);
}

async function main() {
  const { dateArg } = parseArgs();
  const dateStr = dateArg || toDateLabel(new Date());

  for (const z of ZODIAC_SIGNS) {
    assertFileExists(`/images/zodiac_west_${z.id}.webp`);
  }
  for (const a of CHINESE_ZODIAC_ANIMALS) {
    assertFileExists(`/images/zodiac_cn_${a.id}.webp`);
  }
  console.log(`OK   24/24 zodiac files on disk`);

  const scenarios = [
    {
      label: 'DOB + love → cung',
      dob: '2000-07-15',
      axis: 'love',
      dateStr,
      fortuneIndex: 3,
    },
    {
      label: 'DOB + general → cung',
      dob: '1998-03-21',
      axis: 'general',
      dateStr,
      fortuneIndex: 7,
    },
    {
      label: 'DOB + money → con giáp',
      dob: '2000-07-15',
      axis: 'money',
      dateStr,
      fortuneIndex: 1,
    },
    {
      label: 'DOB + health → con giáp',
      dob: '1996-11-08',
      axis: 'health',
      dateStr,
      fortuneIndex: 12,
    },
    {
      label: 'no DOB + date rotation',
      dob: null,
      axis: 'love',
      dateStr,
      fortuneIndex: 0,
    },
    {
      label: 'no DOB + fortune index fallback',
      dob: null,
      axis: 'general',
      dateStr: null,
      fortuneIndex: 11,
    },
  ];

  for (const s of scenarios) {
    await verifyScenario(s.label, s);
  }

  for (const axisId of FORTUNE_AXIS_IDS) {
    await verifyScenario(`axis=${axisId}`, {
      dob: '2002-05-10',
      axis: axisId,
      dateStr,
      fortuneIndex: 5,
    });
  }

  console.log(`\nPASS: zodiac pool + ${scenarios.length + FORTUNE_AXIS_IDS.length} mapping case(s).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
