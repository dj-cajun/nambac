/**
 * Test OpenRouter FLUX Klein via /api/generate-image
 * Run: node scripts/test_openrouter_image.mjs
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const adminKey = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';
const apiBase = process.env.TEST_API_URL || 'http://localhost:8787/api';

console.log('\n🎨 OpenRouter image test');
console.log(`   Model: ${model}`);
console.log(`   API:   ${apiBase}/generate-image\n`);

const res = await fetch(`${apiBase}/generate-image`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey,
  },
  body: JSON.stringify({
    prompt: 'Saigon street food quiz cover, cute character, warm colors',
    type: 'cover',
  }),
});

const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error('❌ Failed:', data.error || res.status);
  process.exit(1);
}

const outPath = path.join(projectRoot, 'public/images/openrouter_test.png');
fs.writeFileSync(outPath, Buffer.from(data.b64_json, 'base64'));

console.log('✅ Image generated');
console.log(`   Model: ${data.model}`);
console.log(`   Cost:  $${data.cost_usd ?? '?'}`);
console.log(`   Saved: public/images/openrouter_test.png (${Math.round(data.b64_json.length / 1024)}KB b64)\n`);
