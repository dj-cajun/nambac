import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const app = express();
app.use(express.json({ limit: '20mb' }));

async function loadHandler(relativePath) {
  const mod = await import(new URL(relativePath, import.meta.url));
  return mod.default;
}

function wrap(handler) {
  return async (req, res) => {
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: req.body,
      url: req.originalUrl || req.url,
      query: { ...req.query, ...req.params },
    };
    return handler(vercelReq, res);
  };
}

const quizzesHandler = await loadHandler('../api/quizzes.js');
const quizByIdHandler = await loadHandler('../api/quizzes/[id].js');
const quizStatsHandler = await loadHandler('../api/quizzes/[id]/stats.js');
const brandHandler = await loadHandler('../api/brand-inquiries.js');
const adminQuizzesHandler = await loadHandler('../api/admin/quizzes.js');
const adminQuizByIdHandler = await loadHandler('../api/admin/quizzes/[id].js');
const adminBrandHandler = await loadHandler('../api/admin/brand-inquiries.js');
const adminUploadHandler = await loadHandler('../api/admin/upload.js');

app.get('/api/quizzes', wrap(quizzesHandler));
app.get('/api/quizzes/:id', wrap(quizByIdHandler));
app.post('/api/quizzes/:id/stats', wrap(quizStatsHandler));
app.post('/api/brand-inquiries', wrap(brandHandler));

app.get('/api/admin/quizzes', wrap(adminQuizzesHandler));
app.post('/api/admin/quizzes', wrap(adminQuizzesHandler));
app.get('/api/admin/quizzes/:id', wrap(adminQuizByIdHandler));
app.patch('/api/admin/quizzes/:id', wrap(adminQuizByIdHandler));
app.delete('/api/admin/quizzes/:id', wrap(adminQuizByIdHandler));
app.get('/api/admin/brand-inquiries', wrap(adminBrandHandler));
app.patch('/api/admin/brand-inquiries', wrap(adminBrandHandler));
app.delete('/api/admin/brand-inquiries', wrap(adminBrandHandler));
app.post('/api/admin/upload', wrap(adminUploadHandler));

const generateImageHandler = await loadHandler('../api/generate-image.js');
app.post('/api/generate-image', wrap(generateImageHandler));

const n8nWebhookHandler = await loadHandler('../api/webhooks/n8n-quiz.js');
const pushSubscribeHandler = await loadHandler('../api/push/subscribe.js');
const pushNotifyHandler = await loadHandler('../api/push/notify.js');
const brandStatsHandler = await loadHandler('../api/brand/stats.js');
const adminAnalyticsHandler = await loadHandler('../api/admin/analytics.js');

app.post('/api/webhooks/n8n-quiz', wrap(n8nWebhookHandler));
app.get('/api/push/subscribe', wrap(pushSubscribeHandler));
app.post('/api/push/subscribe', wrap(pushSubscribeHandler));
app.post('/api/push/notify', wrap(pushNotifyHandler));
app.get('/api/brand/stats', wrap(brandStatsHandler));
app.get('/api/admin/analytics', wrap(adminAnalyticsHandler));

const port = process.env.TURSO_API_PORT || 8787;
app.listen(port, () => {
  console.log(`Turso API dev server → http://localhost:${port}/api/quizzes`);
});
