import { requireAdmin } from '../adminAuth.js';
import { getAnalyticsSummary } from '../quizDb.js';
import { getDailyVisitorSeries, getTodayVisitorStats } from '../visitDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const days = Number(req.query?.days) || 30;
    const [summary, dailyVisitors, todayVisitors] = await Promise.all([
      getAnalyticsSummary(),
      getDailyVisitorSeries(days),
      getTodayVisitorStats(),
    ]);
    return res.status(200).json({
      ...summary,
      dailyVisitors,
      todayVisitors,
    });
  } catch (err) {
    console.error('GET /api/admin/analytics', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
