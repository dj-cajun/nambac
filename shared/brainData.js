/** "Trong đầu bạn đang nghĩ gì?" — brain-composition mini-app (shared client) */

import { interpolateName } from './nameInterpolate.js';

export const BRAIN_RESULTS = [
  {
    id: 'brain_01',
    emoji: '💘',
    title: 'Bộ não yêu đương cấp vũ trụ',
    segments: [
      { emoji: '💘', label: 'Nghĩ về crush', pct: 90 },
      { emoji: '📚', label: 'Việc học', pct: 10 },
    ],
    description:
      '90% não của {name} là hình bóng crush: tưởng tượng cảnh tỏ tình, soạn tin nhắn rồi xoá, canh me story để thả tim lúc 2h sáng. 10% còn lại mang tiếng là việc học, nhưng thật ra {name} chỉ học cách thả thính cho mượt. Học hành gì nữa trời!',
  },
  {
    id: 'brain_02',
    emoji: '🍜',
    title: 'Bộ não chỉ xoay quanh cái ăn',
    segments: [
      { emoji: '🍜', label: 'Ăn gì tiếp theo', pct: 65 },
      { emoji: '😴', label: 'Ngủ nướng', pct: 25 },
      { emoji: '💸', label: 'Ví tiền', pct: 10 },
    ],
    description:
      'Trong đầu {name} là menu khổng lồ cuộn 24/7: trà sữa full topping, bánh tráng trộn, lẩu cay tê lưỡi. {Name} vừa ăn xong đã nghĩ tới bữa tiếp theo. 25% mơ màng ngủ nướng, 10% giật mình vì ví sắp cạn — rồi lại quay về nghĩ đồ ăn.',
  },
  {
    id: 'brain_03',
    emoji: '💸',
    title: 'Bộ não cháy túi kinh niên',
    segments: [
      { emoji: '🛒', label: 'Giỏ hàng Shopee', pct: 55 },
      { emoji: '💸', label: 'Tiền đâu rồi?', pct: 35 },
      { emoji: '😭', label: 'Hối hận', pct: 10 },
    ],
    description:
      'Trong đầu {name} có giỏ hàng Shopee không bao giờ đóng: canh sale 12h đêm, thêm vào giỏ 5 triệu rồi checkout bằng niềm tin. 35% não gào "tiền đâu ra?", 10% ngồi hối hận. Chỉ cần thấy mã freeship là mọi lý trí của {name} bay màu ngay.',
  },
  {
    id: 'brain_04',
    emoji: '👀',
    title: 'Bộ não hóng drama chuyên nghiệp',
    segments: [
      { emoji: '🍿', label: 'Hóng drama', pct: 70 },
      { emoji: '📸', label: 'Chụp màn hình', pct: 20 },
      { emoji: '🤐', label: 'Giả vờ không biết', pct: 10 },
    ],
    description:
      'Não {name} hoạt động như toà soạn báo lá cải: drama vừa nhú lên là radar hú inh ỏi. 20% dành cho chụp màn hình lưu bằng chứng, 10% giả vờ ngây thơ "ủa có chuyện gì hả?". {Name} không tạo drama, chỉ là khán giả trung thành nhất thôi mà.',
  },
  {
    id: 'brain_05',
    emoji: '⏰',
    title: 'Bộ não deadline nhưng vẫn trốn',
    segments: [
      { emoji: '📵', label: 'Trốn việc', pct: 60 },
      { emoji: '😰', label: 'Lo deadline', pct: 30 },
      { emoji: '☕', label: 'Cà phê cứu vớt', pct: 10 },
    ],
    description:
      'Deadline dí sát nút nhưng 60% não của {name} vẫn bình thản lướt TikTok, xem "1 video cuối" lần thứ 47. 30% lo sốt vó nhưng tay {name} không chịu mở laptop. 10% tin rằng một ly cà phê đậm sẽ biến {name} thành thiên tài lúc 3h sáng — spoiler: không cứu được đâu.',
  },
  {
    id: 'brain_06',
    emoji: '🎮',
    title: 'Bộ não sống trong thế giới ảo',
    segments: [
      { emoji: '🎮', label: 'Game & idol', pct: 75 },
      { emoji: '📱', label: 'Lướt TikTok', pct: 15 },
      { emoji: '🌍', label: 'Thực tại', pct: 10 },
    ],
    description:
      '75% não của {name} đang ở vũ trụ khác: rank chưa lên, idol vừa comeback, {name} phải cày view và leo hạng gấp. 15% lướt TikTok tới 2h sáng. Chỉ 10% kết nối thực tại — thường lúc mẹ gọi ăn cơm hoặc hết pin điện thoại.',
  },
  {
    id: 'brain_07',
    emoji: '🎭',
    title: 'Bộ não tâm trạng thất thường',
    segments: [
      { emoji: '😔', label: 'Tự ti', pct: 45 },
      { emoji: '😎', label: 'Ảo tưởng sức mạnh', pct: 45 },
      { emoji: '🤔', label: 'Bình thường', pct: 10 },
    ],
    description:
      'Não {name} là tàu lượn cảm xúc: 45% thì thầm "mình chả làm được gì", 5 phút sau 45% khác gào "vũ trụ này là của tôi!". Chỉ 10% bình thường hiếm hoi. Buổi sáng {name} là CEO, buổi tối là cục bông mít ướt — cả hai đều chính là {name}.',
  },
  {
    id: 'brain_08',
    emoji: '🧘',
    title: 'Bộ não chữa lành nhưng overthinking',
    segments: [
      { emoji: '🧘', label: 'Đi chữa lành', pct: 55 },
      { emoji: '🌀', label: 'Overthinking', pct: 35 },
      { emoji: '😌', label: 'An yên thật sự', pct: 10 },
    ],
    description:
      '55% não của {name} hô hào "phải đi chữa lành thôi" — đặt vé Đà Lạt, mua nến thơm, tải app thiền. 35% overthinking lúc 1h sáng về câu nói vu vơ hồi lớp 6. Chỉ 10% thật sự an yên. Chữa lành kiểu {name} là healing xong về nhà lại nghĩ tiếp.',
  },
];

