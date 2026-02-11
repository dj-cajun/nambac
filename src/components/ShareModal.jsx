import React from 'react';
import { Facebook, Link, X, Send } from 'lucide-react';

const ShareModal = ({ quizTitle, quizId, score, onClose }) => {
    // Backend OG Endpoint (Always use Production URL for Social Sharing)
    const shareUrl = `https://nambac.xyz/api/share/${quizId}/${score}`;

    // Zalo/FB Quote
    const quote = `[${quizTitle}] 결과 확인하기! #Nambac #XemTuong`;

    const shareToFacebook = () => {
        const appId = import.meta.env.VITE_FB_APP_ID;
        const feedUrl = `https://www.facebook.com/dialog/feed?app_id=${appId}&link=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}&display=popup`;
        window.open(feedUrl, '_blank');
        onClose();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50" onClick={onClose}>
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-center font-bold text-lg mb-4">Share Your Result</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <button onClick={shareToFacebook} className="flex flex-col items-center gap-2">
                        <Facebook size={48} className="text-blue-600" />
                        <span>Facebook</span>
                    </button>
                    <button onClick={handleCopy} className="flex flex-col items-center gap-2">
                        <Link size={48} />
                        <span>Copy Link</span>
                    </button>
                    {/* Add other share options if needed */}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
