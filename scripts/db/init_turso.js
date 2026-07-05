import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PROJECT_ROOT } from '../_root.mjs';
import { getTurso } from '../../api/_lib/turso.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function main() {
  const schema = fs.readFileSync(path.join(PROJECT_ROOT, 'turso/schema.sql'), 'utf-8');
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
