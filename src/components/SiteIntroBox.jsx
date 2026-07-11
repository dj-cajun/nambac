import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import './SiteIntroBox.css';

const INTRO_FAQ = [
  {
    q: 'nambac.xyz là gì?',
    a: 'Nền tảng trắc nghiệm tính cách AI — 5 câu hỏi, nhanh, vui, dành cho Gen Z Sài Gòn.',
  },
  {
    q: 'Kết quả có chính xác không?',
    a: 'Mục đích giải trí và khám phá bản thân. Không thay thế kiểm tra tâm lý chuyên nghiệp.',
  },
  {
    q: 'Có cần đăng ký không?',
    a: 'Không. Làm quiz và xem kết quả ngay, không cần tài khoản.',
  },
  {
    q: 'Thông tin cá nhân có được bảo mật không?',
    a: 'Không thu thập tên, email hay SĐT. Chỉ dùng cookie cơ bản để cải thiện trải nghiệm.',
  },
  {
    q: 'Có miễn phí không?',
    a: '100% miễn phí. Chúng tôi duy trì qua quảng cáo, không ảnh hưởng trải nghiệm chính.',
  },
  {
    q: 'Làm thế nào để chia sẻ kết quả?',
    a: 'Sau khi hoàn thành, dùng nút chia sẻ ở trang kết quả — Zalo, Facebook hoặc sao chép link.',
  },
];

