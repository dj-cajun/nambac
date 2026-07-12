/** Daily love fortune archetypes — Tử vi tình yêu (20 types, chỉ số 0–19) */

import { FORTUNE_HEALTH_RESULTS, FORTUNE_MONEY_RESULTS } from './fortuneAxisPools.js';

export const FORTUNE_RESULTS = [
  {
    id: 0,
    title: 'Kiếp nạn Shopee vĩnh cửu 📦',
    desc:
      "Hôm nay vũ trụ báo động đỏ cho giỏ hàng của bạn: gói Shopee 'đang giao' từ sáng đến tối mà shipper như đang lội biển ở Quận 7 sau mưa ngập. Tracking nhảy 'sắp đến' rồi đứng im 6 tiếng — chuẩn kiểu Sài Gòn mùa mưa, không ai chịu trách nhiệm cả. Bạn bấm làm mới app 47 lần, tim đập mỗi khi chuông thông báo kêu, hóa ra chỉ là tin nhắn nhóm 'Ai rảnh đi lẩu không'. Đồ trong giỏ hàng từ 'cần gấp' biến thành 'thôi kệ, mai mua lại' — nhưng mai vẫn không đến.",
    remedy:
      'Tắt thông báo Shopee 24h, đừng mở tracking trước 10h tối — não bạn không phải máy chủ để bấm làm mới suốt. Nếu đói thì GrabFood, đừng chờ gói hàng như chờ crush trả lời.',
    cuuTinh: 'Chỉ số 3 (Chiến thần tiết kiệm hộ)',
    baoThu: 'Chỉ số 5 (Kẻ kẹt xe làm trễ giờ nhận hàng)',
  },
  {
    id: 1,
    title: 'Cột sống sắp gãy — sếp đang tới 💼',
    desc:
      "Chỉ số áp lực cột sống hôm nay: 147% — vượt ngưỡng an toàn từ lúc bước chân vào thang máy công ty. Chưa kịp mở laptop đã nghe 'Em ơi, vào phòng anh một chút' — câu thần chú khiến Gen Z cả thành phố run rẩy. Hộp thư Teams/Zalo công ty đỏ lòm: 'gấp', 'hôm nay xong nhé', 'em hỗ trợ thêm tí' — mà 'tí' ở đây nghĩa là cả đêm. Bạn vừa ngồi thẳng lưng giả vờ chuyên nghiệp, vừa tính toán bao nhiêu ly cà phê cần để sống sót đến 6h chiều.",
    remedy:
      "Americano liều đôi, đừng trả lời tất cả trừ khi bạn chủ động muốn drama cả công ty. Bật 'đang họp' trên Zalo, đeo tai nghe vào — dù đang nghe podcast buồn.",
    cuuTinh: 'Chỉ số 4 (Đồng bọn rủ trốn việc)',
    baoThu: 'Chỉ số 6 (Kẻ suy nghĩ quá đà làm drama thêm phức tạp)',
  },
  {
    id: 2,
    title: 'Crush đã xem — và im lặng như núi 💔',
    desc:
      "Tử vi tình cảm hôm nay cực kỳ tàn nhẫn: tin nhắn bạn gửi crush lúc 11h đêm đã hiện 'đã xem' từ sáng sớm — nhưng không một dấu '...' hay sticker cười nào xuất hiện. 95% khả năng nhận 'khum' một chữ rồi biến mất khỏi tầm ngắm, hoặc trả lời 'ừ' lúc 2h sáng khi bạn đã ngủ mất. Bạn mở Zalo 30 lần, soi story Facebook/Threads xem crush online không — chấm xanh bật tắt như trò đùa của vũ trụ.",
    remedy:
      "Đổi nhạc hồ sơ Zalo buồn cho đúng mood, lướt Threads 2 tiếng rồi cất máy — kiểu healing cổ điển. Đừng gửi thêm tin 'em thấy chưa' — chỉ làm tăng % bị bơ.",
    cuuTinh: 'Chỉ số 6 (Tri kỷ cùng thức đêm cày Threads)',
    baoThu: 'Chỉ số 7 (Đứa bạn ảo tưởng xịn sò hay xúi dại)',
  },
  {
    id: 3,
    title: 'Viêm màng túi cấp — ví lép kẹp trống rỗng 💸',
    desc:
      "Lương còn cách đây 12 ngày mà ví bạn lép kẹp như cái bụng đói lúc 12h đêm — không một nghìn, không hy vọng. Sáng mở app ngân hàng số dư nhìn mà tim đau, ZaloPay báo 'số dư không đủ' khi mua ly trà sữa 45k. Đúng lúc đó bạn thân nhắn 'Chiều nay cf Quận 1 nha, quán mới decor xinh lắm' — quán 95k một ly, chụp ảnh thì xịn sò nhưng tính tiền thì 'em quên ví ở nhà'. Não tính toán cẩn thận xem còn bao nhiêu gói Mì tôm để sống qua ngày.",
    remedy:
      "Hủy hết kế hoạch cuối tuần tốn kém, ở nhà ăn Mì tôm + uống nước lọc — chăm sóc túi tiền không có gì xấu hổ. Nói thẳng với bạn thân 'tuần này em hết tiền' thay vì gồng.",
    cuuTinh: 'Chỉ số 0 (Đứa bao ăn qua ngày)',
    baoThu: 'Chỉ số 4 (Chiến thần rủ quẩy Bùi Viện sát phạt túi tiền)',
  },
  {
    id: 4,
    title: 'Pin xã giao 0% — Bùi Viện bào mòn tâm hồn 🪫',
    desc:
      "Hôm nay bạn buộc phải giả vờ hướng ngoại: lỡ hẹn đám bạn 'tối nay quẩy Bùi Viện cho đã'. Đến nơi được 30 phút là pin xã giao về 0% — mắt ngơ ngác, nụ cười gượng gạo, muốn biến về phòng Quận 9 ngay lập tức. Xung quanh toàn tiếng hét 'Xịn quá~' 'Uống thêm đi~', nhạc bass đập vào não nát bấy, Bùi Viện đang vắt kiệt chút hồn vía cuối cùng của bạn trong khi bạn đứng góc quán lướt điện thoại giả vờ bận.",
    remedy:
      "Báo 'em về trước nhé' không phải tội — sức khỏe tinh thần quan trọng hơn FOMO. Về phòng bật chế độ máy bay, coi đó là một chuyến nghỉ dưỡng cá nhân.",
    cuuTinh: 'Chỉ số 1 (Đại ca cứu bồ giải tán cuộc chơi sớm)',
    baoThu: 'Chỉ số 7 (Chúa tể ảo tưởng xịn sò kéo đi chụp ảnh check-in vô tri)',
  },
  {
    id: 5,
    title: 'Vua kẹt xe — Hàng Xanh không lối thoát 🛵',
    desc:
      "Tan tầm hôm nay bản đồ báo đỏ toàn thành phố, nhưng bạn vẫn tự tin mình là ngoại lệ — tiết lộ: không phải đâu. Mắc kẹt ở ngã tư Hàng Xanh đúng giờ vàng: nhìn cái bánh xe trước mặt suốt 1 tiếng, hít khói combo xe máy + xe buýt số 8 như một buổi đi spa khói bụi miễn phí không ai yêu cầu. Grab báo 'tài xế đang đến' rồi đứng yên 20 phút trên bản đồ. Nhiệt độ ngoài trời 34°C, trong lòng bạn thì 40°C vì bực bội.",
    remedy:
      "Không chen hàng giao hàng, không cãi nhau vì va quẹt nhẹ — còn sống về đến nhà là may rồi. Bật podcast buồn cho đúng mood, hoặc nhắn 'trễ 30p' thật sớm.",
    cuuTinh: 'Chỉ số 2 (Người đợi bạn vô điều kiện)',
    baoThu: 'Chỉ số 0 (Shipper giao hàng bom hẹn giữa đường ngập)',
  },
  {
    id: 6,
    title: 'Suy nghĩ quá đà đến 3h sáng — não loop vô tận 🧠',
    desc:
      "Một tin nhắn vô hại từ bạn thân — trả lời 'haha' ngắn hơn một chữ cái bình thường — là đủ để não bạn khởi động chế độ phân tích siêu căng. 'Tao nói gì sai?', 'Họ giận mình à?', 'Có phải vì hôm qua tao không rep story không?' — vòng lặp vô tận trên giường đến 3h sáng. Sáng dậy mệt mỏi như vừa chạy marathon tinh thần, còn đứa bạn thì online bình thường như không có chuyện gì xảy ra. Chúa tể suy nghĩ quá đà không cần cà phê — chỉ cần một dấu hiệu mơ hồ.",
    remedy:
      'Cất điện thoại ra xa giường — tạo rào chắn thật giữa bạn và màn hình. Đi ăn dĩa Cơm tấm Quận 3, carb chữa lành tâm hồn hiệu quả hơn đi trị liệu 500k nhiều.',
    cuuTinh: 'Chỉ số 5 (Người kéo bạn ra khỏi đống suy nghĩ bằng thực tế kẹt xe)',
    baoThu: 'Chỉ số 2 (Crush bật chế độ im lặng gieo rắc sầu u uất)',
  },
  {
    id: 7,
    title: 'Ảo tưởng xịn sò — gương thần nói dối 👑',
    desc:
      "Sáng nay soi gương: outfit trông xịn sò, makeup chuẩn chỉnh, tóc bồng bềnh — bạn tự tin tưởng mình là nhân vật chính phim Hàn Quốc. Chiều ra đường hí hửng gặp bạn thân, câu đầu tiên nó phán: 'Ê outfit hôm nay… chê~'. Cả ngày sau đó bạn phải trốn trong toilet chỉnh áo, soi gương xe máy hỏi 'ổn chưa' với cả người lạ. Cái ảnh selfie gương đăng lúc 8h sáng giờ nhìn lại thấy ngại không chịu được.",
    remedy:
      'Cấm đăng thêm story cúng gương hôm nay — tránh bị cà khịa tập thể từ nhóm Zalo. Mặc đồ thoải mái rộng rãi thay vì cố gồng xịn sò cho người khác xem.',
    cuuTinh: 'Chỉ số 1 (Đồng nghiệp khen xã giao cứu vớt sĩ diện)',
    baoThu: 'Chỉ số 3 (Đứa bạn thân nghèo rớt mồng tơi dập tắt giấc mơ cf sang chảnh)',
  },
  {
    id: 8,
    title: 'Seen lúc 3 phút — rep sau 3 ngày 🕒',
    desc:
      'Nhịp tim của bạn hôm nay phụ thuộc hoàn toàn vào trạng thái online của crush. Tin nhắn thì được xem rất nhanh, nhưng phản hồi lại xuất hiện sau hai mùa mưa như một dạng nghệ thuật khiến bạn học lại chữ "kiên nhẫn".',
    remedy:
      'Giới hạn bản thân: không mở khung chat quá 3 lần/giờ. Khi đầu óc rối, đi bộ 15 phút rồi quay lại làm việc thật.',
    cuuTinh: 'Chỉ số 12 (Người kéo bạn về thực tế)',
    baoThu: 'Chỉ số 2 (Crush im lặng gieo sầu)',
  },
  {
    id: 9,
    title: 'Tối nay timeline toàn ảnh cưới 📸',
    desc:
      'Bạn vừa mở mạng xã hội đã gặp một loạt ảnh cưới, đính hôn, kỷ niệm 5 năm yêu nhau. Vũ trụ không ác ý, nhưng thuật toán hôm nay rõ ràng muốn thử sức chịu đựng của trái tim độc thân.',
    remedy:
      'Tắt feed 1 giờ, bật playlist vui và hẹn bạn thân đi ăn gì đó thật ngon. Đời không phải cuộc đua về tốc độ lấy chồng/lấy vợ.',
    cuuTinh: 'Chỉ số 15 (Bạn thân chữa lành)',
    baoThu: 'Chỉ số 4 (FOMO xã hội)',
  },
  {
    id: 10,
    title: 'Yêu chưa tới đã roleplay đám cưới 💍',
    desc:
      'Trí tưởng tượng hôm nay bay rất xa: từ một buổi cà phê thành kế hoạch cưới hỏi, decor, danh sách nhạc first dance. Bạn không sai, chỉ là đang đi nhanh hơn thực tế khoảng 6 tháng.',
    remedy:
      'Hạ tốc độ cảm xúc xuống mức "thử tìm hiểu". Đừng gửi tin nhắn dài 9 đoạn trước 10h sáng.',
    cuuTinh: 'Chỉ số 14 (Người giữ nhịp bình tĩnh)',
    baoThu: 'Chỉ số 7 (Ảo tưởng xịn sò)',
  },
  {
    id: 11,
    title: 'Ex cũ lên story "Anh ổn" đầy ẩn ý 📱',
    desc:
      'Bạn không chủ động tìm, nhưng vũ trụ vẫn gửi story của ex vào đúng lúc yếu lòng nhất. Câu chữ mơ hồ cộng bản nhạc buồn khiến não bật lại mode "nếu như ngày đó...".',
    remedy:
      'Mute ngay 30 ngày và khóa cửa trí tưởng tượng. Người cũ là dữ liệu lịch sử, không phải roadmap tương lai.',
    cuuTinh: 'Chỉ số 18 (Người cắt đứt vòng lặp)',
    baoThu: 'Chỉ số 6 (Suy nghĩ quá đà)',
  },
  {
    id: 12,
    title: 'Bạn thân lên chức quân sư tình cảm 🧠',
    desc:
      'Hôm nay bạn được tư vấn 360 độ từ bạn thân, đồng nghiệp, và cả người lạ trong comment. Vấn đề là mỗi người một kịch bản, khiến trái tim bạn như đang họp đa phòng ban.',
    remedy:
      'Chọn một người bạn tin nhất làm cố vấn chính. Nhiều lời khuyên quá đôi khi chỉ làm bạn xa cảm xúc thật của mình.',
    cuuTinh: 'Chỉ số 1 (Đồng đội trung thành)',
    baoThu: 'Chỉ số 17 (Drama hội đồng)',
  },
  {
    id: 13,
    title: 'Tình yêu kiểu "đợi em 5 phút" thành 50 phút 🚦',
    desc:
      'Lịch hẹn hôm nay gặp đúng combo trễ giờ, kẹt xe và pin điện thoại yếu. Không có gì quá nghiêm trọng, nhưng đủ để hai bên hiểu nhầm nhau trong một buổi tối.',
    remedy:
      'Báo trễ càng sớm càng tốt và nói rõ thời gian thực tế. Sự rõ ràng cứu tình cảm tốt hơn 100 lời xin lỗi sau đó.',
    cuuTinh: 'Chỉ số 5 (Người giải cứu logistics)',
    baoThu: 'Chỉ số 19 (Vua mất kết nối)',
  },
  {
    id: 14,
    title: 'Crush hôm nay đẹp quá mức cho phép ✨',
    desc:
      'Bạn gặp crush trong phiên bản hoàn hảo nhất: ánh sáng đẹp, outfit đẹp, thần thái đẹp. Não tạm ngừng logic và chuyển sang chế độ "lỡ lời toàn tập".',
    remedy:
      'Giữ cuộc trò chuyện ngắn, tự nhiên và có điểm dừng. Đừng cố gồng thành phiên bản "quá ấn tượng".',
    cuuTinh: 'Chỉ số 10 (Nhịp tim ổn định)',
    baoThu: 'Chỉ số 16 (Nói quá tay)',
  },
  {
    id: 15,
    title: 'Mưa Sài Gòn + tim mềm = dễ rung động 🌧️',
    desc:
      'Thời tiết hôm nay rất biết cách khuếch đại cảm xúc. Một tin nhắn bình thường cũng có thể khiến bạn nghĩ đó là định mệnh vừa gõ cửa.',
    remedy:
      'Nhìn vào hành động thay vì cảm giác tức thì. Mưa làm mọi thứ thơ hơn, nhưng quyết định vẫn cần tỉnh táo.',
    cuuTinh: 'Chỉ số 9 (Bộ lọc cảm xúc)',
    baoThu: 'Chỉ số 10 (Dễ mềm lòng)',
  },
  {
    id: 16,
    title: 'Lỡ nói mạnh miệng, giờ tự chữa cháy 🔥',
    desc:
      'Trong lúc tranh luận, bạn đã nói câu hơi quá tay và bây giờ thấy áy náy. Đây không phải thảm họa, chỉ là một bài kiểm tra về cách xin lỗi trưởng thành.',
    remedy:
      'Xin lỗi ngắn gọn, đúng việc và không biện minh dài dòng. Thái độ sau đó quan trọng hơn câu chữ đẹp.',
    cuuTinh: 'Chỉ số 18 (Người gỡ mìn giao tiếp)',
    baoThu: 'Chỉ số 11 (Ký ức người cũ quay lại)',
  },
  {
    id: 17,
    title: 'Drama nhóm bạn chạm ngõ tình cảm 🎭',
    desc:
      'Một câu chuyện nhỏ trong nhóm bạn bất ngờ kéo bạn vào vùng nhạy cảm. Mọi người đều có quan điểm, nhưng ít ai biết hết bối cảnh.',
    remedy:
      'Đừng chọn phe quá sớm. Ưu tiên nói chuyện riêng với người liên quan trước khi kết luận.',
    cuuTinh: 'Chỉ số 12 (Người giữ cân bằng)',
    baoThu: 'Chỉ số 4 (Sợ bỏ lỡ nên dễ cuốn vào drama)',
  },
  {
    id: 18,
    title: 'Bình tĩnh là siêu năng lực hôm nay 🧊',
    desc:
      'Bạn xử lý tình huống tình cảm với độ điềm tĩnh hiếm thấy. Người khác có thể nóng vội, nhưng bạn đang giữ được nhịp rất đẹp.',
    remedy:
      'Giữ phong độ: nghe đủ, nói vừa, quyết định chậm hơn cảm xúc 1 nhịp. Hôm nay bạn hợp vai "trụ cột".',
    cuuTinh: 'Chỉ số 14 (Nội lực ổn định)',
    baoThu: 'Chỉ số 7 (Ảo tưởng hình ảnh)',
  },
  {
    id: 19,
    title: 'Mất kết nối tạm thời, hiểu lầm tăng tốc 📵',
    desc:
      'Pin yếu, mạng chập chờn, thông báo tới trễ — công nghệ hôm nay không đứng về phía bạn. Chỉ cần thiếu một câu xác nhận là mọi thứ dễ bị hiểu sai.',
    remedy:
      'Khi quan trọng, gọi trực tiếp thay vì nhắn qua lại quá nhiều. Một cuộc gọi 2 phút có thể cứu cả buổi tối.',
    cuuTinh: 'Chỉ số 13 (Người giao tiếp rõ ràng)',
    baoThu: 'Chỉ số 5 (Kẹt xe + trễ hẹn)',
  },
];

