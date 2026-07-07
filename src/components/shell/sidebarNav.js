/** Sidebar navigation — category tree (play / quiz list / fortune / games) */

export const SIDEBAR_SECTIONS = [
  {
    id: 'play',
    title: 'Chơi ngay',
    icon: '🎮',
    defaultOpen: true,
    links: [
      { to: '/', label: 'Trang chủ' },
      { to: '/explore', label: 'Khám phá quiz' },
      { to: '/leaderboard', label: 'Bảng xếp hạng' },
    ],
  },
  {
    id: 'quizzes',
    title: 'Trắc nghiệm',
    icon: '🧠',
    dynamic: 'quizzes',
    links: [],
  },
  {
    id: 'fortune',
    title: 'Tử vi tình yêu',
    icon: '💘',
    links: [
      { to: '/fortune', label: 'Tử vi tình yêu hôm nay' },
      { to: '/fortune/tomorrow', label: 'Tử vi tình yêu ngày mai' },
    ],
  },
  {
    id: 'games',
    title: 'Chơi vui khác',
    icon: '🎲',
    links: [
      { to: '/balance', label: 'Chọn 1 trong 2 ⚖️' },
      { to: '/roast-card', label: 'Thẻ đen bóc phốt 💳' },
      { to: '/brain', label: 'Trong đầu bạn có gì 🧠' },
    ],
  },
];
