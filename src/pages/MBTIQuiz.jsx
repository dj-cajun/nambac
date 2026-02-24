import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateMBTI } from '../logic/mbtiScoring';
import { getImageUrl } from '../lib/apiConfig';
import AdPlaceholder from '../components/AdPlaceholder';
import './QuizPage.css';

/**
 * MBTIQuiz — 12문항 MBTI 퀴즈
 * 4차원(EI/SN/TF/JP) × 3문항 = 12문항
 * 결과: 16가지 MBTI 유형
 */
export default function MBTIQuiz({ quizInfo, questions, results }) {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
    };

    const handleAnswer = (isB) => {
        const newAnswers = [...answers, isB];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            window.scrollTo(0, 0);
        } else {
            // Calculate MBTI type
            const mbtiType = calculateMBTI(newAnswers, questions);
            // Find matching result by title containing the MBTI type
            const matchedResult = results.find(r =>
                r.title?.includes(mbtiType) || r.result_code?.toString() === mbtiType
            );
            const score = matchedResult?.result_code ?? 0;
            navigate(`/quiz/${quizInfo.id}/analysis`, { state: { score, results, mbtiType } });
        }
    };

    // Intro Screen
    if (!started) {
        return (
            <>
                <div className="quiz-intro-card full-screen-mode">
                    <div className="intro-image-container full-screen-bg">
                        <img
                            src={getImageUrl(quizInfo.image_url) || "/images/default_cover.png"}
                            alt={quizInfo.title}
                            className="intro-cover-img"
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                        />
                        <div className="image-overlay-gradient-strong"></div>
                        <div className="category-tag top-safe-area">MBTI</div>
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
            </>
        );
    }

    // Gameplay
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    // Dimension indicator
    const dimensionLabels = {
        EI: '🧠 Năng lượng',
        SN: '👁️ Nhận thức',
        TF: '💭 Quyết định',
        JP: '🎯 Lối sống'
    };
    const currentDimension = currentQuestion?.dimension || '';

    return (
        <div className="quiz-page-container">
            {/* Header & Progress */}
            <div className="quiz-header">
                <div className="progress-label">
                    <span>{currentIndex + 1}/{questions.length}</span>
                    {currentDimension && (
                        <span className="mbti-dimension-tag">
                            {dimensionLabels[currentDimension] || currentDimension}
                        </span>
                    )}
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

            <AdPlaceholder location="quiz-bottom" />
        </div>
    );
}
