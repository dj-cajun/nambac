import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getTurso } from '../../api/_lib/turso.js';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function main() {
  const sql = fs.readFileSync(path.join(PROJECT_ROOT, 'turso/migrations/004_users.sql'), 'utf-8');
  const db = getTurso();

  for (const statement of sql.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.execute(statement);
  }

  console.log('✅ Users migration applied');
}

main().catch((err) => {
  console.error('❌ Users migration failed:', err.message);
  process.exit(1);
});
