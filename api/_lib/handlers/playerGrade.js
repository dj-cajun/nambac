import { getSession } from '../session.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';
import { getPlayerProgress, recordQuizCompletion, mergeGuestProgress } from '../playerGradeDb.js';
import { getGradeForUniqueCount, getGradeProgress } from '../../../shared/playerGrades.js';

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
}

function formatResponse(progress, extra = {}) {
  const grade = getGradeForUniqueCount(progress?.unique_quizzes || 0);
  const gradeProgress = getGradeProgress(progress?.unique_quizzes || 0);
  return {
    grade: {
      level: grade.level,
      label: grade.label,
      labelKo: grade.labelKo,
      emoji: grade.emoji,
    },
    uniqueQuizzes: progress?.unique_quizzes || 0,
    totalCompletions: progress?.total_completions || 0,
    nextGrade: gradeProgress.next
      ? {
          level: gradeProgress.next.level,
          label: gradeProgress.next.label,
          labelKo: gradeProgress.next.labelKo,
          emoji: gradeProgress.next.emoji,
          remaining: gradeProgress.remaining,
        }
      : null,
    progressPercent: Math.round(gradeProgress.progress * 100),
    ...extra,
  };
}

export async function playerGradeGet(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = getSession(req);
    const visitorId = String(req.query?.visitorId || '').trim();

    if (session?.userId && visitorId) {
      await mergeGuestProgress(visitorId, session.userId);
    }

    const progress = await getPlayerProgress({
      userId: session?.userId || null,
      visitorId: session?.userId ? visitorId : visitorId,
    });

    if (!progress && !session?.userId && !visitorId) {
      return res.status(200).json({ grade: null });
    }

    return res.status(200).json(formatResponse(progress));
  } catch (err) {
    console.error('GET /api/player/grade', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function playerGradeComplete(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isTrustedSiteRequest(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = parseBody(req);
    const session = getSession(req);
    const visitorId = String(body.visitorId || '').trim();
    const quizId = String(body.quizId || '').trim();
    const score = body.score != null ? parseInt(body.score, 10) : null;

    if (!quizId) return res.status(400).json({ error: 'quizId required' });

    if (!session?.userId && (!visitorId || visitorId.length > 64)) {
      return res.status(400).json({ error: 'visitorId required for guest' });
    }

    const result = await recordQuizCompletion({
      userId: session?.userId || null,
      visitorId: visitorId || null,
      quizId,
      score: Number.isNaN(score) ? null : score,
    });

    return res.status(200).json(formatResponse(result.progress, {
      leveledUp: result.leveledUp,
      isNewQuiz: result.isNewQuiz,
      isFirstEver: result.isFirstEver,
      previousGrade: result.previousGrade.level > 0
        ? {
            level: result.previousGrade.level,
            label: result.previousGrade.label,
            emoji: result.previousGrade.emoji,
          }
        : null,
    }));
  } catch (err) {
    console.error('POST /api/player/complete', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return playerGradeGet(req, res);
  if (req.method === 'POST') return playerGradeComplete(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
