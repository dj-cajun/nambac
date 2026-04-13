import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Share2, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { calculateScore } from '../logic/scoring';
import MBTIQuiz from './MBTIQuiz';
import CustomQuiz from './CustomQuiz';
import './QuizPage.css';
import { getImageUrl } from '../lib/apiConfig';
import { supabase } from '../lib/supabase';
import AdSenseUnit from '../components/AdSenseUnit';

export default function QuizPage({ quizIdProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
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
                
                // 1. Try fetching from Supabase FIRST (Cloud)
                let quizData = null;
                let questionsData = [];
                let resultsData = [];
                let isLocalResult = false;

                try {
                    const { data: qz, error: qzErr } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
                    if (!qzErr && qz) {
                        quizData = qz;
                        const { data: qs } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order_number', { ascending: true });
                        const { data: rs } = await supabase.from('results').select('*').eq('quiz_id', quizId);
                        questionsData = qs || [];
                        resultsData = rs || [];
                    }
                } catch (err) {
                    console.log("Supabase fetch skip or fail, trying local...");
                }

                // 2. Try fetching from Local Backend if Cloud failed (or ID not found)
                if (!quizData) {
                    try {
                        const response = await fetch(`http://localhost:8000/api/quizzes/${quizId}`);
                        if (response.ok) {
                            const json = await response.json();
                            quizData = { ...json.quiz, is_local: true };
                            questionsData = json.questions || [];
                            resultsData = json.results || [];
                            isLocalResult = true;
                        }
                    } catch (err) {
                        console.warn("Local backend fetch failed:", err);
                    }
                }

                if (!quizData) throw new Error('Failed to fetch quiz from any source');

                setQuizInfo(quizData);
                setQuestions(questionsData);
                setResults(resultsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz data:', err);
                setLoading(false);
            }
        };

        fetchData();
        
        // Track view_count when quiz page loads (if not already tracked by Home)
        if (quizId && !window.__viewedQuiz?.[quizId]) {
            const trackView = async () => {
                const { data } = await supabase.from('quizzes').select('view_count').eq('id', quizId).single();
                if (data) {
                    supabase.from('quizzes').update({ view_count: (data.view_count || 0) + 1 }).eq('id', quizId).then();
                }
            };
            trackView();
            window.__viewedQuiz = { ...(window.__viewedQuiz || {}), [quizId]: true };
        }
    }, [quizId]);

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
        
        // Track participant_count
        if (quizId && !window.__participatedQuiz?.[quizId]) {
            supabase.from('quizzes').select('participant_count').eq('id', quizId).single()
                .then(({ data }) => {
                    if (data) {
                        supabase.from('quizzes').update({ participant_count: (data.participant_count || 0) + 1 }).eq('id', quizId).then();
                    }
                });
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
        // Calculate score and navigate to Analysis Page
        const score = calculateScore(answers, questions);
        navigate(`/quiz/${quizId}/analysis`, { state: { score, results } }); // Pass data
        return null; // Don't render anything while redirecting
    }

    // --- Intro View ---
    if (!started) {
        // Derive dynamic share URL for Quiz OG Tags
        const shareUrl = `https://nambac.xyz/quiz/${quizId}`;
        
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
                        <div className="category-tag top-safe-area">{quizInfo.category}</div>

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
                                    supabase.from('quizzes').select('share_count').eq('id', quizId).single()
                                        .then(({ data }) => {
                                            if (data) {
                                                supabase.from('quizzes').update({ share_count: (data.share_count || 0) + 1 }).eq('id', quizId).then();
                                            }
                                        });
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
            <AdSenseUnit adSlot="1234567890" location="quiz-bottom" />
        </div>
    );
}
