/** Sponsor / influencer quiz starter templates (Vietnamese, HCMC-localized) */

export const QUIZ_TEMPLATES = [
  {
    id: 'sponsor_bubble_tea',
    label: '💎 Trà sữa — Thương hiệu',
    quiz_type: 'sponsor',
    category: 'Trendy',
    title: 'Bạn là topping trà sữa nào ở Quận 1?',
    description: '5 câu hỏi khịa — khám phá vibe trà sữa Sài Gòn của bạn.',
    design: {
      sponsor_logo: null,
      sponsor_banner: null,
      primary_color: '#FF2D85',
      bg_gradient: ['#fff0f6', '#ffe4ec'],
      brand_name: 'Thương hiệu trà sữa',
    },
    config: { sponsored: true },
    questions: [
      { question_text: 'Xếp hàng trà sữa 30 phút, bạn sẽ?', option_a: 'Quay story tag bạn bè', option_b: 'Order Grab giao tận nhà' },
      { question_text: 'Độ ngọt lý tưởng của bạn?', option_a: '30% — uống được cả ngày', option_b: '100% — ngọt như tình đầu' },
      { question_text: 'Topping không thể thiếu?', option_a: 'Trân châu đen dai dai', option_b: 'Kem cheese mặn mặn' },
      { question_text: 'Check-in quán mới ở Bui Vien?', option_a: 'Chụp 50 tấm trước khi uống', option_b: 'Uống xong mới nhớ chụp' },
      { question_text: 'Bạn order trà sữa vì?', option_a: 'Vị ngon + deal hot', option_b: 'Ly xinh để flex Zalo' },
    ],
    results: [
      { result_code: 0, title: 'Trân Châu Đen Cứng Đầu', description: 'Bạn kiên định như hàng trà sữa cuối tuần — ai rủ cũng đi, không ai rủ vẫn đi.' },
      { result_code: 1, title: 'Kem Cheese Mặn Mà', description: 'Bên ngoài cool, bên trong drama — combo hoàn hảo của Gen Z Sài Gòn.' },
      { result_code: 2, title: 'Trà Matcha Đắng Đắng', description: 'Bạn là người có gu — không follow trend mù quáng, chỉ follow deal ngon.' },
      { result_code: 3, title: 'Size Khổng Lồ Landmark 81', description: 'Làm gì cũng max level — order size L nhưng uống hết trong 5 phút.' },
    ],
  },
  {
    id: 'influencer_grab_driver',
    label: '📱 KOL — Grab Driver Vibe',
    quiz_type: 'sponsor',
    category: 'Delivery',
    title: 'Nếu bạn là tài xế Grab Sài Gòn thì kiểu nào?',
    description: 'Quiz viral cho chiến dịch influencer / delivery brand.',
    design: {
      primary_color: '#00B14F',
      bg_gradient: ['#e8fff0', '#f0fff4'],
      brand_name: 'Grab Vietnam',
    },
    config: { sponsored: true, influencer: true },
    questions: [
      { question_text: 'Khách nhắn "Anh ơi nhanh giúp em"?', option_a: 'Bật nhạc EDM tăng tốc', option_b: 'Reply sticker cười trước' },
      { question_text: 'Kẹt xe Nguyễn Huệ 30 phút?', option_a: 'Story "Sài Gòn yêu thương"', option_b: 'Gọi khách xin lỗi + free nước' },
      { question_text: 'Tip 5k qua GrabPay?', option_a: 'Cảm ơn + emoji trái tim', option_b: 'Screenshot flex group bạn' },
      { question_text: 'Order 10 ly trà sữa?', option_a: 'Check kỹ từng ly trước khi chạy', option_b: 'Chạy trước, check sau' },
      { question_text: 'Ca làm cuối ngày?', option_a: 'Thêm 1 chuyến nữa thôi', option_b: 'Off về Thủ Đức nghỉ ngơi' },
    ],
    results: [
      { result_code: 0, title: 'Tài Xế Flash Q1', description: 'Nhanh như gió, biết shortcut từng ngõ hẻm Quận 1.' },
      { result_code: 1, title: 'Captain Thân Thiện', description: 'Khách nhớ mặt, rating 5 sao — soft skill max.' },
      { result_code: 2, title: 'Night Rider Thủ Đức', description: 'Chạy ca đêm, playlist lo-fi, vibe riêng.' },
      { result_code: 3, title: 'Boss Grab Cà Phê', description: 'Vừa chạy vừa uống cà phê sữa đá — multitask king.' },
    ],
  },
  {
    id: 'brand_compatibility',
    label: '🎯 B2B — So Kèo Hợp Nhau',
    quiz_type: 'binary_5q',
    category: 'Personality',
    title: 'Độ hợp cạ của bạn với thương hiệu này?',
    description: 'Template quiz 5 câu + 8 kết quả — tối ưu viral loop compatibility.',
    design: { primary_color: '#FFD700', bg_gradient: ['#fffbeb', '#fef3c7'] },
    config: { compatibility_enabled: true, sponsored: true },
    questions: [
      { question_text: 'Cuối tuần bạn ở đâu?', option_a: 'Landmark 81 chill', option_b: 'Quán cà phé Thảo Điền' },
      { question_text: 'Style outfit của bạn?', option_a: 'Y2K hồng neon', option_b: 'Minimal đen trắng' },
      { question_text: 'App không thể thiếu?', option_a: 'Zalo + TikTok', option_b: 'Grab + Shopee' },
      { question_text: 'Mua sắm vì?', option_a: 'Deal flash sale', option_b: 'Brand yêu thích' },
      { question_text: 'Share kết quả quiz lên?', option_a: 'Zalo story ngay', option_b: 'Tag 3 bạn thách đố' },
    ],
    results: [
      { result_code: 0, title: 'Level 0 — Mới làm quen', description: 'Còn ngại ngùng nhưng tiềm năng viral cao!' },
      { result_code: 1, title: 'Level 1 — Bạn thân', description: 'Hợp vibe, hay tag nhau trên mạng xã hội.' },
      { result_code: 2, title: 'Level 2 — Soulmate Brand', description: 'Thương hiệu và bạn sinh ra là dành cho nhau.' },
      { result_code: 3, title: 'Level 3 — Ambassador tiềm năng', description: 'Bạn nên làm KOL cho brand ngay lập tức.' },
      { result_code: 4, title: 'Level 4 — Huyền thoại', description: 'Share rate 100% — bạn chính là viral engine.' },
      { result_code: 5, title: 'Level 5 — Icon Q1', description: 'Mỗi lần xuất hiện là trend.' },
      { result_code: 6, title: 'Level 6 — Boss Thủ Đức', description: 'Gu riêng, không ai copy được.' },
      { result_code: 7, title: 'Level 7 — Max Hợp Cạ', description: 'Compatibility 100% — bạn và brand là một.' },
    ],
  },
];

export function getTemplateById(id) {
  return QUIZ_TEMPLATES.find((t) => t.id === id) || null;
}
