import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import './InstallBanner.css';

const InstallBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Detect if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Detect if Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        // Detect if already in standalone (installed) mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        // Check if dismissed in last 3 days
        const dismissedTime = localStorage.getItem('nambac_pwa_dismissed');
        const isDismissedRecently = dismissedTime && (Date.now() - parseInt(dismissedTime) < 3 * 24 * 60 * 60 * 1000);

        if (isIOS && isSafari && !isStandalone && !isDismissedRecently) {
            // Show banner after 3 seconds
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('nambac_pwa_dismissed', Date.now().toString());
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="install-banner-container">
            <button className="install-banner-close" onClick={handleDismiss} aria-label="Close banner">
                <X size={18} />
            </button>
            
            <div className="install-banner-content">
                <span className="install-banner-mascot">🥤</span>
                <div className="install-banner-text">
                    <h4 className="install-title">Thêm vào màn hình chính!</h4>
                    <p className="install-desc">Trải nghiệm Nambac mượt mà như app thật nhé.</p>
                </div>
            </div>
            
            <div className="install-guide-steps">
                <span className="step-item">
                    Nhấn nút <span className="inline-icon"><Share size={14} color="#FF2D85" /></span> dưới trình duyệt.
                </span>
                <span className="step-item">
                    Chọn <span className="inline-icon"><PlusSquare size={14} color="#FF2D85" /></span> <strong>"Thêm vào MH chính"</strong>.
                </span>
            </div>
        </div>
    );
};

export default InstallBanner;
