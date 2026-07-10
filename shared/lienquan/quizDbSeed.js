/**
 * Liên Quân quiz — DB listing entry (redirects to /lienquan/quiz via config.featureRoute).
 * Seed: npm run seed:lienquan-quiz
 */
import { BINARY_5Q_SCORES } from '../quizPrompts.js';
import { LQ_UI } from './uiText.js';
import { LIENQUAN_QUIZ_QUESTIONS } from './quizQuestions.js';

export const LIENQUAN_QUIZ_DB_TITLE = LQ_UI.bannerTitle;

const DESC_PAD =
  ' Kết quả mang tính giải trí Gen Z — làm bài Thông Thạo đầy đủ trên nambac.xyz/lienquan/quiz!';

function padDesc(text) {
  const s = String(text || '').trim();
  if (s.includes('giải trí')) return s;
  return s + DESC_PAD;
}

function pickWrongOption(options) {
  const wrong = options.filter((o) => !o.correct);
  return wrong[0] || null;
}

/** binary_5q: selecting B adds score — knowledge quizzes put the correct answer in option_b */
function toBinaryQuestion(row, index) {
  const correct = row.options.find((o) => o.correct);
  const wrong = pickWrongOption(row.options);
  const [score_a, score_b] = BINARY_5Q_SCORES[index] || [0, 0];
  return {
    order_number: index + 1,
    question_text: row.text,
    option_a: wrong?.label || '',
    option_b: correct?.label || '',
    score_a,
    score_b,
  };
}

const RESULTS = [
  {
    result_code: 0,
    title: 'Đồng — Mới tập tành Liên Quân',
    type_name: 'Đồng — Mới tập tành Liên Quân',
    description: padDesc('Bạn còn đang làm quen meta và tên tướng — không sao, vào nambac copy giáo án pro là kéo rank nhanh hơn học lý thuyết.'),
    traits: ['Tập sự', 'Học meta', 'Copy giáo án'],
  },
  {
    result_code: 1,
    title: 'Thông Thạo 1 — Biết lane cơ bản',
    type_name: 'Thông Thạo 1 — Biết lane cơ bản',
    description: padDesc('Bạn đã nắm vài counter phổ biến và biết spell trừng trị — thi đủ 10 câu trên hub để lên mark cao hơn.'),
    traits: ['Lane ổn', 'Biết counter', 'Đang lên rank'],
  },
  {
    result_code: 2,
    title: 'Thông Thạo 2 — Đọc map khá',
    type_name: 'Thông Thạo 2 — Đọc map khá',
    description: padDesc('Bạn hiểu nhịp trade và khi nào all-in — teamfight bớt feed hơn trung bình lobby VN.'),
    traits: ['Đọc map', 'Trade ổn', 'Ít feed'],
  },
  {
    result_code: 3,
    title: 'Thông Thạo 3 — Lane ổn',
    type_name: 'Thông Thạo 3 — Lane ổn',
    description: padDesc('Counter phổ biến và spell trừng trị — bạn đã vượt mức casual lobby.'),
    traits: ['Lane ổn', 'Counter', 'Spell đúng'],
  },
  {
    result_code: 4,
    title: 'Thông Thạo 4 — Ranker có tâm',
    type_name: 'Thông Thạo 4 — Ranker có tâm',
    description: padDesc('Meta AOG, giáo án item và counter pick không còn là thuật ngữ xa lạ với bạn.'),
    traits: ['Meta', 'Giáo án', 'Ranker'],
  },
  {
    result_code: 5,
    title: 'Thông Thạo 5 — Shotcall nhẹ',
    type_name: 'Thông Thạo 5 — Shotcall nhẹ',
    description: padDesc('Bạn có thể đọc map và copy build pro trong vài giây — đúng vibe cẩm nang nambac.'),
    traits: ['Shotcall', 'Build pro', 'AOG fan'],
  },
  {
    result_code: 6,
    title: 'Thông Thạo 6 — Cơ bản pro',
    type_name: 'Thông Thạo 6 — Cơ bản pro',
    description: padDesc('Counter, giáo án, thuật ngữ VN — gần full package. Thi lại 10 câu để chạm Thông Thạo 7!'),
    traits: ['Thông Thạo 6', 'Meta VN', 'Ranker'],
  },
  {
    result_code: 7,
    title: 'Thông Thạo 7 — Thánh hiểu meta',
    type_name: 'Thông Thạo 7 — Thánh hiểu meta',
    description: padDesc('Bạn hiểu meta VN như fan AOG — khoe mark ở góc chiến tích đi!'),
    traits: ['Thông Thạo 7', 'AOG', 'Khoe được'],
  },
];

export const LIENQUAN_QUIZ_DB_SEED = {
  title: LIENQUAN_QUIZ_DB_TITLE,
  description: padDesc(
    `${LQ_UI.bannerBody} (Explore: 5 câu thử nhanh tier 3 — bản đủ 5 cấp tại /lienquan/quiz)`,
  ),
  category: 'Survival',
  quiz_type: 'binary_5q',
  image_url: '/images/lienquan_hub.webp',
  config: { featureRoute: '/lienquan/quiz', feature: 'lienquan' },
  questions: LIENQUAN_QUIZ_QUESTIONS.slice(0, 5).map(toBinaryQuestion),
  results: RESULTS,
};
