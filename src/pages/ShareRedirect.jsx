import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchQuizBundle } from '../lib/quizApi';
import { buildShareUrl, buildOgImageUrl } from '../lib/siteUrl';
import './ShareRedirect.css';

function stripHtml(text = '') {
  return String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

const ShareRedirect = () => {
    const { id: quizId, score } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    const isResultShare = score !== undefined && score !== null && score !== '';

    useEffect(() => {
        const fetchSharePreview = async () => {
            try {
                setLoading(true);
                const bundle = await fetchQuizBundle(quizId);
                setQuizData(bundle.quiz || null);

                if (isResultShare) {
                    const result = (bundle.results || []).find(
                        (r) => parseInt(r.result_code, 10) === parseInt(score, 10),
                    );
                    setResultData(result || null);
                } else {
                    setResultData(null);
                }
            } catch (err) {
                console.error('Error fetching share preview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSharePreview();
    }, [quizId, score, isResultShare]);

    const resultTitle = resultData?.type_name || resultData?.title || 'Kết quả quiz';
    const hashtags = resultData?.traits ? resultData.traits.map((t) => `#${t}`).join(' ') : '';
    const displayDescription = isResultShare && resultData
        ? `${stripHtml(resultData.description)}\n\n${hashtags}`.trim()
        : stripHtml(quizData?.description || '');

    const ogTitle = isResultShare && resultData
        ? `[${resultTitle}] — ${quizData?.title || 'nambac.xyz'}`
        : `${quizData?.title || 'Quiz'} | nambac.xyz`;

    const ogImage = buildOgImageUrl(quizId, isResultShare ? score : null);
    const sharePath = isResultShare
        ? `/share/${quizId}/${score}`
        : `/share/${quizId}`;

    if (loading) {
        return (
            <div className="share-redirect-page flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4" />
                    <p className="font-black text-[#FF2D85]">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="share-redirect-page">
            <Helmet>
                <title>{ogTitle}</title>
                <meta name="description" content={displayDescription || 'Trắc nghiệm tính cách AI nambac.xyz'} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : buildShareUrl(sharePath)} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="vi_VN" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={ogTitle} />
                <meta name="twitter:description" content={displayDescription || 'Thử quiz này trên nambac.xyz!'} />
                <meta name="twitter:image" content={ogImage} />
            </Helmet>

            <div className="share-redirect-card">
                <div className="share-redirect-header">
                    <p className="share-redirect-badge">
                        {isResultShare ? 'KẾT QUẢ NAMBAC.XYZ' : 'QUIZ NAMBAC.XYZ'}
                    </p>
                    {quizData?.title && (
                        <p className="share-redirect-quiz-label">{quizData.title}</p>
                    )}
                </div>

                <div className="share-redirect-body">
                    <div className="share-redirect-img-wrap">
                        <img
                            src={ogImage}
                            alt={isResultShare ? resultTitle : quizData?.title || 'Quiz'}
                            className="share-redirect-img share-redirect-og-preview"
                        />
                    </div>
                </div>

                <div className="share-redirect-footer">
                    {isResultShare && resultData ? (
                        <>
                            <h2 className="share-redirect-title">{resultTitle}</h2>
                            <p className="share-redirect-desc">{stripHtml(resultData.description)}</p>
                            {resultData.traits?.length > 0 && (
                                <div className="share-redirect-traits">
                                    {resultData.traits.map((trait, i) => (
                                        <span key={i} className="share-redirect-trait-tag">#{trait}</span>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="share-redirect-title">{quizData?.title}</h2>
                            <p className="share-redirect-desc">{stripHtml(quizData?.description)}</p>
                        </>
                    )}

                    {isResultShare && (
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
