import { Link } from 'react-router-dom';
import './LegalPages.css';

const CookiePolicy = () => (
  <div className="legal-page-container">
    <div className="legal-content glass-card">
      <h1>Chính sách Cookie</h1>
      <p className="last-updated">Cập nhật lần cuối: Tháng 7, 2026</p>

      <section>
        <h2>1. Cookie là gì?</h2>
        <p>
          Cookie là các tệp văn bản nhỏ được lưu trên thiết bị của bạn khi truy cập nambac.xyz.
          Chúng giúp trang web ghi nhớ tùy chọn, phân tích lưu lượng và (khi bạn đồng ý) hiển thị quảng cáo phù hợp hơn.
        </p>
      </section>

      <section>
        <h2>2. Cookie chúng tôi sử dụng</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li><strong>Cần thiết:</strong> Duy trì phiên, tùy chọn giao diện, localStorage (ví dụ: đóng banner PWA/push)</li>
          <li><strong>Phân tích:</strong> Google Analytics, Vercel Analytics — thống kê ẩn danh (lượt xem, trang truy cập)</li>
          <li><strong>Quảng cáo:</strong> Google AdSense / DoubleClick — hiển thị quảng cáo, đo hiệu quả (khi bật)</li>
          <li><strong>Tag Manager:</strong> Google Tag Manager — quản lý script phân tích</li>
        </ul>
      </section>

      <section>
        <h2>3. Google AdSense & quảng cáo cá nhân hóa</h2>
        <p>
          Google và đối tác có thể dùng cookie để phân phối quảng cáo dựa trên lượt truy cập trước của bạn trên nambac.xyz hoặc site khác.
        </p>
        <p>
          Tắt quảng cáo cá nhân hóa:{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FF2D85' }}>
            Cài đặt quảng cáo Google
          </a>
          {' '}·{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF2D85' }}>
            aboutads.info
          </a>
        </p>
      </section>

      <section>
        <h2>4. Quản lý cookie</h2>
        <p>Bạn có thể:</p>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li>Xóa cookie trong cài đặt trình duyệt (Chrome, Safari, Firefox…)</li>
          <li>Chặn cookie của bên thứ ba — một số tính năng có thể bị ảnh hưởng</li>
          <li>Từ chối thông báo push trong trình duyệt</li>
        </ul>
      </section>

      <section>
        <h2>5. Thời gian lưu</h2>
        <p>
          Cookie phiên thường hết hạn khi đóng trình duyệt. Cookie phân tích/quảng cáo có thể lưu từ vài ngày đến 24 tháng tùy nhà cung cấp.
        </p>
      </section>

      <section>
        <h2>6. Liên hệ</h2>
        <p>
          Câu hỏi về cookie: <a href="mailto:contact@nambac.xyz" style={{ color: '#FF2D85' }}>contact@nambac.xyz</a>
          {' '}· Xem thêm{' '}
          <Link to="/privacy-policy" style={{ color: '#FF2D85' }}>Chính sách bảo mật</Link>.
        </p>
      </section>

      <button type="button" className="legal-back-btn" onClick={() => window.history.back()}>
        ← Quay lại
      </button>
    </div>
  </div>
);

export default CookiePolicy;
