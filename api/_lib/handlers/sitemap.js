import { listActiveQuizzes } from '../quizDb.js';
import { buildSitemapXml } from '../../../shared/buildSitemapXml.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const quizzes = await listActiveQuizzes();
    const { xml } = buildSitemapXml(quizzes);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(xml);
  } catch (err) {
    console.error('GET /api/sitemap', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
