/**
 * Standalone API server (optional — default dev uses Vite plugin instead).
 * Run: npm run dev:api
 */
import express from 'express';
import { createApiMiddleware, loadDevEnv } from './apiMiddleware.mjs';

loadDevEnv();

const app = express();
app.use(createApiMiddleware());

const port = process.env.TURSO_API_PORT || 8787;
app.listen(port, () => {
  console.log(`Turso API dev server → http://localhost:${port}/api/quizzes`);
});