const INTRO_BUTTONS = [
  { id: 'about', label: 'Giới thiệu' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Liên hệ' },
  { id: 'privacy', label: 'Bảo mật' },
  { id: 'cookie', label: 'Cookie' },
  { id: 'terms', label: 'Điều khoản' },
  { id: 'editorial', label: 'Biên tập' },
];

const INTRO_MODAL_META = {
  about: { title: 'Giới thiệu', more: '/about', moreLabel: 'Xem thêm giới thiệu →' },
  faq: { title: 'Câu hỏi thường gặp', more: '/faq', moreLabel: 'Xem tất cả FAQ →' },
  contact: { title: 'Liên hệ', more: '/contact', moreLabel: 'Trang liên hệ đầy đủ →' },
  privacy: { title: 'Bảo mật', more: '/privacy-policy', moreLabel: 'Chính sách bảo mật →' },
  cookie: { title: 'Cookie & quảng cáo', more: '/cookie-policy', moreLabel: 'Chính sách Cookie →' },
  terms: { title: 'Điều khoản', more: '/terms-of-service', moreLabel: 'Xem điều khoản đầy đủ →' },
  editorial: { title: 'Biên tập', more: '/editorial-policy', moreLabel: 'Chính sách biên tập →' },
  brands: { title: 'Hợp tác thương hiệu', more: '/brands', moreLabel: 'Đăng ký tư vấn →' },
};

function IntroModalBody({ sectionId }) {
  if (sectionId === 'about') {
    return (
      <>
        <p className="site-intro-lead">
          nambac.xyz — trắc nghiệm tính cách AI cho Gen Z Sài Gòn.
        </p>
        <ul className="site-intro-list">
          <li>Chỉ 5 câu hỏi — hoàn thành trong 1–2 phút</li>
          <li>AI phân tích kết quả &amp; tạo hình minh hoạ riêng</li>
          <li>MBTI, tình yêu, ẩm thực, nghề nghiệp và nhiều chủ đề khác</li>
          <li>Chia sẻ kết quả qua Zalo, Facebook dễ dàng</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'faq') {
    return (
      <div className="site-intro-faq-list">
        {INTRO_FAQ.map((item) => (
          <article key={item.q} className="site-intro-faq-item">
            <h4 className="site-intro-faq-q">{item.q}</h4>
            <p className="site-intro-faq-a">{item.a}</p>
          </article>
        ))}
      </div>
    );
  }

  if (sectionId === 'privacy') {
    return (
      <ul className="site-intro-list">
        <li>Không yêu cầu đăng ký — không thu thập tên, email, SĐT</li>
        <li>Chỉ thu thập dữ liệu kỹ thuật ẩn danh (IP, trình duyệt, trang truy cập)</li>
        <li>Cookie cơ bản + phân tích (Google Analytics, Vercel Analytics)</li>
        <li>Quảng cáo qua Google AdSense — có thể tắt cá nhân hoá trong cài đặt Google</li>
        <li>Thông báo push (tuỳ chọn) — chỉ khi bạn bấm &quot;Bật&quot;</li>
        <li>Kết quả quiz dùng để chia sẻ — không bán cho bên thứ ba</li>
      </ul>
    );
  }

  if (sectionId === 'contact') {
    return (
      <>
        <p className="site-intro-lead">
          Góp ý, báo lỗi hoặc hợp tác — chúng tôi phản hồi trong 24–48 giờ.
        </p>
        <ul className="site-intro-list">
          <li>📧 <strong>contact@nambac.xyz</strong></li>
          <li>Báo lỗi quiz / hình ảnh / kết quả</li>
          <li>Đề xuất chủ đề trắc nghiệm mới</li>
          <li>Hợp tác thương hiệu → mục Brands</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'cookie') {
    return (
      <ul className="site-intro-list">
        <li>Cookie cần thiết: phiên, tùy chọn UI, đóng banner</li>
        <li>Phân tích: Google Analytics, Vercel Analytics (ẩn danh)</li>
        <li>Quảng cáo: Google AdSense / DoubleClick (khi bật)</li>
        <li>Tắt quảng cáo cá nhân hoá: google.com/settings/ads</li>
        <li>Xóa cookie bất cứ lúc nào trong cài đặt trình duyệt</li>
      </ul>
    );
  }

  if (sectionId === 'terms') {
    return (
      <>
        <p className="site-intro-lead">
          Sử dụng nambac.xyz đồng nghĩa bạn chấp nhận các điều khoản dưới đây.
        </p>
        <ul className="site-intro-list">
          <li>Dịch vụ trắc nghiệm miễn phí, mục đích giải trí</li>
          <li>Không cần đăng ký tài khoản để sử dụng</li>
          <li>Kết quả AI mang tính tham khảo — không phải tư vấn y khoa hay pháp lý</li>
          <li>Nội dung, hình ảnh thuộc nambac.xyz — không sao chép thương mại</li>
          <li>Chúng tôi có thể cập nhật điều khoản; tiếp tục dùng = đồng ý</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'editorial') {
    return (
      <>
        <p className="site-intro-lead">
          Nội dung quiz được biên tập cho Gen Z Việt Nam — giải trí, rõ ràng, không gây hiểu lầm.
        </p>
        <ul className="site-intro-list">
          <li>Ưu tiên tiếng Việt tự nhiên, meme &amp; văn hoá đời thường</li>
          <li>Quảng cáo không ảnh hưởng thuật toán chấm điểm</li>
          <li>Báo cáo nội dung: contact@nambac.xyz</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'brands') {
    return (
      <>
        <p className="site-intro-lead">
          Tạo chiến dịch quiz AI viral — tiếp cận Gen Z Sài Gòn qua nambac.xyz.
        </p>
        <ul className="site-intro-list">
          <li>Quiz thương hiệu tuỳ chỉnh — AI tạo câu hỏi &amp; hình minh hoạ</li>
          <li>100K+ lượt chơi tự nhiên, lan truyền Zalo &amp; Facebook</li>
          <li>Báo cáo hiệu quả chiến dịch realtime</li>
          <li>Gói ngân sách linh hoạt — tư vấn miễn phí</li>
        </ul>
      </>
    );
  }

  return null;
}

export default function SiteIntroBox() {
  const [introModal, setIntroModal] = useState(null);
  const introPanelRef = useRef(null);
  const introBodyRef = useRef(null);

  useEffect(() => {
    if (!introModal) return;
    if (introBodyRef.current) introBodyRef.current.scrollTop = 0;
    requestAnimationFrame(() => {
      introPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [introModal]);

  const openIntroSection = (sectionId) => {
    setIntroModal((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <div className="site-intro-box">
      <h3 className="site-intro-box-title">nambac.xyz</h3>
      <p className="site-intro-box-desc">Trắc nghiệm AI · 5 câu · share Zalo liền</p>
      <div className="site-intro-btns" role="group" aria-label="Thông tin nambac">
        {INTRO_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className={`site-intro-btn${introModal === btn.id ? ' active' : ''}`}
            aria-expanded={introModal === btn.id}
            onClick={() => openIntroSection(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <Link to="/blog" className="site-intro-btn site-intro-btn-wide site-intro-btn-link">
        Insights 📰
      </Link>
      {introModal && (
        <div
          ref={introPanelRef}
          className="site-intro-panel"
          role="region"
          aria-label={INTRO_MODAL_META[introModal].title}
        >
          <div className="site-intro-panel-header">
            <h4 className="site-intro-panel-title">{INTRO_MODAL_META[introModal].title}</h4>
            <button
              type="button"
              className="site-intro-panel-close"
              onClick={() => setIntroModal(null)}
              aria-label="Đóng"
            >
              <X size={18} strokeWidth={2.25} />
            </button>
          </div>
          <div ref={introBodyRef} className="site-intro-panel-body">
            <IntroModalBody sectionId={introModal} />
            <Link to={INTRO_MODAL_META[introModal].more} className="site-intro-more">
              {INTRO_MODAL_META[introModal].moreLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
