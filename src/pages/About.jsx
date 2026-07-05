import React from 'react';
import './LegalPages.css';

const About = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>Giới thiệu về nambac.xyz</h1>
                <p className="last-updated">Nền tảng trắc nghiệm tính cách AI hàng đầu Việt Nam</p>

                <section>
                    <h2>🎯 Sứ mệnh của chúng tôi</h2>
                    <p>
                        <strong>nambac.xyz</strong> là nền tảng giải trí sáng tạo dành cho thế hệ trẻ Việt Nam. Chúng tôi kết hợp sức mạnh của trí tuệ nhân tạo (AI) tiên tiến với tâm lý học hiện đại để tạo ra những bài trắc nghiệm tính cách thú vị, độc đáo và đầy bất ngờ.
                    </p>
                    <p>
                        Mục tiêu của chúng tôi là giúp mỗi người hiểu rõ hơn về bản thân mình thông qua những trải nghiệm tương tác vui nhộn và có ý nghĩa. Mỗi bài trắc nghiệm được thiết kế cẩn thận để mang lại những phút giây giải trí đồng thời khám phá những khía cạnh thú vị trong tính cách của bạn.
                    </p>
                </section>

                <section>
                    <h2>🤖 Công nghệ AI đằng sau mỗi bài trắc nghiệm</h2>
                    <p>
                        Điều khiến nambac.xyz khác biệt so với các nền tảng trắc nghiệm truyền thống là việc sử dụng <strong>AI (Trí tuệ nhân tạo)</strong> trong toàn bộ quy trình sáng tạo nội dung. Hệ thống AI của chúng tôi:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>✅ <strong>Tạo câu hỏi thông minh</strong> — Mỗi câu hỏi được thiết kế để phân tích nhiều chiều tính cách của bạn</li>
                        <li>✅ <strong>Phân tích kết quả cá nhân hóa</strong> — Kết quả không chỉ là nhãn mà là phân tích chi tiết về xu hướng tính cách</li>
                        <li>✅ <strong>Tạo hình ảnh minh họa độc đáo</strong> — Mỗi kết quả đi kèm với hình ảnh minh họa được AI tạo riêng</li>
                        <li>✅ <strong>Cập nhật nội dung liên tục</strong> — Các bài trắc nghiệm mới được thêm thường xuyên với đề tài đa dạng</li>
                    </ul>
                </section>

                <section>
                    <h2>📊 Các loại trắc nghiệm trên nambac.xyz</h2>
                    <p>
                        Chúng tôi cung cấp đa dạng các loại trắc nghiệm phản ánh nhiều khía cạnh khác nhau trong cuộc sống:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>🧠 <strong>MBTI & Tính cách</strong> — Khám phá kiểu tính cách MBTI của bạn qua các tình huống thực tế</li>
                        <li>❤️ <strong>Tình yêu & Mối quan hệ</strong> — Tìm hiểu phong cách yêu đương và mối quan hệ lý tưởng</li>
                        <li>🍜 <strong>Ẩm thực & Lối sống</strong> — Khám phá khẩu vị ẩm thực và phong cách sống của bạn</li>
                        <li>💼 <strong>Nghề nghiệp & Tài chính</strong> — Tìm hiểu xu hướng nghề nghiệp phù hợp với tính cách</li>
                        <li>🎮 <strong>Giải trí & Văn hóa đại chúng</strong> — Các bài trắc nghiệm vui nhộn về sở thích giải trí</li>
                        <li>🏙️ <strong>Cuộc sống tại Việt Nam</strong> — Trắc nghiệm đặc biệt dành cho giới trẻ Việt Nam</li>
                    </ul>
                </section>

                <section>
                    <h2>🔒 Cam kết bảo mật & An toàn</h2>
                    <p>
                        Chúng tôi cam kết bảo vệ quyền riêng tư của người dùng. nambac.xyz <strong>không yêu cầu đăng ký tài khoản</strong> và không thu thập thông tin cá nhân nhạy cảm. Kết quả trắc nghiệm chỉ được lưu trữ để bạn có thể chia sẻ với bạn bè và không bao giờ được sử dụng cho mục đích thương mại.
                    </p>
                    <p>
                        Để biết thêm chi tiết, vui lòng đọc <a href="/privacy-policy" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Chính sách bảo mật</a> và <a href="/terms-of-service" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Điều khoản dịch vụ</a> của chúng tôi.
                    </p>
                </section>

                <section>
                    <h2>💡 Cách sử dụng nambac.xyz</h2>
                    <ol style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li><strong>Chọn bài trắc nghiệm</strong> — Duyệt qua danh sách các bài trắc nghiệm trên trang chủ</li>
                        <li><strong>Trả lời 5 câu hỏi</strong> — Mỗi câu hỏi có 2 lựa chọn, hãy chọn đáp án phản ánh bạn nhất</li>
                        <li><strong>Xem kết quả</strong> — Nhận phân tích tính cách chi tiết với hình ảnh minh họa</li>
                        <li><strong>Chia sẻ với bạn bè</strong> — Gửi kết quả qua Zalo, Facebook hoặc các mạng xã hội khác</li>
                    </ol>
                </section>

                <section>
                    <h2>🇻🇳 Về đội ngũ phát triển</h2>
                    <p>
                        nambac.xyz được phát triển bởi một nhóm kỹ sư và nhà sáng tạo nội dung đặt trụ sở tại <strong>Thành phố Hồ Chí Minh, Việt Nam</strong>. Chúng tôi hiểu sâu sắc văn hóa và sở thích của giới trẻ Việt Nam, từ đó tạo ra những nội dung phù hợp và gần gũi nhất.
                    </p>
                    <p>
                        Nền tảng này được xây dựng với công nghệ hiện đại nhất bao gồm React, Turso (LibSQL), Google Gemini AI và OpenRouter để đảm bảo trải nghiệm người dùng mượt mà và nội dung chất lượng cao.
                    </p>
                </section>

                <section>
                    <h2>📬 Liên hệ với chúng tôi</h2>
                    <p>
                        Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp của bạn! Nếu bạn có câu hỏi, đề xuất ý tưởng trắc nghiệm mới, hoặc muốn hợp tác, hãy liên hệ:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>📧 Email: <strong>contact@nambac.xyz</strong></li>
                        <li>🌐 Website: <strong>nambac.xyz</strong></li>
                    </ul>
                </section>

                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    ← Quay lại
                </button>
            </div>
        </div>
    );
};

export default About;
