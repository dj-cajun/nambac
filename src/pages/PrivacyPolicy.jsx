import React from 'react';
import './LegalPages.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>Privacy Policy (Chính sách bảo mật)</h1>
                <p className="last-updated">Last Updated: February 2026</p>

                <section>
                    <h2>1. Introduction (Giới thiệu)</h2>
                    <p>
                        Welcome to <strong>nambac.xyz</strong> ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you visit or use our website.
                    </p>
                    <p>
                        Chào mừng bạn đến với <strong>nambac.xyz</strong>. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn truy cập hoặc sử dụng trang web của chúng tôi.
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect (Thông tin chúng tôi thu thập)</h2>
                    <p>
                        <strong>Usage Data:</strong> We may collect generic information about your visit, such as your IP address, browser type, potential location, and pages visited. This helps us improve our service.
                    </p>
                    <p>
                        <strong>Cookies:</strong> We use cookies to enhance your experience. You can choose to disable cookies through your browser settings.
                    </p>
                    <p>
                        <strong>Dữ liệu sử dụng:</strong> Chúng tôi có thể thu thập thông tin chung về lượt truy cập của bạn, chẳng hạn như địa chỉ IP, loại trình duyệt, vị trí tiềm năng và các trang đã truy cập. Điều này giúp chúng tôi cải thiện dịch vụ của mình.
                    </p>
                    <p>
                        <strong>Cookies:</strong> Chúng tôi sử dụng cookie để nâng cao trải nghiệm của bạn. Bạn có thể chọn tắt cookie thông qua cài đặt trình duyệt của mình.
                    </p>
                </section>

                <section>
                    <h2>3. Third-Party Advertisements (Quảng cáo của bên thứ ba)</h2>
                    <p>
                        We use third-party advertising companies (such as Google AdSense) to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
                    </p>
                    <p>
                        Chúng tôi sử dụng các công ty quảng cáo bên thứ ba (chẳng hạn như Google AdSense) để phân phối quảng cáo khi bạn truy cập trang web của chúng tôi. Các công ty này có thể sử dụng thông tin (không bao gồm tên, địa chỉ, địa chỉ email hoặc số điện thoại của bạn) về các lượt truy cập của bạn vào trang web này và các trang web khác để cung cấp quảng cáo về hàng hóa và dịch vụ mà bạn quan tâm.
                    </p>
                </section>

                <section>
                    <h2>4. Contact Us (Liên hệ)</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <strong>contact@nambac.xyz</strong>
                    </p>
                    <p>
                        Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại: <strong>contact@nambac.xyz</strong>
                    </p>
                </section>
                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    Close (Đóng)
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
