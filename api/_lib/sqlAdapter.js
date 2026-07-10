/** SQLite (Turso) → PostgreSQL (Supabase) SQL 변환 */

const INSERT_OR_IGNORE_CONFLICTS = {
  site_visit_exclusions: '(visitor_key)',
  site_daily_visitors: '(visit_date, visitor_key)',
  quiz_completions: '(player_key, quiz_id)',
  fortune_stats: '(kind)',
  feature_stats: '(kind)',
};

export function adaptSqliteToPostgres(sql) {
  let s = String(sql).trim();

  s = s.replace(
    /date\(datetime\('now',\s*'\+7 hours'\)\)/gi,
    "(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date",
  );

  s = s.replace(/datetime\('now',\s*'(-?\d+)\s+days'\)/gi, (_, n) => {
    const num = Math.abs(parseInt(n, 10));
    if (String(n).startsWith('-')) return `NOW() - INTERVAL '${num} days'`;
    return `NOW() + INTERVAL '${num} days'`;
  });

  s = s.replace(/datetime\('now'\)/gi, 'NOW()');
  s = s.replace(/datetime\(([^)]+)\)/gi, '$1');
  s = s.replace(/DEFAULT \(datetime\('now'\)\)/gi, 'DEFAULT NOW()');
  s = s.replace(/\bBLOB\b/gi, 'BYTEA');
  s = s.replace(/\bexcluded\./gi, 'EXCLUDED.');

  const ignoreMatch = s.match(/^INSERT OR IGNORE INTO\s+(\w+)/i);
  if (ignoreMatch) {
    const table = ignoreMatch[1].toLowerCase();
    s = s.replace(/^INSERT OR IGNORE INTO/i, 'INSERT INTO');
    const conflict = INSERT_OR_IGNORE_CONFLICTS[table];
    if (conflict && !/ON CONFLICT/i.test(s)) {
      s = `${s} ON CONFLICT ${conflict} DO NOTHING`;
    }
  }

  return s;
}

export function toPostgresParams(sql, args = []) {
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: pgSql, args };
}
