/**
 * Discover OpenRouter models that can OUTPUT images, then try to generate a
 * test image with each free one. Prints which models actually work.
 *
 * Run: node scripts/images/try_openrouter_free.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error('❌ OPENROUTER_API_KEY missing');
  process.exit(1);
}

const HEADERS = {
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://nambac.vercel.app',
  'X-Title': process.env.OPENROUTER_APP_NAME || 'nambac',
};

function isZero(v) {
  if (v == null) return true;
  const n = Number(v);
  return Number.isFinite(n) && n === 0;
}

console.log('\n🔎 Fetching OpenRouter model catalog…\n');
const listRes = await fetch('https://openrouter.ai/api/v1/models', { headers: HEADERS });
const listData = await listRes.json().catch(() => ({}));
if (!listRes.ok) {
  console.error(`❌ models list failed (${listRes.status}):`, JSON.stringify(listData).slice(0, 300));
  process.exit(1);
}

const all = listData.data || [];
const imageOut = all.filter((m) => {
  const mods = m.architecture?.output_modalities || m.output_modalities || [];
  return Array.isArray(mods) && mods.includes('image');
});

console.log(`Total models: ${all.length} · image-output models: ${imageOut.length}\n`);

const free = imageOut.filter((m) => {
  const p = m.pricing || {};
  const priceKeys = ['image', 'prompt', 'completion', 'request'];
  const allZero = priceKeys.every((k) => isZero(p[k]));
  return allZero || m.id.includes(':free');
});

console.log('🖼️  IMAGE-OUTPUT MODELS (price image/prompt):');
for (const m of imageOut) {
  const p = m.pricing || {};
  console.log(`  - ${m.id}  [img:${p.image ?? '?'} prompt:${p.prompt ?? '?'}]`);
}

console.log(`\n🆓 FREE image-output candidates: ${free.length}`);
for (const m of free) console.log(`  - ${m.id}`);

const TEST_PROMPT =
  'A cute cartoon cat wearing sunglasses, vibrant colors, sticker style, no text';

async function tryImagesEndpoint(model) {
  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ model, prompt: TEST_PROMPT, aspect_ratio: '1:1', resolution: '1K', output_format: 'png' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, msg: `${res.status}: ${(data.error?.message || data.message || JSON.stringify(data.error || data)).slice(0, 160)}` };
  const b64 = data.data?.[0]?.b64_json;
  return b64 ? { ok: true, bytes: b64.length } : { ok: false, msg: 'no b64 in response' };
}

async function tryChatEndpoint(model) {
  // Some image models (e.g. gemini flash image) are exposed via chat completions with image modality
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      model,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: TEST_PROMPT }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, msg: `${res.status}: ${(data.error?.message || data.message || JSON.stringify(data.error || data)).slice(0, 160)}` };
  const img = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  return img ? { ok: true, bytes: img.length } : { ok: false, msg: 'no image in chat response' };
}

const candidates = free.length ? free : imageOut;
console.log(`\n🧪 Testing ${candidates.length} model(s) for actual generation…\n`);

const working = [];
for (const m of candidates) {
  process.stdout.write(`  • ${m.id} … images: `);
  let r = await tryImagesEndpoint(m.id);
  if (!r.ok) {
    process.stdout.write(`fail (${r.msg}) | chat: `);
    r = await tryChatEndpoint(m.id);
  }
  if (r.ok) {
    console.log(`✅ OK (${r.bytes} chars)`);
    working.push(m.id);
  } else {
    console.log(`❌ ${r.msg}`);
  }
  await new Promise((res) => setTimeout(res, 1200));
}

console.log(`\n✅ WORKING free image models: ${working.length ? working.join(', ') : 'none'}\n`);
