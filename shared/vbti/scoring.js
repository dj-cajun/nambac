/**
 * SBTI scoring — pure front-end, entertainment only.
 */
import patterns from './patterns.json' with { type: 'json' };
import types from './types.vi.json' with { type: 'json' };
import dimensions from './dimensions.vi.json' with { type: 'json' };

export const DRUNK_TRIGGER_QUESTION_ID = 'drink_gate_q2';
export const DIMENSION_ORDER = dimensions.order;

const LEVEL_NUM = { L: 0, M: 1, H: 2 };

function levelFromScore(sum) {
  if (sum <= 3) return 'L';
  if (sum === 4) return 'M';
  return 'H';
}

function patternToLevels(pattern) {
  return pattern.replace(/-/g, '').split('');
}

export function scoreAnswers(answers, questionList) {
  const rawScores = {};
  DIMENSION_ORDER.forEach((dim) => {
    rawScores[dim] = 0;
  });
  (questionList || []).forEach((q) => {
    if (!q.dim || q.special) return;
    const val = answers[q.id];
    if (val != null) rawScores[q.dim] += Number(val) || 0;
  });

  const levels = {};
  Object.entries(rawScores).forEach(([dim, sum]) => {
    levels[dim] = levelFromScore(sum);
  });

  const vector = DIMENSION_ORDER.map((d) => LEVEL_NUM[levels[d]] ?? 1);

  const ranked = patterns
    .map((row) => {
      const target = patternToLevels(row.pattern);
      let distance = 0;
      let exact = 0;
      for (let i = 0; i < target.length; i++) {
        const diff = Math.abs(vector[i] - LEVEL_NUM[target[i]]);
        distance += diff;
        if (diff === 0) exact += 1;
      }
      const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
      const lib = types[row.code] || { code: row.code, name: row.code, intro: '', desc: '' };
      return { ...row, ...lib, distance, exact, similarity };
    })
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.exact !== b.exact) return b.exact - a.exact;
      return b.similarity - a.similarity;
    });

  const bestNormal = ranked[0];
  const drunkTriggered = Number(answers[DRUNK_TRIGGER_QUESTION_ID]) === 2;

  let finalType;
  let modeKicker;
  let badge;
  let sub;
  let special = false;
  let secondaryType = null;

  if (drunkTriggered) {
    finalType = types.DRUNK;
    secondaryType = bestNormal;
    modeKicker = 'Nhân cách ẩn đã kích hoạt';
    badge = 'Khớp 100% · yếu tố cồn đã tiếp quản';
    sub = 'Độ thân ethanol quá cao — hệ thống bỏ qua phán xét thường.';
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = types.HHHH;
    modeKicker = 'Hệ thống ép kết quả';
    badge = `Thư viện chuẩn chỉ khớp ${bestNormal.similarity}%`;
    sub = 'Thư viện nhân cách bó tay — bạn được gán HHHH.';
    special = true;
  } else {
    finalType = bestNormal;
    modeKicker = 'Nhân cách chính';
    badge = `Khớp ${bestNormal.similarity}% · trúng ${bestNormal.exact}/15 chiều`;
    sub = 'Độ khớp khá cao — coi đây là bức chân dung đầu tiên.';
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType,
  };
}

export const computeResult = scoreAnswers;

export function getType(code) {
  return types[code] || null;
}

export function getAllTypes() {
  return Object.values(types);
}
