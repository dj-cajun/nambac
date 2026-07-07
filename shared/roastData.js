/** Roast card traits — hyper-local SG Gen Z blacklist (shared client) */

export const ROAST_TRAITS = [
  {
    id: 'trait_01',
    emoji: '👻',
    title: 'Chúa tể Bùi Viện lặn mất tăm',
    description:
      'Chuyên rủ "Tối nay quẩy Bùi Viện nha", gầm rú hăng hái nhất đám — đến 7h tối thì Zalo không rep, gọi thuê bao, lặn mất tăm như chưa từng tồn tại.',
  },
  {
    id: 'trait_02',
    emoji: '⏳',
    title: 'Chiến thần giờ cao su Sài Gòn',
    description:
      'Lúc nào cũng "Đang trên đường đến nè", thực tế vừa mới vào nhà tắm hoặc nằm đắp chăn lướt TikTok tại Bình Thạnh.',
  },
  {
    id: 'trait_03',
    emoji: '💸',
    title: 'Báo thủ quên mang ví ở Quận 1',
    description:
      'Check-in cafe sang chảnh Quận 1 chụp ảnh Slay nhất — đến lúc tính tiền thì "Em ơi ví anh quên ở cốp xe" hoặc "ZaloPay đang lỗi".',
  },
  {
    id: 'trait_04',
    emoji: '🧋',
    title: 'Con nghiện trà sữa cột sống yếu',
    description:
      'Hở ra là "Đi chữa lành thôi" — chiếm bàn cafe 4 tiếng, một ly trà sữa nhạt, than vãn áp lực cột sống lên mạng.',
  },
  {
    id: 'trait_05',
    emoji: '💬',
    title: 'Ghost Zalo 3 ngày',
    description:
      'Đã xem tin nhắn nhưng trả lời như đang leo Everest — không oxygen, không reply. Crush nhìn cũng tự hiểu.',
  },
  {
    id: 'trait_06',
    emoji: '📦',
    title: 'Giỏ Shopee 5 triệu, ví 47k',
    description:
      'Retail therapy boss — checkout bằng niềm tin, trả góp tương lai. Future you khóc, present you vui.',
  },
  {
    id: 'trait_07',
    emoji: '🖥️',
    title: 'Zoom muộn 12 phút chuyên nghiệp',
    description:
      '"Xin lỗi em lag mạng" — trong khi Discord đang online xanh lá. Sếp im lặng nhưng ghi nhớ.',
  },
  {
    id: 'trait_08',
    emoji: '🍜',
    title: 'Ăn hết topping trà sữa người khác',
    description:
      'Order size M nhưng ăn như XL của người bên cạnh. Trân châu biến mất — phép thuật hay tội ác?',
  },
  {
    id: 'trait_09',
    emoji: '🔐',
    title: 'Grab OTP fail 8 lần',
    description:
      'Shipper gọi 3 cuộc, bạn vẫn không nhận mã. Cuộc sống là chuỗi thử thách kỹ thuật số vô tận.',
  },
  {
    id: 'trait_10',
    emoji: '🏋️',
    title: 'Gym card làm bookmark',
    description:
      'Đăng ký tháng 1, tháng 3 card nằm cạnh sách self-help chưa mở. Muscle memory chỉ ở ngón tay scroll TikTok.',
  },
  {
    id: 'trait_11',
    emoji: '💰',
    title: 'Quên chuyển khoản chia bill',
    description:
      'Group chat im lặng 48h sau bữa lẩu. "Quên" là skill ẩn — bạn bè nhớ mãi, ví bạn thì nhẹ tênh.',
  },
  {
    id: 'trait_12',
    emoji: '🌧️',
    title: 'Không mang áo mưa mùa mưa SG',
    description:
      'Dự báo đỏ, bạn vẫn tin số phận. Makeup trôi — performance art trên đường Nguyễn Hữu Cảnh.',
  },
  {
    id: 'trait_13',
    emoji: '📱',
    title: 'Nói bận nhưng online Threads',
    description:
      'Status "đang họp" nhưng vừa quote post drama. Green dot bắt quả tang — không thoát được.',
  },
  {
    id: 'trait_14',
    emoji: '⏰',
    title: 'Snooze báo thức 9 lần',
    description:
      '7h, 7h05, 7h10... 8h30 mới dậy. Morning routine là Olympic của nút "5 phút nữa".',
  },
  {
    id: 'trait_15',
    emoji: '📸',
    title: 'Chụp màn hình drama leak group',
    description:
      'Journalist không lương của hội bạn thân. Ai leak thì ai biết — nhưng ai cũng biết ai.',
  },
  {
    id: 'trait_16',
    emoji: '🛒',
    title: 'Chen hàng trà sữa "bạn em giữ chỗ"',
    description:
      'Hàng 25 người, xuất hiện với lý do classic. Side eye cả Quận 1 — nhưng ly vẫn về tay.',
  },
];

export function getTraitById(id) {
  return ROAST_TRAITS.find((t) => t.id === id) || ROAST_TRAITS[0];
}

export function buildRoastShareUrl(name, traitId, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const params = new URLSearchParams({
    name: String(name).trim(),
    trait: traitId,
  });
  return `${base}/roast-card?${params.toString()}`;
}

export function parseRoastShareParams(searchParams) {
  const name = (searchParams.get('name') || '').trim();
  const traitId = searchParams.get('trait');
  if (!name || !traitId) return null;
  const trait = getTraitById(traitId);
  return { name, traitId, trait };
}
