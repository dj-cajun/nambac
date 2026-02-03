import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Share2, Home, RotateCcw } from 'lucide-react';
import './Result.css';

const Result = ({ score, results, quizId, onRestart }) => {
    const navigate = useNavigate();

    // 1. Calculate Result Logic
    // Find the result that matches the score. 
    // Assuming result_code is the exact score or a threshold. 
    // For now, let's find the closest match or exact match.
    // If results is empty, use the fallback.

    const [finalResult, setFinalResult] = useState({
        title: "CURSING GRANDMA DEALER",
        description: "Your results show a chaotic blend of unhinged energy and master of chaos. You possess the rare ability to deal facts with the intensity of a grandmother who has seen it all and isn't afraid to say it.\n\nKey phrases like \"absolute menace\" and \"no filters\" highlight your unique frequency in this digital landscape.",
        image_url: "/images/grandma_roast_standing.png" // Static fallback
    });

    useEffect(() => {
        if (results && results.length > 0) {
            // Logic: Find result with result_code closest to score
            // Or exact match. Let's assume exact match for now based on typical quiz logic, 
            // or if it's a range, we might need more complex logic. 
            // Given matching 3-bit logic in previous turns, it might be exact.

            // Simple match:
            const match = results.find(r => parseInt(r.result_code) === score) || results[0];

            if (match) {
                setFinalResult({
                    title: match.title,
                    description: match.description,
                    image_url: match.image_url || "/images/grandma_roast_standing.png" // Use dynamic if avail, else static
                });
            }
        }
    }, [score, results]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#2d1b2e] to-purple-900 font-sans flex flex-col items-center justify-start p-4 relative overflow-y-auto overflow-x-hidden">

            {/* Ambient Noise Overlay */}
            <div className="fixed inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>

            {/* Container */}
            <div className="w-full max-w-md z-10 flex flex-col items-center gap-6 pb-32 pt-12">

                {/* 1. Header Section */}
                <div className="text-center w-full space-y-4">
                    <p className="text-white font-bold text-xl tracking-wider uppercase drop-shadow-md animate-pulse">
                        YOUR FACT-BOMB RESULT...
                    </p>

                    {/* Giant Pink Glass Banner */}
                    <div className="glass-banner-pink py-4 px-2 relative z-20 hover:scale-105 transition-transform duration-300">
                        <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight leading-none text-stroke-white drop-shadow-md font-['Jua']">
                            [{finalResult.title}]
                        </h1>
                    </div>
                </div>

                {/* 2. Stickers / Decorations */}
                <div className="flex justify-center gap-4 w-full">
                    <span className="sticker-tag bg-[#fbd400] transform -rotate-3">#FACTBOMB</span>
                    <span className="sticker-tag bg-[#4ade80] transform rotate-2">#NOFILTER</span>
                </div>

                {/* 3. Main Analysis Card (Glass Panel) */}
                <div className="glass-panel w-full my-4 flex flex-col overflow-hidden relative">

                    {/* Image Area */}
                    <div className="w-full h-72 bg-[#edb88b] flex items-end justify-center border-b-[3px] border-black relative">
                        {/* Retro Sun Effect */}
                        <div className="absolute top-4 left-4 w-16 h-16 bg-orange-400 rounded-full border-2 border-black opacity-50"></div>

                        <img
                            src={finalResult.image_url}
                            onError={(e) => { e.target.src = "/images/grandma_roast_standing.png" }} // Double fallback
                            alt="Result Character"
                            className="w-64 h-64 object-contain transform translate-y-2 drop-shadow-2xl z-10"
                        />
                    </div>

                    {/* Text Area */}
                    <div className="p-8 bg-black/40 backdrop-blur-md">
                        <div className="inline-block relative mb-4">
                            <h2 className="text-white font-black text-2xl uppercase relative z-10 px-1 border-b-4 border-[#ff2d85]">
                                THE ANALYSIS
                            </h2>
                        </div>

                        <p className="text-white font-medium leading-relaxed text-[17px] drop-shadow-md whitespace-pre-wrap">
                            {/* Simple keyword highlighting simulation */}
                            {finalResult.description.split(" ").map((word, i) => {
                                // Randomly highlight some words for that 'highlighter' feel if it's a long description
                                // Or purely render text. Let's just render slightly stylized.
                                if (word.length > 7 && i % 5 === 0) {
                                    return <span key={i} className="highlighter-yellow mr-1">{word}</span>
                                }
                                return word + " ";
                            })}
                        </p>
                    </div>
                </div>

                {/* 4. Rarity Metric */}
                <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-end px-2">
                        <span className="text-white font-black text-lg uppercase drop-shadow-md">RARITY METRIC</span>
                        <div className="bg-[#fbd400] text-black px-3 py-1 rounded-full font-bold text-xs border-[2px] border-black shadow-[2px_2px_0px_black] animate-bounce-subtle">
                            Top 3% Rarity!
                        </div>
                    </div>
                    <div className="w-full h-8 bg-black/50 rounded-full border-[3px] border-black overflow-hidden relative p-1">
                        <div className="h-full w-[97%] bg-[#ff2d85] rounded-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-l from-white/30 to-transparent"></div>
                        </div>
                    </div>
                </div>

                {/* 5. Footer Buttons (King-Bad Style) */}
                <div className="w-full flex flex-col gap-4">
                    {/* Save */}
                    <button className="
                        w-full py-4 
                        bg-[#ff2d85] hover:bg-[#ff006e]
                        text-white font-black text-xl uppercase tracking-wide
                        rounded-[2rem]
                        comic-outline comic-shadow-lg
                        active:translate-x-1 active:translate-y-1 active:shadow-none
                        transition-all duration-150
                        flex items-center justify-center gap-2
                     ">
                        <Download size={28} strokeWidth={3} />
                        SAVE IMAGE
                    </button>

                    {/* Share */}
                    <button className="
                        w-full py-4 
                        bg-[#3b82f6] hover:bg-[#2563eb]
                        text-white font-black text-xl uppercase tracking-wide
                        rounded-[2rem]
                        comic-outline comic-shadow-lg
                        active:translate-x-1 active:translate-y-1 active:shadow-none
                        transition-all duration-150
                        flex items-center justify-center gap-2
                     ">
                        <Share2 size={28} strokeWidth={3} />
                        SHARE THE ROAST
                    </button>

                    {/* Home / Restart */}
                    <button
                        className="
                           mt-2 py-3
                           bg-white hover:bg-gray-100
                           text-black font-black text-lg uppercase
                           rounded-[1.5rem]
                           comic-outline comic-shadow
                           active:translate-x-1 active:translate-y-1 active:shadow-none
                           transition-all duration-150
                           flex items-center justify-center gap-2
                        "
                        onClick={() => navigate('/')}
                    >
                        <Home size={20} strokeWidth={3} />
                        다음 팩폭 당하러 가기
                    </button>

                    <button
                        className="text-white/50 text-sm font-bold underline hover:text-white transition-colors"
                        onClick={onRestart}
                    >
                        다시하기 (Restart)
                    </button>
                </div>

                {/* Copyright */}
                <div className="text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-4">
                    GENERATED VIA FACT-BOMB AI © 2004-2024
                </div>

            </div>
        </div>
    );
};

export default Result;
