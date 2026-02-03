import { useState } from 'react';
import { calculateResultIndex } from '../logic/scoring';

export const useQuiz = (questions) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    const handleAnswer = (isOptionB) => {
        const newAnswers = [...answers, isOptionB];
        if (currentIndex < questions.length - 1) {
            setAnswers(newAnswers);
            setCurrentIndex(currentIndex + 1);
        } else {
            // 퀴즈 종료 및 결과 인덱스 반환
            return calculateResultIndex(newAnswers);
        }
        return null;
    };

    return { currentIndex, handleAnswer };
};
