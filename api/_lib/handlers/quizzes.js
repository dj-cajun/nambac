import { listActiveQuizzes } from '../quizDb.js';
import { MEDIUM_CDN_CACHE, setNoStore, setPublicGetCache } from '../cdnCache.js';

const MEM_TTL_MS = 30_000;
let memCache = null;

async function getCachedQuizzes() {
  const now = Date.now();
  if (memCache && now - memCache.at < MEM_TTL_MS) return memCache.quizzes;
  const quizzes = await listActiveQuizzes();
  memCache = { quizzes, at: now };
  return quizzes;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  setPublicGetCache(res, MEDIUM_CDN_CACHE);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const quizzes = await getCachedQuizzes();
    if (req.method === 'HEAD') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).end();
    }
    return res.status(200).json({ quizzes });
  } catch (err) {
    console.error('GET /api/quizzes', err);
    setNoStore(res);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
