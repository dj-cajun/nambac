import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchQuizBundle } from '../lib/quizApi';
import { buildShareUrl, getOgDefaultImageUrl } from '../lib/siteUrl';
import { getImageUrl } from '../lib/apiConfig';
import './ShareRedirect.css';

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
    const ogImage = resultData ? getImageUrl(resultData.image_url) : getOgDefaultImageUrl();

    if (loading) {
        return (
            <div className="share-redirect-page flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4" />
                    <p className="font-black text-[#FF2D85]">Đang tải kết quả...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="share-redirect-page">
            <Helmet>
                <title>{`[${resultTitle}] — nambac.xyz`}</title>
                <meta name="description" content={displayDescription || 'Trắc nghiệm tính cách AI nambac.xyz'} />
                <meta property="og:title" content={`Kết quả của tôi: [${resultTitle}]!`} />
                <meta property="og:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : buildShareUrl(`/share/${quizId}/${score}`)} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="vi_VN" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`Kết quả của tôi: [${resultTitle}]!`} />
                <meta name="twitter:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta name="twitter:image" content={ogImage} />
            </Helmet>

            <div className="share-redirect-card">
                <div className="share-redirect-header">
                    <h1 className="share-redirect-heading">KẾT QUẢ CỦA TÔI</h1>
                </div>

                {resultData && (
                    <div className="share-redirect-body">
                        <div className="share-redirect-img-wrap">
                            <img
                                src={getImageUrl(resultData.image_url)}
                                alt={resultTitle}
                                className="share-redirect-img"
                            />
                        </div>
                    </div>
                )}

                <div className="share-redirect-footer">
                    <h2 className="share-redirect-title">{resultTitle}</h2>
                    <p className="share-redirect-desc">{resultData?.description}</p>

                    {resultData?.traits && (
                        <div className="share-redirect-traits">
                            {resultData.traits.map((trait, i) => (
                                <span key={i} className="share-redirect-trait-tag">#{trait}</span>
                            ))}
                        </div>
                    )}

                    {score !== undefined && (
                        <button
                            type="button"
                            className="share-redirect-btn match-btn"
                            onClick={() => navigate(`/quiz/${quizId}?matchFriendScore=${score}`)}
                        >
                            So Kèo Hợp Nhau 🥤
                        </button>
                    )}

                    <button
                        type="button"
                        className="share-redirect-btn play-btn"
                        onClick={() => navigate(`/quiz/${quizId}`)}
                    >
                        Chơi thử Quiz này 🚀
                    </button>

                    <p className="share-redirect-note">Chia sẻ qua nambac.xyz</p>
                </div>
            </div>
        </div>
    );
};

export default ShareRedirect;
