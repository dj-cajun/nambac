import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import './InstallBanner.css';

const InstallBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [mode, setMode] = useState('ios');

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        const dismissedTime = localStorage.getItem('nambac_pwa_dismissed');
        const isDismissedRecently = dismissedTime && (Date.now() - parseInt(dismissedTime) < 3 * 24 * 60 * 60 * 1000);
        if (isStandalone || isDismissedRecently) return;

        let timer;

        const onBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setMode('android');
            timer = setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari) {
            setMode('ios');
            timer = setTimeout(() => setShowBanner(true), 3000);
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        };
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('nambac_pwa_dismissed', Date.now().toString());
        setShowBanner(false);
    };

    const handleAndroidInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="install-banner-container">
            <button className="install-banner-close" onClick={handleDismiss} aria-label="Close banner">
                <X size={22} />
            </button>

            <div className="install-banner-content">
                <span className="install-banner-mascot">🥤</span>
                <div className="install-banner-text">
                    <h4 className="install-title">Thêm vào màn hình chính!</h4>
                    <p className="install-desc">Trải nghiệm Nambac mượt mà như app thật nhé.</p>
                </div>
            </div>

            {mode === 'android' && deferredPrompt ? (
                <button type="button" className="install-android-btn" onClick={handleAndroidInstall}>
                    <Download size={16} /> Cài đặt ngay
                </button>
            ) : (
                <div className="install-guide-steps">
                    <span className="step-item">
                        Nhấn nút <span className="inline-icon"><Share size={18} color="#FF2D85" /></span> dưới trình duyệt.
                    </span>
                    <span className="step-item">
                        Chọn <span className="inline-icon"><PlusSquare size={18} color="#FF2D85" /></span> <strong>&quot;Thêm vào MH chính&quot;</strong>.
                    </span>
                </div>
            )}
        </div>
    );
};

export default InstallBanner;
