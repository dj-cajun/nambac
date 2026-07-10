import { randomUUID } from 'crypto';
import { getTurso, rowToQuiz, rowToQuestion, rowToResult } from './turso.js';
import { normalizeCategory } from '../../shared/categories.js';

const QUIZ_LIST_COLUMNS = `id, title, description, category, quiz_type, image_url,
  view_count, share_count, like_count, participant_count, created_at,
  is_active, status`;

export async function listActiveQuizzes() {
  await ensureQuizLikeColumn();
  const db = getTurso();
  const rs = await db.execute({
    sql: `SELECT ${QUIZ_LIST_COLUMNS}
          FROM quizzes
          WHERE is_active = 1 AND (status IS NULL OR status != 'hidden')
          ORDER BY datetime(created_at) DESC`,
  });
  // List payloads omit heavy config/design JSON — detail routes still SELECT *.
  return rs.rows.map((row) => ({
    ...row,
    is_active: row.is_active === 1 || row.is_active === true,
    config: null,
    design: null,
  }));
}

export async function getQuizById(quizId) {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT * FROM quizzes WHERE id = ? LIMIT 1',
    args: [quizId],
  });
  return rowToQuiz(rs.rows[0]);
}

export async function getQuizBundle(quizId) {
  const quiz = await getQuizById(quizId);
  if (!quiz) return null;

  const db = getTurso();
  const [questionsRs, resultsRs] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC',
      args: [quizId],
    }),
    db.execute({
      sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC',
      args: [quizId],
    }),
  ]);

  return {
    quiz,
    questions: questionsRs.rows.map(rowToQuestion),
    results: resultsRs.rows.map(rowToResult),
  };
}

export function isQuizPublic(quiz) {
  if (!quiz) return false;
  return quiz.is_active !== false && quiz.status !== 'hidden';
}

export async function getPublicQuizBundle(quizId) {
  const bundle = await getQuizBundle(quizId);
  if (!bundle || !isQuizPublic(bundle.quiz)) return null;
  return bundle;
}

export async function getResultsByQuizId(quizId) {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC',
    args: [quizId],
  });
  return rs.rows.map(rowToResult);
}

const STAT_FIELDS = {
  view: 'view_count',
  share: 'share_count',
  participate: 'participant_count',
  like: 'like_count',
};

let likeColumnReady = null;

async function ensureQuizLikeColumn() {
  if (likeColumnReady) return likeColumnReady;
  likeColumnReady = (async () => {
    const db = getTurso();
    try {
      await db.execute({ sql: 'ALTER TABLE quizzes ADD COLUMN like_count INTEGER DEFAULT 0' });
    } catch (err) {
      const msg = String(err.message || '').toLowerCase();
      if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
        likeColumnReady = null;
        throw err;
      }
    }
  })();
  return likeColumnReady;
}

export function quizPublicStats(quiz) {
  if (!quiz) {
    return { view_count: 0, share_count: 0, like_count: 0, participant_count: 0 };
  }
  return {
    view_count: Number(quiz.view_count) || 0,
    share_count: Number(quiz.share_count) || 0,
    like_count: Number(quiz.like_count) || 0,
    participant_count: Number(quiz.participant_count) || 0,
  };
}

export async function incrementQuizStat(quizId, field) {
  const column = STAT_FIELDS[field];
  if (!column) throw new Error(`Invalid stat field: ${field}`);

  await ensureQuizLikeColumn();

  const quiz = await getQuizById(quizId);
  if (!quiz || !isQuizPublic(quiz)) {
    throw new Error('Quiz not available');
  }

  const db = getTurso();
  await db.execute({
    sql: `UPDATE quizzes SET ${column} = COALESCE(${column}, 0) + 1 WHERE id = ?`,
    args: [quizId],
  });

  const updated = await getQuizById(quizId);
  return { ok: true, ...quizPublicStats(updated) };
}

export async function createBrandInquiry(payload) {
  const db = getTurso();
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO brand_inquiries
      (id, company_name, contact_person, email, phone, quiz_concept, target_audience, budget_tier, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [
      id,
      payload.company_name,
      payload.contact_person,
      payload.email,
      payload.phone || null,
      payload.quiz_concept,
      payload.target_audience || null,
      payload.budget_tier || null,
    ],
  });
  return { id };
}

export async function listBrandInquiries() {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT * FROM brand_inquiries ORDER BY datetime(created_at) DESC',
  });
  return rs.rows;
}

export async function listAllQuizzes() {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT * FROM quizzes ORDER BY datetime(created_at) DESC',
  });
  return rs.rows.map(rowToQuiz);
}

