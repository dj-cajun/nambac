import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { getImageUrl } from '../lib/apiConfig';

const ShareRedirect = () => {
    const { id: quizId, score } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResultInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from('results')
                    .select('*, quizzes(title)')
                    .eq('quiz_id', quizId)
                    .eq('result_code', parseInt(score))
                    .single();
                
                if (data) {
                    setResultData(data);
                }
            } catch (err) {
                console.error("Error fetching share preview:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResultInfo();
    }, [quizId, score]);

    // Handle hashtags
    const hashtags = resultData?.traits ? resultData.traits.map(t => `#${t}`).join(' ') : "";
    const displayDescription = resultData ? `${resultData.description}\n\n${hashtags}` : "";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fff9fc]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FF2D85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-[#FF2D85]">Loading your result...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9fc] p-4 flex flex-col items-center justify-center font-['Be_Vietnam_Pro']">
            {resultData && (
                <Helmet>
                    <title>{`[${resultData.title}] - nambac.xyz`}</title>
                    <meta name="description" content={displayDescription} />
                    <meta property="og:title" content={`Kết quả của tôi là [${resultData.title}]!`} />
                    <meta property="og:description" content={displayDescription} />
                    <meta property="og:image" content={getImageUrl(resultData.image_url)} />
                    <meta property="og:url" content={window.location.href} />
                    <meta property="og:type" content="website" />
                </Helmet>
            )}

            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] rounded-[2rem] overflow-hidden">
                {/* Result Header */}
                <div className="bg-[#FF2D85] p-6 text-center border-b-2 border-black">
                    <h1 className="text-white text-2xl font-black uppercase tracking-wider">
                        MY RESULT
                    </h1>
                </div>

                {/* Result Image */}
                {resultData && (
                    <div className="p-4">
                        <img 
                            src={getImageUrl(resultData.image_url)} 
                            alt={resultData.title}
                            className="w-full rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        />
                    </div>
                )}

                {/* Result Details */}
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-black mb-4 text-[#1a1a1a]">
                        {resultData?.type_name || resultData?.title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {resultData?.description}
                    </p>

                    {/* Hashtags */}
                    {resultData?.traits && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {resultData.traits.map((trait, i) => (
                                <span key={i} className="bg-pink-50 text-[#FF2D85] px-3 py-1 rounded-full text-sm font-bold border border-[#FF2D85]">
                                    #{trait}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Call to Action */}
                    <button 
                        onClick={() => navigate(`/quiz/${quizId}`)}
                        className="w-full py-4 bg-[#00C2FF] text-white font-black text-xl rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] active:translate-y-[2px] active:shadow-none transition-all uppercase"
                    >
                        Try this Quiz 🚀
                    </button>
                    
                    <p className="mt-4 text-xs text-gray-400">
                        Shared via nambac.xyz
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareRedirect;
