import { requireAdmin } from '../adminAuth.js';
import {
  listBrandInquiries,
  updateBrandInquiryStatus,
  deleteBrandInquiry,
} from '../quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const inquiryId = req.query?.id || body.id;

  try {
    if (req.method === 'GET') {
      const inquiries = await listBrandInquiries();
      return res.status(200).json({ inquiries });
    }

    if (req.method === 'PATCH') {
      if (!inquiryId) return res.status(400).json({ error: 'Inquiry id required' });
      await updateBrandInquiryStatus(inquiryId, body.status);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!inquiryId) return res.status(400).json({ error: 'Inquiry id required' });
      await deleteBrandInquiry(inquiryId);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('/api/admin/brand-inquiries', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
