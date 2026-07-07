import './LegalPages.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>Chính sách bảo mật (Privacy Policy)</h1>
                <p className="last-updated">Cập nhật lần cuối: Tháng 7, 2026</p>

                <section>
                    <h2>1. Giới thiệu</h2>
                    <p>
                        Chào mừng bạn đến với <strong>nambac.xyz</strong> ("chúng tôi"). Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, bảo vệ và chia sẻ thông tin khi bạn truy cập hoặc sử dụng trang web nambac.xyz.
                    </p>
                    <p>
                        Bằng cách sử dụng trang web của chúng tôi, bạn đồng ý với các điều khoản của Chính sách bảo mật này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ của chúng tôi.
                    </p>
                </section>

                <section>
                    <h2>2. Thông tin chúng tôi thu thập</h2>
                    <p>
                        <strong>Dữ liệu sử dụng tổng quát:</strong> Chúng tôi tự động thu thập một số thông tin kỹ thuật khi bạn truy cập trang web, bao gồm:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>Địa chỉ IP (được ẩn danh hóa)</li>
                        <li>Loại trình duyệt và thiết bị</li>
                        <li>Hệ điều hành</li>
                        <li>Các trang bạn đã truy cập trên nambac.xyz</li>
                        <li>Thời gian và ngày truy cập</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}>
                        <strong>Cookies:</strong> Chúng tôi sử dụng cookie và các công nghệ theo dõi tương tự để cải thiện trải nghiệm người dùng. Cookie giúp chúng tôi hiểu cách bạn sử dụng trang web và cung cấp nội dung phù hợp hơn. Bạn có thể tắt cookie thông qua cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến một số tính năng.
                    </p>
                    <p>
                        <strong>Thông tin chúng tôi KHÔNG thu thập:</strong> nambac.xyz không yêu cầu và không thu thập tên, địa chỉ email, số điện thoại, hay bất kỳ thông tin cá nhân nhận dạng trực tiếp nào của bạn.
                    </p>
                </section>

                <section>
                    <h2>3. Cách chúng tôi sử dụng thông tin</h2>
                    <p>Thông tin thu thập được sử dụng cho các mục đích sau:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>Cung cấp và duy trì dịch vụ trang web</li>
                        <li>Phân tích lưu lượng truy cập và cải thiện trải nghiệm người dùng</li>
                        <li>Hiển thị quảng cáo phù hợp thông qua Google AdSense</li>
                        <li>Phát hiện và ngăn ngừa các hoạt động gian lận hoặc lạm dụng</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Quảng cáo của bên thứ ba (Google AdSense)</h2>
                    <p>
                        Chúng tôi sử dụng <strong>Google AdSense</strong> để hiển thị quảng cáo trên trang web. Google và các đối tác quảng cáo có thể sử dụng cookie để phân phối quảng cáo dựa trên các lượt truy cập trước đó của bạn vào trang web này hoặc các trang web khác.
                    </p>
                    <p>
                        Google sử dụng cookie quảng cáo (bao gồm cookie DoubleClick) để hiển thị quảng cáo phù hợp. Bạn có thể chọn không sử dụng quảng cáo cá nhân hóa bằng cách truy cập <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Cài đặt quảng cáo Google</a>.
                    </p>
                </section>

                <section>
                    <h2>5. Google Analytics, Tag Manager & Vercel Analytics</h2>
                    <p>
                        Chúng tôi sử dụng Google Analytics, Google Tag Manager và Vercel Analytics để phân tích lưu lượng truy cập và hành vi người dùng trên trang web. Các công cụ này thu thập dữ liệu ẩn danh giúp chúng tôi hiểu rõ hơn cách người dùng tương tác với nội dung, từ đó cải thiện dịch vụ.
                    </p>
                    <p>
                        Chi tiết cookie: xem <a href="/cookie-policy" style={{ color: '#FF2D85', textDecoration: 'underline' }}>Chính sách Cookie</a>.
                    </p>
                </section>

                <section>
                    <h2>6. Thông báo đẩy (Web Push) — tuỳ chọn</h2>
                    <p>
                        Nếu bạn chọn bật thông báo, trình duyệt sẽ lưu subscription token để gửi tin quiz mới. Bạn có thể tắt bất cứ lúc nào trong cài đặt trình duyệt. Chúng tôi không gửi spam.
                    </p>
                </section>

                <section>
                    <h2>7. Thời gian lưu trữ dữ liệu</h2>
                    <p>
                        Dữ liệu sử dụng tổng quát được lưu trữ trong khoảng thời gian cần thiết để phục vụ mục đích phân tích, thường không quá 26 tháng (theo thời hạn mặc định của Google Analytics). Sau thời gian này, dữ liệu sẽ được xóa tự động.
                    </p>
                </section>

                <section>
                    <h2>8. Bảo vệ trẻ em / Người chưa thành niên</h2>
                    <p>
                        nambac.xyz không cố ý thu thập thông tin từ trẻ em dưới 13 tuổi. Nếu chúng tôi phát hiện đã thu thập thông tin từ trẻ em, chúng tôi sẽ xóa thông tin đó ngay lập tức. Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ qua email.
                    </p>
                </section>

                <section>
                    <h2>9. Chia sẻ dữ liệu với bên thứ ba</h2>
                    <p>
                        Chúng tôi <strong>không bán, cho thuê, hoặc trao đổi</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ dữ liệu ẩn danh hóa với các dịch vụ phân tích (Google Analytics) và quảng cáo (Google AdSense) như đã nêu ở trên.
                    </p>
                </section>

                <section>
                    <h2>10. Quyền của bạn</h2>
                    <p>Bạn có quyền:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>Yêu cầu xóa bất kỳ dữ liệu nào liên quan đến bạn</li>
                        <li>Tắt cookie thông qua cài đặt trình duyệt</li>
                        <li>Từ chối quảng cáo cá nhân hóa</li>
                        <li>Liên hệ với chúng tôi để hỏi về dữ liệu của bạn</li>
                    </ul>
                </section>

                <section>
                    <h2>11. Thay đổi chính sách</h2>
                    <p>
                        Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Mọi thay đổi quan trọng sẽ được thông báo trên trang web. Ngày "Cập nhật lần cuối" ở đầu trang sẽ phản ánh phiên bản mới nhất. Chúng tôi khuyến khích bạn kiểm tra trang này định kỳ.
                    </p>
                </section>

                <section>
                    <h2>12. Liên hệ</h2>
                    <p>
                        Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '2' }}>
                        <li>📧 Email: <strong>contact@nambac.xyz</strong></li>
                        <li>🌐 Website: <a href="https://nambac.xyz" style={{ color: '#FF2D85', textDecoration: 'underline' }}>nambac.xyz</a></li>
                    </ul>
                </section>

                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    ← Quay lại
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
