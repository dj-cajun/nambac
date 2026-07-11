/**
 * @deprecated Use npm run images:zodiac — one-time 24 zodiac assets (no daily AI).
 * This script generated fortune_${date}_idx*.webp per day — replaced by zodiac pool.
 */
console.warn('⚠️  images:fortune is deprecated. Use: npm run images:zodiac');
console.warn('    Fortune now uses static zodiac_west_* / zodiac_cn_* images from DOB + axis.\n');

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

if (process.argv.includes('--force-legacy')) {
  const { spawn } = await import('node:child_process');
  const child = spawn(process.execPath, [path.join(__dirname, '_backfill_fortune_legacy.mjs'), ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
  });
  child.on('close', (code) => process.exit(code ?? 1));
} else {
  console.log('Nothing to run. Generate zodiac pool once:\n  npm run images:zodiac\n');
  process.exit(0);
}
