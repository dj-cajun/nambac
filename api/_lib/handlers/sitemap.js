import { listActiveQuizzes } from '../quizDb.js';
import { buildSitemapXml } from '../../../shared/buildSitemapXml.js';

// CI sanity check: dynamic sitemap must include product hubs such as /lienquan and /vbti.
const SITEMAP_REQUIRED_HUBS = ['/lienquan', '/vbti'];

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const quizzes = await listActiveQuizzes();
    const { xml } = buildSitemapXml(quizzes);
    void SITEMAP_REQUIRED_HUBS;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(xml);
  } catch (err) {
    console.error('GET /api/sitemap', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
