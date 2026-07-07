import { composeBalanceOgImage } from '../composeOgImage.js';
import { ensureBalanceSceneImage } from '../balanceImageService.js';
import { BALANCE_QUESTIONS, getQuestionById, parseSharedChoice } from '../../../shared/balanceData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const id = String(req.query?.id || req.query?.q || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });

    const question = getQuestionById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const choice = parseSharedChoice(req.query?.voted);
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const indexHint = Math.max(0, BALANCE_QUESTIONS.findIndex((q) => q.id === id));

    let scene = {};
    try {
      scene = await ensureBalanceSceneImage({ id, indexHint, host });
    } catch {
      /* fall back to default og image inside composer */
    }

    const buffer = await composeBalanceOgImage({
      imageUrl: scene.image_url,
      host,
      imageBuffer: scene.buffer,
      title: question.title || question.prompt,
      optionA: question.optionA || question.option_a,
      optionB: question.optionB || question.option_b,
      choice,
    });

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/balance-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
