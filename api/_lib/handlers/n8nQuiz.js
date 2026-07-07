import { requireWebhook } from '../webhookAuth.js';
import { createFullQuiz } from '../quizDb.js';
import { sendPushToAll } from '../pushService.js';
import { buildSiteUrl } from '../siteUrl.js';
import { validateQuizPayload } from '../geminiQuiz.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireWebhook(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    if (!body.title) return res.status(400).json({ error: 'title required' });

    if (body.questions?.length || body.results?.length) {
      const validationErrors = validateQuizPayload({
        title: body.title,
        questions: body.questions || [],
        results: body.results || [],
      });
      if (validationErrors.length) {
        return res.status(400).json({ error: `Invalid quiz payload: ${validationErrors.join('; ')}` });
      }
    }

    const quiz = await createFullQuiz(body);

    let pushResult = null;
    if (body.notify !== false) {
      try {
        const site = buildSiteUrl();
        pushResult = await sendPushToAll({
          title: '🆕 Quiz mới trên nambac!',
          body: body.title,
          url: `${site}/quiz/${quiz.id}`,
          tag: `quiz-${quiz.id}`,
        });
      } catch (pushErr) {
        pushResult = { error: pushErr.message };
      }
    }

    return res.status(201).json({ quiz, push: pushResult });
  } catch (err) {
    console.error('POST /api/webhooks/n8n-quiz', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
