import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../../public/images');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { filename, data } = body;
    if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, safeName), Buffer.from(data, 'base64'));

    return res.status(201).json({ path: `/images/${safeName}` });
  } catch (err) {
    console.error('POST /api/admin/upload', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