export async function deleteQuiz(quizId) {
  const db = getTurso();
  await db.execute({ sql: 'DELETE FROM questions WHERE quiz_id = ?', args: [quizId] });
  await db.execute({ sql: 'DELETE FROM results WHERE quiz_id = ?', args: [quizId] });
  try {
    await db.execute({ sql: 'DELETE FROM quiz_completions WHERE quiz_id = ?', args: [quizId] });
  } catch {
    // Table may not exist on older DBs
  }
  await db.execute({ sql: 'DELETE FROM quizzes WHERE id = ?', args: [quizId] });
}

export async function updateQuizStatus(quizId, { is_active, status }) {
  const db = getTurso();
  await db.execute({
    sql: 'UPDATE quizzes SET is_active = ?, status = ? WHERE id = ?',
    args: [is_active ? 1 : 0, status, quizId],
  });
}

export async function updateQuiz(quizId, fields) {
  const db = getTurso();
  const sets = ['title = ?', 'description = ?', 'category = ?', 'image_url = ?'];
  const args = [fields.title, fields.description, normalizeCategory(fields.category), fields.image_url];

  if (fields.quiz_type !== undefined) {
    sets.push('quiz_type = ?');
    args.push(fields.quiz_type);
  }
  if (fields.config !== undefined) {
    sets.push('config = ?');
    args.push(fields.config ? JSON.stringify(fields.config) : null);
  }
  if (fields.design !== undefined) {
    sets.push('design = ?');
    args.push(fields.design ? JSON.stringify(fields.design) : null);
  }

  args.push(quizId);
  await db.execute({
    sql: `UPDATE quizzes SET ${sets.join(', ')} WHERE id = ?`,
    args,
  });
}

export async function getAnalyticsSummary() {
  await ensureQuizLikeColumn();
  const db = getTurso();
  const rs = await db.execute({
    sql: `SELECT id, title, category, quiz_type, view_count, share_count, like_count, participant_count,
                 is_active, status, created_at
          FROM quizzes ORDER BY datetime(created_at) DESC`,
  });

  const rows = rs.rows.map((row) => ({
    ...row,
    is_active: row.is_active === 1 || row.is_active === true,
    view_count: Number(row.view_count) || 0,
    share_count: Number(row.share_count) || 0,
    like_count: Number(row.like_count) || 0,
    participant_count: Number(row.participant_count) || 0,
  }));

  const totals = rows.reduce(
    (acc, q) => ({
      views: acc.views + q.view_count,
      shares: acc.shares + q.share_count,
      likes: acc.likes + q.like_count,
      participants: acc.participants + q.participant_count,
    }),
    { views: 0, shares: 0, likes: 0, participants: 0 },
  );

  return { totals, quizzes: rows };
}

export async function getBrandReport(quizId, token) {
  const quiz = await getQuizById(quizId);
  if (!quiz) return null;

  const reportToken = quiz.config?.brand_report_token;
  if (!reportToken || reportToken !== token) return null;

  const shareRate = quiz.participant_count
    ? Math.round(((quiz.share_count || 0) / quiz.participant_count) * 100)
    : 0;

  return {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      quiz_type: quiz.quiz_type,
      brand_name: quiz.design?.brand_name || quiz.config?.brand_name || null,
      created_at: quiz.created_at,
    },
    stats: {
      views: quiz.view_count || 0,
      shares: quiz.share_count || 0,
      likes: quiz.like_count || 0,
      participants: quiz.participant_count || 0,
      share_rate_pct: shareRate,
    },
  };
}

export async function createFullQuiz(payload) {
  const quiz = await createQuiz(payload);
  if (payload.questions?.length) await insertQuestions(quiz.id, payload.questions);
  if (payload.results?.length) await insertResults(quiz.id, payload.results);
  return quiz;
}

export async function deleteQuestion(questionId) {
  const db = getTurso();
  await db.execute({ sql: 'DELETE FROM questions WHERE id = ?', args: [questionId] });
}

export async function upsertQuestions(quizId, questions) {
  const db = getTurso();
  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const id = q.id && q.id.length > 20 ? q.id : randomUUID();
    await db.execute({
      sql: `INSERT INTO questions
        (id, quiz_id, order_number, question_text, option_a, option_b, score_a, score_b, image_url, dimension, options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          quiz_id = EXCLUDED.quiz_id,
          order_number = EXCLUDED.order_number,
          question_text = EXCLUDED.question_text,
          option_a = EXCLUDED.option_a,
          option_b = EXCLUDED.option_b,
          score_a = EXCLUDED.score_a,
          score_b = EXCLUDED.score_b,
          image_url = EXCLUDED.image_url,
          dimension = EXCLUDED.dimension,
          options = EXCLUDED.options`,
      args: [
        id,
        quizId,
        idx + 1,
        q.question_text || '',
        q.option_a || '',
        q.option_b || '',
        q.score_a ?? 0,
        q.score_b ?? 0,
        q.image_url || null,
        q.dimension || null,
        q.options ? JSON.stringify(q.options) : null,
      ],
    });
  }
}

