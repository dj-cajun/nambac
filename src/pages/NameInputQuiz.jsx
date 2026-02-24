import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateNameScore } from '../logic/mbtiScoring';
import { getImageUrl } from '../lib/apiConfig';
import AdPlaceholder from '../components/AdPlaceholder';
import './QuizPage.css';

/**
 * NameInputQuiz — 이름 입력형 퀴즈
 * 이름을 입력하면 해시 기반으로 결과를 보여줌
 */
export default function NameInputQuiz({ quizInfo, results }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [started, setStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!name.trim()) return;
        const resultIndex = calculateNameScore(name.trim(), results.length);
        const score = results[resultIndex]?.result_code ?? resultIndex;
        navigate(`/quiz/${quizInfo.id}/analysis`, { state: { score, results } });
    };

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
                        <div className="category-tag top-safe-area">{quizInfo.category}</div>
                    </div>

                    <motion.div
                        initial={{ y: "150%" }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="intro-bottom-sheet"
                    >
                        <div className="sheet-actions">
                            <button className="start-sheet-btn" onClick={() => setStarted(true)}>
                                <span className="btn-label">BẮT ĐẦU</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    // Name Input Screen
    return (
        <div className="quiz-page-container">
            <div className="name-input-card">
                <h2 className="name-input-title">{quizInfo.title}</h2>
                <p className="name-input-desc">{quizInfo.description}</p>

                <div className="name-input-wrapper">
                    <input
                        type="text"
                        className="name-input-field"
                        placeholder="Nhập tên của bạn..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        autoFocus
                        maxLength={30}
                    />
                </div>

                <motion.button
                    className="name-submit-btn"
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.95 }}
                    disabled={!name.trim()}
                >
                    <span>XEM KẾT QUẢ ✨</span>
                </motion.button>
            </div>

            <AdPlaceholder location="quiz-bottom" />
        </div>
    );
}
