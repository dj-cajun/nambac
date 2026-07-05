import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getQuizById, getResultsByQuizId } from '../quizDb.js';
import {
  buildOgImageApiUrl,
  composeOgImage,
  parseTraits,
  resolveImagePath,
} from '../composeOgImage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_OG = path.join(__dirname, '../../../public/og-default.png');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const quizId = req.query?.quizId || req.query?.id;
    const scoreRaw = req.query?.score;
    const scoreCode = scoreRaw !== undefined && scoreRaw !== '' ? parseInt(scoreRaw, 10) : null;

    if (!quizId) return res.status(400).json({ error: 'quizId required' });

    const quiz = await getQuizById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let buffer;

    if (scoreCode !== null && !Number.isNaN(scoreCode)) {
      const results = await getResultsByQuizId(quizId);
      const result = results.find((row) => parseInt(row.result_code, 10) === scoreCode);
      if (!result) return res.status(404).json({ error: 'Result not found' });

      const imagePath = resolveImagePath(result.image_url) || resolveImagePath(quiz.image_url);
      if (!imagePath) {
        const fb = fs.readFileSync(FALLBACK_OG);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, s-maxage=86400');
        return res.status(200).send(fb);
      }

      buffer = await composeOgImage({
        imagePath,
        quizTitle: quiz.title,
        headline: result.title || result.type_name || 'Kết quả',
        description: result.description,
        hashtags: parseTraits(result.traits),
        mode: 'result',
      });
    } else {
      const imagePath = resolveImagePath(quiz.image_url);
      if (!imagePath) {
        return res.status(404).json({ error: 'Cover not found' });
      }

      buffer = await composeOgImage({
        imagePath,
        quizTitle: quiz.title,
        headline: quiz.title,
        description: quiz.description,
        hashtags: [],
        mode: 'intro',
      });
    }

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/og-image', err);
    return res.status(500).json({ error: err.message || 'OG image failed' });
  }
}

export { buildOgImageApiUrl };
