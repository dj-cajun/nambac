export function requireAdmin(req, res) {
  const expected = process.env.ADMIN_API_KEY || process.env.VITE_ADMIN_API_KEY || '';
  if (!expected) return true;

  const key = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
  if (key !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
