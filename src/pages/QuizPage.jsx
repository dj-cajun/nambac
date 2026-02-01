import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

export default function QuizPage({ quizIdProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const quizId = id || quizIdProp || 1;

    const [quizInfo, setQuizInfo] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
            setQuizInfo(quiz);

            const { data: qs } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order_number', { ascending: true });
            setQuestions(qs || []);
        };
        fetchData();
    }, [quizId]);

    const handleAnswer = (score) => {
        // [수정됨] 0점도 유효한 점수이므로 ?? 연산자 사용
        setTotalScore(prev => prev + (score ?? 0));
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    if (!quizInfo || questions.length === 0) return (
        <div className="min-h-screen bg-[#FFF0F6] flex items-center justify-center font-black text-pink-500 animate-pulse">
            LOADING VIBES... ☁️
        </div>
    );

    // 🏆 결과 화면: 분석형 리포트 디자인
    if (showResult) {
        // [수정됨] 8가지 성향(Types) 매핑 로직
        // 총점(0~7)에 따라 결과 텍스트를 결정합니다.
        // 추후 API 연동 시 quizInfo.results 배열에서 가져오도록 변경 가능
        const resultTypes = [
            { id: 0, title: "TYPE 1: 000", desc: "Pure Option A" },
            { id: 1, title: "TYPE 2: 001", desc: "First Axis Variant" },
            { id: 2, title: "TYPE 3: 010", desc: "Second Axis Variant" },
            { id: 3, title: "TYPE 4: 011", desc: "Hybrid Variant A" },
            { id: 4, title: "TYPE 5: 100", desc: "Third Axis Variant" },
            { id: 5, title: "TYPE 6: 101", desc: "Hybrid Variant B" },
            { id: 6, title: "TYPE 7: 110", desc: "Hybrid Variant C" },
            { id: 7, title: "TYPE 8: 111", desc: "Pure Option B" },
        ];
        
        // 범위 체크 안전장치 (0~7 범위를 벗어나면 마지막 타입 보여줌)
        const safeScore = Math.min(Math.max(totalScore, 0), 7);
        const resultData = resultTypes[safeScore];
        
        return (
            <div className="min-h-screen bg-[#FFD1E8] flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white border-[8px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* 헤더 */}
                    <div className="bg-black p-3 flex justify-between items-center">
                        <span className="text-white font-mono text-xs">REPORT_ID: {quizId}_{safeScore}</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h1 className="text-4xl font-black text-center mb-6 leading-none tracking-tight">
                            VIBE ANALYSIS<br/><span className="text-pink-500">COMPLETE</span>
                        </h1>

                        {/* 통합 이미지 */}
                        <div className="border-4 border-black mb-6 relative group">
                            <img src={quizInfo.image_url} className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="result" />
                            <div className="absolute bottom-0 left-0 bg-yellow-400 border-t-4 border-r-4 border-black px-3 py-1 font-black text-sm">
                                SCORE: {totalScore}
                            </div>
                        </div>

                        {/* 분석 항목 */}
                        <div className="bg-gray-100 border-4 border-black p-4 mb-6 font-mono text-sm">
                            <p className="mb-2 border-b-2 border-dashed border-gray-400 pb-2">
                                <span className="font-bold">▶ YOUR ARCHETYPE:</span>
                            </p>
                            <h2 className="text-2xl font-black mb-2">{resultData.title}</h2>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                {resultData.desc}
                            </p>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate('/')} className="bg-white border-4 border-black py-3 font-black hover:bg-gray-100">
                                HOME 🏠
                            </button>
                            <button className="bg-pink-500 text-white border-4 border-black py-3 font-black hover:bg-pink-600 shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                                SHARE 🔗
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 📝 문제 화면: 배경 이미지 + 핑크 박스 오버레이
    const q = questions[currentIndex];
    
    // 배경 이미지: 문제별 이미지가 있으면 쓰고, 없으면 퀴즈 메인 이미지 사용
    const bgImage = q.image_url || quizInfo.image_url;

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
            {/* 배경 레이어 (블러 처리 및 어둡게) */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 blur-sm scale-110"
                style={{ backgroundImage: `url(${bgImage})` }}
            ></div>
            
            {/* 노이즈/그리드 패턴 오버레이 (키치함 추가) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="w-full max-w-md p-4 relative z-10">
                {/* 진행 상태 */}
                <div className="flex justify-between items-end mb-4 text-white font-black drop-shadow-[2px_2px_0px_#000]">
                    <span className="text-xl italic">Q.{currentIndex + 1}</span>
                    <span className="text-sm opacity-80">{currentIndex + 1} / {questions.length}</span>
                </div>
                
                {/* 메인 핑크 박스 */}
                <div className="bg-[#FF69B4] border-[6px] border-black p-1 shadow-[12px_12px_0px_0px_#000] rotate-1 transition-transform duration-300 hover:rotate-0">
                    <div className="bg-white border-[4px] border-black p-6 h-full flex flex-col items-center text-center">
                        {/* 문제별 썸네일 (작게 중앙 배치) */}
                        {q.image_url && (
                            <div className="w-24 h-24 border-4 border-black mb-6 -mt-12 bg-yellow-300 rotate-3 shadow-md">
                                <img src={q.image_url} className="w-full h-full object-cover" alt="Q" />
                            </div>
                        )}

                        <h2 className="text-2xl font-black text-black mb-8 break-keep leading-snug">
                            {q.question_text}
                        </h2>

                        <div className="w-full flex flex-col gap-4">
                            <button 
                                onClick={() => handleAnswer(q.score_a ?? 0)}
                                className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black border-4 border-transparent hover:border-black py-4 font-bold text-lg transition-all transform hover:-translate-y-1"
                            >
                                A. {q.option_a}
                            </button>
                            <button 
                                onClick={() => handleAnswer(q.score_b ?? 0)}
                                className="w-full bg-white text-black border-4 border-black hover:bg-pink-200 py-4 font-bold text-lg transition-all transform hover:-translate-y-1"
                            >
                                B. {q.option_b}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 데코 */}
                <div className="mt-8 text-center">
                    <span className="bg-white border-2 border-black px-3 py-1 font-mono text-xs font-bold tracking-widest">
                        NAMBAC.XYZ OFFICIAL
                    </span>
                </div>
            </div>
        </div>
    );
}