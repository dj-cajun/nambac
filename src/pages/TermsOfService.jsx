import React from 'react';
import './LegalPages.css';

const TermsOfService = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-content glass-card">
                <h1>Terms of Service (Điều khoản dịch vụ)</h1>
                <p className="last-updated">Last Updated: February 2026</p>

                <section>
                    <h2>1. Agreement to Terms (Chấp nhận điều khoản)</h2>
                    <p>
                        By accessing or using <strong>nambac.xyz</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                    <p>
                        Bằng cách truy cập hoặc sử dụng <strong>nambac.xyz</strong>, bạn đồng ý tuân thủ các Điều khoản dịch vụ này. Nếu bạn không đồng ý với các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                    </p>
                </section>

                <section>
                    <h2>2. Intellectual Property (Quyền sở hữu trí tuệ)</h2>
                    <p>
                        The content, organization, graphics, design, compilation, and other matters related to the Site are protected under applicable copyrights and intellectual property laws.
                    </p>
                    <p>
                        Nội dung, tổ chức, đồ họa, thiết kế, biên soạn và các vấn đề khác liên quan đến Trang web đều được bảo vệ theo luật bản quyền và sở hữu trí tuệ hiện hành.
                    </p>
                </section>

                <section>
                    <h2>3. Disclaimer (Tuyên bố từ chối trách nhiệm)</h2>
                    <p>
                        The materials on nambac.xyz are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                    <p>
                        Các tài liệu trên nambac.xyz được cung cấp trên cơ sở 'nguyên trạng'. Chúng tôi không đưa ra bảo đảm nào, dù rõ ràng hay ngụ ý, và theo đây từ chối và phủ nhận mọi bảo đảm khác bao gồm, nhưng không giới hạn ở, các bảo đảm ngụ ý hoặc điều kiện về khả năng bán được, tính phù hợp cho một mục đích cụ thể, hoặc không vi phạm quyền sở hữu trí tuệ hoặc các vi phạm quyền khác.
                    </p>
                </section>

                <section>
                    <h2>4. Limitation of Liability (Giới hạn trách nhiệm)</h2>
                    <p>
                        In no event shall nambac.xyz or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
                    </p>
                    <p>
                        Trong mọi trường hợp, nambac.xyz hoặc các nhà cung cấp của nambac.xyz sẽ không chịu trách nhiệm cho bất kỳ thiệt hại nào (bao gồm, nhưng không giới hạn ở, thiệt hại do mất dữ liệu hoặc lợi nhuận, hoặc do gián đoạn kinh doanh) phát sinh từ việc sử dụng hoặc không thể sử dụng các tài liệu trên trang web của chúng tôi.
                    </p>
                </section>
                <button className="legal-back-btn" onClick={() => window.history.back()}>
                    Close (Đóng)
                </button>
            </div>
        </div>
    );
};

export default TermsOfService;
