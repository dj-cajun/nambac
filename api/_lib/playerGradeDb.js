import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { getTurso } from './turso.js';
import { getGradeForUniqueCount } from '../../shared/playerGrades.js';

export function hashVisitorId(id) {
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 32);
}

export function buildPlayerKey({ userId = null, visitorId = null } = {}) {
  if (userId) return { playerKey: `u:${userId}`, isLoggedIn: 1 };
  if (visitorId) return { playerKey: `g:${hashVisitorId(visitorId)}`, isLoggedIn: 0 };
  return null;
}

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS player_progress (
      player_key TEXT PRIMARY KEY,
      is_logged_in INTEGER NOT NULL DEFAULT 0,
      unique_quizzes INTEGER NOT NULL DEFAULT 0,
      total_completions INTEGER NOT NULL DEFAULT 0,
      grade_level INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS quiz_completions (
      id TEXT PRIMARY KEY,
      player_key TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(player_key, quiz_id)
    )`,
  });
  await db.execute({
    sql: 'CREATE INDEX IF NOT EXISTS idx_quiz_completions_player ON quiz_completions(player_key)',
  });
}

async function countUniqueQuizzes(db, playerKey) {
  const result = await db.execute({
    sql: 'SELECT COUNT(*) AS cnt FROM quiz_completions WHERE player_key = ?',
    args: [playerKey],
  });
  return Number(result.rows[0]?.cnt) || 0;
}

async function upsertProgress(db, playerKey, isLoggedIn) {
  const uniqueQuizzes = await countUniqueQuizzes(db, playerKey);
  const totalResult = await db.execute({
    sql: 'SELECT total_completions FROM player_progress WHERE player_key = ?',
    args: [playerKey],
  });
  const prevTotal = Number(totalResult.rows[0]?.total_completions) || 0;
  const totalCompletions = Math.max(uniqueQuizzes, prevTotal);
  const grade = getGradeForUniqueCount(uniqueQuizzes);

  await db.execute({
    sql: `INSERT INTO player_progress (player_key, is_logged_in, unique_quizzes, total_completions, grade_level, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(player_key) DO UPDATE SET
            is_logged_in = excluded.is_logged_in,
            unique_quizzes = excluded.unique_quizzes,
            total_completions = excluded.total_completions,
            grade_level = excluded.grade_level,
            updated_at = datetime('now')`,
    args: [playerKey, isLoggedIn, uniqueQuizzes, totalCompletions, grade.level],
  });

  return {
    player_key: playerKey,
    is_logged_in: isLoggedIn,
    unique_quizzes: uniqueQuizzes,
    total_completions: totalCompletions,
    grade_level: grade.level,
  };
}

export async function getPlayerProgress({ userId = null, visitorId = null } = {}) {
  const resolved = buildPlayerKey({ userId, visitorId });
  if (!resolved) return null;

  const db = getTurso();
  await ensureSchema(db);

  const result = await db.execute({
    sql: 'SELECT * FROM player_progress WHERE player_key = ?',
    args: [resolved.playerKey],
  });

  if (!result.rows[0]) {
    return {
      player_key: resolved.playerKey,
      is_logged_in: resolved.isLoggedIn,
      unique_quizzes: 0,
      total_completions: 0,
      grade_level: 0,
    };
  }

  const row = result.rows[0];
  return {
    player_key: row.player_key,
    is_logged_in: Number(row.is_logged_in) || 0,
    unique_quizzes: Number(row.unique_quizzes) || 0,
    total_completions: Number(row.total_completions) || 0,
    grade_level: Number(row.grade_level) || 0,
  };
}

export async function mergeGuestProgress(visitorId, userId) {
  const guest = buildPlayerKey({ visitorId });
  const user = buildPlayerKey({ userId });
  if (!guest || !user || guest.playerKey === user.playerKey) return null;

  const db = getTurso();
  await ensureSchema(db);

  const guestProgress = await getPlayerProgress({ visitorId });
  if (!guestProgress?.unique_quizzes) return getPlayerProgress({ userId });

  const guestCompletions = await db.execute({
    sql: 'SELECT quiz_id, score FROM quiz_completions WHERE player_key = ?',
    args: [guest.playerKey],
  });

  for (const row of guestCompletions.rows) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO quiz_completions (id, player_key, quiz_id, score)
            VALUES (?, ?, ?, ?)`,
      args: [randomUUID(), user.playerKey, row.quiz_id, row.score ?? null],
    });
  }

  await db.execute({
    sql: 'DELETE FROM quiz_completions WHERE player_key = ?',
    args: [guest.playerKey],
  });
  await db.execute({
    sql: 'DELETE FROM player_progress WHERE player_key = ?',
    args: [guest.playerKey],
  });

  return upsertProgress(db, user.playerKey, 1);
}

export async function recordQuizCompletion({
  userId = null,
  visitorId = null,
  quizId,
  score = null,
}) {
  const quiz = String(quizId || '').trim();
  if (!quiz) throw new Error('quizId required');

  if (userId && visitorId) {
    await mergeGuestProgress(visitorId, userId);
  }

  const resolved = buildPlayerKey({ userId, visitorId });
  if (!resolved) throw new Error('Missing player identity');

  const db = getTurso();
  await ensureSchema(db);

  const before = await getPlayerProgress({ userId, visitorId });
  const beforeGrade = getGradeForUniqueCount(before?.unique_quizzes || 0);

  let isNewQuiz = false;
  const insertResult = await db.execute({
    sql: `INSERT OR IGNORE INTO quiz_completions (id, player_key, quiz_id, score)
          VALUES (?, ?, ?, ?)`,
    args: [randomUUID(), resolved.playerKey, quiz, score ?? null],
  });
  isNewQuiz = (insertResult.rowsAffected ?? 0) > 0;

  if (!isNewQuiz) {
    await db.execute({
      sql: `INSERT INTO player_progress (player_key, is_logged_in, unique_quizzes, total_completions, grade_level)
            VALUES (?, ?, 0, 1, 0)
            ON CONFLICT(player_key) DO UPDATE SET
              total_completions = total_completions + 1,
              updated_at = datetime('now')`,
      args: [resolved.playerKey, resolved.isLoggedIn],
    });
  }

  const progress = await upsertProgress(db, resolved.playerKey, resolved.isLoggedIn);
  const afterGrade = getGradeForUniqueCount(progress.unique_quizzes);

  return {
    progress,
    grade: afterGrade,
    previousGrade: beforeGrade,
    leveledUp: afterGrade.level > beforeGrade.level,
    isNewQuiz,
    isFirstEver: before.unique_quizzes === 0 && isNewQuiz,
  };
}
