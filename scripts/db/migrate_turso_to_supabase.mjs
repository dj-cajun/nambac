/**
 * Turso → Supabase Postgres 전체 데이터 이전
 *
 * .env.local 필요:
 *   TURSO_DATABASE_URL, TURSO_AUTH_TOKEN  (소스)
 *   SUPABASE_DB_URL (또는 DATABASE_URL)     (대상 — Transaction pooler 권장)
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (Khoe 이미지 → Storage, 선택)
 *
 * Usage: npm run db:migrate-supabase
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import pg from 'pg';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const { Pool } = pg;

const TABLE_ORDER = [
  'quizzes',
  'questions',
  'results',
  'brand_inquiries',
  'balance_votes',
  'fortune_stats',
  'feature_stats',
  'users',
  'player_progress',
  'quiz_completions',
  'push_subscriptions',
  'site_daily_visitors',
  'site_visit_exclusions',
  'lienquan_mastery',
  'lienquan_boasts',
  'lienquan_boast_likes',
  'lienquan_khoe_images',
];

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name} in .env.local`);
  }
}

function normalizeSupabaseEnv() {
  let apiUrl = String(process.env.SUPABASE_URL || '').trim();
  apiUrl = apiUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
  process.env.SUPABASE_URL = apiUrl;

  const ref = apiUrl.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1];
  let dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';

  if (ref && /postgres\.xxxxx/i.test(dbUrl)) {
    dbUrl = dbUrl.replace(/postgres\.xxxxx/i, `postgres.${ref}`);
    process.env.SUPABASE_DB_URL = dbUrl;
  }

  if (!dbUrl) {
    throw new Error('Missing SUPABASE_DB_URL or DATABASE_URL in .env.local');
  }
  return dbUrl;
}

async function testConnection(dbUrl) {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: /localhost|127\.0\.0\.1/.test(dbUrl) ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await pool.query('SELECT 1');
    return pool;
  } catch (err) {
    await pool.end().catch(() => {});
    const msg = String(err.message || err);
    const hints = [
      'Supabase 대시보드 → nambac → 프로젝트가 Paused면 Restore project',
      'Settings → Database → Connection string → Transaction pooler URI 를 그대로 SUPABASE_DB_URL 에 붙여넣기',
      '비밀번호에 특수문자 있으면 URI 인코딩 필요',
    ];
    throw new Error(`${msg}\n\n확인:\n${hints.map((h) => `  • ${h}`).join('\n')}`);
  }
}

async function applySchema(pool) {
  const migrationsDir = path.join(PROJECT_ROOT, 'supabase/migrations');
  const sqlPaths = fs.readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => path.join(migrationsDir, name));

  for (const sqlPath of sqlPaths) {
    const raw = fs.readFileSync(sqlPath, 'utf-8');
    const statements = raw
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        if (/already exists|duplicate/i.test(err.message)) continue;
        throw err;
      }
    }
    console.log(`✅ Supabase migration applied: ${path.basename(sqlPath)}`);
  }
}

async function copyTable(turso, pool, table) {
  let rows;
  try {
    const rs = await turso.execute(`SELECT * FROM ${table}`);
    rows = rs.rows;
  } catch (err) {
    if (/no such table/i.test(err.message)) {
      console.log(`⏭  ${table}: (없음)`);
      return 0;
    }
    throw err;
  }

  if (!rows.length) {
    console.log(`⏭  ${table}: 0 rows`);
    return 0;
  }

  const cols = Object.keys(rows[0]);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const conflict = table === 'fortune_stats' || table === 'feature_stats'
    ? ` ON CONFLICT (kind) DO NOTHING`
    : '';

  let inserted = 0;
  for (const row of rows) {
    const values = cols.map((c) => row[c]);
    await pool.query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})${conflict}`,
      values,
    );
    inserted += 1;
  }
  console.log(`✅ ${table}: ${inserted} rows`);
  return inserted;
}

async function migrateKhoeImagesToStorage(turso, supabase) {
  let rows;
  try {
    const rs = await turso.execute('SELECT id, user_id, content_type, data FROM lienquan_khoe_images');
    rows = rs.rows;
  } catch {
    return;
  }
  if (!rows.length) return;

  console.log(`📷 Khoe images → Storage: ${rows.length}개`);
  for (const row of rows) {
    const buf = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);
    const objectPath = `${row.user_id}/${row.id}.webp`;
    const { error } = await supabase.storage.from('khoe-images').upload(objectPath, buf, {
      contentType: row.content_type || 'image/webp',
      upsert: true,
    });
    if (error) {
      console.warn(`  ⚠ ${row.id}: ${error.message}`);
      continue;
    }
    const { data } = supabase.storage.from('khoe-images').getPublicUrl(objectPath);
    console.log(`  ✓ ${row.id} → ${data.publicUrl}`);
  }
}

async function main() {
  requireEnv('TURSO_DATABASE_URL');
  requireEnv('TURSO_AUTH_TOKEN');
  const dbUrl = normalizeSupabaseEnv();

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🔄 Turso → Supabase 마이그레이션 시작…');
  console.log('   소스:', process.env.TURSO_DATABASE_URL.replace(/\/\/.*@/, '//***@'));

  const pool = await testConnection(dbUrl);

  await applySchema(pool);

  let total = 0;
  for (const table of TABLE_ORDER) {
    if (table === 'lienquan_khoe_images') continue;
    total += await copyTable(turso, pool, table);
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    await migrateKhoeImagesToStorage(turso, supabase);
  }

  await pool.end();
  console.log(`\n🎉 완료 — ${total} rows copied`);
  console.log('\n다음 단계:');
  console.log('  1. .env.local 에 SUPABASE_DB_URL 유지, TURSO_* 는 제거 가능');
  console.log('  2. Vercel env 도 동일하게 업데이트 후 Redeploy');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
