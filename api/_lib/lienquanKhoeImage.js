import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { getTurso } from './turso.js';
import { getSupabase, isSupabaseConfigured } from './supabase.js';

const MAX_INPUT_BYTES = 6 * 1024 * 1024;
const MAX_WEBP_BYTES = 900 * 1024;
const KHOE_BUCKET = 'khoe-images';

async function ensureKhoeImageSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS lienquan_khoe_images (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'image/webp',
      data BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
}

export async function processKhoeUploadBase64(b64) {
  const raw = Buffer.from(String(b64 || ''), 'base64');
  if (!raw.length) throw new Error('Ảnh trống');
  if (raw.length > MAX_INPUT_BYTES) throw new Error('Ảnh quá lớn (tối đa 6MB)');

  let webp = await sharp(raw)
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  if (webp.length > MAX_WEBP_BYTES) {
    webp = await sharp(webp)
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
  }
  if (webp.length > MAX_WEBP_BYTES) {
    throw new Error('Ảnh vẫn quá lớn sau khi nén — chọn ảnh nhỏ hơn');
  }
  return webp;
}

/** @returns {{ imageId: string, imageUrl: string }} */
export async function saveKhoeImage(userId, webpBuffer) {
  if (!userId) throw new Error('Login required');
  const id = randomUUID();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const objectPath = `${userId}/${id}.webp`;
    const { error } = await supabase.storage.from(KHOE_BUCKET).upload(objectPath, webpBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });
    if (error) throw new Error(error.message || 'Storage upload failed');

    const { data } = supabase.storage.from(KHOE_BUCKET).getPublicUrl(objectPath);
    return { imageId: id, imageUrl: data.publicUrl };
  }

  const db = getTurso();
  await ensureKhoeImageSchema(db);
  await db.execute({
    sql: `INSERT INTO lienquan_khoe_images (id, user_id, content_type, data, created_at)
          VALUES (?, ?, 'image/webp', ?, datetime('now'))`,
    args: [id, userId, webpBuffer],
  });
  return { imageId: id, imageUrl: khoeImageApiPath(id) };
}

export async function getKhoeImage(id) {
  const safeId = String(id || '').trim();
  if (!safeId) return null;

  const db = getTurso();
  await ensureKhoeImageSchema(db);
  const rs = await db.execute({
    sql: 'SELECT content_type, data FROM lienquan_khoe_images WHERE id = ? LIMIT 1',
    args: [safeId],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return {
    contentType: row.content_type || 'image/webp',
    data: row.data,
  };
}

export function khoeImageApiPath(imageId) {
  return `/api/lienquan/khoe-image?id=${encodeURIComponent(imageId)}`;
}
