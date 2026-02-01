import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 사장님의 설정 파일 경로 확인

export default function QuizSystem({ quizId = 3 }) { // Default quizId to 3 for testing
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // 1. 창고(Supabase)에서 문제 5개 가져오기
    useEffect(() => {
        const fetchQuestions = async () => {
            const { data } = await supabase
                .from('questions')
                .select('*')
                .eq('quiz_id', quizId)
                .order('order_number', { ascending: true });
            setQuestions(data || []);
        };
        fetchQuestions();
    }, [quizId]);

    // 2. 답변 클릭 시 다음 문제로 이동하는 로직
    const handleAnswer = (score) => {
        const nextScore = totalScore + (score || 0);
        setTotalScore(nextScore);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResult(true);
        }
    };

    if (questions.length === 0) return <div className="p-10 text-pink-500 font-black">로딩 중... (문제 ID: {quizId})</div>;

    // 3. 결과 화면 (공유하기 좋은 핑크 키치 디자인)
    if (showResult) {
        return (
            <div className="min-h-screen bg-[#FFF0F6] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-white border-[8px] border-black p-8 shadow-[15px_15px_0px_0px_#FF69B4] text-center">
                    <h2 className="text-pink-500 font-black italic mb-2">QUIZ RESULT</h2>
                    <h1 className="text-4xl font-black text-black mb-6 uppercase leading-none">
                        {totalScore >= 3 ? "👑 호치민 만렙 족제비" : "🐣 샌님 카공족"}
                    </h1>
                    <div className="w-full h-48 bg-gray-100 border-4 border-black mb-6">
                        {/* 여기에 결과 이미지가 들어갑니다 */}
                        <img src="https://api.dicebear.com/9.x/micah/svg?seed=result" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-bold text-lg mb-8 text-gray-800">
                        {totalScore >= 3
                            ? "당신은 이미 사이공의 매연을 향수로 느끼는 경지에 올랐군요!"
                            : "아직은 에어컨 빵빵한 1군 카페가 더 어울리는 초보입니다."}
                    </p>
                    <button className="w-full bg-[#00FF00] border-4 border-black font-black py-4 text-xl shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                        결과 이미지 저장하기 📸
                    </button>
                </div>
            </div>
        );
    }

    // 4. 문제 화면 (2지선다형 5문제)
    const q = questions[currentIndex];
    return (
        <div className="min-h-screen bg-[#FFF0F6] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* 진행률 표시바 */}
                <div className="w-full bg-white border-4 border-black h-6 mb-8">
                    <div
                        className="bg-pink-500 h-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-white border-[6px] border-black p-6 shadow-[10px_10px_0px_0px_#000]">
                    <h3 className="text-pink-500 font-black mb-2">QUESTION {q.order_number} / 5</h3>
                    <h2 className="text-2xl font-black text-black mb-8 leading-tight">{q.question_text}</h2>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleAnswer(q.score_a)}
                            className="bg-pink-100 hover:bg-pink-500 hover:text-white border-4 border-black p-5 font-black text-left transition-colors"
                        >
                            A. {q.option_a}
                        </button>
                        <button
                            onClick={() => handleAnswer(q.score_b)}
                            className="bg-pink-100 hover:bg-pink-500 hover:text-white border-4 border-black p-5 font-black text-left transition-colors"
                        >
                            B. {q.option_b}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
