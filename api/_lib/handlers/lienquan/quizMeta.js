import { getTurso } from '../../turso.js';
import { LIENQUAN_QUIZ_DB_TITLE } from '../../../../shared/lienquan/quizDbSeed.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getTurso();
    const rs = await db.execute({
      sql: `SELECT id FROM quizzes
            WHERE title = ? AND is_active = 1 AND (status IS NULL OR status != 'hidden')
            LIMIT 1`,
      args: [LIENQUAN_QUIZ_DB_TITLE],
    });
    const quizId = rs.rows[0]?.id ? String(rs.rows[0].id) : null;

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({
      quizId,
      ctaPath: '/lienquan/quiz',
    });
  } catch (err) {
    console.error('GET /api/lienquan/quiz-meta', err);
    return res.status(200).json({ quizId: null, ctaPath: '/lienquan/quiz' });
  }
}
