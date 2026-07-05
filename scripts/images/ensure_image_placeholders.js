import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

const imagesDir = path.join(PROJECT_ROOT, 'public', 'images');
const defaultCover = path.join(imagesDir, 'default_cover.png');

const loadJson = (name) => {
  const filePath = path.join(PROJECT_ROOT, 'legacy/backend/data', name);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

function collectPaths(value, paths) {
  if (!value) return;
  if (typeof value === 'string' && value.includes('/images/')) {
    paths.add(value.split('/').pop());
    return;
  }
  if (Array.isArray(value)) value.forEach((item) => collectPaths(item, paths));
  else if (typeof value === 'object') Object.values(value).forEach((v) => collectPaths(v, paths));
}

const paths = new Set();
for (const file of ['quizzes.json', 'questions.json', 'results.json']) {
  collectPaths(loadJson(file), paths);
}

if (!fs.existsSync(defaultCover)) {
  console.error('❌ default_cover.png not found');
  process.exit(1);
}

let created = 0;
for (const filename of paths) {
  const target = path.join(imagesDir, filename);
  if (fs.existsSync(target)) continue;
  fs.copyFileSync(defaultCover, target);
  created++;
}

console.log(`✅ Placeholders ready (${created} created, ${paths.size - created} already existed)`);
