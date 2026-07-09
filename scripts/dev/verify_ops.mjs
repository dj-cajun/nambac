#!/usr/bin/env node
/** Ops presence checks — never prints secret values */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const PLACEHOLDER_SLOTS = new Set(['1234567890', '0987654321', '0000000000', '']);

function present(name) {
  return Boolean(String(process.env[name] || '').trim());
}

function slotOk(name) {
  const v = String(process.env[name] || '').trim();
  return Boolean(v) && !PLACEHOLDER_SLOTS.has(v);
}

const rows = [
  ['VAPID_PUBLIC_KEY (local)', present('VAPID_PUBLIC_KEY')],
  ['VAPID_PRIVATE_KEY (local)', present('VAPID_PRIVATE_KEY')],
  ['VAPID_SUBJECT (local)', present('VAPID_SUBJECT')],
  ['VITE_ADSENSE_PUB_ID (local)', present('VITE_ADSENSE_PUB_ID')],
  ['VITE_ADSENSE_ENABLED=true', String(process.env.VITE_ADSENSE_ENABLED || '') === 'true'],
  ['VITE_ADSENSE_SLOT_HOME', slotOk('VITE_ADSENSE_SLOT_HOME')],
  ['VITE_ADSENSE_SLOT_QUIZ', slotOk('VITE_ADSENSE_SLOT_QUIZ')],
  ['VITE_ADSENSE_SLOT_RESULT_1', slotOk('VITE_ADSENSE_SLOT_RESULT_1')],
  ['VITE_ADSENSE_SLOT_RESULT_2', slotOk('VITE_ADSENSE_SLOT_RESULT_2')],
];

console.log('Local ops checklist');
for (const [label, ok] of rows) {
  console.log(ok ? '✅' : '⬜', label);
}

const base = (process.env.TEST_API_URL || 'https://www.nambac.xyz/api').replace(/\/$/, '');
try {
  const res = await fetch(`${base}/push/subscribe`);
  const data = await res.json().catch(() => ({}));
  const hasKey = Boolean(data.publicKey);
  console.log(hasKey ? '✅' : '⬜', `Production push publicKey (${base})`);
  if (!hasKey) {
    console.log('   → Add VAPID_* to Vercel Production env, then Redeploy');
  }
} catch (err) {
  console.log('❌ Production push check failed:', err.message);
}

const adsReady = String(process.env.VITE_ADSENSE_ENABLED || '') === 'true'
  && slotOk('VITE_ADSENSE_SLOT_HOME')
  && slotOk('VITE_ADSENSE_SLOT_QUIZ');
console.log(adsReady ? '✅' : '⬜', 'AdSense ready to enable (enabled + real slots)');
if (!adsReady) {
  console.log('   → Create 4 ad units in AdSense, set VITE_ADSENSE_SLOT_* + ENABLED=true on Vercel');
}

console.log('\nGTM: open docs/GTM_SETUP.md and publish container GTM-P56XG75Q');
