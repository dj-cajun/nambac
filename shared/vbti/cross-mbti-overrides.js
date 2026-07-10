/**
 * Hand-crafted VBTI × MBTI copy — 10 popular types × 4 MBTI anchors.
 * Keys: `${vbtiCode}:${mbtiType}`
 */
export const CROSS_MBTI_OVERRIDES = {
  'CTRL:ENFP': 'CTRL lập Google Sheet chia tiền, ENFP thì kéo cả nhóm đi chơi bằng hype — combo planner + mood maker. Group chat không bao giờ lạc trôi.',
  'CTRL:INTJ': 'CTRL chốt lịch Grab, INTJ phân tích route tối ưu — hơi cold nhưng hiệu quả đáng sợ. Ai trễ 5 phút là bị nhắc trong sheet.',
  'CTRL:ESTJ': 'Hai thánh kỷ luật gặp nhau: CTRL chia việc, ESTJ đảm bảo ai cũng làm đúng deadline. Họp nhóm chạy như sprint planning.',
  'CTRL:ISFP': 'CTRL muốn mọi thứ có kế hoạch, ISFP thì vibe tự do — drama nhẹ nhưng cuối cùng vẫn đi chơi được vì CTRL đã book Grab.',

  'BOSS:ENFP': 'BOSS chốt quán chốt giờ, ENFP làm không khí sôi động — đi chơi không cần vote, chỉ cần BOSS nói "đi thôi".',
  'BOSS:INTJ': 'BOSS ra lệnh, INTJ tính toán chi phí và rủi ro — combo CEO trong group chat. Ai phản đối phải có slide.',
  'BOSS:ESTJ': 'Trùm cuối gặp người điều hành — kế hoạch chặt, không ai được trễ. Đi chơi mà như đi làm.',
  'BOSS:ISFP': 'BOSS muốn lead, ISFP muốn chill — hơi căng nhưng ISFP vẫn follow vì BOSS đã chốt quán ngon.',

  'JOKE-R:ENFP': 'Meme lord + người truyền cảm hứng = group chat không bao giờ chết. Sticker spam là ngôn ngữ chính.',
  'JOKE-R:INTJ': 'JOKE-R đùa, INTJ phân tích joke có logic không — awkward nhưng content vàng. Thread dài vì tranh luận meme.',
  'JOKE-R:ESTJ': 'JOKE-R troll, ESTJ nhắc "đừng off-topic" — drama vui như sitcom văn phòng Gen Z.',
  'JOKE-R:ISFP': 'Hài hước gặp nghệ sĩ phiêu lưu — vibe chill, meme nhẹ, không toxic. Đúng kiểu bạn thân quán cf.',

  'OJBK:ENFP': 'OJBK "ăn gì cũng được" thật lòng, ENFP gợi ý 10 quán — cuối cùng vẫn đi quán ENFP chọn vì OJBK không care.',
  'OJBK:INTJ': 'Zen mode gặp kiến trúc sư — INTJ chọn quán có data, OJBK ok luôn. Ít drama nhất trong 432 combo.',
  'OJBK:ESTJ': 'OJBK không tranh, ESTJ chốt menu — ai cũng được ăn, không ai phải quyết định.',
  'OJBK:ISFP': 'Hai vibe tự do — đi đâu cũng được, miễn có trà đá. Friendship low maintenance.',

  'ATM-er:ENFP': 'ATM-er chuyển khoản trà sữa, ENFP kéo thêm 5 người — ví mỏng nhưng vibe full. Cảnh báo: ví có hạn.',
  'ATM-er:INTJ': 'ATM-er trả tiền, INTJ tính lại ai nợ bao nhiêu — spreadsheet tình bạn. Chính xác đến từng đồng.',
  'ATM-er:ESTJ': 'Ngân hàng di động gặp kế toán — chia bill không bao giờ sai. Ai quên trả là bị nhắc lịch sự.',
  'ATM-er:ISFP': 'ATM-er chi cho vibe, ISFP mang aesthetic — đi chơi đẹp nhưng ví ATM-er khóc thầm.',

  'GOGO:ENFP': 'Hai thánh "đi liền" — Grab chưa tới đã ở ngoài đường. FOMO là superpower.',
  'GOGO:INTJ': 'GOGO muốn action, INTJ cần plan 5 phút — hơi clash nhưng vẫn đi được vì GOGO không chờ.',
  'GOGO:ESTJ': 'Đi nhanh + làm đúng giờ — combo du lịch speedrun. Itinerary full mà vẫn kịp 3 quán.',
  'GOGO:ISFP': 'GOGO kéo đi, ISFP chụp ảnh đẹp — content trip hoàn hảo. Story IG đầy ảnh.',

  'OH-NO:ENFP': 'OH-NO sốc kết quả, ENFP an ủi bằng meme — trauma healing qua sticker. Vẫn tag bạn thân.',
  'OH-NO:INTJ': 'OH-NO tự hỏi bấm sai, INTJ phân tích từng câu — overthink squared. Thread dài 200 tin.',
  'OH-NO:ESTJ': 'OH-NO panic, ESTJ bảo "làm lại test cho chắc" — productivity trong khủng hoảng.',
  'OH-NO:ISFP': 'Shock gặp chill — ISFP bảo "type nào cũng cute" — OH-NO hơi bình tĩnh lại.',

  'MUM:ENFP': 'Mẹ đường + năng lượng social — nhắc uống nước và kéo đi chơi cùng lúc. Group chat có người chăm sóc.',
  'MUM:INTJ': 'MUM lo sức khỏe, INTJ lo efficiency — combo parent friend mode. Lịch ngủ được optimize.',
  'MUM:ESTJ': 'Hai thánh nhắc deadline — nộp bài, uống nước, đừng nhắn ex. Strict love.',
  'MUM:ISFP': 'MUM ấm áp, ISFP nhẹ nhàng — friendship safe space. Đúng kiểu bạn quán cf hay gặp.',

  'FAKE:ENFP': 'Nhiều lớp mặt nạ gặp người truyền cảm hứng — ai cũng thấy FAKE vui, chỉ 2h sáng mới biết mệt.',
  'FAKE:INTJ': 'FAKE đeo mask, INTJ muốn biết bản chất thật — psychological thriller trong group chat.',
  'FAKE:ESTJ': 'FAKE hòa đồng ngoài, ESTJ muốn authenticity — tension nhưng growth potential.',
  'FAKE:ISFP': 'Hai vibe sensitive — FAKE giấu, ISFP cảm nhận được. Friendship sâu hoặc im lặng.',

  'DRUNK:ENFP': 'Nhánh ẩn kích hoạt + party energy — group chat lúc 2h sáng full sticker và voice note không rõ nội dung.',
  'DRUNK:INTJ': 'DRUNK vs logic — INTJ phân tích tại sao bạn chọn câu bia rượu. Content vàng, regret vàng.',
  'DRUNK:ESTJ': 'DRUNK muốn chill, ESTJ nhắc "mai có deadline" — mom friend và party animal trong một người.',
  'DRUNK:ISFP': 'Cồn + vibe nghệ — đêm đó story đẹp, sáng hôm sau không nhớ caption.',
};

export const CROSS_MBTI_TYPES = ['ENFP', 'INTJ', 'ESTJ', 'ISFP'];
export const CROSS_VBTI_POPULAR = [
  'CTRL', 'BOSS', 'JOKE-R', 'OJBK', 'ATM-er', 'GOGO', 'OH-NO', 'MUM', 'FAKE', 'DRUNK',
];
