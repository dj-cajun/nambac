import { composeVbtiOgImage } from '../composeOgImage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const title = String(req.query?.title || 'VBTI').trim().slice(0, 80);
    const subtitle = String(
      req.query?.subtitle || '27 nhãn meme · test tiếng Việt trên nambac',
    ).trim().slice(0, 120);

    const buffer = await composeVbtiOgImage({ title, subtitle });

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/vbti-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
