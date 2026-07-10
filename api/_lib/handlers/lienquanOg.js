import { composeLienquanOgImage } from '../composeOgImage.js';

function resolveHost(req) {
  return req.headers?.['x-forwarded-host'] || req.headers?.host || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'HEAD') {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).end();
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const title = String(req.query?.title || 'Cẩm Nang Liên Quân').trim().slice(0, 80);
    const subtitle = String(req.query?.subtitle || 'Khắc chế · Giáo án pro · Meta AOG').trim().slice(0, 120);

    const buffer = await composeLienquanOgImage({ title, subtitle, host: resolveHost(req) });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('GET /api/lienquan-og', err);
    return res.status(500).json({ error: err.message || 'Tạo ảnh OG thất bại' });
  }
}
