#!/usr/bin/env node
/**
 * Writes sitemap XML for local inspection.
 * Production serves the same builder via /api/sitemap
 * (Vercel rewrites /sitemaps/all.xml and /sitemap.xml).
 * Do NOT write under public/ — static files beat rewrites on Vercel.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PROJECT_ROOT } from '../_root.mjs';
import { listActiveQuizzes } from '../../api/_lib/quizDb.js';
import { buildSitemapXml } from '../../shared/buildSitemapXml.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function main() {
  const quizzes = await listActiveQuizzes();
  const { xml, quizCount, heroCount } = buildSitemapXml(quizzes);

  const outDir = path.join(PROJECT_ROOT, 'artifacts/sitemaps');
  fs.mkdirSync(outDir, { recursive: true });
  const allPath = path.join(outDir, 'all.xml');
  fs.writeFileSync(allPath, xml);

  console.log(`✅ wrote ${allPath} (${quizCount} quizzes, ${heroCount} heroes)`);
  console.log('📡 Production: /sitemaps/all.xml → /api/sitemap');
}

main().catch((err) => {
  console.error('❌ sitemap generation failed:', err.message);
  process.exit(1);
});
