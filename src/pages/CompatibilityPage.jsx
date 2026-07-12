import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Share2, Download, Zap, RefreshCw } from 'lucide-react';
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

    const [nameA, setNameA] = useState('');
    const [mbtiA, setMbtiA] = useState('');
    const [nameB, setNameB] = useState('');
    const [mbtiB, setMbtiB] = useState('');
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const isInteractiveMode = !quizId || friendScoreParam === undefined || myScoreParam === undefined;

    const friendScore = parseInt(friendScoreParam);
    const myScore = parseInt(myScoreParam);

    const [quizTitle, setQuizTitle] = useState("Trắc nghiệm tính cách");
    const [friendResult, setFriendResult] = useState(null);
    const [myResult, setMyResult] = useState(null);
    const [loading, setLoading] = useState(!isInteractiveMode);

    useEffect(() => {
        if (isInteractiveMode) return;
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
    }, [quizId, friendScore, myScore, isInteractiveMode]);

    useEffect(() => {
        if (!loading && quizId) {
            trackCompatStart(quizId, friendScore, myScore);
        }
    }, [loading, quizId, friendScore, myScore]);

    const calculateCompatibility = () => {
        if (isInteractiveMode) return { score: 0, title: '', roast: '', chemical: '' };
        const toBinaryArray = (num) => {
            return [num & 1, (num >> 1) & 1, (num >> 2) & 1];
        };

        const fBits = toBinaryArray(friendScore);
        const mBits = toBinaryArray(myScore);

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

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!nameA.trim() || !nameB.trim() || aiLoading) return;
        setAiLoading(true);
        try {
            const res = await fetch(`/api/ai/compatibility?nameA=${encodeURIComponent(nameA)}&mbtiA=${encodeURIComponent(mbtiA)}&nameB=${encodeURIComponent(nameB)}&mbtiB=${encodeURIComponent(mbtiB)}`);
            if (!res.ok) throw new Error("Failed to compare");
            const data = await res.json();
            setAiResult(data);
        } catch (err) {
            console.error(err);
            alert("Không so khớp được lúc này. Hãy thử lại sau nhé!");
        } finally {
            setAiLoading(false);
        }
    };

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
            link.download = `nambac-compat.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download", err);
        }
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert("Đã sao chép link so sánh!");
        });
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

    if (isInteractiveMode) {
        return (
            <div className="compatibility-page" style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '80px' }}>
                <Helmet>
                    <title>AI So Khớp &amp; Đo Độ Hợp Cạ | nambac.xyz</title>
                </Helmet>
                <main className="compatibility-main" ref={pageRef} style={{ width: '90%', margin: '20px auto' }}>
                    <div className="compat-header">
                        <span className="compat-badge">AI MATCHMAKER 🪄</span>
                        <h1 className="compat-quiz-title" style={{ fontSize: '1.4rem', fontWeight: 900 }}>Đo Độ Hợp Cạ Cùng Crush</h1>
                    </div>
                    {!aiResult && !aiLoading && (
                        <div style={{ background: '#fff', border: '2.5px solid #1e293b', borderRadius: '20px', padding: '20px', boxShadow: '4px 4px 0 #1e293b' }}>
                            <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input type="text" placeholder="Tên của bạn..." value={nameA} onChange={(e) => setNameA(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #1e293b' }} />
                                <input type="text" placeholder="Tên đối phương..." value={nameB} onChange={(e) => setNameB(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #1e293b' }} />
                                <button type="submit" style={{ background: '#10b981', color: '#fff', border: '2.5px solid #1e293b', padding: '14px', borderRadius: '12px', fontWeight: 900 }}>🚀 BẮT ĐẦU SO KHỚP AI</button>
                            </form>
                        </div>
                    )}
                    {aiLoading && <div style={{ textAlign: 'center', padding: '40px' }}>AI đang đo lường... ⚡</div>}
                    {aiResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="compat-score-section">
                                <div className="compat-score-circle" style={{ borderColor: '#10b981' }}>
                                    <span className="score-percentage">{aiResult.matchRate}%</span>
                                </div>
                                <h2 className="compat-score-title">{aiResult.archetype}</h2>
                            </div>
                            <button onClick={() => { setAiResult(null); setNameA(''); setNameB(''); }}><RefreshCw size={16} /> SO SÁNH CẶP KHÁC</button>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="compatibility-page-container">
            <Helmet>
                <title>{`Độ hợp nhau: ${matchScore}% — nambac.xyz`}</title>
            </Helmet>
            <main className="compatibility-main" ref={pageRef}>
                <div className="compat-header">
                    <span className="compat-badge">SO KÈO HỢP NHAU ⚡</span>
                    <h1 className="compat-quiz-title">{quizTitle}</h1>
                </div>
                <div className="compat-score-section">
                    <div className="compat-score-circle">
                        <Zap className="score-bolt-icon" size={28} />
                        <span className="score-percentage">{matchScore}%</span>
                    </div>
                    <h2 className="compat-score-title">{matchTitle}</h2>
                    <span className="compat-chemical">🧪 Phản ứng: {matchChemical}</span>
                </div>
                <div className="compat-duo-cards">
                    <div className="compat-person-card">
                        <div className="card-avatar friend">
                            <img src={getImageUrl(friendResult?.image_url)} onError={(e) => { e.target.src = "/images/default_cover.png" }} alt="Friend Result" />
                        </div>
                        <span className="person-label">BẠN THÂN</span>
                        <h4 className="person-result-title">{friendResult?.type_name || friendResult?.title}</h4>
                    </div>
                    <div className="compat-vs">VS</div>
                    <div className="compat-person-card">
                        <div className="card-avatar me">
                            <img src={getImageUrl(myResult?.image_url)} onError={(e) => { e.target.src = "/images/default_cover.png" }} alt="My Result" />
                        </div>
                        <span className="person-label">BẠN</span>
                        <h4 className="person-result-title">{myResult?.type_name || myResult?.title}</h4>
                    </div>
                </div>
                <div className="compat-roast-box">
                    <div className="roast-tape"></div>
                    <p className="roast-text">{matchRoast}</p>
                </div>
            </main>
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
