import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Share2, Copy, Check } from 'lucide-react';
import { calculateScore } from '../logic/scoring';
import Result from './Result';
import NameInputQuiz from './NameInputQuiz';
import MBTIQuiz from './MBTIQuiz';
import CustomQuiz from './CustomQuiz';
import './QuizPage.css';
import { API_BASE_URL, getImageUrl } from '../lib/apiConfig';
import AdPlaceholder from '../components/AdPlaceholder';

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
                // Fetch Quiz Info & Questions
                const quizRes = await fetch(`${API_BASE_URL}/quizzes/${quizId}`);
                if (!quizRes.ok) throw new Error('Failed to fetch quiz');
                const quizData = await quizRes.json();

                if (quizData) {
                    setQuizInfo(quizData);
                    setQuestions(quizData.questions || []);
                }

                // Fetch Results
                const resultRes = await fetch(`${API_BASE_URL}/quizzes/${quizId}/results`);
                if (resultRes.ok) {
                    const resData = await resultRes.json();
                    setResults(resData.results || []);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, [quizId]);

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
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
        return (
            <>
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

                            <button className="share-sheet-btn" onClick={() => setShowShareModal(true)}>
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
            <AdPlaceholder location="quiz-bottom" />
        </div>
    );
}
