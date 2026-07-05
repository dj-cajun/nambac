import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const imagesDir = path.join(root, 'public', 'images');
const defaultCover = path.join(imagesDir, 'default_cover.png');

const loadJson = (name) => {
  const filePath = path.join(root, 'backend', 'data', name);
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
