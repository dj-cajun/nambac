import types from './types.vi.json' with { type: 'json' };

const MBTI_AXES = {
  E: 'hướng ngoại, năng lượng từ người khác',
  I: 'hướng nội, năng lượng từ không gian riêng',
  S: 'thực tế, chi tiết hiện tại',
  N: 'tưởng tượng, pattern tương lai',
  T: 'logic, công bằng',
  F: 'cảm xúc, hòa hợp',
  J: 'kế hoạch, chốt việc',
  P: 'linh hoạt, giữ option',
};

const MBTI_NICKNAMES = {
  INTJ: 'Kiến trúc sư',
  INTP: 'Nhà logic',
  ENTJ: 'Chỉ huy',
  ENTP: 'Nhà tranh biện',
  INFJ: 'Người che chở',
  INFP: 'Người hòa giải',
  ENFJ: 'Người dẫn dắt',
  ENFP: 'Người truyền cảm hứng',
  ISTJ: 'Người kiểm tra',
  ISFJ: 'Người bảo vệ',
  ESTJ: 'Người điều hành',
  ESFJ: 'Người quản gia',
  ISTP: 'Thợ thủ công',
  ISFP: 'Nghệ sĩ phiêu lưu',
  ESTP: 'Doanh nhân',
  ESFP: 'Người trình diễn',
};

export function computeMbtiType(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  answers.forEach((letter) => {
    if (letter && scores[letter] != null) scores[letter] += 1;
  });
  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');
  return type;
}

export function getCrossMbti(sbtiCode, mbtiType) {
  const sbti = types[sbtiCode];
  if (!sbti || !mbtiType) return null;
  const letters = mbtiType.split('');
  const traits = letters.map((l) => MBTI_AXES[l]).join(' · ');
  const nickname = MBTI_NICKNAMES[mbtiType] || mbtiType;
  const title = `${sbti.code} × ${mbtiType}`;
  const hook = sbti.intro;
  const desc = `${sbti.name} (${hook}) gặp ${nickname} (${mbtiType}): bạn mang vibe ${traits}. `
    + `Trên lý thuyết, ${sbti.name} đẩy năng lượng meme còn ${mbtiType} giữ khung tư duy — `
    + `combo này ${compatibilityLine(sbtiCode, mbtiType)}`;
  return {
    title,
    nickname,
    desc,
    compatibility: compatibilityScore(sbtiCode, mbtiType),
  };
}

function compatibilityScore(sbtiCode, mbtiType) {
  let score = 3;
  const extro = ['CTRL', 'BOSS', 'GOGO', 'SEXY', 'THAN-K'];
  const intro = ['MONK', 'ZZZZ', 'DEAD', 'POOR', 'THIN-K'];
  if (extro.includes(sbtiCode) && mbtiType.startsWith('E')) score += 1;
  if (intro.includes(sbtiCode) && mbtiType.startsWith('I')) score += 1;
  if (['JOKE-R', 'HHHH', 'WOC!'].includes(sbtiCode) && mbtiType.includes('P')) score += 1;
  return Math.min(5, Math.max(1, score));
}

function compatibilityLine(sbtiCode, mbtiType) {
  const s = compatibilityScore(sbtiCode, mbtiType);
  if (s >= 5) return 'khá ăn ý — share card đi ngay.';
  if (s >= 4) return 'ổn áp cho meme group.';
  if (s >= 3) return 'vừa drama vừa vui.';
  return 'hơi clash nhưng đó mới là content.';
}

export { MBTI_NICKNAMES };
