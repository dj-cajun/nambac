import { listActiveQuizzes } from '../quizDb.js';
import { CANONICAL_SITE_ORIGIN } from '../../../shared/siteOrigin.js';
import { isBot } from './og.js';
import { sendSpaHtml } from '../serveSpaHtml.js';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Static page metadata for SEO.
 * Each key = URL path (without leading slash).
 */
const PAGE_META = {
  '': {
    title: 'nambac.xyz — Trắc nghiệm tính cách AI cho Gen Z Sài Gòn',
    description:
      'nambac.xyz là nền tảng trắc nghiệm tính cách và mini-game giải trí cho Gen Z Việt Nam. Website: https://www.nambac.xyz',
    h1: 'nambac.xyz — Trắc nghiệm tính cách AI cho Gen Z Sài Gòn',
    body: 'nambac.xyz (https://www.nambac.xyz) là website giải trí tiếng Việt: quiz tính cách AI (5 câu), VBTI (trắc nghiệm kiểu Việt), Liên Quân Mobile hub, bói vận mệnh, balance game, roast card. Mục tiêu: chơi nhanh ~90 giây rồi share Zalo. Không phải công ty phụ tùng ô tô Nam Bắc (nambac.vn) hay bất động sản — đây là nền tảng quiz Gen Z tại Sài Gòn.',
  },
  explore: {
    title: 'Khám phá Quiz — nambac.xyz',
    description:
      'Duyệt tất cả trắc nghiệm tính cách AI trên nambac.xyz. MBTI, Personality, Fortune, Survival và nhiều thể loại khác.',
    h1: 'Khám phá tất cả Quiz trên nambac.xyz',
    body: 'Hàng trăm bài trắc nghiệm tính cách AI đang chờ bạn. Từ MBTI, tính cách, tiền kiếp, bói vận mệnh đến trắc nghiệm sinh tồn — tìm quiz phù hợp với bạn ngay!',
  },
  blog: {
    title: 'Blog Insights — nambac.xyz',
    description:
      'Bài viết chuyên sâu về trắc nghiệm tính cách, xu hướng Gen Z, AI trong giải trí và văn hoá meme Sài Gòn.',
    h1: 'Blog & Insights',
    body: 'Đọc những bài viết chuyên sâu về xu hướng Gen Z, ứng dụng AI trong giải trí, văn hoá meme và trắc nghiệm tính cách tại Việt Nam.',
  },
  vbti: {
    title: 'VBTI — Trắc nghiệm tính cách kiểu Việt Nam | nambac.xyz',
    description:
      'VBTI (Vietnamese Behavioral Type Indicator) — bài trắc nghiệm tính cách dành riêng cho người Việt. Khám phá 16 nhóm tính cách Việt!',
    h1: 'VBTI — Trắc nghiệm tính cách kiểu Việt Nam',
    body: 'VBTI là bài trắc nghiệm tính cách được thiết kế dành riêng cho người Việt, lấy cảm hứng từ MBTI nhưng phản ánh văn hoá và tâm lý Việt Nam. Hãy khám phá bạn thuộc nhóm tính cách nào!',
  },
  lienquan: {
    title: 'Liên Quân Mobile Hub — nambac.xyz',
    description:
      'Quiz, giáo án, từ điển tướng Liên Quân Mobile trên nambac.xyz. Tìm tướng phù hợp với phong cách chơi của bạn!',
    h1: 'Liên Quân Mobile Hub',
    body: 'Khám phá thế giới Liên Quân Mobile trên nambac.xyz: quiz tính cách tướng, giáo án chơi, từ điển thuật ngữ và khoe rank cùng bạn bè!',
  },
  fortune: {
    title: 'Bói vận mệnh hôm nay — nambac.xyz',
    description:
      'AI bói vận mệnh hôm nay của bạn theo phong cách Gen Z Sài Gòn. Mỗi ngày một lời tiên tri dí dỏm!',
    h1: 'Bói vận mệnh hôm nay',
    body: 'Mỗi ngày, AI sẽ gửi đến bạn lời tiên tri dí dỏm về vận mệnh hôm nay. Phong cách Gen Z Sài Gòn, vui nhộn và share được ngay!',
  },
  balance: {
    title: 'Balance Game — Bạn chọn gì? | nambac.xyz',
    description:
      'Trò chơi lựa chọn khó xử — bạn sẽ chọn bên nào? Chơi ngay và xem mọi người chọn gì!',
    h1: 'Balance Game — Bạn chọn gì?',
    body: 'Đứng trước hai lựa chọn khó xử, bạn sẽ chọn bên nào? Chơi Balance Game, xem tỉ lệ % mọi người đã chọn và share kết quả lên Zalo!',
  },
  'roast-card': {
    title: 'Roast Card — Thẻ cà khịa bạn bè | nambac.xyz',
    description:
      'Tạo thẻ cà khịa vui nhộn cho bạn bè. AI viết lời roast theo phong cách Gen Z — share Zalo cười rụng rốn!',
    h1: 'Roast Card — Thẻ cà khịa bạn bè',
    body: 'Nhập tên bạn bè và chọn đặc điểm — AI sẽ viết lời cà khịa siêu hài theo phong cách Gen Z. Tạo thẻ roast và share Zalo ngay!',
  },
  brain: {
    title: 'Trong đầu bạn có gì? — nambac.xyz',
    description:
      'AI phân tích xem trong đầu bạn đang nghĩ gì! Kết quả hình ảnh vui nhộn, share Zalo cùng bạn bè.',
    h1: 'Trong đầu bạn có gì?',
    body: 'AI sẽ phân tích và vẽ ra những thứ đang ở trong đầu bạn. Kết quả hình ảnh vui nhộn, chia sẻ Zalo cùng bạn bè ngay!',
  },
  about: {
    title: 'Giới thiệu — nambac.xyz',
    description: 'Tìm hiểu về nambac.xyz — nền tảng trắc nghiệm tính cách AI cho Gen Z Sài Gòn.',
    h1: 'Giới thiệu về nambac.xyz',
    body: 'nambac.xyz là nền tảng trắc nghiệm tính cách AI dành cho Gen Z Sài Gòn. Chúng mình tạo ra những bài quiz vui nhộn, dễ thương và dễ share!',
  },
  faq: {
    title: 'Câu hỏi thường gặp (FAQ) — nambac.xyz',
    description: 'Giải đáp những câu hỏi thường gặp về nambac.xyz và các bài trắc nghiệm AI.',
    h1: 'Câu hỏi thường gặp',
    body: 'Tổng hợp câu hỏi thường gặp về nambac.xyz: cách chơi quiz, chia sẻ kết quả, bảo mật thông tin và nhiều hơn nữa.',
  },
  contact: {
    title: 'Liên hệ — nambac.xyz',
    description: 'Liên hệ đội ngũ nambac.xyz để hợp tác, phản hồi hoặc hỏi đáp.',
    h1: 'Liên hệ với nambac.xyz',
    body: 'Bạn muốn hợp tác, phản hồi hoặc đặt câu hỏi? Liên hệ đội ngũ nambac.xyz ngay.',
  },
  'privacy-policy': {
    title: 'Chính sách bảo mật — nambac.xyz',
    description: 'Chính sách bảo mật của nambac.xyz — cách chúng tôi thu thập và bảo vệ dữ liệu của bạn.',
    h1: 'Chính sách bảo mật',
    body: 'Tìm hiểu cách nambac.xyz thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
  },
  'terms-of-service': {
    title: 'Điều khoản dịch vụ — nambac.xyz',
    description: 'Điều khoản sử dụng dịch vụ nambac.xyz.',
    h1: 'Điều khoản dịch vụ',
    body: 'Các điều khoản và điều kiện khi sử dụng dịch vụ trên nambac.xyz.',
  },
  'cookie-policy': {
    title: 'Chính sách Cookie — nambac.xyz',
    description: 'Chính sách sử dụng cookie của nambac.xyz.',
    h1: 'Chính sách Cookie',
    body: 'Tìm hiểu về cách nambac.xyz sử dụng cookie và các công nghệ theo dõi.',
  },
  'editorial-policy': {
    title: 'Chính sách biên tập — nambac.xyz',
    description: 'Chính sách biên tập nội dung trên nambac.xyz.',
    h1: 'Chính sách biên tập',
    body: 'Quy trình và tiêu chuẩn biên tập nội dung trên nền tảng nambac.xyz.',
  },
  leaderboard: {
    title: 'Bảng xếp hạng — nambac.xyz',
    description: 'Xem bảng xếp hạng người chơi và quiz phổ biến nhất trên nambac.xyz.',
    h1: 'Bảng xếp hạng',
    body: 'Xem ai đang dẫn đầu và quiz nào hot nhất trên nambac.xyz. Cạnh tranh cùng bạn bè ngay!',
  },
  brands: {
    title: 'Hợp tác thương hiệu — nambac.xyz',
    description: 'Giải pháp trắc nghiệm AI cho thương hiệu — tăng tương tác và nhận diện thương hiệu với Gen Z.',
    h1: 'Hợp tác thương hiệu',
    body: 'nambac.xyz cung cấp giải pháp quiz AI tùy chỉnh cho thương hiệu, giúp tăng tương tác và kết nối sâu hơn với Gen Z Việt Nam.',
  },
};

