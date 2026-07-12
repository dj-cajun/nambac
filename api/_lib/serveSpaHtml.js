import fs from 'fs';
import path from 'path';

const CANDIDATES = [
  () => path.join(process.cwd(), 'dist', 'index.html'),
  () => path.join(process.cwd(), 'index.html'),
  () => path.join(process.cwd(), 'public', 'index.html'),
];

let cachedHtml = null;

/**
 * Serve the Vite SPA shell so the browser URL stays on /quiz/:id
 * after an internal rewrite to the API handler.
 */
export function sendSpaHtml(res) {
  if (cachedHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(cachedHtml);
  }

  for (const getPath of CANDIDATES) {
    const filePath = getPath();
    try {
      if (fs.existsSync(filePath)) {
        cachedHtml = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.status(200).send(cachedHtml);
      }
    } catch {
      // try next
    }
  }

  return res.redirect(302, '/');
}
