/**
 * Demo: Gemini text + OpenRouter cover + Turso save
 * Run: npm run demo:ai-quiz
 */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const API = process.env.TEST_API_URL || 'http://localhost:5173/api';
const adminKey = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const model = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';
const headers = { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey };

const {
  generateQuizContent,
  formatQuizForDb,
  validateQuizPayload,
} = await import('../../shared/quizPrompts.js');
const { coverPrompt } = await import('../../shared/imagePrompts.js');

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

console.log('1/3 Gemini 퀴즈 텍스트 생성 (Trendy / trà sữa)...');
const generated = await generateQuizContent({
  apiKey: geminiKey,
  categoryId: 'Trendy',
  customTopic: 'Trà sữa Sài Gòn — thói quen gọi đồ uống',
});
const ai = formatQuizForDb(generated);
const validationErrors = validateQuizPayload(ai);
if (validationErrors.length) {
  console.error('❌ 퀴즈 검증 실패:', validationErrors.join('; '));
  process.exit(1);
}
console.log('   ✅', ai.title);

console.log('2/3 OpenRouter 커버 이미지...');
const imgRes = await fetch(`${API}/generate-image`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    prompt: coverPrompt({ title: ai.title, description: ai.description, category: ai.category }),
    raw: true,
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
    category: ai.category,
    quiz_type: 'binary_5q',
    image_url: upData.path,
    questions: ai.questions,
    results: ai.results.map((r) => ({
      ...r,
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
