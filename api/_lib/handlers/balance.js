import { isTrustedSiteRequest } from '../requestOrigin.js';
import {
  castBalanceVote,
  getBalanceStats,
  getRandomBalanceQuestion,
} from '../balanceDb.js';
import { getQuestionById } from '../../../shared/balanceData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = req.query?.action || 'random';
  const questionId = req.query?.id;

  try {
    if (req.method === 'GET' && action === 'random') {
      const exclude = req.query?.exclude || '';
      const question = getRandomBalanceQuestion(exclude || undefined);
      let stats = { pct_a: 50, pct_b: 50, total: 0, votes_a: 0, votes_b: 0 };
      try {
        stats = await getBalanceStats(question.id);
      } catch {
        /* table may not exist yet — client still works */
      }
      return res.status(200).json({ question, stats });
    }

    if (req.method === 'GET' && questionId) {
      const question = getQuestionById(questionId);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      let stats = { pct_a: 50, pct_b: 50, total: 0, votes_a: 0, votes_b: 0 };
      try {
        stats = await getBalanceStats(questionId);
      } catch {
        /* fallback */
      }
      return res.status(200).json({ question, stats });
    }

    if (req.method === 'POST') {
      if (!isTrustedSiteRequest(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const qid = body.question_id || questionId;
      const choice = body.choice;
      if (!qid || !choice) {
        return res.status(400).json({ error: 'Missing question_id or choice' });
      }
      const stats = await castBalanceVote(qid, choice);
      const question = getQuestionById(qid);
      return res.status(200).json({ question, stats });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('balance handler', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
