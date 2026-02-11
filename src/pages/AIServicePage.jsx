import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Send, RefreshCw, ChevronLeft, Sparkles } from 'lucide-react';
import './AIServicePage.css';
import { API_BASE_URL } from '../lib/apiConfig';

export default function AIServicePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const fileInputRef = useRef(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!name || !preview) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ai-service/cats-vs-dog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    image: preview
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setName('');
        setImage(null);
        setPreview(null);
        setResult(null);
        window.scrollTo(0, 0);
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    return (
        <div className="service-page-container">
            {/* Back Button removed as requested */}

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="service-form-card"
                    >
                        <header className="service-header-form">
                            <h1 className="service-title">Đại Chiến Chó Mèo ⚔️</h1>
                            <p className="service-subtitle">Khám phá linh hồn động vật ẩn giấu trong bạn!</p>
                        </header>

                        <div className="input-group">
                            <label>Bạn tên là gì?</label>
                            <input
                                type="text"
                                className="name-input"
                                placeholder="Nhập tên của bạn..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label>Ảnh để "vạch trần" (Bạn hoặc Pet)</label>
                            <div
                                className="photo-upload-zone"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="preview-img" />
                                        <div className="change-photo-overlay">
                                            <Camera size={20} color="#FF2D85" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="p-4 bg-pink-50 rounded-full">
                                            <Upload size={32} color="#FF2D85" />
                                        </div>
                                        <p>Nhấn để tải ảnh lên<br />(Dữ liệu sẽ được AI phân tích)</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        <button
                            className="analyze-btn"
                            disabled={!name || !preview || loading}
                            onClick={handleAnalyze}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    관상을 분석 중입니다...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Bắt đầu phân tích
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="result-container-quiz-style"
                        >
                            {/* Pretty Box Header (Question Style) */}
                            <div className="pretty-box-header">
                                {result.title}
                            </div>

                            <div className="question-glass-panel">
                                <div className="result-inner-content">
                                    {/* AI Classification Badge */}
                                    <div className="classification-badge">
                                        {result.dominant_animal === 'Cat' ? '🐱 Tướng Mèo (Cat Face)' : '🐶 Tướng Chó (Dog Face)'}
                                    </div>

                                    {/* User Photo with Ring */}
                                    <div className="relative w-40 h-40 mb-6">
                                        <div className={`absolute inset-0 rounded-full border-4 ${result.dominant_animal === 'Cat' ? 'border-purple-400' : 'border-amber-400'} animate-pulse`}></div>
                                        <img
                                            src={preview}
                                            alt="User"
                                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md text-2xl">
                                            {result.dominant_animal === 'Cat' ? '🐱' : '🐶'}
                                        </div>
                                    </div>

                                    <div className="trait-card description-card">
                                        <p className="description-text">
                                            <span className="text-pink-500">{result.name || name}</span> yêu dấu ơi...<br />
                                            "{result.description}"
                                        </p>
                                    </div>

                                    {/* 3 Traits List */}
                                    <div className="traits-container">
                                        {result.traits.map((trait, i) => (
                                            <div key={i} className="trait-card">
                                                {trait}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Bottom Action Bar (Fixed Modal Style) */}
                        <div className="result-bottom-bar">
                            <div className="bar-actions">
                                <button className="restart-btn" onClick={handleReset}>
                                    <RefreshCw size={20} color="#1E293B" />
                                    <span className="btn-label">THỬ LẠI</span>
                                </button>

                                <button className="share-btn" onClick={handleShare}>
                                    <span className="btn-label">CHIA SẺ</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="share-modal-title">Chia sẻ kết quả</h3>

                        <div className="share-options">
                            <button className="share-option zalo" onClick={() => {
                                window.open(`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}>
                                <span className="share-icon">💬</span>
                                <span>Zalo</span>
                            </button>

                            <button className="share-option instagram" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã sao chép link! Hãy dán vào Instagram.');
                            }}>
                                <span className="share-icon">📷</span>
                                <span>Instagram</span>
                            </button>

                            <button className="share-option facebook" onClick={() => {
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}>
                                <span className="share-icon">📘</span>
                                <span>Facebook</span>
                            </button>

                            <button className="share-option copy-link" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã sao chép link!');
                            }}>
                                <span className="share-icon">🔗</span>
                                <span>Sao chép</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
