/** Roast card traits — hyper-local SG Gen Z blacklist (shared client) */

import { interpolateName } from './nameInterpolate.js';

export const ROAST_TRAITS = [
  {
    id: 'trait_01',
    emoji: '👻',
    title: 'Chúa tể Bùi Viện lặn mất tăm',
    description:
      '{Name} rủ đi quẩy hăng nhất hội, hô hào cho đã mồm. Tới 7h tối gọi là "thuê bao quý khách vừa gọi" — {name} lặn sâu hơn tàu ngầm, mất tích như chưa từng tồn tại. Đúng chuẩn ma đời.',
  },
  {
    id: 'trait_02',
    emoji: '⏳',
    title: 'Chiến thần giờ cao su Sài Gòn',
    description:
      '{Name} hay nói "đang tới rồi nè" trong khi vừa mới bò ra khỏi giường. "Sắp tới rồi" với {name} nghĩa là còn đang gội đầu. Đồng hồ sinh học của {name} chạy bằng múi giờ hành tinh khác, để cả hội phơi nắng 45 phút mà {name} vẫn tỉnh bơ.',
  },
  {
    id: 'trait_03',
    emoji: '💸',
    title: 'Báo thủ quên mang ví ở Quận 1',
    description:
      '{Name} check-in cafe sang Quận 1, chụp ảnh slay nhất bàn, story sống ảo full HD. Tới lúc tính tiền thì "ủa ví mình đâu rồi ta", "ZaloPay đang lỗi kìa". Nghèo mà sang, sang mà quỵt — {name} là nghệ nhân bốc hơi lúc bill tới.',
  },
  {
    id: 'trait_04',
    emoji: '🧋',
    title: 'Con nghiện trà sữa cột sống yếu',
    description:
      'Cứ mệt là {name} kêu "đi chữa lành thôi", chiếm bàn cafe 4 tiếng với đúng 1 ly trà sữa nhạt. {Name} vừa hớp vừa than áp lực cột sống lên story, nhưng cột sống thật ra chỉ mỏi vì cúi xuống lướt TikTok cả ngày.',
  },
  {
    id: 'trait_05',
    emoji: '💬',
    title: 'Thánh ghost Zalo 3 ngày',
    description:
      '{Name} đã xem tin nhắn lúc 9h tối nhưng rep lúc… 3 ngày sau kèm câu "ơ mình tưởng rep rồi". Tốc độ trả lời của {name} chậm hơn sên bò leo Everest. Crush nhắn cũng seen, ba mẹ nhắn cũng seen — {name} công bằng với tất cả, chỉ có điều ai cũng đau.',
  },
  {
    id: 'trait_06',
    emoji: '📦',
    title: 'Giỏ Shopee 5 triệu, ví còn 47k',
    description:
      '{Name} canh sale 12h đêm, thêm vào giỏ Shopee bằng cả trái tim, checkout bằng niềm tin mãnh liệt. Bạn của hiện tại vui phơi phới, bạn của cuối tháng ngồi ăn mì gói khóc ròng — đúng chuẩn kiểu {name}: mua sắm là healing, sao kê là hết hồn.',
  },
  {
    id: 'trait_07',
    emoji: '🖥️',
    title: 'Vua vào Zoom muộn 12 phút',
    description:
      '{Name} vào Zoom với lời "xin lỗi em lag mạng quá" — trong khi Discord đang xanh lét, vừa rank xong ván cuối. Sếp im lặng nhưng âm thầm ghi vào sổ đen. Mạng thì {name} đổ thừa được, còn cái nết dậy trễ thì đổ thừa cho ai?',
  },
  {
    id: 'trait_08',
    emoji: '🍜',
    title: 'Ăn hết topping của người khác',
    description:
      '{Name} order size M nhưng chuyên trị size XL của người bên cạnh. "Cho ăn thử miếng nha" xong trân châu, phô mai viên bay sạch không dấu vết. {Name} là ảo thuật gia thực thụ: chớp mắt cái là ly người ta trống trơn.',
  },
  {
    id: 'trait_09',
    emoji: '🔐',
    title: 'Nhập OTP Grab fail 8 lần',
    description:
      'Shipper gọi 3 cuộc đứng ngay trước cổng mà {name} vẫn "ủa mã đâu ta". Đời {name} là một chuỗi thử thách kỹ thuật số bất tận. Người ta giao hàng 5 phút, riêng {name} biến nó thành phim dài tập đủ cao trào.',
  },
  {
    id: 'trait_10',
    emoji: '🏋️',
    title: 'Thẻ gym dùng làm bookmark',
    description:
      '{Name} đăng ký gym hùng hồn tháng 1, tháng 3 thẻ nằm kẹp trong cuốn self-help chưa mở trang nào. Cơ bắp duy nhất {name} phát triển là ngón cái lướt TikTok. "Mai tập" là câu thần chú {name} nhắc lâu hơn cả hạn hội viên phòng gym.',
  },
  {
    id: 'trait_11',
    emoji: '💰',
    title: 'Quên chuyển khoản chia bill',
    description:
      'Sau bữa lẩu, group chat im như tờ suốt 48 tiếng vì {name} "bận". "Quên" chia bill là kỹ năng ẩn cấp SSR của {name} — bạn bè nhớ tới già, còn ví thì nhẹ tênh phơi phới. Đòi thì kỳ, không đòi thì tức.',
  },
  {
    id: 'trait_12',
    emoji: '🌧️',
    title: 'Mùa mưa SG mà không mang áo mưa',
    description:
      'Dự báo báo động đỏ mà {name} vẫn tin vào số phận và làn da mình. Kết quả: makeup trôi thành tranh trừu tượng, tóc bết như vừa gội xong. {Name} trình diễn nghệ thuật miễn phí giữa đường Nguyễn Hữu Cảnh.',
  },
  {
    id: 'trait_13',
    emoji: '📱',
    title: 'Nói bận nhưng online Threads',
    description:
      '{Name} bảo "đang bận lắm, nói sau nha" — 30 giây sau đã quote post drama, thả tim comment. Chấm xanh online tố cáo hết. {Name} có bận thật, nhưng là bận hóng, bận cà khịa thiên hạ thôi à.',
  },
  {
    id: 'trait_14',
    emoji: '⏰',
    title: 'Tắt báo thức 9 lần buổi sáng',
    description:
      '{Name} tắt báo thức 9 lần mỗi sáng: 7h, 7h05, 7h10… tới 8h30 mới bật dậy hoảng hốt. Buổi sáng của {name} là kỳ Olympic trì hoãn, và {name} năm nào cũng ẵm huy chương vàng hạng mục "ngủ thêm tí nữa".',
  },
  {
    id: 'trait_15',
    emoji: '📸',
    title: 'Chuyên gia chụp màn hình leak group',
    description:
      '{Name} là nhà báo không lương của hội — tin nóng vừa nhú là màn hình đã kịp lưu bằng chứng. Ai leak thì không ai biết, nhưng ai cũng ngầm hiểu là {name}. Ngồi giữa hội mặt tỉnh bơ mà trong điện thoại là cả kho tư liệu điều tra.',
  },
  {
    id: 'trait_16',
    emoji: '🛒',
    title: 'Chen hàng "bạn em giữ chỗ nãy giờ"',
    description:
      'Hàng dài 25 người, {name} xuất hiện với câu kinh điển "bạn em đứng đây nãy giờ nè". Cả Quận 1 quay sang lườm cháy da, nhưng ly trà sữa vẫn ngoan ngoãn về tay {name}. Mặt dày đúng chuẩn ghi vào sách kỷ lục.',
  },
  {
    id: 'trait_17',
    emoji: '🧢',
    title: 'Hứa "sắp gặp nha" từ 3 tháng trước',
    description:
      '{Name} hay hứa "tuần sau cà phê nha", "tháng sau rảnh gặp nha" — lời hứa mãi treo ở thì tương lai. Gặp được {name} khó hơn săn vé concert. Kèo của {name} là huyền thoại chỉ nghe kể, chưa ai thấy.',
  },
  {
    id: 'trait_18',
    emoji: '🎧',
    title: 'Chúa tể story nhạc buồn 2h sáng',
    description:
      '{Name} đăng lyrics tan vỡ lúc 2h sáng, ai vào hỏi "sao thế" thì "à không có gì đâu". Nhưng không có gì thật thì {name} đăng làm chi. Tổng đài tâm sự tự phong, chuyên rải drama rồi giả vờ bí ẩn.',
  },
  {
    id: 'trait_19',
    emoji: '🍗',
    title: 'Gọi món chung nhưng gắp phần ngon nhất',
    description:
      'Miệng thì {name} nói "gọi chung cho vui nha", nhưng đũa lúc nào cũng nhắm thẳng đùi gà, tôm to, miếng nạc ngon. Chiến thuật buffet cấp thượng thừa: chia sẻ là của người khác, phần ngon nhất mặc định thuộc về {name}.',
  },
  {
    id: 'trait_20',
    emoji: '📅',
    title: 'Trả lời "để mai tính" suốt 6 tháng',
    description:
      'Mọi kế hoạch của hội đều bị {name} nuốt chửng bằng câu "mai tính nha". Ngày mai của {name} nằm ở chiều không gian khác, mãi không tới. Quyết định nhanh nhất trong đời {name} là quyết định… để mai quyết.',
  },
  {
    id: 'trait_21',
    emoji: '🪫',
    title: 'Mượn sạc rồi không bao giờ trả',
    description:
      'Cây sạc, cục dự phòng, tai nghe — cứ vào tay {name} là bốc hơi vĩnh viễn. Bảo tàng đồ mượn tư nhân lớn nhất Bình Thạnh, vào cửa tự do nhưng không có cửa ra. Đòi thì {name} ngơ ngác "ủa của mày hả, tao tưởng của tao".',
  },
  {
    id: 'trait_22',
    emoji: '🤳',
    title: 'Sống ảo gấp mười lần sống thật',
    description:
      '{Name} để bữa ăn nguội ngắt vì phải chụp 40 góc cho bằng được tấm ưng ý. Feed của {name} lung linh sang chảnh, người thật thì quầng thâm mắt gấu trúc và deadline dí sát nút. Một nửa cuộc đời {name} sống trong app chỉnh ảnh, nửa còn lại chỉnh caption.',
  },
  {
    id: 'trait_23',
    emoji: '🚿',
    title: '"5 phút ra liền" nhưng tắm 45 phút',
    description:
      'Cả nhóm đứng chôn chân trước cửa, bên trong {name} đang mở liveshow karaoke tắm gội. "5 phút nữa" của {name} dài bằng một tập phim truyền hình. Khái niệm thời gian với {name} chỉ mang tính tham khảo — đừng tin.',
  },
  {
    id: 'trait_24',
    emoji: '🧃',
    title: 'Uống ké cả hội nhưng không bao giờ mua',
    description:
      '{Name} hay bảo "cho hớp trà sữa", "nếm miếng bánh coi" — cộng dồn lại đủ nguyên một phần full topping. Nền kinh tế chia sẻ một chiều: ví {name} nguyên seal, còn đồ ăn cả hội thì hao hụt bí ẩn.',
  },
  {
    id: 'trait_25',
    emoji: '🗺️',
    title: 'Chỉ đường sai nhưng tự tin cực mạnh',
    description:
      '{Name} bảo "cứ đi thẳng đi, tin tao, tao rành đường lắm" — 20 phút sau cả hội lạc tận Quận 8. Google Maps nhìn còn phải khóc thét. {Name} tự tin đầy mình, chỉ tiếc là tự tin và đúng đường chưa từng đi chung.',
  },
  {
    id: 'trait_26',
    emoji: '😴',
    title: 'Seen story nhưng bơ đẹp tin nhắn',
    description:
      '{Name} xem story người ta 3 giây trước còn thả tim nhiệt tình, nhưng tin nhắn quan trọng thì "ủa chưa thấy gì hết á". Hóng thì {name} nhanh, mà rep thì xin khất — thuật toán ưu tiên vận hành theo logic vũ trụ.',
  },
  {
    id: 'trait_27',
    emoji: '🎮',
    title: '"Ván cuối thôi" lần thứ 7',
    description:
      'Hẹn đi ăn lúc 6h, tới 8h {name} vẫn dõng dạc "ván cuối thôi mà". Ranh giới giữa lời hứa và cái rank của {name} mờ nhạt tới mức không tồn tại. "Ván cuối" là khái niệm vô hạn, giống dãy số pi không có điểm dừng.',
  },
  {
    id: 'trait_28',
    emoji: '🧥',
    title: 'Mượn đồ đi date rồi quên đường trả',
    description:
      '{Name} mượn áo khoác xịn, túi hàng hiệu "một hôm thôi" rồi nghiễm nhiên thành di sản. Tủ đồ {name} 30% là chiến lợi phẩm mượn cả hội. Nhắc khéo thì "ơ tao tưởng mày cho luôn rồi" — mượn kiểu một đi không trở lại.',
  },
  {
    id: 'trait_29',
    emoji: '📢',
    title: 'Hóng cực nhanh mà miệng như cái rổ',
    description:
      'Bí mật vừa kể {name} xong, 10 phút sau đã thành tin nóng toàn group. Đài phát thanh không giấy phép của hội, phát 24/7 không nghỉ trưa. Tin {name} giữ bí mật thì thà tin trời Sài Gòn tháng 6 không mưa còn hơn.',
  },
  {
    id: 'trait_30',
    emoji: '💤',
    title: 'Hủy kèo phút chót vì "mệt quá"',
    description:
      'Cả hội lên đồ xong xuôi, tới cửa thì nhận tin {name} "thôi ở nhà nha, tự nhiên mệt". Bậc thầy hủy kèo cấp thành phố. Rủ {name} đi chơi giống mua vé số — trúng hay trượt hên xui.',
  },
];

