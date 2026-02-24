import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../lib/apiConfig';
import AdPlaceholder from '../components/AdPlaceholder';
import './QuizPage.css';

/**
 * CustomQuiz — sponsor / full_custom 타입
 * 다중 선택지 (A/B/C/D+), 커스텀 배경, 커스텀 CSS 지원
 */
export default function CustomQuiz({ quizInfo, questions, results }) {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);

    const design = quizInfo.design || {};
    const config = quizInfo.config || {};

    // Inject custom CSS
    useEffect(() => {
        if (design.custom_css) {
            const style = document.createElement('style');
            style.id = 'custom-quiz-css';
            style.textContent = design.custom_css;
            document.head.appendChild(style);
            return () => { document.getElementById('custom-quiz-css')?.remove(); };
        }
    }, [design.custom_css]);

    // Custom background style
    const bgStyle = {};
    if (design.bg_gradient && design.bg_gradient.length >= 2) {
        bgStyle.background = `linear-gradient(135deg, ${design.bg_gradient[0]} 0%, ${design.bg_gradient[1]} 100%)`;
    }
    if (design.primary_color) {
        bgStyle['--custom-primary'] = design.primary_color;
    }

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
    };

    const handleAnswer = (optionIndex) => {
        const q = questions[currentIndex];
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            window.scrollTo(0, 0);
        } else {
            // Score: sum up tag scores or use simple index-based scoring
            const score = calculateCustomScore(newAnswers, questions, results);
            navigate(`/quiz/${quizInfo.id}/analysis`, { state: { score, results } });
        }
    };

    // Intro
    if (!started) {
        return (
            <div style={bgStyle}>
                <div className="quiz-intro-card full-screen-mode">
                    <div className="intro-image-container full-screen-bg">
                        <img
                            src={getImageUrl(quizInfo.image_url) || "/images/default_cover.png"}
                            alt={quizInfo.title}
                            className="intro-cover-img"
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                        />
                        <div className="image-overlay-gradient-strong"></div>
                        <div className="category-tag top-safe-area">{quizInfo.category}</div>

                        {/* Sponsor logo */}
                        {design.sponsor_logo && (
                            <img src={getImageUrl(design.sponsor_logo)} className="sponsor-logo-overlay" alt="sponsor" />
                        )}
                    </div>

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
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Gameplay
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    // Multi-choice: use options array or fallback to option_a/option_b
    const options = currentQuestion.options || [
        { text: currentQuestion.option_a, label: 'A' },
        { text: currentQuestion.option_b, label: 'B' },
    ];

    // Question background
    const questionBgStyle = currentQuestion.image_url
        ? { backgroundImage: `url(${getImageUrl(currentQuestion.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : bgStyle;

    return (
        <div className="quiz-page-container" style={bgStyle}>
            {/* Sponsor banner */}
            {design.sponsor_banner && (
                <div className="sponsor-banner">
                    <img src={getImageUrl(design.sponsor_banner)} alt="sponsor" />
                </div>
            )}

            {/* Header & Progress */}
            <div className="quiz-header">
                <div className="progress-label">
                    <span>{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="glass-progress-track">
                    <div className="glass-progress-fill" style={{ width: `${progress}%` }}></div>
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
                    <div className="question-glass-panel" style={questionBgStyle}>
                        <h2 className="question-text">{currentQuestion.question_text}</h2>
                    </div>

                    {/* Multi-Choice Answers */}
                    <div className="answers-grid multi-choice">
                        {options.map((opt, idx) => (
                            <button
                                key={idx}
                                className="glass-answer-btn"
                                onClick={() => handleAnswer(idx)}
                            >
                                <div className="option-letter-circle">
                                    {opt.label || String.fromCharCode(65 + idx)}
                                </div>
                                <span className="btn-text">{opt.text}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <AdPlaceholder location="quiz-bottom" />
        </div>
    );
}

/**
 * Custom scoring: tag-based or index-based
 */
function calculateCustomScore(answers, questions, results) {
    // Tag-based scoring
    const tagCounts = {};
    answers.forEach((optIdx, qIdx) => {
        const q = questions[qIdx];
        const options = q.options || [
            { score: { tag: 'a' } },
            { score: { tag: 'b' } },
        ];
        const chosen = options[optIdx];
        if (chosen?.score?.tag) {
            tagCounts[chosen.score.tag] = (tagCounts[chosen.score.tag] || 0) + 1;
        }
    });

    // If tags were used, find result with highest tag match
    if (Object.keys(tagCounts).length > 0) {
        let bestTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0][0];
        const match = results.find(r => r.title?.toLowerCase().includes(bestTag.toLowerCase()));
        if (match) return match.result_code ?? 0;
    }

    // Fallback: simple sum of option indices modulo result count
    const sum = answers.reduce((acc, v) => acc + v, 0);
    return sum % results.length;
}
