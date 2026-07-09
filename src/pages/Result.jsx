import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, Share2, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import AdSenseUnit from '../components/AdSenseUnit';
import { AD_SLOTS } from '../lib/adsConfig';
import { trackQuizComplete, trackShare } from '../lib/analytics';
import './Result.css';
import { getImageUrl } from '../lib/apiConfig';
import { fetchQuizResults, fetchQuizzes as loadQuizzes, incrementQuizStat } from '../lib/quizApi';
import { hasQuizLikedThisSession, trackQuizLikeOnce } from '../lib/quizRanking';
import { buildShareUrl, buildOgImageUrl } from '../lib/siteUrl';
import { recordPlayerQuizComplete } from '../lib/playerGrade';
import { markTodayDone } from '../lib/todayDone';
import { copyShareLinkWithFeedback } from '../lib/copyShareLink';
import CopyToast from '../components/CopyToast';
import ZaloShareButton from '../components/ZaloShareButton';
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
    const [liked, setLiked] = useState(() => hasQuizLikedThisSession(quizIdParam));
    const [likeCount, setLikeCount] = useState(0);
    const [playerGrade, setPlayerGrade] = useState(null);
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
                    recordPlayerQuizComplete(quizIdParam, score).then((data) => {
                        if (data?.grade) {
                            setPlayerGrade(data);
                            window.dispatchEvent(new CustomEvent('nambac:grade-updated', { detail: data }));
                        }
                    });
                }
                markTodayDone('quiz');
            }
        }
    }, [score, results, quizIdParam]);

    // Fetch recommended quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const all = await loadQuizzes();
                const current = all.find((q) => q.id === quizIdParam);
                if (current) setLikeCount(current.like_count || 0);
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
            const { default: html2canvas } = await import('html2canvas');
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

    const handleZaloShare = () => {
        trackShare('tag_friends', quizIdParam, score);
        if (!window.__sharedQuiz?.[quizIdParam]) {
            incrementQuizStat(quizIdParam, 'share').catch(console.error);
            window.__sharedQuiz = { ...(window.__sharedQuiz || {}), [quizIdParam]: true };
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

    const handleLike = async () => {
        if (liked || !trackQuizLikeOnce(quizIdParam)) return;
        setLiked(true);
        setLikeCount((n) => n + 1);
        try {
            const data = await incrementQuizStat(quizIdParam, 'like');
            if (typeof data.like_count === 'number') setLikeCount(data.like_count);
        } catch {
            setLiked(false);
            setLikeCount((n) => Math.max(0, n - 1));
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

                {playerGrade?.grade && (
                    <div className={`result-grade-card${playerGrade.leveledUp ? ' is-level-up' : ''}`}>
                        <div className="result-grade-header">
                            <span className="result-grade-emoji" aria-hidden="true">{playerGrade.grade.emoji}</span>
                            <div>
                                <p className="result-grade-kicker">
                                    {playerGrade.isFirstEver
                                        ? 'Hạng của bạn'
                                        : playerGrade.leveledUp
                                            ? 'Thăng hạng!'
                                            : 'Hạng hiện tại'}
                                </p>
                                <p className="result-grade-title">{playerGrade.grade.label}</p>
                            </div>
                        </div>
                        <p className="result-grade-meta">
                            {playerGrade.uniqueQuizzes} quiz đã chơi
                            {playerGrade.nextGrade
                                ? ` · còn ${playerGrade.nextGrade.remaining} quiz tới ${playerGrade.nextGrade.emoji} ${playerGrade.nextGrade.label}`
                                : ' · max rank!'}
                        </p>
                        {playerGrade.nextGrade && (
                            <div className="result-grade-progress" aria-hidden="true">
                                <div
                                    className="result-grade-progress-fill"
                                    style={{ width: `${playerGrade.progressPercent || 0}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

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

                <section className="result-brand-cta" aria-label="Hợp tác thương hiệu">
                    <p className="result-brand-cta-kicker">Cho brand/agency</p>
                    <h3>Muốn làm quiz viral cho chiến dịch của bạn?</h3>
                    <p>
                        Tạo quiz theo insight khách hàng, có hình AI riêng và báo cáo realtime.
                        Hợp tác nhanh trong 24-48h.
                    </p>
                    <button
                        type="button"
                        className="result-brand-cta-btn"
                        onClick={() => navigate('/brands')}
                    >
                        Nhận proposal từ nambac
                    </button>
                </section>
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

                    <div className="tag-friends-zalo-wrap" aria-label="Chia sẻ Zalo — tag 3 bạn">
                        <ZaloShareButton
                            fillParent
                            url={shareUrl}
                            label="TAG 3 BẠN"
                            title="nambac.xyz"
                            text="Xem kết quả này trên nambac — tag 3 bạn ngay!"
                            onShared={handleZaloShare}
                            onToast={showToast}
                        />
                    </div>

                    {/* Download Image Button */}
                    <button className="download-action-btn" onClick={handleDownloadImage}>
                        <Download size={20} />
                        <span className="btn-label">TẢI ẢNH</span>
                    </button>

                    <div className="share-btn-wrap">
                        <CopyToast toast={toast} anchored />
                        <button
                            type="button"
                            className={`result-like-btn${liked ? ' is-liked' : ''}`}
                            onClick={handleLike}
                            disabled={liked}
                            aria-label={liked ? 'Đã thích' : 'Thích kết quả'}
                        >
                            <Heart size={22} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
                            <span className="result-like-count">{likeCount.toLocaleString()}</span>
                        </button>
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
