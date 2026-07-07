import { composeRoastOgImage } from '../composeOgImage.js';
import { getTraitById } from '../../../shared/roastData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const name = String(req.query?.name || 'Bạn thân').trim().slice(0, 22);
    const traitId = String(req.query?.trait || '').trim();
    const trait = getTraitById(traitId);

    const buffer = await composeRoastOgImage({
      name,
      traitTitle: trait.title,
      description: trait.description,
    });

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/roast-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
