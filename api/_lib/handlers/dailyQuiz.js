import { requireCron } from '../cronAuth.js';
import { createFullQuiz } from '../quizDb.js';
import { generateQuizContent, formatQuizForDb, pickDailyCategory } from '../geminiQuiz.js';
import { sendPushToAll } from '../pushService.js';
import { buildSiteUrl } from '../siteUrl.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireCron(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const category = body.category || req.query?.category || pickDailyCategory();

  try {
    const generated = await generateQuizContent(category, body.topic || '');
    const payload = formatQuizForDb(generated);
    const quiz = await createFullQuiz(payload);

    let push = null;
    if (body.notify !== false) {
      try {
        const site = buildSiteUrl();
        push = await sendPushToAll({
          title: '🆕 Quiz mới trên nambac!',
          body: payload.title,
          url: `${site}/quiz/${quiz.id}`,
          tag: `quiz-${quiz.id}`,
        });
      } catch (err) {
        push = { error: err.message };
      }
    }

    return res.status(201).json({
      ok: true,
      category,
      quiz: { id: quiz.id, title: payload.title },
      push,
    });
  } catch (err) {
    console.error('GET/POST /api/cron/daily-quiz', err);
    return res.status(500).json({ error: err.message || 'Daily quiz failed' });
  }
}