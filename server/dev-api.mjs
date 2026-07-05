import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dispatch } from '../api/_lib/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const app = express();
app.use(express.json({ limit: '20mb' }));

function wrap(handler) {
  return async (req, res) => {
    const apiPath = (req.originalUrl || req.url).replace(/^\/api\/?/, '');
    const segments = apiPath.split('?')[0].split('/').filter(Boolean);
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: req.body,
      url: req.originalUrl || req.url,
      query: { ...req.query, path: segments },
    };
    return handler(vercelReq, res, segments);
  };
}

app.all('/api', wrap(dispatch));
app.all('/api/*path', wrap(dispatch));

const port = process.env.TURSO_API_PORT || 8787;
app.listen(port, () => {
  console.log(`Turso API dev server → http://localhost:${port}/api/quizzes`);
});
