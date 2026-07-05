/**
 * Seed personality/MBTI-style quizzes (GitHub topics: personality-test, mbti).
 * Run: node scripts/dev/seed_github_style_quizzes.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';
import { BINARY_5Q_SCORES } from '../../shared/quizPrompts.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const DEFAULT_COVER = '/images/default_cover.png';

function buildQuestions(items) {
  return items.map((q, i) => {
    const [score_a, score_b] = BINARY_5Q_SCORES[i];
    return { order_number: i + 1, ...q, score_a, score_b };
  });
}

function buildResults(levels) {
  return levels.map((r, i) => ({
    result_code: i,
    title: r.title,
    type_name: r.title,
    description: r.description,
    traits: r.traits || [],
    image_url: DEFAULT_COVER,
  }));
}

const QUIZZES = [
  {
    title: 'Test MBTI Sài Gòn: Pin Xã Hội Còn Bao Nhiêu %?',
    description: 'GitHub MBTI topic kiểu E/I — cuối tuần ở Thảo Điền hay ở nhà recharge, bạn thuộc team nào?',
    category: 'MBTI',
    questions: buildQuestions([
      {
        question_text: 'Cuối tuần bạn được rủ đi rooftop Thảo Điền, phản ứng đầu tiên?',
        option_a: 'Ok luôn, book bàn trước cho chắc.',
        option_b: 'Giả bệnh, bật chế độ im lặng Zalo.',
      },
      {
        question_text: 'Grab tài xế hỏi chuyện suốt đường, bạn...',
        option_a: 'Trả lời vui vẻ, kể luôn chuyện hôm qua.',
        option_b: 'Đeo tai nghe, gật gật cho qua.',
      },
      {
        question_text: 'Tan làm ở Quận 1, bạn thường...',
        option_a: 'Rủ đồng nghiệp đi cafe kể drama.',
        option_b: 'Lặn về nhà, không ai biết mình sống.',
      },
      {
        question_text: 'Story Instagram của bạn kiểu gì?',
        option_a: 'Tag bạn bè, check-in liên tục.',
        option_b: 'Chỉ repost meme, không lộ mặt.',
      },
      {
        question_text: 'Đi chợ Bến Thành với người quen, bạn...',
        option_a: 'Vừa đi vừa livestream cho vui.',
        option_b: 'Đi nhanh, mua xong biến.',
      },
    ]),
    results: buildResults([
      { title: 'INTJ Hermit Mode', description: 'Pin xã hội 5%. Ở nhà với quạt và trà đá là đủ hạnh phúc. Ai rủ đi chơi, bạn rep "ok" rồi không thấy đâu — classic GitHub introvert repo energy.' },
      { title: 'INFP Góc Tối', description: 'Thích người nhưng sợ người. Lên kế hoạch đi chơi xong hối hận ngay. Giống mấy project MBTI trên GitHub: commit message đầy cảm xúc, merge request thì im lặng.' },
      { title: 'ISTJ Lịch Trình', description: 'Cuối tuần có lịch… ở nhà dọn phòng. Xã hội với bạn là deadline, không phải party. Ổn định, predecitable — như unit test pass 100%.' },
      { title: 'ISFJ Caretaker', description: 'Không thích ồn ào nhưng luôn rep tin nhắn cho bạn bè. Năng lượng vừa đủ: đi chơi được nhưng về sớm. Kiểu "soft launch" extrovert.' },
      { title: 'ISTP Cool Cat', description: 'Im lặng nhưng không nhút nhát — chỉ chọn lọc nơi nào đáng tốn pin. Đi chơi thì chill, không drama. MBTI meme: "I go out once a quarter."' },
      { title: 'ENFP Chaos Lite', description: 'Bắt đầu tuần như introvert, cuối tuần biến thành MC tiệc. Năng lượng bất ổn nhưng dễ thương. GitHub star count tăng vì personality, không phải code.' },
      { title: 'ENTP Social Hacker', description: 'Đi đâu cũng quen mặt một đám. Thích tranh luận ở quán cà phê hơn là ngồi im. E/I với bạn là… tùy mood và có ai trả tiền không.' },
      { title: 'ESTP Party Main', description: 'Pin xã hội 200%. Không có kế hoạch vẫn ra đường được. Thảo Điền cuối tuần không có bạn thì thiếu vibe — đúng nghĩa extrovert open-source maintainer.' },
    ]),
  },
  {
    title: 'S/N Thực Chiến: Bạn Sống Kiểu Thực Tế Hay Mơ Mộng?',
    description: 'Lấy cảm hứng từ MBTI Sensing/Intuition — bạn nhìn đời bằng ví tiền hay bằng timeline tương lai?',
    category: 'MBTI',
    questions: buildQuestions([
      {
        question_text: 'Thấy quán trà sữa decor đẹp trên TikTok, bạn...',
        option_a: 'Check giá, review, rồi mới quyết.',
        option_b: 'Book ngay — vibe trước, ví sau.',
      },
      {
        question_text: 'Bạn bè kể kế hoạch startup "sẽ rich năm sau", bạn...',
        option_a: 'Hỏi luôn: doanh thu đâu, chi phí bao nhiêu?',
        option_b: 'Vision hay đấy, brainstorm thêm ý tưởng.',
      },
      {
        question_text: 'Mưa ngập Quận 7, bạn nghĩ đầu tiên...',
        option_a: 'Đường nào đi được, Grab surge bao nhiêu.',
        option_b: 'Cảnh này đăng story aesthetic được không.',
      },
      {
        question_text: 'Mua đồ online, bạn tin...',
        option_a: 'Spec, size chart, ảnh thật người mặc.',
        option_b: 'Cảm giác "hợp vibe" là đủ.',
      },
      {
        question_text: 'Cuối tháng hết tiền, bạn...',
        option_a: 'Excel chi tiêu, cắt subscription.',
        option_b: 'Manifest abundance, tin tháng sau khá hơn.',
      },
    ]),
    results: buildResults([
      { title: 'ISTJ Fact Checker', description: 'S thuần 100%. Bạn tin số liệu, không tin horoscope startup. GitHub MBTI repo kiểu bạn: README đầy benchmark, không có "coming soon".' },
      { title: 'ISFJ Grounded', description: 'Thực tế nhưng có trái tim. Lo cho người khác bằng hành động cụ thể — nhắc mang áo mưa, không phải gửi quote.' },
      { title: 'ESTJ Operator', description: 'S + J năng lượng: mọi thứ phải có quy trình. Đi chợ cũng có checklist. Personality test trên GitHub mà thiếu bạn thì thiếu phần "project manager".' },
      { title: 'ESFJ Local Guide', description: 'Biết quán nào ngon, đường nào tránh kẹt. Sensing kiểu "tôi sống Sài Gòn thật", không phải Google Maps tourist.' },
      { title: 'ISTP Fixer', description: 'Nhìn vấn đề, sửa ngay. Không mơ mộng — tay làm chân làm. MBTI meme: "It works on my machine" và thật sự work.' },
      { title: 'INTJ Strategist', description: 'Bắt đầu N nhưng vẫn có framework. Mơ lớn nhưng có roadmap. Giống repo MBTI có 2k star: architecture document 40 trang.' },
      { title: 'ENFP Idea Factory', description: 'N dominant: một ý tưởng mỗi giờ. Thực tế hơi… flexible. GitHub personality-test topic yêu kiểu bạn — creative, chaotic good.' },
      { title: 'ENTP Vision Hacker', description: 'Thấy trend trước người khác nửa năm. S/N với bạn nghiêng N mạnh: "What if we…" là câu mở đầu mọi cuộc trò chuyện.' },
    ]),
  },
  {
    title: 'Love Language Kiểu Việt: Bạn Thương Bằng Gì?',
    description: 'Cảm hứng từ personality-test repos (love language, attachment) — tình yêu Sài Gòn nói bằng Grab, quà, hay im lặng?',
    category: 'Personality',
    questions: buildQuestions([
      {
        question_text: 'Người yêu stress deadline, bạn làm gì đầu tiên?',
        option_a: 'Order GrabFood món họ thích, giao surprise.',
        option_b: 'Ngồi nghe họ than, không chen lời.',
      },
      {
        question_text: 'Kỷ niệm ngày quen, bạn chọn...',
        option_a: 'Quà handmade hoặc thư viết tay.',
        option_b: 'Đi chơi chỗ mới, tạo kỷ niệm chung.',
      },
      {
        question_text: 'Cách bạn thể hiện quan tâm thường ngày?',
        option_a: 'Nhắn "ăn cơm chưa", gửi meme nội bộ.',
        option_b: 'Làm giúp việc — sửa máy, chở đi, lo giùm.',
      },
      {
        question_text: 'Cãi nhau xong, bạn muốn...',
        option_a: 'Ôm một cái, nói thẳng đã hiểu nhau chưa.',
        option_b: 'Im lặng cho qua, mai nói lại cũng được.',
      },
      {
        question_text: 'Valentine ở Sài Gòn, ideal date của bạn?',
        option_a: 'Quán rooftop view đẹp, chụp ảnh couple.',
        option_b: 'Ăn bánh mì vỉa hè, về sớm coi phim.',
      },
    ]),
    results: buildResults([
      { title: 'Acts of Service', description: 'Yêu là lo hộ — sửa wifi, chở Grab, nhắc uống nước. Lời nói bạn hơi… tiết kiệm, nhưng hành động thì full commit.' },
      { title: 'Quality Time Lite', description: 'Không cần hoành tráng, chỉ cần ngồi cạnh không lướt điện thoại. Love language trending trên GitHub: "presence over presents".' },
      { title: 'Words of Affirmation', description: 'Compliment cho bạn như oxygen. Không được khen là mood down cả ngày. Personality repo kiểu bạn: README đầy badge "you matter".' },
      { title: 'Gift Giver Soft', description: 'Quà nhỏ thường xuyên — trà sữa, sticker, voucher Grab. Không cần đắt, cần đúng gu. Sài Gòn love language thực dụng.' },
      { title: 'Physical Touch Warm', description: 'Handhold, ôm, pat đầu — body language nói thay lời. Hơi clingy nhưng chân thành. Attachment style: secure-ish.' },
      { title: 'Mixed Signals Cute', description: 'Hôm nay tặng quà, mai im lặng, mốt lại meme. Khó đoán nhưng không toxic — chỉ là… creative. GitHub issue: "works as intended".' },
      { title: 'Grand Gesture', description: 'Yêu kiểu show — flashmob mini, surprise party, post story tag người yêu. Main character energy trong personality-test topic.' },
      { title: 'Chaos Romance', description: 'Love language của bạn là drama có kiểm soát: cãi → makeup → quà → lặp lại. MBTI meme ENFP in relationship — star repo energy.' },
    ]),
  },
  {
    title: 'Attachment Style Sài Gòn: Bạn Dính Hay Chill?',
    description: 'Trend attachment style từ personality-test GitHub — anxious, avoidant, secure kiểu Gen Z Việt.',
    category: 'Personality',
    questions: buildQuestions([
      {
        question_text: 'Crush seen Zalo 2 tiếng chưa rep, bạn...',
        option_a: 'Đoán 50 kịch bản, nhưng không nhắn thêm.',
        option_b: 'Gửi "?" rồi story passive-aggressive.',
      },
      {
        question_text: 'Người yêu muốn "cần không gian riêng", bạn...',
        option_a: 'Ok, mình cũng cần — chill luôn.',
        option_b: 'Panic mode: mình làm gì sai?',
      },
      {
        question_text: 'Trong friend group, bạn thường là...',
        option_a: 'Người giữ kết nối, nhắc họp mặt định kỳ.',
        option_b: 'Người biến mất rồi xuất hiện như không có gì.',
      },
      {
        question_text: 'Tin nhắn "đi ngủ đi" lúc 2h sáng, bạn hiểu...',
        option_a: 'Quan tâm thật, rep "ngủ ngon".',
        option_b: 'Đang đuổi mình — overthink 30 phút.',
      },
      {
        question_text: 'Sau chia tay, bạn...',
        option_a: 'Block sạch, focus bản thân, next.',
        option_b: 'Stalk story, hỏi bạn chung, soft relaunch.',
      },
    ]),
    results: buildResults([
      { title: 'Secure Chill', description: 'Attachment style hiếm: tin được người khác và tin được bản thân. Không dính, không trốn — balance như yoga ở Thảo Điền.' },
      { title: 'Secure Soft', description: 'Hơi lo nhưng biết dừng. Rep tin nhắn nhanh nhưng không spam. GitHub personality-test: green CI, stable release.' },
      { title: 'Anxious Lite', description: 'Cần reassurance thỉnh thoảng. Seen mà chưa rep thì hơi khó chịu, nhưng chưa tới mức gửi 20 tin. Relatable content.' },
      { title: 'Anxious Classic', description: '"Bạn còn yêu mình không?" energy. Overthink là hobby. Personality repo star vì mọi người thấy mình trong kết quả này.' },
      { title: 'Avoidant Warm', description: 'Sợ dính nhưng vẫn muốn gần. Push-pull kiểu Sài Gòn: nóng ngoài, lạnh trong inbox. MBTI meme: "I need space" nhưng miss you.' },
      { title: 'Avoidant Ice', description: 'Cảm xúc sâu nhưng không show. Ghosting không phải toxic — chỉ là… recharge. GitHub issue closed: "not a bug, feature".' },
      { title: 'Fearful Mixed', description: 'Muốn gần sợ bị từ chối, muốn xa sợ cô đơn. Chaotic attachment nhưng self-aware. Đọc nhiều personality-test repo.' },
      { title: 'Chaos Attached', description: 'Dính + trốn xen kẽ trong cùng một ngày. Drama queen/king nhưng biết mình drama. ENTJ in relationship meme energy.' },
    ]),
  },
];

async function main() {
  const { createQuiz, insertQuestions, insertResults } = await import('../../api/_lib/quizDb.js');

  console.log(`\n📝 Seeding ${QUIZZES.length} GitHub-style quizzes...\n`);
  const created = [];

  for (const payload of QUIZZES) {
    const existing = await import('../../api/_lib/turso.js').then(({ getTurso }) =>
      getTurso().execute({ sql: 'SELECT id FROM quizzes WHERE title = ? LIMIT 1', args: [payload.title] }),
    );
    if (existing.rows.length) {
      console.log(`⏭️  Skip (exists): ${payload.title}`);
      created.push({ id: existing.rows[0].id, title: payload.title });
      continue;
    }

    const quiz = await createQuiz({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quiz_type: 'binary_5q',
      image_url: DEFAULT_COVER,
    });
    await insertQuestions(quiz.id, payload.questions);
    await insertResults(quiz.id, payload.results);
    console.log(`✅ ${payload.title}`);
    console.log(`   → /quiz/${quiz.id}`);
    created.push({ id: quiz.id, title: payload.title });
  }

  console.log('\n🎉 Done:', created.length, 'quiz(es)\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
