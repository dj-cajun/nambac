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
  const sql = fs.readFileSync(path.join(root, 'turso/migrations/002_push_and_brand.sql'), 'utf-8');
  const db = getTurso();

  for (const statement of sql.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.execute(statement);
  }

  console.log('✅ Phase 2/3 migration applied');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
