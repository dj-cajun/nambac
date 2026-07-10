import pg from 'pg';
import { adaptSqliteToPostgres, toPostgresParams } from './sqlAdapter.js';

const { Pool } = pg;

let pool;
let adapter;

export function isPostgresConfigured() {
  return !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);
}

export function getPostgresDb() {
  if (adapter) return adapter;

  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL or DATABASE_URL is not configured');
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
  });

  adapter = {
    async execute(sqlOrObj) {
      const raw = typeof sqlOrObj === 'string' ? { sql: sqlOrObj, args: [] } : sqlOrObj;
      const adapted = adaptSqliteToPostgres(raw.sql);
      const { sql, args } = toPostgresParams(adapted, raw.args || []);
      const result = await pool.query(sql, args);
      return {
        rows: result.rows,
        rowsAffected: result.rowCount ?? 0,
        columns: result.fields?.map((f) => f.name),
      };
    },
  };

  return adapter;
}
