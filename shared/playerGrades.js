/** Player grade tiers — unique quizzes completed (ICT site, VN UI labels) */

export const PLAYER_GRADES = [
  { level: 0, minUnique: 0, label: 'Chưa có', labelKo: '없음', emoji: '·' },
  { level: 1, minUnique: 1, label: 'Tập sự', labelKo: '새내기', emoji: '🌱' },
  { level: 2, minUnique: 3, label: 'Mới chơi', labelKo: '입문자', emoji: '⭐' },
  { level: 3, minUnique: 7, label: 'Thám hiểm', labelKo: '탐험가', emoji: '🔥' },
  { level: 4, minUnique: 15, label: 'Cao thủ', labelKo: '달인', emoji: '💎' },
  { level: 5, minUnique: 30, label: 'Bậc thầy', labelKo: '마스터', emoji: '👑' },
  { level: 6, minUnique: 50, label: 'Huyền thoại', labelKo: '레전드', emoji: '🏆' },
];

export function getGradeForUniqueCount(uniqueCount = 0) {
  const n = Math.max(0, Number(uniqueCount) || 0);
  let grade = PLAYER_GRADES[0];
  for (const g of PLAYER_GRADES) {
    if (n >= g.minUnique) grade = g;
  }
  return grade;
}

export function getNextGrade(uniqueCount = 0) {
  const current = getGradeForUniqueCount(uniqueCount);
  return PLAYER_GRADES.find((g) => g.level === current.level + 1) || null;
}

export function getGradeProgress(uniqueCount = 0) {
  const current = getGradeForUniqueCount(uniqueCount);
  const next = getNextGrade(uniqueCount);
  if (!next) {
    return { current, next: null, progress: 1, remaining: 0 };
  }
  const span = next.minUnique - current.minUnique;
  const done = Math.max(0, uniqueCount - current.minUnique);
  return {
    current,
    next,
    progress: span > 0 ? Math.min(1, done / span) : 1,
    remaining: Math.max(0, next.minUnique - uniqueCount),
  };
}

export function formatPlayerGrade(progress) {
  const grade = getGradeForUniqueCount(progress?.unique_quizzes ?? progress?.uniqueQuizzes ?? 0);
  return {
    level: grade.level,
    label: grade.label,
    labelKo: grade.labelKo,
    emoji: grade.emoji,
    uniqueQuizzes: progress?.unique_quizzes ?? progress?.uniqueQuizzes ?? 0,
    totalCompletions: progress?.total_completions ?? progress?.totalCompletions ?? 0,
  };
}
