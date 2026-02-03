import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Share2, Home, RotateCcw } from 'lucide-react';
import './Result.css';

const Result = ({ score, results, quizId, onRestart }) => {
    const navigate = useNavigate();

    const [finalResult, setFinalResult] = useState({
        title: "CURSING GRANDMA DEALER",
        description: "Your results show a chaotic blend of unhinged energy and master of chaos. You possess the rare ability to deal facts with the intensity of a grandmother who has seen it all and isn't afraid to say it.\n\nKey phrases like \"absolute menace\" and \"no filters\" highlight your unique frequency in this digital landscape.",
        image_url: "/images/grandma_roast_standing.png"
    });

    useEffect(() => {
        if (results && results.length > 0) {
            const match = results.find(r => parseInt(r.result_code) === score) || results[0];
            if (match) {
                setFinalResult({
                    title: match.title,
                    description: match.description,
                    image_url: match.image_url || "/images/grandma_roast_standing.png"
                });
            }
        }
    }, [score, results]);

    // Highlight keywords in description
    const renderDescription = (text) => {
        const keywords = ['absolute menace', 'no filters', 'chaotic', 'unhinged', 'master'];
        let result = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            result = result.replace(regex, '<mark class="highlighter-pink">$1</mark>');
        });
        return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return (
        <div className="result-page-container">

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
                    <h1 className="celebration-title">CORRECT!</h1>
                </div>

                {/* Main Glass Card */}
                <div className="result-glass-card">

                    {/* Decorative Glow */}
                    <div className="decorative-glow"></div>

                    {/* Title Banner */}
                    <div className="title-banner">
                        <span className="banner-label">YOUR RESULT</span>
                        <div className="banner-title-box">
                            <h2 className="banner-title">[{finalResult.title}]</h2>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="result-image-section">
                        <div className="retro-sun"></div>
                        <img
                            src={finalResult.image_url}
                            onError={(e) => { e.target.src = "/images/grandma_roast_standing.png" }}
                            alt="Result Character"
                            className="result-character-img"
                        />
                    </div>

                    {/* Analysis Section */}
                    <div className="analysis-section">
                        <div className="analysis-header">
                            <span className="material-symbols-outlined filled icon-lightbulb">lightbulb</span>
                            <h4 className="analysis-label">THE ANALYSIS</h4>
                        </div>
                        <p className="analysis-text">
                            {renderDescription(finalResult.description)}
                        </p>
                    </div>

                    {/* Rarity Meter */}
                    <div className="rarity-section">
                        <div className="rarity-header">
                            <span className="rarity-label">RARITY METRIC</span>
                            <div className="rarity-badge">Top 3% Rarity!</div>
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
                    SAVE IMAGE
                </button>

                <button className="btn-primary btn-share">
                    <Share2 size={24} strokeWidth={3} />
                    SHARE THE ROAST
                </button>

                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <Home size={20} strokeWidth={3} />
                    다음 팩폭 당하러 가기
                </button>

                <button className="btn-text" onClick={onRestart}>
                    다시하기 (Restart)
                </button>
            </div>

            {/* Home Indicator */}
            <div className="home-indicator">
                <div className="indicator-bar"></div>
            </div>
        </div>
    );
};

export default Result;
