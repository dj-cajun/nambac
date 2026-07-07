import { Link } from 'react-router-dom';
import './LegalPages.css';

const Contact = () => (
  <div className="legal-page-container">
    <div className="legal-content glass-card">
      <h1>Liên hệ với nambac.xyz</h1>
      <p className="last-updated">Chúng tôi luôn sẵn sàng lắng nghe bạn</p>

      <section>
        <h2>📧 Email</h2>
        <p>
          Gửi email đến{' '}
          <a href="mailto:contact@nambac.xyz" style={{ color: '#FF2D85', fontWeight: 700 }}>
            contact@nambac.xyz
          </a>
        </p>
        <p>Thời gian phản hồi: thường trong <strong>24–48 giờ</strong> (ngày làm việc).</p>
      </section>

      <section>
        <h2>Bạn có thể liên hệ khi</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li>Báo lỗi trang web hoặc kết quả quiz không hiển thị đúng</li>
          <li>Đề xuất chủ đề trắc nghiệm mới</li>
          <li>Hỏi về quyền riêng tư, cookie hoặc quảng cáo</li>
          <li>Yêu cầu gỡ nội dung hoặc chỉnh sửa thông tin</li>
        </ul>
      </section>

      <section>
        <h2>🎯 Hợp tác thương hiệu</h2>
        <p>
          Doanh nghiệp muốn tạo chiến dịch quiz AI viral — vui lòng dùng{' '}
          <Link to="/brands" style={{ color: '#FF2D85', fontWeight: 700 }}>trang hợp tác thương hiệu</Link>
          {' '}hoặc ghi rõ &quot;Brand partnership&quot; trong tiêu đề email.
        </p>
      </section>

      <section>
        <h2>🌐 Thông tin website</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li>Website: <a href="https://nambac.xyz" style={{ color: '#FF2D85' }}>nambac.xyz</a></li>
          <li>Loại hình: Nền tảng trắc nghiệm tính cách AI — giải trí</li>
          <li>Khu vực phục vụ: Gen Z Việt Nam (ưu tiên Sài Gòn / TP.HCM)</li>
        </ul>
      </section>

      <section>
        <h2>Liên kết hữu ích</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li><Link to="/faq" style={{ color: '#FF2D85' }}>Câu hỏi thường gặp (FAQ)</Link></li>
          <li><Link to="/privacy-policy" style={{ color: '#FF2D85' }}>Chính sách bảo mật</Link></li>
          <li><Link to="/cookie-policy" style={{ color: '#FF2D85' }}>Chính sách Cookie</Link></li>
          <li><Link to="/terms-of-service" style={{ color: '#FF2D85' }}>Điều khoản dịch vụ</Link></li>
        </ul>
      </section>

      <button type="button" className="legal-back-btn" onClick={() => window.history.back()}>
        ← Quay lại
      </button>
    </div>
  </div>
);

export default Contact;
