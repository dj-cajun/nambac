import { getSession } from '../../session.js';
import { isTrustedSiteRequest } from '../../requestOrigin.js';
import {
  getKhoeImage,
  processKhoeUploadBase64,
  saveKhoeImage,
} from '../../lienquanKhoeImage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'id required' });

      const image = await getKhoeImage(id);
      if (!image?.data) return res.status(404).json({ error: 'Not found' });

      const buf = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data);
      res.setHeader('Content-Type', image.contentType || 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.status(200).send(buf);
    }

    if (req.method === 'POST') {
      if (!isTrustedSiteRequest(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const session = getSession(req);
      if (!session?.userId) {
        return res.status(401).json({ error: 'Đăng nhập Google để tải ảnh' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const webp = await processKhoeUploadBase64(body.data);
      const { imageId, imageUrl } = await saveKhoeImage(session.userId, webp);

      return res.status(201).json({ imageId, imageUrl });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('/api/lienquan/khoe-image', err);
    const status = /login|Đăng nhập|quá lớn|trống/i.test(err.message) ? 400 : 500;
    return res.status(status).json({ error: err.message || 'Upload failed' });
  }
}
