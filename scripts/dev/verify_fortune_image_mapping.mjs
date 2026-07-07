#!/usr/bin/env node
import { ensureFortuneSceneImage } from '../../api/_lib/fortuneImageService.js';
import { FORTUNE_COUNT } from '../../shared/fortuneData.js';

function toDateLabel(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1];
  const daysArg = Number(args.find((a) => a.startsWith('--days='))?.split('=')[1] || 2);
  return { dateArg, days: Number.isFinite(daysArg) && daysArg > 0 ? daysArg : 2 };
}

function imageUrlIdx(imageUrl) {
  const m = /_idx(\d+)\.webp$/.exec(imageUrl || '');
  return m ? Number(m[1]) : null;
}

async function main() {
  const { dateArg, days } = parseArgs();
  const start = dateArg ? new Date(`${dateArg}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid --date value: ${dateArg}`);
  }

  const checks = [];
  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + dayOffset);
    const dateStr = toDateLabel(d);
    for (let idx = 0; idx < FORTUNE_COUNT; idx += 1) {
      checks.push({ dateStr, idx });
    }
  }

  let failed = 0;
  for (const c of checks) {
    const r = await ensureFortuneSceneImage({
      fortuneIndex: c.idx,
      dateStr: c.dateStr,
      host: 'localhost:5173',
    });
    const gotIdx = imageUrlIdx(r.image_url);
    const ok = gotIdx === c.idx && !!r.buffer;
    if (!ok) {
      failed += 1;
      console.error(
        `FAIL date=${c.dateStr} idx=${c.idx} image_url=${r.image_url || '-'} source=${r.source || '-'} gotIdx=${gotIdx}`,
      );
    } else {
      console.log(`OK   date=${c.dateStr} idx=${c.idx} source=${r.source}`);
    }
  }

  if (failed > 0) {
    throw new Error(`Fortune mapping verification failed: ${failed} case(s)`);
  }
  console.log(`\nPASS: ${checks.length} case(s) verified.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
