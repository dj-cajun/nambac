import { useState } from 'react';
import './LegalPages.css';

const faqData = [
    {
        question: "nambac.xyz là gì?",
        answer: "nambac.xyz là nền tảng trắc nghiệm tính cách trực tuyến sử dụng công nghệ trí tuệ nhân tạo (AI). Chúng tôi cung cấp các bài trắc nghiệm vui nhộn và có ý nghĩa giúp bạn khám phá tính cách, sở thích và xu hướng của bản thân thông qua 5 câu hỏi được thiết kế thông minh."
    },
    {
        question: "Kết quả trắc nghiệm có chính xác không?",
        answer: "Các bài trắc nghiệm trên nambac.xyz được thiết kế với mục đích giải trí và khám phá bản thân. Câu hỏi được AI tạo ra dựa trên các nguyên tắc tâm lý học cơ bản, nhưng không thay thế được các bài kiểm tra tâm lý chuyên nghiệp. Kết quả phản ánh xu hướng tính cách của bạn theo cách vui nhộn và thú vị."
    },
    {
        question: "Tôi có cần đăng ký tài khoản không?",
        answer: "Không! Bạn hoàn toàn có thể làm trắc nghiệm và xem kết quả mà không cần đăng ký tài khoản hay đăng nhập. nambac.xyz được thiết kế để bạn có thể sử dụng ngay lập tức mà không gặp bất kỳ rào cản nào."
    },
    {
        question: "Thông tin cá nhân của tôi có được bảo mật không?",
        answer: "Chúng tôi rất coi trọng quyền riêng tư của bạn. nambac.xyz không thu thập tên, email, số điện thoại hay bất kỳ thông tin cá nhân nhạy cảm nào của bạn. Chúng tôi chỉ sử dụng cookie cơ bản để cải thiện trải nghiệm người dùng. Để biết thêm chi tiết, vui lòng đọc Chính sách bảo mật của chúng tôi."
    },
    {
        question: "Làm thế nào để chia sẻ kết quả với bạn bè?",
        answer: "Sau khi hoàn thành bài trắc nghiệm và nhận kết quả, bạn sẽ thấy các nút chia sẻ ở cuối trang kết quả. Bạn có thể chia sẻ trực tiếp qua Zalo, Facebook, hoặc sao chép liên kết để gửi qua bất kỳ ứng dụng nhắn tin nào. Khi bạn bè nhấn vào liên kết, họ sẽ được dẫn đến bài trắc nghiệm để thử sức."
    },
    {
        question: "AI được sử dụng như thế nào trong các bài trắc nghiệm?",
        answer: "Chúng tôi sử dụng Google Gemini AI — một trong những hệ thống AI tiên tiến nhất thế giới — để tạo câu hỏi, phân tích câu trả lời, tạo mô tả kết quả chi tiết, và thiết kế hình ảnh minh họa cho mỗi loại tính cách. Điều này giúp mỗi bài trắc nghiệm có nội dung độc đáo và chất lượng cao."
    },
    {
        question: "nambac.xyz có miễn phí không?",
        answer: "Hoàn toàn miễn phí! Tất cả các bài trắc nghiệm trên nambac.xyz đều miễn phí 100%. Chúng tôi duy trì hoạt động thông qua quảng cáo được hiển thị trên trang web. Chúng tôi cam kết rằng quảng cáo sẽ không ảnh hưởng đến trải nghiệm của bạn."
    },
    {
        question: "Có những loại trắc nghiệm nào trên nambac.xyz?",
        answer: "Chúng tôi cung cấp đa dạng các loại trắc nghiệm: MBTI & phân tích tính cách, tình yêu & mối quan hệ, ẩm thực & lối sống, nghề nghiệp & tài chính, giải trí & xu hướng, và nhiều chủ đề khác. Các bài trắc nghiệm mới được thêm thường xuyên để luôn mang đến nội dung tươi mới."
    },
    {
        question: "Mỗi bài trắc nghiệm mất bao lâu?",
        answer: "Mỗi bài trắc nghiệm trên nambac.xyz chỉ gồm 5 câu hỏi, vì vậy bạn có thể hoàn thành trong khoảng 1-2 phút. Chúng tôi thiết kế các bài trắc nghiệm ngắn gọn nhưng vẫn đủ chi tiết để đưa ra phân tích tính cách có ý nghĩa."
    },
    {
        question: "Tôi có thể làm lại trắc nghiệm không?",
        answer: "Tất nhiên! Bạn có thể làm lại bất kỳ bài trắc nghiệm nào bao nhiêu lần tùy thích. Đôi khi kết quả có thể khác nhau tùy vào tâm trạng và hoàn cảnh hiện tại của bạn — và điều đó hoàn toàn bình thường."
    },
    {
        question: "nambac.xyz hoạt động trên những thiết bị nào?",
        answer: "nambac.xyz được tối ưu hóa cho cả điện thoại di động và máy tính. Bạn có thể truy cập trên bất kỳ trình duyệt nào (Chrome, Safari, Firefox, v.v.) mà không cần cài đặt ứng dụng. Giao diện được thiết kế đặc biệt thân thiện với điện thoại di động."
    },
    {
        question: "Làm thế nào để liên hệ với nambac.xyz?",
        answer: "Bạn có thể liên hệ với chúng tôi qua email: contact@nambac.xyz. Chúng tôi luôn hoan nghênh mọi ý kiến đóng góp, đề xuất chủ đề trắc nghiệm mới, hoặc yêu cầu hợp tác. Chúng tôi sẽ cố gắng phản hồi trong vòng 24-48 giờ."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>Câu hỏi thường gặp (FAQ)</h1>
                <p className="last-updated">Những thắc mắc phổ biến về nambac.xyz</p>

                <section>
                    <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
                        Dưới đây là những câu hỏi thường gặp từ người dùng nambac.xyz. Nếu bạn không tìm thấy câu trả lời cho thắc mắc của mình, hãy liên hệ với chúng tôi qua email <strong>contact@nambac.xyz</strong>.
                    </p>
                </section>

                {faqData.map((item, index) => (
                    <div key={index} style={{
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                        marginBottom: '4px',
                    }}>
                        <button
                            onClick={() => toggle(index)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '16px 0',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <span style={{
                                fontWeight: '700',
                                fontSize: '15px',
                                color: '#1a1a1a',
                                lineHeight: '1.5',
                            }}>
                                {item.question}
                            </span>
                            <span style={{
                                fontSize: '20px',
                                color: '#FF2D85',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}>
                                +
                            </span>
                        </button>
                        {openIndex === index && (
                            <div style={{
                                padding: '0 0 16px 0',
                                color: '#555',
                                fontSize: '14px',
                                lineHeight: '1.8',
                                animation: 'fadeIn 0.2s ease',
                            }}>
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}

                <section style={{ marginTop: '32px' }}>
                    <h2>📬 Vẫn còn thắc mắc?</h2>
                    <p>
                        Nếu bạn không tìm thấy câu trả lời ở trên, đừng ngần ngại liên hệ với chúng tôi! Gửi email đến <strong>contact@nambac.xyz</strong> và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                    <p>
                        Bạn cũng có thể tham khảo thêm:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li><a href="/about" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Giới thiệu về nambac.xyz</a></li>
                        <li><a href="/contact" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Liên hệ</a></li>
                        <li><a href="/privacy-policy" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Chính sách bảo mật</a></li>
                        <li><a href="/cookie-policy" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Chính sách Cookie</a></li>
                        <li><a href="/editorial-policy" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Chính sách nội dung &amp; AI</a></li>
                        <li><a href="/terms-of-service" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Điều khoản dịch vụ</a></li>
                    </ul>
                </section>

                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    ← Quay lại
                </button>
            </div>
        </div>
    );
};

export default FAQ;
