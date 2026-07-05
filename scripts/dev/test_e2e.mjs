/**
 * End-to-end smoke test: AI generation + core API flows
 * Run: node scripts/test_e2e.mjs
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const API = 'http://localhost:8787/api';
const VITE = 'http://localhost:5173';
const adminKey = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const results = [];
let testQuizId = null;

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.log(`❌ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function adminFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
      ...options.headers,
    },
  });
}

async function testServers() {
  try {
    const api = await fetch(`${API}/quizzes`);
    if (!api.ok) throw new Error(`API ${api.status}`);
    pass('Dev API (8787)', `${(await api.json()).quizzes?.length ?? 0} quizzes`);
  } catch (e) {
    fail('Dev API (8787)', e.message);
  }

  try {
    const vite = await fetch(`${VITE}/api/quizzes`);
    if (!vite.ok) throw new Error(`proxy ${vite.status}`);
    const ct = vite.headers.get('content-type') || '';
    if (!ct.includes('json')) throw new Error('proxy returned non-JSON');
    pass('Vite proxy (/api → 8787)');
  } catch (e) {
    fail('Vite proxy (/api → 8787)', e.message);
  }
}

async function testGeminiQuizGen() {
  if (!geminiKey) {
    fail('Gemini quiz text generation', 'VITE_GEMINI_API_KEY missing');
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    const body = {
      contents: [{
        parts: [{
          text: `Generate a minimal test quiz JSON in Vietnamese. Exactly 5 questions (binary A/B), 8 results (scores 0-7). Topic: coffee in Saigon. Return ONLY valid JSON with keys: title, description, category, questions, results. Keep text short for testing.`,
        }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];
    const quiz = JSON.parse(text);

    if (!quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length !== 5) {
      throw new Error(`Invalid structure: ${quiz.questions?.length} questions`);
    }
    if (!Array.isArray(quiz.results) || quiz.results.length !== 8) {
      throw new Error(`Invalid results: ${quiz.results?.length}`);
    }

    pass('Gemini quiz text generation', `"${quiz.title.slice(0, 40)}..."`);
    return quiz;
  } catch (e) {
    fail('Gemini quiz text generation', e.message);
    return null;
  }
}

async function testImagenCover() {
  if (!geminiKey) {
    fail('Imagen cover image', 'VITE_GEMINI_API_KEY missing');
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: 'Vietnamese Gen Z manhwa Saigon coffee shop cover, vibrant tropical colors, no text no letters' }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', safetyFilterLevel: 'BLOCK_ONLY_HIGH' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 120)}`);
    }

    const data = await res.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('No image bytes returned');

    pass('Imagen cover image', `${Math.round(b64.length / 1024)}KB base64`);
    return b64;
  } catch (e) {
    fail('Imagen cover image', e.message);
    return null;
  }
}

function formatAiQuizForDb(aiQuiz, coverPath) {
  const questions = aiQuiz.questions.map((q, i) => ({
    order_number: q.order_number ?? i + 1,
    question_text: q.question_text || q.text || `Q${i + 1}`,
    option_a: q.option_a || 'A',
    option_b: q.option_b || 'B',
    score_a: q.score_a ?? 0,
    score_b: q.score_b ?? (i < 3 ? [4, 2, 1][i] : 0),
  }));

  const results = aiQuiz.results.map((r, i) => ({
    result_code: r.score ?? r.result_code ?? i,
    title: r.type_name || r.title || `Result ${i}`,
    description: r.description || '',
    traits: r.traits || [],
    image_url: '/images/default_cover.png',
  }));

  return {
    title: `[E2E] ${aiQuiz.title}`,
    description: aiQuiz.description || '',
    category: aiQuiz.category || 'fun',
    quiz_type: 'binary_5q',
    image_url: coverPath || '/images/default_cover.png',
    questions,
    results,
  };
}

async function testFullAiQuizSave(aiQuiz, coverB64) {
  if (!aiQuiz) {
    fail('AI quiz save to Turso', 'skipped — no AI content');
    return;
  }

  try {
    let coverPath = '/images/default_cover.png';

    if (coverB64) {
      const uploadRes = await adminFetch(`${API}/admin/upload`, {
        method: 'POST',
        body: JSON.stringify({
          filename: `e2e_cover_${Date.now()}.png`,
          data: coverB64,
        }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`upload: ${uploadData.error}`);
      coverPath = uploadData.path;
      pass('Image upload to public/images', coverPath);
    }

    const payload = formatAiQuizForDb(aiQuiz, coverPath);
    const createRes = await adminFetch(`${API}/admin/quizzes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const created = await createRes.json();
    if (!createRes.ok) throw new Error(created.error);

    testQuizId = created.id;
    pass('AI quiz saved to Turso', testQuizId.slice(0, 8));

    const bundleRes = await fetch(`${API}/quizzes/${testQuizId}`);
    const bundle = await bundleRes.json();
    if (!bundleRes.ok) throw new Error(bundle.error);
    if (bundle.questions?.length !== 5 || bundle.results?.length !== 8) {
      throw new Error(`bundle mismatch q=${bundle.questions?.length} r=${bundle.results?.length}`);
    }
    pass('Public quiz bundle', '5Q / 8R');
  } catch (e) {
    fail('AI quiz save to Turso', e.message);
  }
}

async function testQuizPlayFlow() {
  const quizId = testQuizId || (await fetch(`${API}/quizzes`).then((r) => r.json())).quizzes?.[0]?.id;
  if (!quizId) {
    fail('Quiz play flow', 'no quiz available');
    return;
  }

  try {
    const bundle = await fetch(`${API}/quizzes/${quizId}`).then((r) => r.json());
    const questions = bundle.questions || [];
    const results = bundle.results || [];

    // Simulate all-B answers → score 7 (4+2+1)
    let score = 0;
    for (let i = 0; i < Math.min(3, questions.length); i++) {
      score += questions[i].score_b ?? 0;
    }

    const result = results.find((r) => parseInt(r.result_code) === score);
    if (!result) throw new Error(`No result for score ${score}`);

    pass('Score calculation + result lookup', `score=${score} → "${result.title.slice(0, 30)}..."`);

    const statRes = await fetch(`${API}/quizzes/${quizId}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'participate' }),
    });
    if (!statRes.ok) throw new Error(`stats ${statRes.status}`);
    pass('Participation stat increment');
  } catch (e) {
    fail('Quiz play flow', e.message);
  }
}

async function testBrandInquiry() {
  try {
    const res = await fetch(`${API}/brand-inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: 'E2E Test Co',
        contact_person: 'Tester',
        email: 'test@example.com',
        quiz_concept: 'Automated test inquiry',
        budget_tier: 'basic',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const listRes = await adminFetch(`${API}/admin/brand-inquiries`);
    const list = await listRes.json();
    const found = list.inquiries?.some((i) => i.id === data.id);
    if (!found) throw new Error('not in admin list');

    await adminFetch(`${API}/admin/brand-inquiries`, {
      method: 'DELETE',
      body: JSON.stringify({ id: data.id }),
    });

    pass('B2B brand inquiry (create + admin + delete)');
  } catch (e) {
    fail('B2B brand inquiry', e.message);
  }
}

async function testAdminCrud() {
  try {
    const listRes = await adminFetch(`${API}/admin/quizzes`);
    const list = await listRes.json();
    if (!listRes.ok) throw new Error(list.error);
    pass('Admin quiz list', `${list.quizzes?.length ?? 0} total`);

    if (testQuizId) {
      await adminFetch(`${API}/admin/quizzes/${testQuizId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'status', is_active: false, status: 'hidden' }),
      });
      const publicList = await fetch(`${API}/quizzes`).then((r) => r.json());
      const visible = publicList.quizzes?.some((q) => q.id === testQuizId);
      if (visible) throw new Error('hidden quiz still in public list');
      pass('Admin hide quiz (status toggle)');

      await adminFetch(`${API}/admin/quizzes/${testQuizId}`, { method: 'DELETE' });
      testQuizId = null;
      pass('Admin delete test quiz');
    }
  } catch (e) {
    fail('Admin CRUD', e.message);
  }
}

async function testFrontendRoutes() {
  const routes = ['/', '/admin', '/brands', '/about', '/faq'];
  for (const route of routes) {
    try {
      const res = await fetch(`${VITE}${route}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (!html.includes('root') && !html.includes('id="root"')) throw new Error('no root mount');
      pass(`Frontend route ${route}`);
    } catch (e) {
      fail(`Frontend route ${route}`, e.message);
    }
  }
}

async function main() {
  console.log('\n🧪 nambac E2E Test Suite\n');

  await testServers();
  const aiQuiz = await testGeminiQuizGen();
  const coverB64 = await testImagenCover();
  await testFullAiQuizSave(aiQuiz, coverB64);
  await testQuizPlayFlow();
  await testBrandInquiry();
  await testAdminCrud();
  await testFrontendRoutes();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log(`\n📊 Result: ${passed}/${results.length} passed`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  • ${f.name}: ${f.detail}`));
    process.exit(1);
  }
  console.log('\n✅ All tests passed\n');
}

main().catch((err) => {
  console.error('Fatal:', err);
  if (testQuizId) {
    adminFetch(`${API}/admin/quizzes/${testQuizId}`, { method: 'DELETE' }).catch(() => {});
  }
  process.exit(1);
});
