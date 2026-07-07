import { Link } from 'react-router-dom';
import './LegalPages.css';

const EditorialPolicy = () => (
  <div className="legal-page-container">
    <div className="legal-content glass-card">
      <h1>Chính sách nội dung &amp; AI</h1>
      <p className="last-updated">Minh bạch về cách nambac.xyz tạo trắc nghiệm</p>

      <section>
        <h2>1. Mục đích nội dung</h2>
        <p>
          nambac.xyz cung cấp <strong>trắc nghiệm tính cách mang tính giải trí</strong> cho Gen Z Việt Nam.
          Kết quả nhằm khám phá bản thân một cách vui vẻ — <strong>không phải</strong> chẩn đoán y khoa, tâm lý lâm sàng hay tư vấn pháp lý.
        </p>
      </section>

      <section>
        <h2>2. Quy trình sáng tạo</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li><strong>Văn bản:</strong> AI (Google Gemini / OpenRouter) tạo câu hỏi &amp; kết quả theo prompt chuyên biệt từng chủ đề</li>
          <li><strong>Hình ảnh:</strong> AI tạo minh hoạ cover + 8 kết quả; phong cách đồng bộ theo từng quiz</li>
          <li><strong>Kiểm duyệt:</strong> Admin rà soát trước khi xuất bản; quiz lỗi được sửa hoặc ẩn</li>
          <li><strong>Cập nhật:</strong> Quiz mới được thêm thường xuyên (cron hàng ngày + biên tập thủ công)</li>
        </ul>
      </section>

      <section>
        <h2>3. Quảng cáo &amp; độc lập biên tập</h2>
        <p>
          Chúng tôi có thể hiển thị quảng cáo Google AdSense. <strong>Quảng cáo không ảnh hưởng</strong> đến thuật toán chấm điểm hay kết quả trắc nghiệm của bạn.
          Hợp tác thương hiệu (quiz sponsored) sẽ được ghi rõ khi áp dụng.
        </p>
      </section>

      <section>
        <h2>4. Bản quyền</h2>
        <p>
          Văn bản, hình ảnh và thiết kế quiz trên nambac.xyz thuộc quyền sở hữu của nambac.xyz trừ khi ghi chú khác.
          Không sao chép thương mại hoặc tái xuất bản mà không có phép.
        </p>
      </section>

      <section>
        <h2>5. Báo cáo nội dung</h2>
        <p>
          Nếu bạn thấy nội dung không phù hợp, vi phạm hoặc gây hiểu lầm — email{' '}
          <a href="mailto:contact@nambac.xyz" style={{ color: '#FF2D85' }}>contact@nambac.xyz</a>.
        </p>
      </section>

      <section>
        <h2>Liên kết</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <li><Link to="/about" style={{ color: '#FF2D85' }}>Giới thiệu</Link></li>
          <li><Link to="/terms-of-service" style={{ color: '#FF2D85' }}>Điều khoản dịch vụ</Link></li>
          <li><Link to="/privacy-policy" style={{ color: '#FF2D85' }}>Chính sách bảo mật</Link></li>
        </ul>
      </section>

      <button type="button" className="legal-back-btn" onClick={() => window.history.back()}>
        ← Quay lại
      </button>
    </div>
  </div>
);

export default EditorialPolicy;
