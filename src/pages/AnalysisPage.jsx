import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronUp, Lock, Unlock } from 'lucide-react';
import './AnalysisPage.css';
import AdPlaceholder from '../components/AdPlaceholder';

const AnalysisPage = () => {
    const navigate = useNavigate();
    const { id: quizId } = useParams();
    const location = useLocation();
    const { score, results } = location.state || {}; // Expecting score and results passed from QuizPage

    const [progress, setProgress] = useState(0);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const [pullStartY, setPullStartY] = useState(0);
    const bottomSheetRef = useRef(null);

    // Affiliate Link (Mock - Replace with real logic if needed)
    const AFFILIATE_LINK = "https://shopee.vn";

    // 1. Progress Animation (0% -> 100%)
    useEffect(() => {
        let interval;
        if (progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    // Slower at the end to build suspense
                    const increment = prev > 80 ? 0.5 : 2;
                    return Math.min(prev + increment, 100);
                });
            }, 50); // Faster updates for smooth animation
        } else {
            // Auto Unlock when 100% reached
            if (!isUnlocked) setIsUnlocked(true);
        }
        return () => clearInterval(interval);
    }, [progress, isUnlocked]);

    // 2. Handle Pull-to-Action
    const handleTouchStart = (e) => {
        if (isUnlocked) return;
        setPullStartY(e.touches[0].clientY);
        setIsPulling(true);
    };

    const handleTouchMove = (e) => {
        if (!isPulling || isUnlocked) return;
        const currentY = e.touches[0].clientY;
        const diff = pullStartY - currentY; // Positive if pulling up

        if (diff > 50) { // Threshold to trigger
            activateAffiliate();
            setIsPulling(false);
        }
    };

    const handleTouchEnd = () => {
        setIsPulling(false);
    };

    const activateAffiliate = () => {
        if (isUnlocked) return;

        // Open Affiliate Link
        window.open(AFFILIATE_LINK, '_blank');

        // Unlock Result
        setIsUnlocked(true);
    };

    const goToResult = () => {
        if (!isUnlocked) {
            // Fallback, though UI prevents this
            alert("Hãy chờ phân tích xong hoặc kéo thanh bên dưới lên!");
            return;
        }
        // Navigate to result page with query params
        navigate(`/quiz/${quizId}/result?score=${score}`);
    };

    return (
        <div className="analysis-container">
            {/* Header / Loading Section */}
            <div className="analysis-header">
                <h2 className="analysis-title animate-pulse">
                    {progress < 100 ? "Đang phân tích..." : "Phân tích hoàn tất! ✨"}
                </h2>
                <div className="analysis-progress-track">
                    <div
                        className="analysis-progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="analysis-subtitle">
                    {progress < 100 ? `AI đang tổng hợp dữ liệu... (${Math.floor(progress)}%)` : "Đã tìm thấy kết quả của bạn!"}
                </p>
            </div>

            {/* AdSense Slot (Fixed Height) */}
            <div className="analysis-ad-container">
                <AdPlaceholder location="analysis-interstitial" />
            </div>

            {/* Bottom Interaction Area */}
            <div
                className={`pull-action-bar ${isUnlocked ? 'unlocked' : ''}`}
                ref={bottomSheetRef}
                onClick={isUnlocked ? goToResult : activateAffiliate}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >

                <div className="pull-content">
                    {isUnlocked ? (
                        <button className="view-result-btn w-full" onClick={(e) => {
                            e.stopPropagation();
                            goToResult();
                        }}>
                            Xem Kết Quả Ngay! 🚀
                        </button>
                    ) : (
                        <div className="pull-instruction">
                            <ChevronUp className="animate-bounce mb-1" size={24} />
                            <span className="font-bold text-lg">Kéo lên để xem kết quả!</span>
                            <span className="text-xs opacity-75">(Hoặc chờ phân tích xong...)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay to block interaction if not unlocked (Optional, but using Pull UI instead) */}
        </div>
    );
};

export default AnalysisPage;