const TITLE_EMOJI_RE = /^(.+?)\s+([\p{Extended_Pictographic}\uFE0F]+)$/u;
const INDEX_LABEL_RE = /Chỉ số\s*(\d+)/i;

export function normalizeFortune(entry) {
  const match = entry.title.match(TITLE_EMOJI_RE);
  const emoji = match ? match[2].trim() : '✨';
  const title = match ? match[1].trim() : entry.title.trim();
  const cuuMatch = entry.cuuTinh.match(INDEX_LABEL_RE);
  const baoMatch = entry.baoThu.match(INDEX_LABEL_RE);

  return {
    id: entry.id,
    emoji,
    title,
    body: entry.desc,
    remedy: entry.remedy,
    cuuTinh: entry.cuuTinh,
    baoThu: entry.baoThu,
    soulmateIndex: cuuMatch ? Number(cuuMatch[1]) : null,
    villainIndex: baoMatch ? Number(baoMatch[1]) : null,
  };
}

/** @deprecated use FORTUNE_RESULTS — kept for existing imports */
export const FORTUNE_ARCHETYPES = FORTUNE_RESULTS.map(normalizeFortune);
export const FORTUNE_COUNT = FORTUNE_ARCHETYPES.length;

function markAxisNative(pool) {
  return pool.map((f) => ({ ...f, axisNative: true }));
}

export const FORTUNE_MONEY_ARCHETYPES = markAxisNative(FORTUNE_MONEY_RESULTS.map(normalizeFortune));
export const FORTUNE_HEALTH_ARCHETYPES = markAxisNative(FORTUNE_HEALTH_RESULTS.map(normalizeFortune));

export function getFortuneByIndex(index) {
  const i = ((Number(index) % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
  return FORTUNE_ARCHETYPES[i];
}

/** Axis-native pool when available; index stays 0..FORTUNE_COUNT-1 for share URLs */
export function getFortuneByIndexForAxis(index, axis) {
  const pool = getFortunePoolForAxis(axis);
  const i = ((Number(index) % pool.length) + pool.length) % pool.length;
  return pool[i];
}

export function getFortunePoolForAxis(axis) {
  const ax = String(axis || 'love').trim().toLowerCase();
  if (ax === 'money' && FORTUNE_MONEY_ARCHETYPES.length) return FORTUNE_MONEY_ARCHETYPES;
  if (ax === 'health' && FORTUNE_HEALTH_ARCHETYPES.length) return FORTUNE_HEALTH_ARCHETYPES;
  return FORTUNE_ARCHETYPES;
}
