import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import AdSenseUnit from '../components/AdSenseUnit';
import { AD_SLOTS } from '../lib/adsConfig';
import { trackQuizComplete, trackShare } from '../lib/analytics';
import './Result.css';
import { getImageUrl } from '../lib/apiConfig';
import { fetchQuizResults, fetchQuizzes as loadQuizzes, incrementQuizStat } from '../lib/quizApi';
import { buildShareUrl, buildOgImageUrl } from '../lib/siteUrl';
import { copyShareLinkWithFeedback } from '../lib/copyShareLink';
import CopyToast from '../components/CopyToast';
import { useCopyToast } from '../hooks/useCopyToast';

const Result = () => {
    const navigate = useNavigate();
    const { id: quizIdParam } = useParams();
    const [searchParams] = useSearchParams(); // Needs import
    const score = parseInt(searchParams.get('score'));

    const cardRef = useRef(null);

    // passed props are gone, so we need local state
    const [results, setResults] = useState([]);
    const [finalResult, setFinalResult] = useState({ title: "Đang tải...", description: "", image_url: "" });
    const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);
    const { toast, showToast } = useCopyToast();

    // Fetch Results if not present
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await fetchQuizResults(quizIdParam);
                if (data?.length) setResults(data);
            } catch (err) {
                console.error("Failed to fetch results", err);
            }
        };
        fetchResults();
    }, [quizIdParam]);

    useEffect(() => {
        if (results && results.length > 0) {
            const match = results.find(r => parseInt(r.result_code) === score) || results[0];
            if (match) {
                setFinalResult(match);
                if (quizIdParam && !Number.isNaN(score)) {
                    trackQuizComplete(quizIdParam, score);
                }
            }
        }
    }, [score, results, quizIdParam]);

    // Fetch recommended quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const all = await loadQuizzes();
                setRecommendedQuizzes(all.filter(q => q.id !== quizIdParam).slice(0, 8));
            } catch (err) {
                console.error('Failed to fetch recommended quizzes:', err);
            }
        };
        fetchQuizzes();
    }, [quizIdParam]);

    // Share URL for SSR OG tags (crawlers hit this, users get redirected to quiz start)
    const shareUrl = buildShareUrl(`/share/${quizIdParam}/${score}`);
    const resultHashtags = finalResult.traits?.map((t) => `#${t}`).join(' ') || '';
    const ogDescription = resultHashtags
        ? `${finalResult.description}\n\n${resultHashtags}`
        : finalResult.description;
    const ogImageUrl = buildOgImageUrl(quizIdParam, score);

    const renderDescription = (text = "") => {
        return <span dangerouslySetInnerHTML={{ __html: text.replace(/\\n/g, '<br/>') }} />;
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // High resolution
                backgroundColor: '#ffffff'
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `nambac-result-${quizIdParam}-${score}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download image", err);
            alert("Có lỗi xảy ra khi tải ảnh! Bạn hãy chụp màn hình kết quả nhé.");
        }
    };

    const handleShareLink = async () => {
        const ok = await copyShareLinkWithFeedback(shareUrl, showToast);
        if (!ok) return;
        trackShare('copy', quizIdParam, score);
        if (!window.__sharedQuiz?.[quizIdParam]) {
            incrementQuizStat(quizIdParam, 'share').catch(console.error);
            window.__sharedQuiz = { ...(window.__sharedQuiz || {}), [quizIdParam]: true };
        }
    };

    return (
        <div className="result-page-container">
            <Helmet>
                <title>{`[${finalResult.type_name || finalResult.title}] - nambac.xyz`}</title>
                <meta name="description" content={finalResult.description} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`[${finalResult.type_name || finalResult.title}] — nambac.xyz`} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={shareUrl} />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={finalResult.type_name || finalResult.title} />
                <meta property="twitter:description" content={ogDescription} />
                <meta property="twitter:image" content={ogImageUrl} />
            </Helmet>

            {/* Header removed as per request */}

            {/* Main Content */}
            <main className="result-main">

                {/* Result Card - Unified Image Style */}
                <div className="result-unified-card" ref={cardRef}>
                    <div className="result-image-wrap">
                        <img
                            src={getImageUrl(finalResult.image_url)}
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                            alt="Result Character"
                            className="result-full-img"
                        />
                    </div>

                    <div className="result-text-panel">
                        <div className="result-title-badge">
                            {finalResult.type_name || finalResult.title}
                        </div>

                        <p className="result-description-text">
                            {renderDescription(finalResult.description)}
                        </p>

                        {finalResult.traits && finalResult.traits.length > 0 && (
                            <div className="result-traits">
                                {finalResult.traits.map((trait, i) => (
                                    <span key={i} className="trait-tag">#{trait}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AdSense Slot (Below Result Image) */}
                <AdSenseUnit adSlot={AD_SLOTS.result1} location="result-bottom-1" />
                <AdSenseUnit adSlot={AD_SLOTS.result2} location="result-bottom-2" />

                {/* Recommended Quizzes Section */}
                {recommendedQuizzes.length > 0 && (
                    <div className="recommended-section">
                        <h3 className="recommended-title">Đề xuất cho bạn</h3>
                        <div className="recommended-grid">
                            {recommendedQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="recommended-card"
                                    onClick={() => { navigate(`/quiz/${quiz.id}`); }}
                                >
                                    <img
                                        src={getImageUrl(quiz.thumbnail_url || quiz.image_url)}
                                        alt={quiz.title}
                                        className="recommended-thumbnail"
                                        onError={(e) => { e.target.src = "/images/default_cover.png" }}
                                    />
                                    <span className="recommended-card-title">{quiz.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Modal Bar — slides up on mount */}
            <motion.div
                className="result-bottom-bar"
                initial={{ y: '150%' }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className="bar-actions">
                    <button className="restart-btn" onClick={() => navigate(`/quiz/${quizIdParam}`)}>
                        <span className="btn-label">CHƠI LẠI</span>
                    </button>

                    {/* Download Image Button */}
                    <button className="download-action-btn" onClick={handleDownloadImage}>
                        <Download size={20} />
                        <span className="btn-label">TẢI ẢNH</span>
                    </button>

                    <div className="share-btn-wrap">
                        <CopyToast toast={toast} anchored />
                        <button type="button" className="share-btn" onClick={handleShareLink} aria-label="Sao chép link chia sẻ">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Result;
