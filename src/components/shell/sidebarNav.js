/** Sidebar navigation — play / quiz only (legal & info stay on homepage footer) */

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
      { to: '/fortune', label: 'Tử vi bóc phốt 🔮' },
      { to: '/balance', label: 'Chọn 1 trong 2 ⚖️' },
      { to: '/roast-card', label: 'Thẻ đen bóc phốt 💳' },
    ],
  },
];
