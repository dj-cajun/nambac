/**
 * Handcrafted quizzes — no AI, direct DB seed.
 * 5 questions (binary_5q) + 8 results each.
 */
import { BINARY_5Q_SCORES } from './quizPrompts.js';
import { QUIZ_RICHNESS_LIMITS } from './quizPrompts.js';

const DESC_PAD =
  ' Kết quả mang tính giải trí Gen Z Sài Gòn — nếu trúng quá đúng thì tag bạn thân trên Zalo để cùng roast!';

const QUESTION_PAD = ' Bạn sẽ chọn phản ứng nào trong tình huống này?';

function padDesc(text) {
  let s = String(text || '').trim();
  const marker = 'Kết quả mang tính giải trí Gen Z Sài Gòn';
  // Never append twice — descriptions that already have the disclaimer stay as-is.
  if (s.includes(marker)) return s;
  if (s.length < QUIZ_RICHNESS_LIMITS.resultDescMin) {
    s += DESC_PAD;
  }
  return s;
}

function padTitle(text) {
  const t = String(text || '').trim();
  if (t.length >= QUIZ_RICHNESS_LIMITS.resultTitleMin) return t;
  return `${t} — Sài Gòn`;
}

function padQuestion(text) {
  let s = String(text || '').trim();
  const marker = 'Bạn sẽ chọn phản ứng nào trong tình huống này?';
  // Never append twice — questions that already have the filler stay as-is.
  if (s.includes(marker)) return s;
  if (s.length < QUIZ_RICHNESS_LIMITS.questionMin) {
    s += QUESTION_PAD;
  }
  return s;
}

function q(text, a, b) {
  return { question_text: padQuestion(text), option_a: a, option_b: b };
}

function buildQuestions(rows) {
  return rows.map((row, i) => {
    const [score_a, score_b] = BINARY_5Q_SCORES[i] || [0, 0];
    return {
      order_number: i + 1,
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      score_a,
      score_b,
    };
  });
}

function buildResults(items) {
  return items.map((item, i) => ({
    result_code: i,
    title: padTitle(item.title),
    type_name: padTitle(item.title),
    description: padDesc(item.description),
    traits: item.traits,
  }));
}

const R = (title, description, traits) => ({ title, description, traits });

