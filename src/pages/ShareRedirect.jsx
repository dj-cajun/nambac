import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchQuizBundle } from '../lib/quizApi';
import { getImageUrl } from '../lib/apiConfig';

const ShareRedirect = () => {
    const { id: quizId, score } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResultInfo = async () => {
            try {
                setLoading(true);
                const bundle = await fetchQuizBundle(quizId);
                const result = (bundle.results || []).find(
                    (r) => parseInt(r.result_code) === parseInt(score)
                );

                if (result) {
                    setResultData({
                        ...result,
                        quizzes: { title: bundle.quiz?.title },
                    });
                }
            } catch (err) {
                console.error("Error fetching share preview:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResultInfo();
    }, [quizId, score]);

    const hashtags = resultData?.traits ? resultData.traits.map(t => `#${t}`).join(' ') : "";
    const displayDescription = resultData ? `${resultData.description}\n\n${hashtags}` : "";
    const resultTitle = resultData?.type_name || resultData?.title || 'Kết quả quiz';
    const ogImage = resultData ? getImageUrl(resultData.image_url) : 'https://nambac.xyz/og-default.png';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fff9fc]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FF2D85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-[#FF2D85]">Đang tải kết quả...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9fc] p-4 flex flex-col items-center justify-center font-['Be_Vietnam_Pro']">
            <Helmet>
                <title>{`[${resultTitle}] — nambac.xyz`}</title>
                <meta name="description" content={displayDescription || 'Trắc nghiệm tính cách AI nambac.xyz'} />
                <meta property="og:title" content={`Kết quả của tôi: [${resultTitle}]!`} />
                <meta property="og:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : `https://nambac.xyz/share/${quizId}/${score}`} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="vi_VN" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`Kết quả của tôi: [${resultTitle}]!`} />
                <meta name="twitter:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta name="twitter:image" content={ogImage} />
            </Helmet>

            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] rounded-[2rem] overflow-hidden">
                <div className="bg-[#FF2D85] p-6 text-center border-b-2 border-black">
                    <h1 className="text-white text-2xl font-black uppercase tracking-wider">
                        KẾT QUẢ CỦA TÔI
                    </h1>
                </div>

                {resultData && (
                    <div className="p-4">
                        <img 
                            src={getImageUrl(resultData.image_url)} 
                            alt={resultTitle}
                            className="w-full rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        />
                    </div>
                )}

                <div className="p-6 text-center">
                    <h2 className="text-2xl font-black mb-4 text-[#1a1a1a]">
                        {resultTitle}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {resultData?.description}
                    </p>

                    {resultData?.traits && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {resultData.traits.map((trait, i) => (
                                <span key={i} className="bg-pink-50 text-[#FF2D85] px-3 py-1 rounded-full text-sm font-bold border border-[#FF2D85]">
                                    #{trait}
                                </span>
                            ))}
                        </div>
                    )}

                    {score !== undefined && (
                        <button 
                            onClick={() => navigate(`/quiz/${quizId}?matchFriendScore=${score}`)}
                            className="w-full py-4 bg-[#FFD700] text-black font-black text-xl rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-[2px] active:shadow-none transition-all uppercase mb-4"
                        >
                            So Kèo Hợp Nhau 🥤
                        </button>
                    )}

                    <button 
                        onClick={() => navigate(`/quiz/${quizId}`)}
                        className="w-full py-4 bg-[#00C2FF] text-white font-black text-xl rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-[2px] active:shadow-none transition-all uppercase"
                    >
                        Chơi thử Quiz này 🚀
                    </button>
                    
                    <p className="mt-4 text-xs text-gray-400">
                        Chia sẻ qua nambac.xyz
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareRedirect;