export function getTraitById(id) {
  return ROAST_TRAITS.find((t) => t.id === id) || ROAST_TRAITS[0];
}

/** Pick a random roast trait, optionally avoiding one id (for re-rolls). */
export function pickRandomTrait(excludeId) {
  const pool = excludeId ? ROAST_TRAITS.filter((t) => t.id !== excludeId) : ROAST_TRAITS;
  const list = pool.length ? pool : ROAST_TRAITS;
  return list[Math.floor(Math.random() * list.length)];
}

/** Weave a friend's name into roast copy via {name}/{Name} placeholders. */
export function personalizeRoastDescription(name, description) {
  return interpolateName(description, name);
}

/** One flowing answer paragraph — same tone for name, trait and explanation. */
export function buildRoastAnswerText(name, trait) {
  const n = String(name || '').trim();
  const body = interpolateName(trait.description, n);
  if (!n) return `${trait.emoji} ${trait.title}. ${body}`;
  return `${trait.emoji} ${trait.title}: ${body}`;
}

export function buildRoastShareUrl(name, traitId, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const params = new URLSearchParams({
    name: String(name).trim(),
    trait: traitId,
  });
  return `${base}/roast-card?${params.toString()}`;
}

/** Crawler-friendly share link — bots get OG card, humans redirect to /roast-card */
export function buildRoastShareLink(name, traitId, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  return `${base}/share-roast/${encodeURIComponent(String(name).trim())}/${encodeURIComponent(traitId)}`;
}

export function parseRoastShareParams(searchParams) {
  const name = (searchParams.get('name') || '').trim();
  const traitId = searchParams.get('trait');
  if (!name || !traitId) return null;
  const trait = getTraitById(traitId);
  return { name, traitId, trait };
}
