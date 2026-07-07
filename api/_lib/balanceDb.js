import { getTurso } from './turso.js';
import { getQuestionById, pickRandomQuestion, BALANCE_QUESTIONS } from '../../shared/balanceData.js';

export async function getBalanceStats(questionId) {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT votes_a, votes_b FROM balance_votes WHERE question_id = ? LIMIT 1',
    args: [questionId],
  });
  const row = rs.rows[0];
  const votesA = row ? Number(row.votes_a) : 0;
  const votesB = row ? Number(row.votes_b) : 0;
  const total = votesA + votesB;
  return {
    question_id: questionId,
    votes_a: votesA,
    votes_b: votesB,
    total,
    pct_a: total ? Math.round((votesA / total) * 100) : 50,
    pct_b: total ? Math.round((votesB / total) * 100) : 50,
  };
}

export async function castBalanceVote(questionId, choice) {
  const q = getQuestionById(questionId);
  if (!q) throw new Error('Question not found');
  if (choice !== 'a' && choice !== 'b') throw new Error('Invalid choice');

  const column = choice === 'a' ? 'votes_a' : 'votes_b';
  const db = getTurso();

  await db.execute({
    sql: `INSERT INTO balance_votes (question_id, votes_a, votes_b)
          VALUES (?, ?, ?)
          ON CONFLICT(question_id) DO UPDATE SET
            ${column} = ${column} + 1,
            updated_at = datetime('now')`,
    args: [questionId, choice === 'a' ? 1 : 0, choice === 'b' ? 1 : 0],
  });

  return getBalanceStats(questionId);
}

export function getRandomBalanceQuestion(excludeId) {
  return pickRandomQuestion(excludeId ? [excludeId] : []);
}

export function listBalanceQuestionIds() {
  return BALANCE_QUESTIONS.map((q) => q.id);
}
