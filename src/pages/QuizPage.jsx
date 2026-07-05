import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Share2, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { calculateScore } from '../logic/scoring';
import MBTIQuiz from './MBTIQuiz';
import CustomQuiz from './CustomQuiz';
import NameInputQuiz from './NameInputQuiz';
import './QuizPage.css';
import { getImageUrl } from '../lib/apiConfig';
import { getCategoryLabel } from '../constants/categories';
import { fetchQuizBundle, incrementQuizStat } from '../lib/quizApi';
import AdSenseUnit from '../components/AdSenseUnit';
import { AD_SLOTS } from '../lib/adsConfig';
import { trackQuizStart, trackShare } from '../lib/analytics';

export default function QuizPage({ quizIdProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const quizId = id || quizIdProp;

    const [quizInfo, setQuizInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            if (!quizId) return;
            try {
                setLoading(true);
                
                const bundle = await fetchQuizBundle(quizId);
                setQuizInfo(bundle.quiz);
                setQuestions(bundle.questions || []);
                setResults(bundle.results || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz data:', err);
                setLoading(false);
            }
        };

        fetchData();
        
        // Track view_count when quiz page loads (if not already tracked by Home)
        if (quizId && !window.__viewedQuiz?.[quizId]) {
            incrementQuizStat(quizId, 'view').catch(console.error);
            window.__viewedQuiz = { ...(window.__viewedQuiz || {}), [quizId]: true };
        }
    }, [quizId]);

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
        trackQuizStart(quizId, quizInfo?.category);

        if (quizId && !window.__participatedQuiz?.[quizId]) {
            incrementQuizStat(quizId, 'participate').catch(console.error);
            window.__participatedQuiz = { ...(window.__participatedQuiz || {}), [quizId]: true };
        }
    };

    const handleAnswer = (isA) => {
        const newAnswers = [...answers, isA];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            window.scrollTo(0, 0);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setAnswers([]);
        setCurrentIndex(0);
        setShowResult(false);
        setStarted(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="quiz-page-container">
                <div className="loading-state">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="loading-spinner"
                    />
                    <p>Đang tải quiz...</p>
                </div>
            </div>
        );
    }

    if (!quizInfo) {
        return (
            <div className="quiz-page-container">
                <div className="error-state">
                    <h2>Oops! 🕸️</h2>
                    <p>Không tìm thấy quiz này rồi.</p>
                    <button className="glass-btn" onClick={() => navigate('/')}>Quay lại trang chủ</button>
                </div>
            </div>
        );
    }

    // --- Quiz Type Routing ---
    const quizType = quizInfo.quiz_type || 'binary_5q';

    if (quizType === 'name_input') {
        return <NameInputQuiz quizInfo={quizInfo} results={results} />;
    }

    if (quizType === 'mbti_12q') {
        return <MBTIQuiz quizInfo={quizInfo} questions={questions} results={results} />;
    }

    if (quizType === 'sponsor' || quizType === 'full_custom') {
        return <CustomQuiz quizInfo={quizInfo} questions={questions} results={results} />;
    }

    if (showResult) {
        const score = calculateScore(answers, questions);
        const matchFriendScore = searchParams.get('matchFriendScore');
        if (matchFriendScore !== null) {
            navigate(`/compatibility/${quizId}/${matchFriendScore}/${score}`);
        } else {
            navigate(`/quiz/${quizId}/result?score=${score}`);
        }
        return null; // Don't render anything while redirecting
    }

    // --- Intro View ---
    if (!started) {
        // Derive dynamic share URL for Quiz OG Tags (Route through /share/ for SSR OG api wrapper)
        const shareUrl = `https://nambac.xyz/share/${quizId}`;
        
        return (
            <>
                <Helmet>
                    <title>{quizInfo.title} - nambac.xyz</title>
                    <meta name="description" content={quizInfo.description || quizInfo.title} />
                    <meta property="og:title" content={quizInfo.title} />
                    <meta property="og:description" content={quizInfo.description || quizInfo.title} />
                    <meta property="og:image" content={getImageUrl(quizInfo.image_url) || "/images/default_cover.png"} />
                    <meta property="og:url" content={shareUrl} />
                    <meta property="twitter:card" content="summary_large_image" />
                </Helmet>
                
                <div className="quiz-intro-card full-screen-mode">
                    {/* Full Screen Cover Image */}
                    <div className="intro-image-container full-screen-bg">
                        <img
                            src={getImageUrl(quizInfo.image_url) || "/images/default_cover.png"}
                            alt={quizInfo.title}
                            className="intro-cover-img"
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                        />
                        <div className="image-overlay-gradient-strong"></div>

                        {/* Category Tag (Top Left) */}
                        <div className="category-tag top-safe-area">{getCategoryLabel(quizInfo.category)}</div>

                        {/* Title (On Image, above bottom sheet) */}
                        {/* Title Removed as per request */}
                    </div>

                    {/* Bottom Sheet (Navi Style) */}
                    <motion.div
                        initial={{ y: "150%" }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="intro-bottom-sheet"
                    >
                        <div className="sheet-actions">
                            <button className="start-sheet-btn" onClick={handleStart}>
                                <span className="btn-label">BẮT ĐẦU</span>
                            </button>

                            <button className="share-sheet-btn" onClick={() => {
                                setShowShareModal(true);
                                // Increment share_count
                                if (!window.__sharedQuiz?.[quizId]) {
                                    incrementQuizStat(quizId, 'share').catch(console.error);
                                    window.__sharedQuiz = { ...(window.__sharedQuiz || {}), [quizId]: true };
                                }
                            }}>
                                <span className="btn-label">CHIA SẺ</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Share Modal Popup */}
                {showShareModal && (
                    <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                        <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3 className="share-modal-title">Chia sẻ bài quiz</h3>
                            
                            {/* Derive dynamic share URL for Quiz */}
                            {(() => {
                                const shareUrl = `${window.location.origin}/quiz/${quizId}`;
                                return (
                                    <div className="share-options">
                                        <button className="share-option zalo" onClick={() => {
                                            trackShare('zalo', quizId);
                                            window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
                                        }}>
                                    <span className="share-icon">💬</span>
                                    <span>Zalo</span>
                                </button>

                                <button className="share-option instagram" onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    alert('Đã sao chép link! Hãy dán vào Instagram.');
                                }}>
                                    <span className="share-icon">📷</span>
                                    <span>Instagram</span>
                                </button>

                                <button className="share-option facebook" onClick={() => {
                                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                                }}>
                                    <span className="share-icon">📘</span>
                                    <span>Facebook</span>
                                </button>

                                <button className="share-option copy-link" onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    alert('Đã sao chép link!');
                                }}>
                                    <span className="share-icon">🔗</span>
                                    <span>Sao chép</span>
                                </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </>
        );
    }

    // --- Gameplay View ---
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-page-container">
            {/* Header & Progress */}
            <div className="quiz-header">
                <div className="progress-label">
                    <span>{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="glass-progress-track">
                    <div
                        className="glass-progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="question-anim-wrapper"
                >
                    {/* Question Card */}
                    <div className="question-glass-panel">
                        <h2 className="question-text">{currentQuestion.question_text}</h2>
                    </div>

                    {/* Answers Grid */}
                    <div className="answers-grid">
                        <button
                            className="glass-answer-btn"
                            onClick={() => handleAnswer(false)}
                        >
                            <div className="option-letter-circle">A</div>
                            <span className="btn-text">{currentQuestion.option_a}</span>
                        </button>
                        <button
                            className="glass-answer-btn"
                            onClick={() => handleAnswer(true)}
                        >
                            <div className="option-letter-circle">B</div>
                            <span className="btn-text">{currentQuestion.option_b}</span>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* AdSense Slot (Bottom of Quiz Page) */}
            <AdSenseUnit adSlot={AD_SLOTS.quiz} location="quiz-bottom" />
        </div>
    );
}