export function getBrainResultById(id) {
  return BRAIN_RESULTS.find((r) => r.id === id) || BRAIN_RESULTS[0];
}

/** Pick a random brain result, optionally avoiding one id (for re-rolls). */
export function pickRandomBrainResult(excludeId) {
  const pool = excludeId ? BRAIN_RESULTS.filter((r) => r.id !== excludeId) : BRAIN_RESULTS;
  const list = pool.length ? pool : BRAIN_RESULTS;
  return list[Math.floor(Math.random() * list.length)];
}

/** Weave a friend's name into brain-scan copy via {name}/{Name} placeholders. */
export function personalizeBrainDescription(name, description) {
  return interpolateName(description, name);
}

/** Intro + explanation as one story; bars sit between the two lines. */
export function buildBrainAnswerParts(name, result) {
  const n = String(name || '').trim();
  const body = interpolateName(result.description, n);
  if (!n) {
    return {
      intro: `Kết quả quét não cho thấy ${result.emoji} ${result.title}.`,
      body,
    };
  }
  return {
    intro: `Theo sóng não, ${n} thuộc kiểu ${result.emoji} ${result.title}.`,
    body,
  };
}

/** Crawler-friendly share link — bots get OG card, humans redirect to /brain */
export function buildBrainShareLink(name, resultId, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  return `${base}/share-brain/${encodeURIComponent(String(name).trim())}/${encodeURIComponent(resultId)}`;
}

export function parseBrainShareParams(searchParams) {
  const name = (searchParams.get('name') || '').trim();
  const resultId = searchParams.get('result');
  if (!name || !resultId) return null;
  const result = getBrainResultById(resultId);
  return { name, resultId, result };
}
