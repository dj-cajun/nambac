/** 10-question Liên Quân knowledge quiz → Thông Thạo 0–7 */
export const LIENQUAN_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    text: 'Florentino mạnh nhất ở giai đoạn nào?',
    options: [
      { id: 'a', label: 'Early level 1–2 trade', correct: false },
      { id: 'b', label: 'Sau khi có skill 1 và nhịp trade ổn', correct: true },
      { id: 'c', label: 'Chỉ late-game full đồ', correct: false },
    ],
  },
  {
    id: 'q2',
    text: 'Nakroth đi rừng nên ưu tiên spell nào?',
    options: [
      { id: 'a', label: 'Trừng trị', correct: true },
      { id: 'b', label: 'Hồi máu', correct: false },
      { id: 'c', label: 'Tàng hình', correct: false },
    ],
  },
  {
    id: 'q3',
    text: 'Khi gặp Elsu, AD nên làm gì?',
    options: [
      { id: 'a', label: 'Đứng im farm giữa đường', correct: false },
      { id: 'b', label: 'Giữ góc khuất, tránh đường đạn dài', correct: true },
      { id: 'c', label: 'All-in level 1 ngay', correct: false },
    ],
  },
  {
    id: 'q4',
    text: 'Xeniel ult dùng tốt nhất khi nào?',
    options: [
      { id: 'a', label: 'Bay vào 1v5 cho ngầu', correct: false },
      { id: 'b', label: 'Cứu carry / đảo chiều teamfight', correct: true },
      { id: 'c', label: 'Clear minion wave', correct: false },
    ],
  },
  {
    id: 'q5',
    text: 'Raz mid nên ưu tiên gì early?',
    options: [
      { id: 'a', label: 'Poke bằng skill, giữ khoảng cách', correct: true },
      { id: 'b', label: 'Melee trade liên tục', correct: false },
      { id: 'c', label: 'Bỏ lane đi support từ phút 1', correct: false },
    ],
  },
  {
    id: 'q6',
    text: 'AOG là gì trong cộng đồng Liên Quân VN?',
    options: [
      { id: 'a', label: 'Tên một tướng', correct: false },
      { id: 'b', label: 'Giải đấu / meta pro Việt Nam', correct: true },
      { id: 'c', label: 'Loại giày trong shop', correct: false },
    ],
  },
  {
    id: 'q7',
    text: 'Murad all-in khi nào hợp lý?',
    options: [
      { id: 'a', label: 'Khi đã có đủ dấu ấn / nhịp combo', correct: true },
      { id: 'b', label: 'Ngay khi thấy địch full máu 5 người', correct: false },
      { id: 'c', label: 'Chỉ khi mất hết rừng', correct: false },
    ],
  },
  {
    id: 'q8',
    text: 'Support Annette ưu tiên nhiệm vụ nào?',
    options: [
      { id: 'a', label: 'Steal kill AD', correct: false },
      { id: 'b', label: 'Peel / bảo vệ carry', correct: true },
      { id: 'c', label: 'Solo Baron', correct: false },
    ],
  },
  {
    id: 'q9',
    text: 'Grakk hook trượt liên tục thì nên?',
    options: [
      { id: 'a', label: 'Spam hook giữa đường', correct: false },
      { id: 'b', label: 'Kiên nhẫn, hook từ bụi / góc khuất', correct: true },
      { id: 'c', label: 'Bán support mua AD', correct: false },
    ],
  },
  {
    id: 'q10',
    text: '“Giáo án” trong Liên Quân VN thường nghĩa là?',
    options: [
      { id: 'a', label: 'Bài tập về nhà', correct: false },
      { id: 'b', label: 'Build / trang bị theo pro hoặc guide', correct: true },
      { id: 'c', label: 'Tên map mới', correct: false },
    ],
  },
];

/** Map correct count (0–10) → Thông Thạo level 0–7 */
export function scoreToMastery(correctCount) {
  const n = Math.max(0, Math.min(10, Number(correctCount) || 0));
  if (n <= 1) return 0;
  if (n === 2) return 1;
  if (n === 3) return 2;
  if (n === 4) return 3;
  if (n === 5) return 4;
  if (n === 6) return 5;
  if (n <= 8) return 6;
  return 7;
}

export const MASTERY_LABELS = {
  0: 'Đồng',
  1: 'Thông Thạo 1',
  2: 'Thông Thạo 2',
  3: 'Thông Thạo 3',
  4: 'Thông Thạo 4',
  5: 'Thông Thạo 5',
  6: 'Thông Thạo 6',
  7: 'Thông Thạo 7',
};

export function masteryLabel(level) {
  return MASTERY_LABELS[level] || MASTERY_LABELS[0];
}
