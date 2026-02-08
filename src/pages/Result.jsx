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
    const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    useEffect(() => {
        if (results && results.length > 0) {
            const match = results.find(r => parseInt(r.result_code) === score) || results[0];
            if (match) setFinalResult(match);
        }
    }, [score, results]);

    // Fetch recommended quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/quizzes');
                if (res.ok) {
                    const data = await res.json();
                    // Filter out current quiz
                    const filtered = (data.quizzes || data).filter(q => q.id !== parseInt(quizId));
                    setRecommendedQuizzes(filtered);
                }
            } catch (err) {
                console.error('Failed to fetch recommended quizzes:', err);
            }
        };
        fetchQuizzes();
    }, [quizId]);

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

            {/* Header removed as per request */}

            {/* Main Content */}
            <main className="result-main">

                {/* Result Card - Unified Image Style */}
                <div className="result-unified-card">
                    {/* Full Result Image */}
                    <img
                        src={getImageUrl(finalResult.image_url)}
                        onError={(e) => { e.target.src = "/images/default_character.png" }}
                        alt="Result Character"
                        className="result-full-img"
                    />

                    {/* Dark Overlay for Text */}
                    <div className="result-overlay-right">
                        {/* Result Title */}
                        <div className="result-title-badge">
                            {finalResult.type_name || finalResult.title}
                        </div>

                        {/* Description */}
                        <p className="result-overlay-text">
                            {renderDescription(finalResult.description)}
                        </p>
                    </div>
                </div>

                {/* Recommended Quizzes Section */}
                {recommendedQuizzes.length > 0 && (
                    <div className="recommended-section">
                        <h3 className="recommended-title">Đề xuất cho bạn</h3>
                        <div className="recommended-grid">
                            {recommendedQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="recommended-card"
                                    onClick={() => { window.location.href = `/quiz/${quiz.id}`; }}
                                >
                                    <img
                                        src={getImageUrl(quiz.thumbnail_url || quiz.image_url)}
                                        alt={quiz.title}
                                        className="recommended-thumbnail"
                                        onError={(e) => { e.target.src = "/images/default_quiz.png" }}
                                    />
                                    <span className="recommended-card-title">{quiz.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Modal Bar (Like Quiz Start Screen) */}
            <div className="result-bottom-bar">
                <div className="bar-actions">
                    <button className="restart-btn" onClick={onRestart}>
                        <span className="btn-label">CHƠI LẠI</span>
                        <div className="btn-icon-circle">
                            <span className="material-symbols-outlined">refresh</span>
                        </div>
                    </button>

                    <button className="share-btn" onClick={() => setShowShareModal(true)}>
                        <Share2 size={24} />
                    </button>
                </div>
            </div>

            {/* Share Modal Popup */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="share-modal-title">Chia sẻ kết quả quiz</h3>

                        <div className="share-options">
                            <button className="share-option zalo" onClick={() => {
                                window.open(`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}>
                                <span className="share-icon">💬</span>
                                <span>Zalo</span>
                            </button>

                            <button className="share-option instagram" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã sao chép link! Hãy dán vào Instagram.');
                            }}>
                                <span className="share-icon">📷</span>
                                <span>Instagram</span>
                            </button>

                            <button className="share-option facebook" onClick={() => {
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}>
                                <span className="share-icon">📘</span>
                                <span>Facebook</span>
                            </button>

                            <button className="share-option copy-link" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã sao chép link!');
                            }}>
                                <span className="share-icon">🔗</span>
                                <span>Sao chép</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Result;
