import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, ChevronRight, Award, TrendingUp, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { submitBrandInquiry } from '../lib/quizApi';
import './BrandsLanding.css';

const BrandsLanding = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    // Form State
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [quizConcept, setQuizConcept] = useState('');
    const [budgetTier, setBudgetTier] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName || !contactPerson || !email || !quizConcept || !budgetTier) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc nhé! 📝');
            return;
        }

        try {
            setSubmitting(true);
            await submitBrandInquiry({
                company_name: companyName,
                contact_person: contactPerson,
                email: email,
                phone: phone || null,
                quiz_concept: quizConcept,
                budget_tier: budgetTier,
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting brand inquiry:', err);
            alert('Có lỗi xảy ra khi gửi thông tin. Bạn hãy liên hệ trực tiếp qua email nam@nambac.xyz nhé!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="brands-page-container">
            <Helmet>
                <title>Hợp Tác Thương Hiệu - Trắc Nghiệm AI MZ | nambac.xyz</title>
                <meta name="description" content="Tạo chiến dịch Marketing Viral cùng Nambac. Tiếp cận 100k+ thế hệ Gen Z Sài Gòn chỉ trong 5 giây." />
            </Helmet>

            <div className="brands-top-bar">
                <button type="button" className="brands-back-btn" onClick={handleBack}>
                    <ArrowLeft size={20} strokeWidth={2.5} />
                    <span>Quay lại</span>
                </button>
            </div>

            {/* Glowing Blobs */}
            <div className="compat-glow-blob b2b-blob-1"></div>
            <div className="compat-glow-blob b2b-blob-2"></div>

            <main className="brands-main">
                {/* 1. Hero Title */}
                <div className="brands-hero-section">
                    <span className="brands-category-badge">🎯 DÀNH CHO THƯƠNG HIỆU</span>
                    <h1 className="brands-hero-title">
                        Chạm Đến <span className="neon-text-gold">Gen Z Sài Gòn</span> Qua Trắc Nghiệm AI Viral
                    </h1>
                    <p className="brands-hero-desc">
                        Nambac.xyz kết hợp trí tuệ nhân tạo (AI) và tâm lý học hiện đại để tạo nên những chiến dịch Marketing tương tác độc bản. Tăng nhận diện thương hiệu, tiếp cận hàng vạn khách hàng trẻ tuổi với tốc độ lan truyền chóng mặt.
                    </p>
                    <a href="#inquiry-form" className="btn-b2b-primary">
                        <span>ĐĂNG KÝ TƯ VẤN NGAY</span>
                        <ChevronRight size={18} />
                    </a>
                </div>

                {/* 2. Key Stats (Neon Grid) */}
                <div className="brands-stats-grid">
                    <div className="b2b-stat-card">
                        <TrendingUp className="stat-icon pink" size={24} />
                        <h3 className="stat-number">100K+</h3>
                        <span className="stat-label">Lượt chơi tự nhiên</span>
                    </div>
                    <div className="b2b-stat-card">
                        <Zap className="stat-icon gold" size={24} />
                        <h3 className="stat-number">85%</h3>
                        <span className="stat-label">Tỷ lệ chia sẻ mạng xã hội</span>
                    </div>
                    <div className="b2b-stat-card">
                        <Sparkles className="stat-icon blue" size={24} />
                        <h3 className="stat-number">24H</h3>
                        <span className="stat-label">Thời gian thiết kế & triển khai</span>
                    </div>
                </div>

                {/* 3. Value Proposition Section */}
                <div className="brands-value-section">
                    <h2 className="section-b2b-title">Tại sao thương hiệu chọn Nambac?</h2>
                    
                    <div className="value-item-row">
                        <div className="value-num">01</div>
                        <div className="value-content">
                            <h4 className="value-title">Nội dung "Đo Ni Đóng Giày" Bằng AI</h4>
                            <p className="value-text">
                                Đội ngũ AI Agent độc quyền tự động nghiên cứu insight sản phẩm của bạn, tự sinh câu hỏi khịa vui vẻ và tạo ra các Archetype kết quả cực kỳ lôi cuốn, thúc đẩy người chơi tự hào chia sẻ lên Facebook & Zalo.
                            </p>
                        </div>
                    </div>

                    <div className="value-item-row">
                        <div className="value-num">02</div>
                        <div className="value-content">
                            <h4 className="value-title">Sở Hữu Phép Màu "So Kèo Hợp Nhau"</h4>
                            <p className="value-text">
                                Tính năng tính toán độ tương thích của hai người chơi (Friend Compatibility) tạo nên một vòng lặp lan truyền (Viral Loop). Bạn bè thách đố nhau chơi để xem độ hợp cạ, nhân đôi lượt tiếp cận thương hiệu của bạn miễn phí.
                            </p>
                        </div>
                    </div>

                    <div className="value-item-row">
                        <div className="value-num">03</div>
                        <div className="value-content">
                            <h4 className="value-title">Đo Lường Trực Quan 100%</h4>
                            <p className="value-text">
                                Nhận báo cáo chi tiết về số lượng người tham gia, phân bố tính cách, tỷ lệ chia sẻ và tệp khách hàng tiềm năng thông qua bảng 어드민 실시간 데이터 통계 시스템을 제공합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. Contact / Inquiry Form */}
                <div className="brands-form-section" id="inquiry-form">
                    <div className="form-tape-deco"></div>
                    
                    {submitted ? (
                        <div className="form-success-container">
                            <CheckCircle2 size={64} className="success-icon" />
                            <h3 className="success-title">Gửi Yêu Cầu Thành Công!</h3>
                            <p className="success-text">
                                Cảm ơn đối tác đã tin tưởng Nambac. Đội ngũ đại diện thương hiệu của chúng tôi sẽ liên hệ lại với bạn qua Email/Số điện thoại trong vòng 12 giờ làm việc để gửi bản kế hoạch chi tiết nhất.
                            </p>
                            <button className="btn-b2b-secondary" onClick={() => setSubmitted(false)}>
                                Gửi yêu cầu khác
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="b2b-inquiry-form">
                            <h3 className="form-heading">Đặt Làm Quiz Thương Hiệu</h3>
                            <p className="form-subheading">Hãy để lại thông tin, chúng tôi sẽ phác thảo ý tưởng 퀴즈 miễn phí cho thương hiệu của bạn.</p>

                            <div className="form-group-b2b">
                                <label className="form-label-b2b">Tên Doanh Nghiệp / Thương Hiệu *</label>
                                <input 
                                    type="text" 
                                    className="form-input-b2b" 
                                    placeholder="Ví dụ: Grab Vietnam, Trà sữa Koi Thé..." 
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row-b2b">
                                <div className="form-group-b2b flex-1">
                                    <label className="form-label-b2b">Người Đại Diện Liên Hệ *</label>
                                    <input 
                                        type="text" 
                                        className="form-input-b2b" 
                                        placeholder="Ví dụ: Nguyễn Văn A" 
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group-b2b flex-1">
                                    <label className="form-label-b2b">Số Điện Thoại (Zalo)</label>
                                    <input 
                                        type="tel" 
                                        className="form-input-b2b" 
                                        placeholder="Ví dụ: 0901234567" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group-b2b">
                                <label className="form-label-b2b">Địa Chỉ Email Làm Việc *</label>
                                <input 
                                    type="email" 
                                    className="form-input-b2b" 
                                    placeholder="Ví dụ: marketing@company.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group-b2b">
                                <label className="form-label-b2b">Ý Tưởng Sơ Bộ Hoặc Mục Tiêu Chiến Dịch *</label>
                                <textarea 
                                    className="form-textarea-b2b" 
                                    rows="4"
                                    placeholder="Ví dụ: Chúng tôi muốn làm quiz trắc nghiệm tính cách cho các bạn nghiện trà sữa để quảng bá dòng sản phẩm Matcha mới..."
                                    value={quizConcept}
                                    onChange={(e) => setQuizConcept(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group-b2b">
                                <label className="form-label-b2b">Ngân Sách Dự Kiến Cho Chiến Dịch *</label>
                                <select 
                                    className="form-select-b2b"
                                    value={budgetTier}
                                    onChange={(e) => setBudgetTier(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn mức ngân sách phù hợp --</option>
                                    <option value="basic">Dưới $500 (Gói Cơ Bản - 1 Quiz)</option>
                                    <option value="standard">$500 - $2,000 (Gói Tiêu Chuẩn - 1 Quiz + 2차 바이럴 궁합)</option>
                                    <option value="enterprise">Trên $2,000 (Gói Doanh Nghiệp - Độc Quyền + Custom UI)</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-b2b-submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span>Đang gửi thông tin... ⚡</span>
                                ) : (
                                    <>
                                        <span>GỬI YÊU CẦU ĐĂNG KÝ</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BrandsLanding;
