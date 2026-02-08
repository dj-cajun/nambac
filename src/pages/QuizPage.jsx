import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Share2, Copy, Check } from 'lucide-react';
import { calculateScore } from '../logic/scoring';
import Result from './Result';
import './QuizPage.css';

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

    useEffect(() => {
        const fetchData = async () => {
            if (!quizId) return;
            try {
                setLoading(true);
                // Fetch Quiz Info & Questions
                const quizRes = await fetch(`http://localhost:8000/api/quizzes/${quizId}`);
                if (!quizRes.ok) throw new Error('Failed to fetch quiz');
                const quizData = await quizRes.ok ? await quizRes.json() : null;

                if (quizData) {
                    setQuizInfo(quizData);
                    setQuestions(quizData.questions || []);
                }

                // Fetch Results
                const resultRes = await fetch(`http://localhost:8000/api/quizzes/${quizId}/results`);
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
    };

    const handleAnswer = (isA) => {
        const newAnswers = [...answers, isA];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
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

    if (showResult) {
        // Use all answers with weighted scoring (Gatekeeper Logic 3-1-1-0-0)
        const score = calculateScore(answers, questions);

        return (
            <Result
                score={score}
                results={results}
                quizId={quizId}
                onRestart={handleRestart}
            />
        );
    }

    // --- Intro View ---
    if (!started) {
        return (
            <div className="quiz-page-container">
                <div className="quiz-intro-card">
                    {/* Cover Image */}
                    <div className="intro-image-container">
                        <img
                            src={quizInfo.image_url || "/images/default_cover.png"}
                            alt={quizInfo.title}
                            className="intro-cover-img"
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                        />
                        <div className="image-overlay-gradient"></div>
                        <div className="category-tag">{quizInfo.category}</div>
                    </div>

                    {/* Content Section */}
                    <div className="intro-content">
                        <h1 className="intro-title">{quizInfo.title}</h1>
                        <p className="intro-description">{quizInfo.description}</p>

                        <div className="intro-stats">
                            <div className="stat-pill">
                                <Play size={14} fill="currentColor" />
                                <span>{quizInfo.view_count || 0} lượt chơi</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Box */}
                    <div className="intro-actions-box">
                        <button className="start-main-btn" onClick={handleStart}>
                            <Play fill="currentColor" size={24} />
                            <span>BẮT ĐẦU</span>
                        </button>

                        <div className="intro-secondary-btns">
                            <button className="intro-icon-btn share-btn" onClick={() => { }}>
                                <Share2 size={20} />
                            </button>
                            <button className="intro-icon-btn copy-btn" onClick={handleCopy}>
                                {copied ? <Check size={20} color="#4ADE80" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div className="home-indicator">
                    <div className="indicator-bar"></div>
                </div>
            </div>
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
                    <span>CÂU HỎI {currentIndex + 1}</span>
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
                        <div className="question-badge">LEVEL {currentIndex + 1}</div>

                        {currentQuestion.image_url && (
                            <div className="question-image-box">
                                <img src={currentQuestion.image_url} alt="Question Art" />
                            </div>
                        )}

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

            {/* Home Indicator */}
            <div className="home-indicator">
                <div className="indicator-bar"></div>
            </div>
        </div>
    );
}