/**
 * Build a fully crawlable HTML page for bots.
 * Includes JSON-LD structured data.
 */
function pageSeoHtml({ title, description, h1, body, url, quizLinks }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'nambac.xyz',
    alternateName: 'Nambac',
    url: CANONICAL_SITE_ORIGIN,
    description: 'Trắc nghiệm tính cách AI cho Gen Z Sài Gòn',
    inLanguage: 'vi',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_SITE_ORIGIN}/explore?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  const quizListHtml = (quizLinks || [])
    .map(
      (q) =>
        `<li><a href="${esc(`${CANONICAL_SITE_ORIGIN}/quiz/${q.id}`)}">${esc(q.title)}</a></li>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(CANONICAL_SITE_ORIGIN)}/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="nambac.xyz">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(CANONICAL_SITE_ORIGIN)}/og-default.png">
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<main>
  <h1>${esc(h1)}</h1>
  <p>${esc(body)}</p>
</main>
<nav aria-label="Điều hướng chính">
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/">Trang chủ</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/explore">Khám phá</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/blog">Blog</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/vbti">VBTI</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/lienquan">Liên Quân</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/fortune">Bói vận mệnh</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/balance">Balance Game</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/about">Giới thiệu</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/faq">FAQ</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/contact">Liên hệ</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/privacy-policy">Bảo mật</a> ·
  <a href="${esc(CANONICAL_SITE_ORIGIN)}/terms-of-service">Điều khoản</a>
</nav>
${quizListHtml ? `<section aria-label="Quiz phổ biến"><h2>Quiz phổ biến</h2><ul>${quizListHtml}</ul></section>` : ''}
</body>
</html>`;
}

/**
 * Serve crawlable static-page HTML to bots, SPA shell to humans.
 * Reached via Vercel rewrite: /<page> → /api/handler?path=page-seo&page=<page>
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ua = req.headers['user-agent'] || '';

  // Humans get the SPA shell
  if (!isBot(ua)) {
    return sendSpaHtml(res);
  }

  const page = req.query?.page || '';
  const meta = PAGE_META[page];

  if (!meta) {
    // Unknown page — serve SPA shell
    return sendSpaHtml(res);
  }

  const url = page
    ? `${CANONICAL_SITE_ORIGIN}/${page}`
    : `${CANONICAL_SITE_ORIGIN}/`;

  // For the homepage and explore page, include quiz links for internal linking
  let quizLinks = [];
  if (page === '' || page === 'explore') {
    try {
      const all = await listActiveQuizzes();
      quizLinks = all.filter((q) => q.id && q.title).slice(0, 20);
    } catch {
      quizLinks = [];
    }
  }

  const html = pageSeoHtml({
    ...meta,
    url,
    quizLinks,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(html);
}

/** Exported for reuse */
export { PAGE_META };
