import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getTurso } from '../api/_lib/turso.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

async function main() {
  const schema = fs.readFileSync(path.join(root, 'turso/schema.sql'), 'utf-8');
  const db = getTurso();

  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sql of statements) {
    await db.execute(sql);
  }

  console.log('✅ Turso schema initialized');
}

main().catch((err) => {
  console.error('❌ Schema init failed:', err.message);
  process.exit(1);
});
