import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getTurso } from '../../api/_lib/turso.js';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function main() {
  const db = getTurso();

  for (const file of ['004_users.sql', '005_users_admin.sql', '006_site_visitors.sql']) {
    const sql = fs.readFileSync(path.join(PROJECT_ROOT, `turso/migrations/${file}`), 'utf-8');
    for (const statement of sql.split(';').map((s) => s.trim()).filter(Boolean)) {
      try {
        await db.execute(statement);
      } catch (err) {
        if (!String(err.message).includes('duplicate column')) throw err;
      }
    }
  }

  console.log('✅ Users migrations applied');
}

main().catch((err) => {
  console.error('❌ Users migration failed:', err.message);
  process.exit(1);
});
