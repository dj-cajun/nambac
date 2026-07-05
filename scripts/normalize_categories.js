import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTurso } from '../api/_lib/turso.js';
import { normalizeCategory } from '../api/_lib/categories.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

async function main() {
  const db = getTurso();
  const rs = await db.execute('SELECT id, category FROM quizzes');
  let updated = 0;

  for (const row of rs.rows) {
    const next = normalizeCategory(row.category);
    if (next === row.category) continue;
    await db.execute({
      sql: 'UPDATE quizzes SET category = ? WHERE id = ?',
      args: [next, row.id],
    });
    console.log(`  ${row.category} → ${next}`);
    updated++;
  }

  console.log(`\n✅ Normalized ${updated}/${rs.rows.length} quizzes`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
