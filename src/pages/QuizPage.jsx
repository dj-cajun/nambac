import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateScore } from '../logic/scoring';
import Result from './Result'; // Import standalone Result component
import './QuizPage.css';

export default function QuizPage({ quizIdProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const quizId = id || quizIdProp || 1;

    const [quizInfo, setQuizInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                // Parallel fetch for quiz info and results (since main endpoint might not return results)
                const [quizRes, resultRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/quizzes/${quizId}`),
                    fetch(`http://localhost:8000/api/quizzes/${quizId}/results`)
                ]);

                const quizData = await quizRes.json();
                const resultData = await resultRes.json();

                setQuizInfo(quizData);
                setQuestions(quizData.questions || []);
                setResults(resultData.results || []); // Assuming API returns { results: [...] }
            } catch (error) {
                console.error("Error fetching quiz data:", error);
            }
        };
        fetchQuizData();
    }, [quizId]);

    const handleAnswer = (isOptionB) => {
        const newAnswers = [...answers, isOptionB];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            const score = calculateScore(newAnswers);
            setFinalScore(score);
            setShowResult(true);
        }
    };

    if (!quizInfo || questions.length === 0) return (
        <div className="quiz-page-container flex items-center justify-center">
            <div className="text-xl font-black text-[#1E293B] animate-pulse">Đang tải câu hỏi... 🧩</div>
        </div>
    );

    // 🏆 Result View Delegation
    if (showResult) {
        return <Result score={finalScore} results={results} quizId={quizId} onRestart={() => window.location.reload()} />;
    }

    // 📝 Question View
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-page-container">

            {/* 1. Header (Progress) */}
            <div className="quiz-header">
                <div className="progress-label">
                    <span>Câu {currentIndex + 1}</span>
                    <span className="opacity-50">/{questions.length}</span>
                </div>
                <div className="glass-progress-track">
                    <div className="glass-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* 2. Content */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="question-anim-wrapper"
                >
                    {/* Floating Question Panel */}
                    <div className="question-glass-panel">
                        <div className="question-badge">{quizInfo.category || 'Câu Hỏi'}</div>
                        <h2 className="question-text">
                            {q.question_text}
                        </h2>
                    </div>

                    {/* Giant Answer Buttons */}
                    <div className="answers-grid">
                        <button onClick={() => handleAnswer(false)} className="glass-answer-btn">
                            <div className="option-letter-circle">A</div>
                            {q.option_a}
                        </button>
                        <button onClick={() => handleAnswer(true)} className="glass-answer-btn">
                            <div className="option-letter-circle" style={{ background: '#E0F2FE' }}>B</div>
                            {q.option_b}
                        </button>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
    );
}