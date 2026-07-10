/**
 * UI copy for Liên Quân hub — source of truth also in ui-text-vi.txt
 * (Vietnamese labels for local Gen Z / AOG vibe)
 */
export const LQ_UI = {
  drawerLabel: 'Cẩm Nang Liên Quân',
  searchPlaceholder: 'Tìm tướng của bạn...',
  searchLabel: 'Tìm tướng của bạn',
  lanePick: 'Chọn Đường',

  tabCounterTier: 'Khắc Chế & Tier',
  tabGiaoAn: 'Giáo Án Pro',
  tabKhoe: 'Khoe Chiến Tích',
  tabTuDien: 'Từ Điển Game',

  shareLink: 'Sao chép link chia sẻ',
  shareToast: 'Đã sao chép link!',

  glossaryTitle: 'Từ Điển Liên Quân',
  glossarySub: 'Trang bị · ngọc · thuật ngữ meta (tham khảo)',
  glossarySearch: 'Tìm tên item hoặc thuật ngữ…',
  hubGiaoAnTitle: 'Giáo án nổi bật',

  counterTitle: 'Tướng Khắc Chế:',
  tipTitle: 'Mẹo Đối Đầu:',
  matchLabel: 'Trận đấu:',
  buildLabel: 'Bộ Trang Bị & Ngọc:',
  copyButton: 'Sao chép Giáo Án',
  copyToast: 'Đã sao chép vào bộ nhớ tạm!',

  bannerTitle: 'Bạn có thực sự hiểu rõ về Liên Quân Mobile?',
  bannerBody:
    '10 câu Thông Thạo — nhận mark từ Đồng đến Thông Thạo 7 trên nambac.xyz!',
  bannerCta: 'Thử Thách Ngay',
  bannerExploreNote: 'Bản trên Explore là 5 câu thử — làm đủ 10 câu tại hub.',

  hubTitle: 'Cẩm Nang Liên Quân',
  hubSub: 'Khắc chế · Giáo án pro · Meta AOG',

  khoeSub: 'Đăng MVP · clip TikTok · thả 🔥 — khoe là content.',
  khoeUploadCta: '+ Đăng chiến tích',
  khoeUploadClose: 'Đóng form',
  khoeLoginHint: 'Đăng nhập Google để đăng bài — khoe clip rank lên feed.',
  khoeCaptionPlaceholder: 'Hôm nay Flo quadra hard carry lane đối phương… 🔥',
  khoeEmptyHint: 'Chưa có bài mới? Bạn là người đầu tiên khoe MVP hôm nay!',

  quizIntro: '10 câu · Meta + cơ bản · Mark Đồng → Thông Thạo 7',
  quizResultMemes: {
    0: 'Rank Đồng cũng được — vào copy giáo án pro là kéo nhanh hơn đọc wiki.',
    1: 'Thông Thạo 1 rồi! Biết AOG là gì — bạn đã hơn nửa lobby VN 😂',
    2: 'Thông Thạo 3 — đọc map khá. Giờ thử khoe ở Góc Khoe xem.',
    3: 'Thông Thạo 5 — ranker có tâm. Counter pick bạn đã ngon.',
    4: 'Thông Thạo 6 — gần pro rồi. SGP Bang sẽ gật đầu (trong tưởng tượng).',
    5: 'Thông Thạo 6+ — cơ bản pro. Một bước nữa thôi!',
    6: 'Thông Thạo 6++ — mark gần max. Thi lại 1 lần nữa là 7.',
    7: 'Thông Thạo 7! Mark vàng đã gắn — khoe ngay Góc Khoe, đừng giữ trong tim.',
  },

  fbViral: `Anh em ơi! Vừa tìm được trang cẩm nang siêu nhẹ cho Liên Quân.
Vào nambac.xyz/lienquan xem Giáo Án của SGP Bang với Maris, copy một phát là ăn ngay trong trận.
Lại còn có cả bài test 10 câu xem trình độ hiểu biết tướng nữa, vào húp ngay cái danh hiệu Thông Thạo 7 đi kìa! 😂🔥`,
};

/** Meme line after quiz by mastery level 0–7 */
export function quizResultMeme(level) {
  const n = Math.max(0, Math.min(7, Number(level) || 0));
  return LQ_UI.quizResultMemes[n] || LQ_UI.quizResultMemes[0];
}