export async function upsertResults(quizId, results) {
  const db = getTurso();
  for (const r of results) {
    if (!r.title && !r.description) continue;
    const id = r.id && r.id.length > 20 ? r.id : randomUUID();
    await db.execute({
      sql: `INSERT INTO results
        (id, quiz_id, result_code, title, type_name, description, traits, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          quiz_id = EXCLUDED.quiz_id,
          result_code = EXCLUDED.result_code,
          title = EXCLUDED.title,
          type_name = EXCLUDED.type_name,
          description = EXCLUDED.description,
          traits = EXCLUDED.traits,
          image_url = EXCLUDED.image_url`,
      args: [
        id,
        quizId,
        r.result_code ?? 0,
        r.title || '',
        r.type_name || null,
        r.description || null,
        r.traits ? JSON.stringify(r.traits) : null,
        r.image_url || null,
      ],
    });
  }
}

export async function updateQuestionImageUrl(questionId, imageUrl) {
  const db = getTurso();
  await db.execute({
    sql: 'UPDATE questions SET image_url = ? WHERE id = ?',
    args: [imageUrl, questionId],
  });
}

export async function updateQuizImageUrl(quizId, imageUrl) {
  const db = getTurso();
  await db.execute({
    sql: 'UPDATE quizzes SET image_url = ? WHERE id = ?',
    args: [imageUrl, quizId],
  });
}

export async function updateResultImageUrl(resultId, imageUrl) {
  const db = getTurso();
  await db.execute({
    sql: 'UPDATE results SET image_url = ? WHERE id = ?',
    args: [imageUrl, resultId],
  });
}

function buildQuizConfig(payload) {
  const config = { ...(payload.config || {}) };
  if (payload.quiz_type === 'sponsor' && !config.brand_report_token) {
    config.brand_report_token = randomUUID().replace(/-/g, '').slice(0, 24);
  }
  if (payload.quiz_type === 'sponsor') {
    config.sponsored = true;
  }
  return Object.keys(config).length ? JSON.stringify(config) : null;
}

function sqlArg(value) {
  if (value === undefined) return null;
  return value;
}

export async function createQuiz(payload) {
  const db = getTurso();
  const id = randomUUID();
  const configJson = buildQuizConfig(payload);
  const designJson = payload.design ? JSON.stringify(payload.design) : null;

  await db.execute({
    sql: `INSERT INTO quizzes (id, title, description, category, quiz_type, image_url, config, design, is_active, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')`,
    args: [
      id,
      sqlArg(payload.title),
      sqlArg(payload.description ?? null),
      sqlArg(normalizeCategory(payload.category)),
      sqlArg(payload.quiz_type || 'binary_5q'),
      sqlArg(payload.image_url ?? null),
      sqlArg(configJson),
      sqlArg(designJson),
    ],
  });
  return {
    id,
    brand_report_token: configJson ? JSON.parse(configJson).brand_report_token : null,
  };
}

export async function insertQuestions(quizId, questions) {
  const db = getTurso();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.execute({
      sql: `INSERT INTO questions
        (id, quiz_id, order_number, question_text, option_a, option_b, score_a, score_b, image_url, dimension, options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        quizId,
        q.order_number ?? i + 1,
        q.question_text || '',
        q.option_a || '',
        q.option_b || '',
        q.score_a ?? 0,
        q.score_b ?? 0,
        q.image_url || null,
        q.dimension || null,
        q.options ? JSON.stringify(q.options) : null,
      ],
    });
  }
}

export async function insertResults(quizId, results) {
  const db = getTurso();
  for (const r of results) {
    await db.execute({
      sql: `INSERT INTO results
        (id, quiz_id, result_code, title, type_name, description, traits, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        quizId,
        r.result_code ?? 0,
        r.title || r.type_name || '',
        r.type_name || null,
        r.description || null,
        r.traits ? JSON.stringify(r.traits) : null,
        r.image_url || null,
      ],
    });
  }
}

export async function updateBrandInquiryStatus(id, status) {
  const db = getTurso();
  await db.execute({
    sql: 'UPDATE brand_inquiries SET status = ? WHERE id = ?',
    args: [status, id],
  });
}

export async function deleteBrandInquiry(id) {
  const db = getTurso();
  await db.execute({ sql: 'DELETE FROM brand_inquiries WHERE id = ?', args: [id] });
}
