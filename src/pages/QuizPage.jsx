import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { calculateScore } from '../logic/scoring';
import './QuizPage.css';

const MBTIQuiz = lazy(() => import('./MBTIQuiz'));
const CustomQuiz = lazy(() => import('./CustomQuiz'));
const NameInputQuiz = lazy(() => import('./NameInputQuiz'));
import { getImageUrl } from '../lib/apiConfig';
import { getCategoryLabel } from '../constants/categories';
import { fetchQuizBundle, incrementQuizStat } from '../lib/quizApi';
import { trackQuizViewOnce } from '../lib/quizRanking';
import AdSenseUnit from '../components/AdSenseUnit';
import { AD_SLOTS } from '../lib/adsConfig';
import { trackQuizStart, trackShare } from '../lib/analytics';
import QuizImage from '../components/QuizImage';
import { buildShareUrl, buildOgImageUrl } from '../lib/siteUrl';
import CopyToast from '../components/CopyToast';
import { useCopyToast } from '../hooks/useCopyToast';
import { copyShareLinkWithFeedback } from '../lib/copyShareLink';

export default function QuizPage({ quizIdProp }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const quizId = id || quizIdProp;

    const [quizInfo, setQuizInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast, showToast } = useCopyToast();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            if (!quizId) return;
            try {
                setLoading(true);
                
                const bundle = await fetchQuizBundle(quizId);
                const featureRoute = bundle.quiz?.config?.featureRoute;
                if (featureRoute) {
                    navigate(featureRoute, { replace: true });
                    return;
                }
                setQuizInfo(bundle.quiz);
                setQuestions(bundle.questions || []);
                setResults(bundle.results || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz data:', err);
                setLoading(false);
            }
        };

        fetchData();
        
        // Track view_count when quiz page loads (if not already tracked by Home)
        if (quizId && trackQuizViewOnce(quizId)) {
            incrementQuizStat(quizId, 'view').catch(console.error);
        }
    }, [quizId, navigate]);

    const handleStart = () => {
        setStarted(true);
        window.scrollTo(0, 0);
        trackQuizStart(quizId, quizInfo?.category);

        if (quizId && !window.__participatedQuiz?.[quizId]) {
            incrementQuizStat(quizId, 'participate').catch(console.error);
            window.__participatedQuiz = { ...(window.__participatedQuiz || {}), [quizId]: true };
        }
    };

    const handleAnswer = (isA) => {
        const newAnswers = [...answers, isA];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            window.scrollTo(0, 0);
        } else {
            setShowResult(true);
        }
    };

    const handleShareLink = async () => {
        const shareUrl = buildShareUrl(`/share/${quizId}`);
        const ok = await copyShareLinkWithFeedback(shareUrl, showToast);
        if (!ok) return;
        trackShare('copy', quizId);
        if (!window.__sharedQuiz?.[quizId]) {
            incrementQuizStat(quizId, 'share').catch(console.error);
            window.__sharedQuiz = { ...(window.__sharedQuiz || {}), [quizId]: true };
        }
    };

    if (loading) {
        return (
            <div className="quiz-page-container">
                <div className="loading-state">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="loading-spinner"
                    />
                    <p>Đang tải quiz...</p>
                </div>
            </div>
        );
    }

    if (!quizInfo) {
        return (
            <div className="quiz-page-container">
                <div className="error-state">
                    <h2>Oops! 🕸️</h2>
                    <p>Không tìm thấy quiz này rồi.</p>
                    <button className="glass-btn" onClick={() => navigate('/')}>Quay lại trang chủ</button>
                </div>
            </div>
        );
    }

    // --- Quiz Type Routing ---
    const quizType = quizInfo.quiz_type || 'binary_5q';

    if (quizType === 'name_input') {
        return (
            <Suspense fallback={<div className="quiz-loading">Đang tải...</div>}>
                <NameInputQuiz quizInfo={quizInfo} results={results} />
            </Suspense>
        );
    }

    if (quizType === 'mbti_12q') {
        return (
            <Suspense fallback={<div className="quiz-loading">Đang tải...</div>}>
                <MBTIQuiz quizInfo={quizInfo} questions={questions} results={results} />
            </Suspense>
        );
    }

    if (quizType === 'sponsor' || quizType === 'full_custom') {
        return (
            <Suspense fallback={<div className="quiz-loading">Đang tải...</div>}>
                <CustomQuiz quizInfo={quizInfo} questions={questions} results={results} />
            </Suspense>
        );
    }

    if (showResult) {
        const score = calculateScore(answers, questions);
        const matchFriendScore = searchParams.get('matchFriendScore');
        if (matchFriendScore !== null) {
            navigate(`/compatibility/${quizId}/${matchFriendScore}/${score}`);
        } else {
            navigate(`/quiz/${quizId}/result?score=${score}`);
        }
        return null; // Don't render anything while redirecting
    }

    // --- Intro View ---
    if (!started) {
        const playUrl = buildShareUrl(`/quiz/${quizId}`);

        return (
            <>
                <Helmet>
                    <title>{quizInfo.title} - nambac.xyz</title>
                    <meta name="description" content={quizInfo.description || quizInfo.title} />
                    <link rel="canonical" href={playUrl} />
                    <meta property="og:title" content={quizInfo.title} />
                    <meta property="og:description" content={quizInfo.description || quizInfo.title} />
                    <meta property="og:image" content={buildOgImageUrl(quizId)} />
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />
                    <meta property="og:url" content={playUrl} />
                    <meta property="twitter:card" content="summary_large_image" />
                </Helmet>
                
                <div className="quiz-intro-card full-screen-mode">
                    {/* Full Screen Cover Image */}
                    <div className="intro-image-container full-screen-bg">
                        <img
                            src={getImageUrl(quizInfo.image_url) || "/images/default_cover.png"}
                            alt={quizInfo.title}
                            className="intro-cover-img"
                            onError={(e) => { e.target.src = "/images/default_cover.png" }}
                        />
                        <div className="image-overlay-gradient-strong"></div>

                        {/* Category Tag (Top Left) */}
                        <div className="category-tag top-safe-area">{getCategoryLabel(quizInfo.category)}</div>

                        {/* Quiz title + description on cover bottom */}
                        <div className="intro-text-overlay">
                            <h1 className="intro-overlay-title">{quizInfo.title}</h1>
                            {quizInfo.description && (
                                <p className="intro-overlay-desc">{quizInfo.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Sheet (Navi Style) */}
                    <motion.div
                        initial={{ y: "150%" }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="intro-bottom-sheet"
                    >
                        <div className="sheet-actions">
                            <button className="start-sheet-btn" onClick={handleStart}>
                                <span className="btn-label">BẮT ĐẦU</span>
                            </button>

                            <div className="share-btn-wrap">
                                <CopyToast toast={toast} anchored />
                                <button
                                    type="button"
                                    className="share-btn"
                                    onClick={handleShareLink}
                                    aria-label="Sao chép link chia sẻ"
                                >
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    // --- Gameplay View ---
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-page-container">
            {/* Header & Progress */}
            <div className="quiz-header">
                <div className="progress-label">
                    <span>{currentIndex + 1}/{questions.length}</span>
                </div>
                <div className="glass-progress-track">
                    <div
                        className="glass-progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="question-anim-wrapper"
                >
                    {/* Question Card — image + text box below */}
                    <div className="question-unified-card question-text-below">
                        {currentQuestion.image_url && (
                            <div className="question-image-wrap">
                                <QuizImage
                                    src={currentQuestion.image_url}
                                    alt=""
                                    className="question-scene-img"
                                />
                            </div>
                        )}
                        <div className="question-text-panel">
                            <h2 className="question-text">{currentQuestion.question_text}</h2>
                        </div>
                    </div>

                    {/* Answers Grid */}
                    <div className="answers-grid">
                        <button
                            className="glass-answer-btn"
                            onClick={() => handleAnswer(false)}
                        >
                            <div className="option-letter-circle">A</div>
                            <span className="btn-text">{currentQuestion.option_a}</span>
                        </button>
                        <button
                            className="glass-answer-btn"
                            onClick={() => handleAnswer(true)}
                        >
                            <div className="option-letter-circle">B</div>
                            <span className="btn-text">{currentQuestion.option_b}</span>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* AdSense Slot (Bottom of Quiz Page) */}
            <AdSenseUnit adSlot={AD_SLOTS.quiz} location="quiz-bottom" />
        </div>
    );
}
