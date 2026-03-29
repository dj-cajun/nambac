import React from 'react';
import './LegalPages.css';

const About = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>About nambac.xyz</h1>
                <p className="last-updated">Chào mừng bạn đến với Nambac!</p>

                <section>
                    <h2>Mission (Sứ mệnh)</h2>
                    <p>
                        nambac.xyz là nền tảng giải trí sáng tạo dành cho Gen Z Việt Nam. Chúng tôi kết hợp sức mạnh của AI để tạo ra những bài trắc nghiệm tính cách thú vị, độc đáo và đầy bất ngờ.
                    </p>
                    <p>
                        nambac.xyz is a creative entertainment platform designed for Vietnamese Gen Z. We combine the power of AI to create fun, unique, and surprising personality quizzes.
                    </p>
                </section>

                <section>
                    <h2>What we offer (Chúng tôi cung cấp gì)</h2>
                    <p>
                        Từ những bài kiểm tra MBTI cho đến những thử thách vui nhộn về lối sống, nambac.xyz mang đến cho bạn những phút giây thư giãn và khám phá bản thân theo cách hoàn toàn mới.
                    </p>
                </section>

                <section>
                    <h2>Contact (Liên hệ)</h2>
                    <p>
                        Mọi thắc mắc hoặc hợp tác, vui lòng liên hệ: <strong>contact@nambac.xyz</strong>
                    </p>
                </section>

                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    Close (Đóng)
                </button>
            </div>
        </div>
    );
};

export default About;
