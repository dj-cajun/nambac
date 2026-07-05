/**
 * Demo: Gemini text + OpenRouter cover + Turso save
 * Run: npm run demo:ai-quiz
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const API = process.env.TEST_API_URL || 'http://localhost:8787/api';
const adminKey = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';
const headers = { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey };

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY 없음 (.env 확인)');
  process.exit(1);
}
if (!geminiKey) {
  console.error('❌ VITE_GEMINI_API_KEY 없음');
  process.exit(1);
}

console.log('\n🔑 OpenRouter: 설정됨');
console.log('🖼️  모델:', model);
console.log('📝 Gemini: 설정됨\n');

console.log('1/3 Gemini 퀴즈 텍스트 생성...');
const gemRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: 'Generate a fun Vietnamese quiz JSON about bubble tea in Saigon. Exactly 5 binary questions, 8 results (scores 0-7). Keys: title, description, category, questions, results. Keep text concise.',
        }],
      }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096, responseMimeType: 'application/json' },
    }),
  },
);
const gemData = await gemRes.json();
if (!gemRes.ok) throw new Error(gemData.error?.message || 'Gemini failed');
let text = gemData.candidates[0].content.parts[0].text;
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (jsonMatch) text = jsonMatch[0];
let ai;
try {
  ai = JSON.parse(text);
} catch {
  // trailing comma 등 간단 보정
  ai = JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
}
console.log('   ✅', ai.title);

console.log('2/3 OpenRouter 커버 이미지...');
const imgRes = await fetch(`${API}/generate-image`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    prompt: `Quiz cover: ${ai.title}. Bubble tea Saigon, cute webtoon`,
    type: 'cover',
  }),
});
const imgData = await imgRes.json();
if (!imgRes.ok) throw new Error(imgData.error || 'Image failed');
console.log(`   ✅ $${imgData.cost_usd} (${imgData.model})`);

const upRes = await fetch(`${API}/admin/upload`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ filename: `quiz_ai_${Date.now()}_cover.png`, data: imgData.b64_json }),
});
const upData = await upRes.json();
if (!upRes.ok) throw new Error(upData.error || 'Upload failed');

console.log('3/3 Turso 저장...');
const createRes = await fetch(`${API}/admin/quizzes`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    title: ai.title,
    description: ai.description || '',
    category: ai.category || 'fun',
    quiz_type: 'binary_5q',
    image_url: upData.path,
    questions: ai.questions.map((q, i) => ({
      order_number: q.order_number ?? i + 1,
      question_text: q.question_text || q.text,
      option_a: q.option_a || 'A',
      option_b: q.option_b || 'B',
      score_a: q.score_a ?? 0,
      score_b: q.score_b ?? (i < 3 ? [4, 2, 1][i] : 0),
    })),
    results: ai.results.map((r, i) => ({
      result_code: r.score ?? r.result_code ?? i,
      title: r.type_name || r.title || `Result ${i}`,
      description: r.description || '',
      traits: r.traits || [],
      image_url: '/images/default_cover.png',
    })),
  }),
});
const created = await createRes.json();
if (!createRes.ok) throw new Error(created.error);

console.log('\n🎉 AI 퀴즈 생성 완료!');
console.log('   ID:', created.id);
console.log('   플레이: http://localhost:5173/quiz/' + created.id);
console.log('   Admin: http://localhost:5173/admin\n');