export const HANDCRAFTED_QUIZZES = [
  {
    title: 'Bạn là "Thánh Ghost" hay "Reply Trong 3 Giây" trên Zalo?',
    description: 'Test độ "mặn mà" khi nhắn tin với crush, bạn thân và sếp ở Sài Gòn. Ai cũng từng seen mà không rep — bạn thuộc phe nào? (Kết quả có thể hơi đau nhưng chính xác!)',
    category: 'Personality',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Crush nhắn "Em ngủ chưa?" lúc 1h sáng, bạn đang thức lướt TikTok ở phòng trọ Bình Thạnh — bạn sẽ làm gì?',
        'Rep ngay "Chưa, em cũng chưa ngủ nè 🥺" rồi chat thêm 20 phút cho ấm. (Reply trong 3 giây — simp chuyên nghiệp!)',
        'Để máy im lặng, sáng mai rep "Hôm qua ngủ sớm rồi" như chưa từng online. (Ghost artist — di sản Zalo!)',
      ),
      q(
        'Group Zalo lớp hỏi "Ai rảnh làm slide?" lúc 11h đêm trước deadline — bạn đang nằm cuộn chăn xem phim.',
        'Giơ tay ngay "Em làm phần intro nha!" để ghi điểm với lớp. (Team player đêm khuya — corporate nice guy!)',
        'Tắt thông báo, mai sáng rep "Em mới thấy tin" như vừa tỉnh dậy. (Strategic ghost — survival mode!)',
      ),
      q(
        'Bạn thân gửi screenshot drama crush mới, hỏi "Mày nghĩ sao?" — bạn đang học online có camera tắt.',
        'Drop hết việc, phân tích drama 30 phút như chuyên gia tâm lý. (Bestie priority — gossip therapist!)',
        'React bằng sticker cười, để mai rảnh mới rep chi tiết. (Emotional bandwidth low!)',
      ),
      q(
        'Sếp nhắn Zalo "Em rảnh 5 phút không?" lúc 18h05 thứ Sáu — bạn vừa bước chân ra khỏi văn phòng Quận 1.',
        'Rep "Dạ em rảnh ạ" dù đã lên Grab về nhà. (Employee of the month material!)',
        'Để seen 2 tiếng, tối rep "Em xin lỗi, lúc nãy em không thấy ạ". (Boundary icon — Friday freedom!)',
      ),
      q(
        'Ex like story cũ của bạn lúc nửa đêm — bạn đang chill với trà sữa một mình ở quán cf Thảo Điền.',
        'Like lại story ex ngay — power move hoặc tự sabotage tuỳ karma. (Chaos agent activated!)',
        'Mute story ex, tiếp tục uống trà sữa như không có gì xảy ra. (Healing arc — peace > drama!)',
      ),
    ]),
    results: buildResults([
      R('Thánh Reply Trong 3 Giây', 'Bạn là archetype Reply Trong 3 Giây — điện thoại dính tay như sinh ra để nhắn tin. Crush nhắn một câu là bạn rep cả đoạn văn, bạn bè tag là bạn có mặt ngay. Mọi người yêu mến vì luôn tạo cảm giác được quan tâm, nhưng đôi khi bạn kiệt sức vì không ai biết nói "không" với notification. Lời khuyên: đôi khi để họ chờ 15 phút cũng tăng giá trị bản thân đấy. Đừng biến Zalo thành công việc full-time nhé!', ['Nhiệt tình', 'Dễ mến', 'Online 24/7']),
      R('Ghost Có Kiểm Soát', 'Bạn thuộc phe Ghost Có Kiểm Soát — không phải bơ người ta, mà chọn thời điểm rep cho đúng vibe. Bạn đã xem tin nhưng cần "nấu câu trả lời" trong đầu trước khi gửi. Bạn bè hiểu bạn là người suy nghĩ kỹ, crush thì hơi đoán không ra. Đôi khi seen quá lâu bị hiểu nhầm là không quan tâm — nhưng bạn biết mình chỉ đang bảo vệ năng lượng. Lời khuyên: thỉnh thoảng rep "đang bận, tí rep nha" để đỡ bị gán mác thờ ơ.', ['Bí ẩn', 'Tỉnh táo', 'Có chiến thuật']),
      R('Thánh Seen Không Rep', 'Archetype Thánh Seen Không Rep — bạn master của nút "đã xem". Tin nhắn vào là bạn đọc xong trong 0.5 giây, nhưng ngón tay không bao giờ chạm ô reply. Bạn bè đã quen, crush thì stress, sếp thì... chưa dám hỏi. Bạn không xấu — chỉ là não bạn cần deadline mới kích hoạt chế độ trả lời. Group chat im lặng khi bạn online vì ai cũng biết bạn đang lướt. Lời khuyên: rep một tin "ok" mỗi ngày để giữ mối quan hệ, đừng để thành legend tiêu cực.', ['Lười rep', 'Đã xem', 'Meme sống']),
      R('Reply Tuỳ Tâm Trạng', 'Bạn là Reply Tuỳ Tâm Trạng — hôm nay rep siêu nhanh như CSKH, mai thì biến mất 48 tiếng không dấu vết. Năng lượng xã hội của bạn như pin iPhone sau 2 năm: lúc 100%, lúc 3%. Bạn bè đã học cách không gửi tin quan trọng vào Chủ Nhật tối. Crush đôi khi không biết mình đang ở giai đoạn nào của bạn. Lời khuyên: thông báo trước khi "biến mất" — một story "em off 1 ngày nha" cứu được cả tình bạn lẫn tình yêu đấy!', ['Thất thường', 'Cảm xúc', 'Khó đoán']),
      R('Ghost Chuyên Nghiệp', 'Ghost Chuyên Nghiệp — bạn không ghost vì ghét ai, mà vì social battery về 0%. Một cuộc trò chuyện dài là bạn cần nằm im 6 tiếng để hồi phục. Bạn bè toxic gọi bạn "lạnh lùng", bạn bè thật sự hiểu bạn chỉ cần không gian. Crush nhắn "sao hôm nay im vậy" là bạn panic rep một câu rồi lại biến. Lời khuyên: introvert không phải lỗi — nhưng đừng để người quan trọng tưởng bạn đã block họ nhé.', ['Introvert', 'Mệt xã giao', 'Cần không gian']),
      R('Nhắn Tin Như Sếp', 'Bạn nhắn tin như Sếp — câu ngắn, thẳng, không emoji, kết thúc bằng dấu chấm. "Ok.", "Được.", "Chiều gặp." — đủ khiến crush overthink 3 tiếng. Bạn không cố tình lạnh, đó chỉ là phong cách giao tiếp tiết kiệm năng lượng. Bạn bè quen rồi thì thấy đáng yêu, người mới thì tưởng bạn đang giận. Lời khuyên: thêm một emoji 🥺 mỗi tuần — thế giới sẽ ấm hơn và crush bớt lo lắng.', ['Ngắn gọn', 'Lạnh lùng', 'Thẳng thắn']),
      R('Thánh Kéo Dài Cuộc Trò Chuyện', 'Thánh Kéo Dài Cuộc Trò Chuyện — bạn rep nhanh nhưng mỗi tin nhắn mở ra chủ đề mới, chat từ 10h tối đến 3h sáng không ai muốn dừng. Bạn bè yêu vì vui, nhưng sáng hôm sau cả hai đều zombie đi làm. Crush có thể thích hoặc sợ vì intensity quá cao. Lời khuyên: biết dừng đúng lúc — để lại "mai nói tiếp nha" tạo hook tốt hơn chat đến sáng.', ['Ba hoa', 'Vui tính', 'Nhiệt huyết']),
      R('Meme Reply Chỉ Sticker', 'Meme Reply Chỉ Sticker — bạn giao tiếp bằng sticker, meme và reaction, hiếm khi gõ chữ quá 5 từ. "Ok", "Ừ", "😂" là vocabulary chính. Bạn bè hiểu ngôn ngữ của bạn, người lạ thì confused. Crush đôi khi không biết bạn nghiêm túc đến đâu. Lời khuyên: một câu dài thỉnh thoảng chứng minh bạn vẫn biết dùng bàn phím — đừng để thành NPC trong chat.', ['Hài hước', 'Lười gõ', 'Meme lord']),
    ]),
  },
  {
    title: 'Sinh Tồn Mùa Mưa Sài Gòn: Bạn Là "Thánh Lội Nước" Hay "Ở Nhà"?',
    description: 'Mưa ngập, xe hỏng, deadline vẫn gọi — test khả năng sinh tồn Gen Z Sài Gòn khi trời không thương. Bạn sẽ làm gì khi ngập đến đầu gối ở Quận 7? (Có thể hơi quen!)',
    category: 'Survival',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        '7h30 sáng, mưa ngập ngang bụng ở Quận 7, meeting online 15 phút nữa — bạn đang ở phòng trọ cách công ty 4km.',
        'Lội nước ra đường, bật hotspot, join Zoom trên xe máy giữa mương. (Main character energy — hustle or drown!)',
        'Nhắn sếp "em delay 30p", tìm quán cf gần nhất có WiFi ổn. (Problem solver — dry feet priority!)',
      ),
      q(
        'Áo mưa quên ở nhà, trời đổ như trút, bạn vừa makeup xong chuẩn bị đi hẹn crush ở Quận 1.',
        'Mua áo mưa 15k bên đường, chấp nhận makeup trôi — đúng giờ quan trọng hơn. (Punctuality warrior!)',
        'Nhắn crush "trời mưa em ở nhà nha", order đồ ăn xem phim online cùng. (Pivot master — Plan B romantic!)',
      ),
      q(
        'Xe máy chết giữa đường ngập, điện thoại còn 8% pin, bạn cách nhà 2km — trời vẫn mưa.',
        'Dắt bộ về nhà trong mưa như phim Hàn — content cho story. (Drama queen/king arc!)',
        'Gọi bạn có xe ô tô cao, nhờ đón — trả bằng trà sữa tuần sau. (Social capital activated!)',
      ),
      q(
        'Shopee Food báo shipper delay vì mưa, bạn đói muốn xỉu, tủ lạnh chỉ có nước lọc và trứng.',
        'Chiên trứng ăn với cơm nguội, survive ngày mai. (Instant noodle hero — MacGyver Gen Z!)',
        'Đi bộ 200m ra tiệm tạp hoá mua mì gói — không để bụng làm chủ não. (Hangry problem solver!)',
      ),
      q(
        'Cả khu trọ mất điện vì mưa, laptop sắp hết pin, deadline 23h59 — bạn làm gì?',
        'Chạy ra quán net gần nhất, cày đến khi xong bài. (Grind mode — no excuses!)',
        'Xin deadline thêm 1 ngày, ngủ sớm — sáng mai đầu óc minh mẫn hơn. (Strategic surrender!)',
      ),
    ]),
    results: buildResults([
      R('Thánh Lội Nước Sài Gòn', 'Thánh Lội Nước — bạn coi mùa mưa như boss battle hàng ngày, không gì cản được deadline. Bạn từng lội ngập đến đầu gối vẫn đúng giờ họp, makeup trôi vẫn cười được. Bạn bè ngưỡng mộ nhưng cũng lo bạn sớm viêm phổi. Lời khuyên: đôi khi ở nhà không phải thua — là chiến thuật thông minh. Nhưng respect năng lượng main character của bạn!', ['Gan dạ', 'Bất khuất', 'Hustle']),
      R('Chiến Thuật Gia Mùa Mưa', 'Chiến Thuật Gia Mùa Mưa — bạn không hùng dũng mù quáng mà lên plan B, C, D trước khi ra đường. App dự báo mưa, áo mưa dự phòng, quán cf backup — bạn chuẩn bị như đi phượt. Bạn bè hay nhờ bạn lên lịch vì biết bạn không bao giờ để cả nhóm ướt sũng. Lời khuyên: đôi khi spontaneity cũng vui — đừng over-plan mất hết rom-com moment nhé!', ['Chu đáo', 'Thực tế', 'Có plan B']),
      R('Ở Nhà Là Chiến Thắng', 'Ở Nhà Là Chiến Thắng — bạn hiểu rằng sinh tồn = không ra đường khi ngập. Trà sữa, Netflix, chăn ấm — bạn biến ngày mưa thành staycation. Bạn bè gọi "nhút nhát" nhưng sáng hôm sau chỉ mình bạn khô ráo và đủ ngủ. Lời khuyên: đừng FOMO khi thấy story người khác lội nước — sức khỏe > content.', ['An toàn', 'Thông minh', 'Biết lui']),
      R('Thánh Pivot Online', 'Thánh Pivot Online — mưa ngập là signal chuyển mọi thứ sang online: họp Zoom, hẹn hò video call, order đồ ăn. Bạn không chống thiên nhiên, bạn hợp tác với nó. Crush thích vì bạn linh hoạt, sếp thích vì vẫn đúng giờ. Lời khuyên: giữ skill này — thế giới ngày càng remote, bạn đã đi trước một bước.', ['Linh hoạt', 'Tech-savvy', 'Thích nghi']),
      R('Người Gọi Bạn Cứu', 'Người Gọi Bạn Cứu — bạn không tự lội nước, nhưng network cứu cánh của bạn mạnh. Một tin nhắn "ai đón em với" là có xe cao, áo mưa, hoặc chỗ trú. Bạn bè than bạn hay nhờ nhưng cũng sẵn sàng giúp lại. Lời khuyên: đừng abuse social capital — trả ơn bằng trà sữa và loyalty.', ['Xã giao', 'Biết nhờ', 'May mắn']),
      R('Chạy Deadline Bất Chấp', 'Chạy Deadline Bất Chấp — mưa, ngập, mất điện đều không bằng nỗi sợ trễ deadline. Bạn từng cày bài bằng đèn pin điện thoại, respect. Stress cao nhưng output ổn định. Bạn bè lo burnout, sếp thì ghi nhận. Lời khuyên: thỉnh thoảng nghỉ một ngày mưa — não cần reset để creative hơn.', ['Cày cuốc', 'Chịu khó', 'Áp lực cao']),
      R('Thánh Content Mưa', 'Thánh Content Mưa — bạn lội nước không chỉ để đi làm mà còn để quay story. Mưa ngập = content vàng, bạn bè xem vừa lo vừa cười. Bạn biến khó khăn thành entertainment — skill Gen Z đỉnh. Lời khuyên: đừng quên sống thật ngoài khung hình — đôi khi tắt camera và chỉ... sống.', ['Sống ảo', 'Vui tính', 'Content']),
      R('Đầu Hàng Có Phong Cách', 'Đầu Hàng Có Phong Cách — bạn cancel mọi kế hoạch khi mưa, không áy náy, không FOMO. Tin nhắn "trời mưa em off nha" gửi đi như routine. Bạn bè đã quen schedule của bạn phụ thuộc radar mưa. Lời khuyên: thỉnh thoảng cố một lần cho crush thấy bạn có effort — đừng thành "người chỉ ra khi nắng".', ['Thoải mái', 'Thẳng thắn', 'Biết nghỉ']),
    ]),
  },
  {
    title: 'Kiếp Trước Ở Sài Gòn: Bạn Là "Influencer flop" Hay "Bà Chủ Quán Cf"?',
    description: 'Nếu kiếp trước bạn sống ở Sài Gòn thập niên 90-2000, bạn sẽ là ai? Test vibe tiền kiếp Gen Z — kết quả có thể giải thích vì sao bạn mê trà sữa hoặc sợ livestream. (Vui thôi nhé!)',
    category: 'PastLife',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Kiếp trước, bạn có 50 triệu đồng thời điểm Sài Gòn đang lên — bạn đầu tư vào đâu?',
        'Mở quán cf nhỏ ở hẻm Quận 3, nuôi mèo, sống chậm. (Bà chủ quán cf — low drama life!)',
        'Mua máy quay, làm show đường phố Bùi Viện, săn view. (Influencer tiên phong — content or die!)',
      ),
      q(
        'Bạn được mời party rooftop Quận 1 nhưng cùng ngày bạn thân cưới ở Bình Thạnh — bạn chọn?',
        'Đi đám cưới, mặc áo dài, chụp ảnh cưới như photographer. (Loyal friend — family > flex!)',
        'Party rooftop, story check-in, tag "living my best life". (Main character — FOMO winner!)',
      ),
      q(
        'Kiếp trước bạn yêu ai đó nhưng họ thích người giàu hơn — bạn làm gì?',
        'Viết thơ buồn, đăng nhật ký, trở thành artist nổi tiếng sau này. (Sad boy/girl to star arc!)',
        'Học kinh doanh, 10 năm sau mở chuỗi trà sữa, crush quay lại. (Revenge success — CEO energy!)',
      ),
      q(
        'Bạn thấy người bạn thân bị bully trên mạng xã hội thời mới có Facebook — bạn?',
        'Đăng status bênh bạn, war comment 3 ngày 3 đêm. (Warrior — ride or die online!)',
        'Nhắn riêng an ủi, khuyên off mạng một thời gian. (Healer — peace over drama!)',
      ),
      q(
        'Cuối kiếp, bạn được chọn một di sản để lại cho kiếp sau — bạn chọn gì?',
        'Khả năng nấu ăn ngon và recipe bí mật trà sữa. (Food legacy — taste never dies!)',
        'Kỹ năng kể chuyện và làm người khác cười. (Storyteller — meme ancestor!)',
      ),
    ]),
    results: buildResults([
      R('Bà Chủ Quán Cf Hẻm', 'Kiếp trước bạn là Bà Chủ Quán Cf Hẻm — sống chậm, biết tên khách quen, mèo nằm quầy. Bạn không giàu nhưng được yêu mến cả phường. Kiếp này bạn vẫn mê không gian nhỏ ấm, ghét open office ồn ào. Lời khuyên: đừng để hustle culture làm mất vibe cozy — đôi khi ly cf và bạn thân là đủ.', ['Ấm áp', 'Bình dị', 'Biết người']),
      R('Influencer Đường Phố', 'Influencer Đường Phố — bạn săn view trước khi có từ "influencer". Camera cầm tay, Bùi Viện, drama đời thường. Kiếp này bạn vẫn cần validation từ like — không xấu, chỉ cần awareness. Lời khuyên: content vui nhưng đừng để algorithm làm chủ hạnh phúc.', ['Nổi bật', 'Hướng ngoại', 'Sống ảo']),
      R('Thánh Thả Thính Tiền Kiến', 'Thánh Thả Thính Tiền Kiến — kiếp trước bạn viết thư tay, giờ là DM slide. Tình yêu là nghệ thuật, bạn là Picasso của pickup line. Crush run nhưng bạn không bỏ cuộc. Lời khuyên: thả thính có skill nhưng đọc room — im lặng đôi khi là câu trả lời rõ nhất.', ['Lãng mạn', 'Táo bạo', 'Kiên trì']),
      R('CEO Trà Sữa Ngầm', 'CEO Trà Sữa Ngầm — kiếp trước bạn đã hiểu margin trà sữa trước cả thị trường. Bạn không khoe nhưng ví luôn có kế hoạch. Kiếp này bạn săn voucher, so sánh giá, nhưng cũng mơ mở shop. Lời khuyên: đầu tư skill thật — trà sữa chỉ là metaphor cho hustle thông minh.', ['Kinh doanh', 'Thực tế', 'Nhìn xa']),
      R('Artist Buồn Nổi Tiếng', 'Artist Buồn Nổi Tiếng — kiếp trước bạn đau khổ mà tạo ra thơ, nhạc, tranh. Kiếp này bạn vẫn emotional depth cao, playlist toàn nhạc buồn 2h sáng. Bạn bè tới bạn khi cần người hiểu. Lời khuyên: channel cảm xúc vào sáng tạo — đừng chỉ scroll trong đó.', ['Sâu sắc', 'Nghệ sĩ', 'Cảm xúc']),
      R('Warrior Comment Section', 'Warrior Comment Section — kiếp trước bạn đã war forum, kiếp này war Threads. Bạn không để ai bắt nạt người mình thương. Năng lượng cao, đôi khi mệt. Lời khuyên: chọn trận đánh — không phải drama nào cũng đáng burn energy.', ['Bảo vệ', 'Mạnh mẽ', 'Trực tiếp']),
      R('Healer Im Lặng', 'Healer Im Lặng — kiếp trước bạn là người nghe, không phán xét. Kiếp này bạn vẫn là safe space của hội bạn. Crush tin bạn vì bạn giữ bí mật. Lời khuyên: đừng quên chữa lành cho chính mình — bạn cũng cần người nghe.', ['Dịu dàng', 'Tử tế', 'Ẩn mình']),
      R('Meme Ancestor', 'Meme Ancestor — kiếp trước bạn đã biết làm người khác cười trước khi có meme. Truyện cười, châm biếm, timing hoàn hảo. Kiếp này bạn là người gửi meme đúng lúc trong group chat. Lời khuyên: humor là gift — dùng để kết nối, đừng dùng để trốn cảm xúc thật.', ['Hài hước', 'Sáng tạo', 'Timing vàng']),
    ]),
  },
  {
    title: 'Vận Mệnh Tháng Này: Bạn Sẽ "Thành Công" Hay "Nằm Dài"?',
    description: 'Bói vui kiểu Gen Z Sài Gòn — không cần Tarot thật, chỉ cần trung thực với bản thân. Tháng này bạn sẽ hustle hay procrastinate? (Không chịu trách nhiệm nếu trúng quá đúng!)',
    category: 'Fortune',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Đầu tháng, bạn nhận lương — ví vừa đầy, Shopee sale đang chạy, bạn sẽ?',
        'Lập Excel chi tiêu, chia 50-30-20, không đụng sale. (Financial adult — future you says thanks!)',
        'Checkout giỏ hàng từ tuần trước, "tháng sau siết lại". (Retail therapy — debt is future problem!)',
      ),
      q(
        'Crush đăng story đi chơi với người khác — bạn thấy lúc đang scroll trước khi ngủ.',
        'Tắt điện thoại, ngủ — mai tính tiếp. (Emotional discipline — self care first!)',
        'Stalk profile người đó 45 phút, hỏi bạn thân phân tích. (Detective mode — pain but data!)',
      ),
      q(
        'Sếp giao project mới deadline 2 tuần — bạn đang có 3 việc chưa xong.',
        'Nói thẳng workload, xin ưu tiên hoặc gia hạn. (Boundary boss — communication wins!)',
        'Nhận hết, cày đêm, hy vọng không collapse. (Yes person — burnout speedrun!)',
      ),
      q(
        'Bạn thân rủ đi Đà Lạt cuối tuần, ví còn đủ nhưng đang muốn tiết kiệm.',
        'Từ chối nhẹ, hẹn tháng sau khi có kế hoạch. (Delayed gratification — adulting!)',
        'Đi luôn — "tiền kiếm lại được, kỷ niệm thì không". (YOLO — memory > money!)',
      ),
      q(
        'Cuối tháng, bạn check lại mục tiêu đầu tháng — bạn đã làm được bao nhiêu?',
        'Khoảng 70% — không hoàn hảo nhưng proud. (Steady progress — realistic king/queen!)',
        'Quên mục tiêu là gì, nhưng story đẹp và meme nhiều. (Vibes over goals — soft life!)',
      ),
    ]),
    results: buildResults([
      R('Tháng Thành Công Rực Rỡ', 'Vận tháng này: Thành Công Rực Rỡ — năng lượng hustle đang cao, deadline gặp bạn là nộp đúng hạn. Sếp ghi nhận, ví không trống rỗng cuối tháng. Crush có thể rep tin nhắn vì bạn không desperate. Lời khuyên: đừng quên nghỉ — success mà burnout thì tháng sau flop. Celebrate nhỏ mỗi tuần!', ['May mắn', 'Kỷ luật', 'Tỏa sáng']),
      R('Tháng Nằm Dài Có Lý Do', 'Tháng Nằm Dài — universe bảo bạn rest. Procrastinate có guilt nhưng não cần reset. Bạn sẽ hoàn thành việc quan trọng, bỏ việc không quan trọng. Crush không rep cũng không sai — focus bản thân. Lời khuyên: nằm dài có chủ đích = recharge, không phải thua cuộc.', ['Thư giãn', 'Chậm lại', 'Tự chữa']),
      R('Tháng Drama Nhẹ', 'Tháng Drama Nhẹ — không thảm như phim, nhưng đủ story cho group chat. Ex, crush, hoặc bạn thân sẽ tạo plot twist nhỏ. Bạn sẽ survive và có meme. Lời khuyên: đừng post khi đang angry — story 24h sau sẽ hối hận.', ['Kịch tính', 'Meme', 'Sống sót']),
      R('Tháng Tiền Về', 'Tháng Tiền Về — voucher, hoàn tiền, hoặc khoản không ngờ tới. Bạn săn sale đúng lúc, chia bill thắng. Lời khuyên: đừng tiêu hết ngay — để 20% cho rainy day Sài Gòn thật sự.', ['Tài lộc', 'May mắn', 'Thông minh']),
      R('Tháng Tình Cảm Nóng', 'Tháng Tình Cảm Nóng — crush, talking stage, hoặc reconnect có biến. Tin nhắn 2h sáng tăng. Lời khuyên: đọc tín hiệu, đừng uống trà sữa rồi tỏ tình — sugar rush không phải love.', ['Lãng mạn', 'Hồi hộp', 'Thả thính']),
      R('Tháng Cày Cuốc', 'Tháng Cày Cuốc — deadline chồng deadline, nhưng output đẹp. Portfolio, điểm số, hoặc side project tiến triển. Lời khuyên: sleep 7 tiếng — não mệt thì code và cảm xúc đều bug.', ['Chăm chỉ', 'Áp lực', 'Thành quả']),
      R('Tháng Social Butterfly', 'Tháng Social Butterfly — lịch full cuối tuần, sinh nhật liên tục, Bùi Viện gọi tên. Năng lượng xã giao max. Lời khuyên: chọn 2/5 lời mời — quality > quantity, tránh social hangover.', ['Vui vẻ', 'Đông bạn', 'Quẩy']),
      R('Tháng Plot Twist', 'Tháng Plot Twist — universe chuẩn bị cú lật bạn không đoán trước. Có thể tốt, có thể drama — stay flexible. Lời khuyên: backup plan cho mọi thứ, đặc biệt là pin điện thoại và lòng tin.', ['Bất ngờ', 'Linh hoạt', 'Thích nghi']),
    ]),
  },
  {
    title: 'Grab Giao Hàng: Bạn Là "Thánh Tip" Hay "Săn Voucher Đến Cùng"?',
    description: 'Giải mã DNA order đồ ăn của Gen Z Sài Gòn — từ OTP fail đến đánh giá 5 sao có tâm. Bạn thuộc hệ nào khi bụng đói mà ví mỏng? (Không phán xét, chỉ vui!)',
    category: 'Delivery',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Order GrabFood 80k, shipper giao đúng giờ dù mưa — bạn sẽ?',
        'Tip thêm 10-15k, đánh giá 5 sao có comment cảm ơn. (Thánh tip — karma delivery!)',
        'Nhận đồ, đóng cửa — đã trả phí ship trong bill rồi. (Practical — budget mode!)',
      ),
      q(
        'App báo voucher 30% nhưng chỉ áp dụng quán xa 5km, quán gần không có — bạn?',
        'Order quán xa, chờ 50 phút, tiết kiệm 25k. (Voucher hunter — time is cheap!)',
        'Order quán gần full giá, ăn trong 15 phút. (Hangry priority — speed > savings!)',
      ),
      q(
        'Grab OTP không về, shipper gọi 3 lần, bạn đang meeting — bạn?',
        'Xin phép ra ngoài 2 phút lấy đồ, apologize shipper. (Human decency — respect gig workers!)',
        'Nhắn shipper "để đồ cửa", cancel nếu quá lâu. (Efficiency — meeting > mì gói!)',
      ),
      q(
        'Đồ ăn tới sai món — bạn order nhầm, không phải shipper — bạn?',
        'Ăn luôn, không complain — lesson learned. (Acceptance — không drama!)',
        'Chat support, xin đổi hoặc refund — quyền lợi consumer. (Know your rights!)',
      ),
      q(
        'Cuối tháng còn 100k, đói, bạn chọn combo nào?',
        'Mì gói + trứng + rau — 25k, survive 3 bữa. (Survival economist — student life!)',
        'Order một bữa ngon 90k, ngày mai chịu. (One good meal — mental health tax!)',
      ),
    ]),
    results: buildResults([
      R('Thánh Tip 5 Sao', 'Thánh Tip — bạn hiểu shipper vất vả, tip và comment là investment vào karma. Đồ ăn luôn nóng, shipper nhớ mặt bạn. Lời khuyên: tip khi có thể, nhưng đừng pressure bản thân khi ví cháy.', ['Tử tế', 'Biết ơn', 'Có tâm']),
      R('Voucher Hunter Pro', 'Voucher Hunter — bạn biết app nào sale giờ nào, stack mã như pro. Bạn bè nhờ bạn order hộ. Lời khuyên: đừng để tiết kiệm 20k mà chờ 1 tiếng khi đói muốn xỉu.', ['Tiết kiệm', 'Thông minh', 'Kiên nhẫn']),
      R('Hangry Speed Runner', 'Hangry Speed Runner — thời gian từ order đến miệng phải < 20 phút. Giá full không sao, bụng không đợi được. Lời khuyên: meal prep Chủ Nhật giảm bill và stress.', ['Vội vàng', 'Thực tế', 'Đói meo']),
      R('OTP Survivor', 'OTP Survivor — bạn đã trải qua mọi bug app delivery, vẫn sống sót. Patience và chat support skill max. Lời khuyên: lưu số shipper khi OTP fail — cứu cánh thật.', ['Bền bỉ', 'Problem solver', 'Điềm tĩnh']),
      R('Budget Gourmet', 'Budget Gourmet — ví mỏng nhưng vẫn muốn ăn ngon, bạn master combo giá rẻ chất lượng. Lời khuyên: share bill với bạn — social + savings.', ['Sáng tạo', 'Tiết kiệm', 'Ăn uống']),
      R('Complaint Warrior', 'Complaint Warrior — sai là phải nói, refund là quyền. Không toxic, chỉ assertive. Lời khuyên: chọn battle — món 5k sai không cần war 30 phút.', ['Quyền lợi', 'Thẳng thắn', 'Rõ ràng']),
      R('Comfort Orderer', 'Comfort Orderer — đồ ăn quen mỗi tuần, không thử mới, an toàn là số 1. Lời khuyên: thử một món mới mỗi tháng — palate cũng cần adventure.', ['Ổn định', 'An toàn', 'Quen thuộc']),
      R('Midnight Snacker', 'Midnight Snacker — order chủ yếu 10h-2h đêm, guilt nhưng ngon. Lời khuyên: protein snack trước 10h giảm craving — sức khỏe > mì gói 1h sáng.', ['Đêm khuya', 'Guilty pleasure', 'Sống một lần']),
    ]),
  },
  {
    title: 'Nhan Sắc "Tầm" Hay "Vô Tri": Test Độ Slay Khi Gặp Crush Ở Quận 1',
    description: 'Không phải bóc phốt ngoại hình — test vibe, confidence và cách bạn xử khi crush xuất hiện đột ngột. Ai cũng từng tóc bết gặp người thích — bạn thuộc type nào?',
    category: 'Lookalike',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Gặp crush đột ngột ở Starbucks Quận 1, bạn đang mặc đồ ngủ, tóc bết — bạn?',
        'Chào tự nhiên, joke "hôm nay em style grunge" — confidence fake it till you make it. (Main character — messy but cute!)',
        'Cúi đầu đi nhanh, nhắn sau "hôm nay em xấu quá không dám chào". (Shy disaster — relatable!)',
      ),
      q(
        'Crush đăng story đi concert, bạn không được mời — bạn reaction?',
        'Like story, comment "hay quá, lần sau rủ em nha" — casual. (Secure energy — no jealousy show!)',
        'Mute story, overthink 2 tiếng tại sao không rủ. (Overthinker — inner war!)',
      ),
      q(
        'Bạn được khen "ảnh này đẹp" trên Instagram — ảnh bạn filter 40%, góc chụp 30 lần.',
        'Rep "cảm ơn nhiều 🥺" — nhận compliment gracefully. (Accept love — you deserve it!)',
        'Rep "ảnh này filter thôi, người thật xấu hơn" — self deprecate. (Deflect compliment — stop it!)',
      ),
      q(
        'Hẹn crush lần đầu cafe, bạn chuẩn bị outfit bao lâu?',
        '30 phút — outfit đẹp nhưng không quá effort. (Balanced — cool without trying too hard!)',
        '2 tiếng + hỏi 5 người chọn đồ — anxiety fashion show. (Overprepared — but valid!)',
      ),
      q(
        'Crush nói "em type người tự nhiên" — bạn hiểu là?',
        'Ít makeup, vibe chill, không fake. (Natural beauty — less is more!)',
        'Vẫn makeup nhẹ nhưng không nói — natural enhanced. (Strategic natural — smart!)',
      ),
    ]),
    results: buildResults([
      R('Slay Tự Nhiên', 'Slay Tự Nhiên — confidence là makeup tốt nhất. Gặp crush tóc bết vẫn slay vì energy. Lời khuyên: giữ vibe này — authenticity attractive hơn filter.', ['Tự tin', 'Tự nhiên', 'Hút người']),
      R('Overthink Beauty', 'Overthink Beauty — bạn đẹp nhưng não không tin. Compliment vào là deflect. Lời khuyên: practice nhận "cảm ơn" thay vì self roast.', ['Khiêm tốn', 'Lo lắng', 'Chân thật']),
      R('Filter Master', 'Filter Master — bạn biết góc và app, feed đẹp. Không fake hoàn toàn — chỉ highlight. Lời khuyên: đôi khi post no-filter story — courage hot.', ['Sống ảo', 'Sáng tạo', 'Aesthetic']),
      R('Secure Icon', 'Secure Icon — crush với ai cũng không collapse self worth. Like story không mean desperation. Lời khuyên: giữ boundary — bạn đã đủ.', ['Vững vàng', 'Mature', 'Độc lập']),
      R('Shy Cute', 'Shy Cute — gặp crush đỏ mặt nhưng đáng yêu. Crush có thể thấy sweet. Lời khuyên: một câu chào đủ — đừng chạy mất.', ['Dễ thương', 'Nhút nhát', 'Chân thành']),
      R('Effort Queen/King', 'Effort Queen/King — chuẩn bị kỹ vì coi trọng người đối diện. Không vanity — là respect. Lời khuyên: đừng burnout chuẩn bị — bạn đủ đẹp từ đầu.', ['Chu đáo', 'Coi trọng', 'Tỉ mỉ']),
      R('Messy Hot', 'Messy Hot — grunge accidental, vibe vẫn work. Bạn bè envy vì "sao mày xấu xấu mà cute". Lời khuyên: đừng over-fix khi đã có magic.', ['Phóng khoáng', 'Vui tính', 'Không cầu kỳ']),
      R('Glow Up Arc', 'Glow Up Arc — đang trong journey tự tin, mỗi tháng better. Lời khuyên: so sánh với yesterday you, không với influencer.', ['Đang tiến bộ', 'Hy vọng', 'Kiên trì']),
    ]),
  },
  {
    title: 'MBTI Gen Z: Cuối Tuần Bạn Là "Party Animal" Hay "Cocoon Mode"?',
    description: 'Không cần làm 100 câu — 5 tình huống cuối tuần Sài Gòn đủ reveal bạn recharge kiểu introvert hay extrovert. Kết quả 8 type vibe (không phải MBTI chính thức!).',
    category: 'MBTI',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Thứ Sáu 6pm, bạn vừa tan làm — group chat rủ "đi Bùi Viện tối nay", bạn?',
        'Đồng ý ngay — tuần này cần quẩy, social battery full. (Party animal — Friday is sacred!)',
        'Từ chối nhẹ, về nhà Netflix + trà sữa — recharge solo. (Cocoon mode — introvert rights!)',
      ),
      q(
        'Cuối tuần một mình, không plan — bạn thường làm gì?',
        'Gọi bạn đi cafe hoặc phượt spontaneous. (Extrovert energy — alone is boring!)',
        'Ở nhà, game/đọc sách/nấu ăn — quality me time. (Introvert paradise — peace!)',
      ),
      q(
        'Party đông người, bạn không quen ai — bạn sẽ?',
        'Làm quen ngay, trở thành center của vũ trụ. (Social butterfly — new friends unlocked!)',
        'Dính sát bạn thân một người cả đêm. (Safety buddy — one is enough!)',
      ),
      q(
        'Sáng Chủ Nhật, bạn được chọn — bạn pick?',
        'Brunch Quận 1 với squad, chụp ảnh, story. (Social Sunday — content + friends!)',
        'Ngủ đến 11h, order đồ ăn, không ra cửa. (Lazy Sunday — recovery mode!)',
      ),
      q(
        'Thứ Hai tới, bạn muốn cuối tuần vừa rồi feel như thế nào?',
        'Mệt nhưng vui, full kỷ niệm để kể. (Extrovert hangover — worth it!)',
        'Refresh, sẵn sàng tuần mới, không drained. (Introvert recharge — balanced!)',
      ),
    ]),
    results: buildResults([
      R('Party Animal Thứ Sáu', 'Party Animal — cuối tuần không quẩy là tuần thất bại. Bùi Viện, karaoke, rooftop — bạn cần người và nhạc. Thứ Hai hơi mệt nhưng không hối. Lời khuyên: hydrate và sleep — party sustainable cần self care.', ['Quẩy', 'Hướng ngoại', 'Năng lượng cao']),
      R('Cocoon Mode Master', 'Cocoon Master — nhà là sanctuary, blanket là best friend. Social invite = maybe next time. Lời khuyên: một outing nhỏ mỗi tháng giữ friendship — đừng biến mất hoàn toàn.', ['Introvert', 'Yên tĩnh', 'Tự recharge']),
      R('Ambivert Flex', 'Ambivert Flex — tuần này quẩy, tuần sau ở nhà, không pattern cố định. Bạn confuse cả bạn bè. Lời khuyên: communicate energy level — "tuần này em off nha" cứu relationship.', ['Linh hoạt', 'Khó đoán', 'Cân bằng']),
      R('Social Butterfly Lite', 'Social Butterfly Lite — thích người nhưng không cần party lớn. Cafe 3 người là perfect. Lời khuyên: quality over quantity — đúng squad > đông đảo.', ['Thân thiện', 'Vừa phải', 'Chọn lọc']),
      R('Planned Introvert', 'Planned Introvert — ra ngoài nhưng book trước, biết giờ về. Không spontaneous. Lời khuyên: cho phép một spontaneous mỗi quý — surprise có thể vui.', ['Có kế hoạch', 'An toàn', 'Kiểm soát']),
      R('FOMO Fighter', 'FOMO Fighter — muốn ở nhà nhưng sợ miss out, đi rồi mệt. Internal conflict classic. Lời khuyên: chọn 1/3 invite — FOMO giảm, energy tăng.', ['FOMO', 'Mệt mỏi', 'Đang học']),
      R('Adventure Seeker', 'Adventure Seeker — cuối tuần = phượt, thử quán mới, explore SG. Alone hoặc với bạn đều ok. Lời khuyên: budget cho adventure — ví cũng cần recharge.', ['Phiêu lưu', 'Tò mò', 'Năng động']),
      R('Recovery Specialist', 'Recovery Specialist — cuốn tuần cày, cuối tuần chỉ recovery. Không guilt. Lời khuyên: recovery là productive — đừng let hustle shame bạn.', ['Nghỉ ngơi', 'Chữa lành', 'Thông minh']),
    ]),
  },
  {
    title: 'Tính Cách "Trà Xanh" Hay "Thẳng Thắn": Bạn Thuộc Hệ Nào Ở Sài Gòn?',
    description: 'Trà xanh (passive-aggressive sweet) vs thẳng thắn (no filter) — Gen Z Sài Gòn ai cũng từng bị gán label. Test xem bạn manipulate nhẹ hay nói thẳng như filter Instagram. (Vui, không toxic!)',
    category: 'Personality',
    quiz_type: 'binary_5q',
    questions: buildQuestions([
      q(
        'Bạn thân mặc áo xấu hỏi "đẹp không?" — bạn thật sự thấy không hợp.',
        'Khen "màu hay đó" rồi gợi ý style khác nhẹ nhàng. (Trà xanh soft — kindness with tact!)',
        'Nói thẳng "hơi không hợp, thử cái kia xem" — honesty is love. (Straight shooter — real friend!)',
      ),
      q(
        'Crush đăng ảnh với người khác, bạn buồn — bạn sẽ?',
        'Story nhạc buồn, không tag, để crush tự hiểu. (Trà xanh passive — subtle signal!)',
        'Nhắn riêng "em hơi buồn khi thấy" — direct communication. (Mature honest — green flag!)',
      ),
      q(
        'Đồng nghiệp chiếm credit công việc của bạn trước sếp — bạn?',
        'Im lặng lần này, ghi nhớ, tránh hợp tác lần sau. (Strategic silence — pick battles!)',
        'Nói trước sếp "phần này em làm" — assertive professional. (Boundary at work — respect!)',
      ),
      q(
        'Group order trà sữa, bạn muốn ít đường nhưng ngại nói — bạn?',
        'Nhờ bạn order hộ với note — indirect win. (Trà xanh practical — avoid conflict!)',
        'Nói to "cho em ít đường 30%" — clear is kind. (Direct order — no misunderstanding!)',
      ),
      q(
        'Bạn thân flake kèo lần 5 — bạn reaction?',
        'Rep "ok không sao" nhưng distance dần. (Trà xanh fade — actions > words!)',
        'Nói thẳng "em thất vọng, lần sau confirm trước nha". (Honest friendship — repair chance!)',
      ),
    ]),
    results: buildResults([
      R('Trà Xanh Cao Cấp', 'Trà Xanh Cao Cấp — sweet bên ngoài, strategic bên trong. Không toxic, chỉ khéo léo. Bạn bè tin vì soft, đối thủ underestimate. Lời khuyên: đừng suppress quá — bạn cũng cần nói need thật.', ['Khéo léo', 'Dịu dàng', 'Chiến thuật']),
      R('Thẳng Thắn Không Filter', 'Thẳng Thắn — nói như nghĩ, không drama passive. Một số người shock, bạn thân appreciate. Lời khuyên: timing matters — truth với kindness vẫn thẳng được.', ['Thật thà', 'Mạnh mẽ', 'Rõ ràng']),
      R('Balanced Communicator', 'Balanced — biết khi soft khi direct. Emotional intelligence cao. Lời khuyên: giữ skill — rare và valuable.', ['Cân bằng', 'EQ cao', 'Linh hoạt']),
      R('Passive Peacekeeper', 'Passive Peacekeeper — né conflict đến cùng, hòa bình > đúng sai. Lời khuyên: một lần nói thẳng sẽ giải phóng — bạn xứng đáng được nghe.', ['Hòa bình', 'Né tránh', 'Nhẹ nhàng']),
      R('Assertive Pro', 'Assertive Pro — biết claim credit và boundary không aggressive. Lời khuyên: mentor người passive — leadership natural.', ['Tự tin', 'Chuyên nghiệp', 'Có nguyên tắc']),
      R('Subtle Signal Master', 'Subtle Signal — story, like, timing là ngôn ngữ. Crush decode khó. Lời khuyên: một tin nhắn rõ hơn 10 story mơ hồ.', ['Tinh tế', 'Gián tiếp', 'Romantic']),
      R('Honest Bruiser', 'Honest Bruiser — thật nhưng hơi brutal. Không ác ý, chỉ không sugarcoat. Lời khuyên: thêm "em nói vì quan tâm" — same truth, softer landing.', ['Thẳng', 'Không filter', 'Quan tâm']),
      R('Strategic Fade', 'Strategic Fade — không confrontation, chỉ distance. Energy preservation. Lời khuyên: đôi khi một conversation salvage friendship.', ['Im lặng', 'Chọn lọc', 'Tự bảo vệ']),
    ]),
  },
];
