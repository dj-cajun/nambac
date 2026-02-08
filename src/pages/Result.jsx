import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Share2, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ShareModal from '../components/ShareModal';
import './Result.css';

const Result = ({ score, results, quizId, onRestart }) => {
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);

    const [finalResult, setFinalResult] = useState({ title: "Đang tải...", description: "", image_url: "" });

    useEffect(() => {
        if (results && results.length > 0) {
            const match = results.find(r => parseInt(r.result_code) === score) || results[0];
            if (match) setFinalResult(match);
        }
    }, [score, results]);

    // ogImageUrl 제거. finalResult.image_url을 직접 사용

    const renderDescription = (text = "") => {
        return <span dangerouslySetInnerHTML={{ __html: text.replace(/\\n/g, '<br/>') }} />;
    };

    return (
        <div className="result-page-container">
            <Helmet>
                <title>{`[${finalResult.type_name || finalResult.title}] - nambac.xyz`}</title>
                <meta property="og:title" content={`Kết quả của tôi là [${finalResult.type_name || finalResult.title}]!`} />
                <meta property="og:image" content={finalResult.image_url} />
            </Helmet>

            {/* Header Bar */}
            <div className="result-header">
                <button className="header-btn glass-btn" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="progress-bar-container">
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <button className="header-btn glass-btn">
                    <span className="material-symbols-outlined">favorite</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="result-main">

                {/* Celebration Section */}
                <div className="celebration-section">
                    <div className="celebration-icon">
                        <span className="material-symbols-outlined filled">celebration</span>
                    </div>
                    <h1 className="celebration-title">HOÀN THÀNH!</h1>
                </div>

                {/* Main Glass Card */}
                <div className="result-glass-card">

                    {/* Decorative Glow */}
                    <div className="decorative-glow"></div>

                    {/* Title Banner */}
                    <div className="title-banner">
                        <span className="banner-label">KẾT QUẢ CỦA BẠN</span>
                        <div className="banner-title-box">
                            <h2 className="banner-title">[{finalResult.type_name || finalResult.title}]</h2>
                        </div>
                    </div>

                    <div className="content-split-container">
                        {/* 1. Image Section (Left) */}
                        <div className="result-image-section">
                            <div className="retro-sun"></div>
                            <img
                                src={finalResult.image_url}
                                onError={(e) => { e.target.src = "/images/default_character.png" }}
                                alt="Result Character"
                                className="result-character-img"
                            />
                        </div>

                        {/* 2. Analysis & Description Section (Right) */}
                        <div className="analysis-section">
                            <div className="analysis-header">
                                <span className="material-symbols-outlined filled icon-lightbulb">lightbulb</span>
                                <h4 className="analysis-label">PHÂN TÍCH</h4>
                            </div>
                            <p className="analysis-text">
                                {renderDescription(finalResult.description)}
                            </p>

                            {/* Traits/Stats (재배치) */}
                            <div className="traits-list mt-4">
                                <div className="traits-header">ĐẶC ĐIỂM</div>
                                {finalResult.traits && finalResult.traits.map((trait, index) => (
                                    <span key={index} className="trait-badge">{trait}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rarity Meter */}
                    <div className="rarity-section">
                        <div className="rarity-header">
                            <span className="rarity-label">ĐỘ HIẾM</span>
                            <div className="rarity-badge">Top 3% Độ hiếm!</div>
                        </div>
                        <div className="rarity-bar-track">
                            <div className="rarity-bar-fill"></div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item stat-xp">
                            <span className="material-symbols-outlined filled">stars</span>
                            <span className="stat-value">+100 XP</span>
                        </div>
                        <div className="stat-item stat-time">
                            <span className="material-symbols-outlined filled">timer</span>
                            <span className="stat-value">1.2s</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Buttons */}
            <div className="result-buttons">
                <button className="btn-primary btn-save">
                    <Download size={24} strokeWidth={3} />
                    LƯU ẢNH
                </button>

                <button className="btn-primary btn-share" onClick={() => setShowShareModal(true)}>
                    <Share2 size={24} strokeWidth={3} />
                    CHIA SẺ KẾT QUẢ
                </button>

                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <Home size={20} strokeWidth={3} />
                    VỀ TRANG CHỦ
                </button>

                <button className="btn-text" onClick={onRestart}>
                    Chơi lại (Restart)
                </button>
            </div>

            {showShareModal && (
                <ShareModal
                    quizTitle={finalResult.type_name || finalResult.title}
                    quizId={quizId}
                    score={score}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {/* Home Indicator */}
            <div className="home-indicator">
                <div className="indicator-bar"></div>
            </div>
        </div>
    );
};

export default Result;
