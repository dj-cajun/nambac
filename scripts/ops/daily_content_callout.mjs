#!/usr/bin/env node

const PLAN_START = process.env.CONTENT_PLAN_START || '2026-07-08';

const plan = [
  ['연애', 'Bạn yêu kiểu nào khi đang giận?', 'Bạn bè nói chuẩn 90%'],
  ['성격', 'Bạn là người mở lời hay né drama?', 'Tag đứa bạn trùng kết quả'],
  ['학교/직장', 'Deadline đến là bạn biến thành ai?', 'Dân văn phòng vào điểm danh'],
  ['연애', 'Red flag lớn nhất của bạn là gì?', 'Nghe đau nhưng thật'],
  ['소비', 'Bạn tiêu tiền theo cảm xúc hay kế hoạch?', 'Cuối tháng ai cũng hiểu'],
  ['친구관계', 'Trong nhóm bạn, bạn là vai nào?', 'Không ai thoát vai này'],
  ['주간특집', 'Tuần này bạn hút ai nhất? (Challenge)', 'So với người yêu ngay'],
  ['연애', 'Bạn yêu nhanh hay yêu chắc?', 'Kết quả làm bạn cãi nhau nhẹ'],
  ['직장', 'Bạn làm việc vì đam mê hay lương?', 'Sự thật dân đi làm'],
  ['밈', 'Nếu là nhân vật meme Việt, bạn là ai?', 'Cười xỉu luôn'],
  ['연애', 'Bạn dễ rung động vì điều gì?', 'Crush đọc là hiểu'],
  ['소비', 'Món đồ bạn luôn mua quá tay là gì?', 'Tự thú thật lòng'],
  ['친구관계', 'Bạn giữ bí mật tốt cỡ nào?', 'Nhóm bạn test liền'],
  ['주간특집', 'Bạn hợp ai nhất tuần này? (Compatibility)', 'Share để ghép cặp'],
  ['연애', 'Khi yêu xa, bạn thuộc team nào?', 'Đọc xong nhớ người cũ'],
  ['성격', 'Bạn là người chữa lành hay gây bão?', 'Kết quả gây tranh luận'],
  ['학교/직장', 'Kiểu nghỉ phép lý do của bạn là gì?', 'Ai cũng từng dùng'],
  ['밈', 'Bạn có tố chất làm content creator không?', 'Kết quả rất gắt'],
  ['연애', 'Bạn đáng yêu nhất khi nào?', 'Người yêu gửi ngay'],
  ['소비', 'Bạn hợp ví tiền nào trong 2026?', 'Lucky money test'],
  ['주간특집', 'Chủ nhật này bạn nên đi đâu?', 'Rủ bạn đi chung'],
  ['연애', 'Bạn ghen theo kiểu công khai hay im lặng?', 'Kết quả chí mạng'],
  ['친구관계', 'Bạn là người kết nối hay tách nhóm?', 'Nhóm chat cần test'],
  ['직장', 'Bạn hợp làm leader hay specialist?', 'Team đi làm vào xem'],
  ['밈', 'Nếu là nhân vật game mobile, bạn hệ gì?', 'Game thủ share mạnh'],
  ['연애', 'Điều khiến bạn bật đèn xanh là gì?', 'Crush đọc để hiểu'],
  ['소비', 'Bạn hợp phong cách sống tối giản hay flex?', 'Gen Z rất thích'],
  ['주간특집', 'Tuần tới vận may của bạn ở đâu?', 'Kết hợp cùng vận may hôm nay'],
  ['성격', 'Bạn nói thẳng hay nói khéo?', 'Công sở tranh luận'],
  ['결산', '30 ngày qua bạn đã biến thành phiên bản nào?', 'Share tổng kết tháng'],
];

function parseDateArg() {
  const arg = process.argv.find((a) => a.startsWith('--date='));
  if (!arg) return null;
  return arg.split('=')[1];
}

function toDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

const targetDate = parseDateArg() || new Date().toISOString().slice(0, 10);
const start = toDate(PLAN_START);
const today = toDate(targetDate);

if (!start || !today) {
  console.error('Invalid date. Use YYYY-MM-DD (example: --date=2026-07-10)');
  process.exit(1);
}

const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
const index = ((diff % plan.length) + plan.length) % plan.length;
const dayNumber = index + 1;
const [category, title, hook] = plan[index];

console.log(`# 오늘 콘텐츠 호출 (${targetDate})`);
console.log('');
console.log(`- Day: ${dayNumber}/30`);
console.log(`- 카테고리: ${category}`);
console.log(`- 퀴즈 제목: ${title}`);
console.log(`- 공유 훅: ${hook}`);
console.log('');
console.log('## 오늘 실행 체크');
console.log('- [ ] 퀴즈 발행');
console.log('- [ ] 운세와 같이 배포');
console.log('- [ ] 인스타/틱톡/커뮤니티 업로드');
console.log('- [ ] UTM 링크 생성');
console.log('- [ ] 밤 10시 성과 기록');
