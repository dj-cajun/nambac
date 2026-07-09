import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Share2, Download, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getImageUrl } from '../lib/apiConfig';
import { fetchQuizBundle } from '../lib/quizApi';
import { trackCompatStart, trackShare } from '../lib/analytics';
import { getOgDefaultImageUrl } from '../lib/siteUrl';
import './CompatibilityPage.css';

const CompatibilityPage = () => {
    const { id: quizId, friendScore: friendScoreParam, myScore: myScoreParam } = useParams();
    const navigate = useNavigate();
    const pageRef = useRef(null);

    const friendScore = parseInt(friendScoreParam);
    const myScore = parseInt(myScoreParam);

    const [quizTitle, setQuizTitle] = useState("Trắc nghiệm tính cách");
    const [friendResult, setFriendResult] = useState(null);
    const [myResult, setMyResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const bundle = await fetchQuizBundle(quizId);
                if (bundle?.quiz) setQuizTitle(bundle.quiz.title);

                const resultsData = bundle?.results || [];
                if (resultsData.length > 0) {
                    const fMatch = resultsData.find(r => parseInt(r.result_code) === friendScore);
                    const mMatch = resultsData.find(r => parseInt(r.result_code) === myScore);
                    setFriendResult(fMatch || resultsData[0]);
                    setMyResult(mMatch || resultsData[0]);
                }
            } catch (err) {
                console.error("Failed to fetch compatibility data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [quizId, friendScore, myScore]);

    useEffect(() => {
        if (!loading && quizId) {
            trackCompatStart(quizId, friendScore, myScore);
        }
    }, [loading, quizId, friendScore, myScore]);

    // 3-Bit Binary Compatibility Logic
    const calculateCompatibility = () => {
        // Convert scores to 3-bit binary arrays (e.g. 5 -> [1, 0, 1])
        const toBinaryArray = (num) => {
            return [num & 1, (num >> 1) & 1, (num >> 2) & 1];
        };

        const fBits = toBinaryArray(friendScore);
        const mBits = toBinaryArray(myScore);

        // Count matching bits
        let matchCount = 0;
        for (let i = 0; i < 3; i++) {
            if (fBits[i] === mBits[i]) matchCount++;
        }

        let score = 20;
        let title = "Alien Khác Hệ 👽";
        let roast = "Hai bạn như nước với lửa, nói chuyện 3 câu là khịa nhau khum trượt phát lào. Nhưng thế mới vui!";
        let chemical = "Độ khắc khẩu cực cao";

        if (matchCount === 3) {
            score = 100;
            title = "Song Sinh Thất Lạc 👯‍♂️";
            roast = "Trời ơi, hai bạn chung một tần số cực mạnh! Khớp khum trượt phát lào, chỉ cần nhìn mắt nhau là hiểu đối phương muốn chê gì rồi!";
            chemical = "Tần số tâm linh tương thông";
        } else if (matchCount === 2) {
            score = 80;
            title = "Cặp Bài Trùng Slay 🥤";
            roast = "Rất hợp cạ nha! Cùng nhau đi trà sữa, chém gió hay đi 'cháy phố' đều cực kỳ dính. Một đứa chê là đứa kia phụ họa liền!";
            chemical = "Đồng chí trà sữa quốc dân";
        } else if (matchCount === 1) {
            score = 50;
            title = "Trái Dấu Hút Nhau 🧲";
            roast = "Hai người tuy khác biệt kha khá nhưng lại bù trừ cho nhau cực tốt. Một đứa quậy đục nước thì phải có một đứa bất lực cản lại chứ!";
            chemical = "Bù trừ áp lực cột sống";
        }

        return { score, title, roast, chemical };
    };

    const { score: matchScore, title: matchTitle, roast: matchRoast, chemical: matchChemical } = calculateCompatibility();

    const handleDownload = async () => {
        if (!pageRef.current) return;
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(pageRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `nambac-compatibility-${quizId}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download compatibility image", err);
            alert("Có lỗi xảy ra khi tải ảnh! Bạn hãy chụp màn hình kết quả nhé.");
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        trackShare('compat', quizId, matchScore);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Độ hợp nhau của chúng tớ là ${matchScore}%!`,
                    text: `Xem mức độ hợp nhau của tớ và bạn thân trên nambac.xyz nhé!`,
                    url: shareUrl,
                });
            } catch (e) {
                navigator.clipboard.writeText(shareUrl);
                alert("Đã sao chép liên kết!");
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Đã sao chép liên kết!");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fff9fc]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FF2D85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-[#FF2D85]">Đang so kèo hợp nhau... 🥤</p>
                </div>
            </div>
        );
    }

    return (
        <div className="compatibility-page-container">
            <Helmet>
                <title>{`Độ hợp nhau: ${matchScore}% — nambac.xyz`}</title>
                <meta name="description" content={`${matchTitle} — ${matchRoast}`} />
                <meta property="og:title" content={`Độ hợp nhau ${matchScore}%! ${matchTitle}`} />
                <meta property="og:description" content={matchRoast} />
                <meta property="og:image" content={getImageUrl(myResult?.image_url) || getOgDefaultImageUrl()} />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="vi_VN" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <main className="compatibility-main" ref={pageRef}>
                {/* Visual Header */}
                <div className="compat-header">
                    <span className="compat-badge">SO KÈO HỢP NHAU ⚡</span>
                    <h1 className="compat-quiz-title">{quizTitle}</h1>
                </div>

                {/* Compatibility Score Circle */}
                <div className="compat-score-section">
                    <div className="compat-score-circle">
                        <Zap className="score-bolt-icon" size={28} />
                        <span className="score-percentage">{matchScore}%</span>
                    </div>
                    <h2 className="compat-score-title">{matchTitle}</h2>
                    <span className="compat-chemical">🧪 Phản ứng: {matchChemical}</span>
                </div>

                {/* Left & Right Results Preview */}
                <div className="compat-duo-cards">
                    {/* Friend Card */}
                    <div className="compat-person-card">
                        <div className="card-avatar friend">
                            <img 
                                src={getImageUrl(friendResult?.image_url)} 
                                onError={(e) => { e.target.src = "/images/default_cover.png" }}
                                alt="Friend Result" 
                            />
                        </div>
                        <span className="person-label">BẠN THÂN</span>
                        <h4 className="person-result-title">{friendResult?.type_name || friendResult?.title}</h4>
                    </div>

                    {/* VS */}
                    <div className="compat-vs">VS</div>

                    {/* My Card */}
                    <div className="compat-person-card">
                        <div className="card-avatar me">
                            <img 
                                src={getImageUrl(myResult?.image_url)} 
                                onError={(e) => { e.target.src = "/images/default_cover.png" }}
                                alt="My Result" 
                            />
                        </div>
                        <span className="person-label">BẠN</span>
                        <h4 className="person-result-title">{myResult?.type_name || myResult?.title}</h4>
                    </div>
                </div>

                {/* Roast description Box */}
                <div className="compat-roast-box">
                    <div className="roast-tape"></div>
                    <p className="roast-text">{matchRoast}</p>
                </div>
            </main>

            {/* Bottom Actions Bar */}
            <div className="result-bottom-bar">
                <div className="bar-actions">
                    <button className="restart-btn" onClick={() => navigate('/')}>
                        <Home size={18} />
                        <span className="btn-label">TRANG CHỦ</span>
                    </button>

                    <button className="download-action-btn" onClick={handleDownload}>
                        <Download size={18} />
                        <span className="btn-label">TẢI ẢNH</span>
                    </button>

                    <button className="share-btn" onClick={handleShare}>
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompatibilityPage;
