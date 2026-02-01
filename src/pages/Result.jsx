import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';
const Result = () => {
    const navigate = useNavigate();
    return (
        <div className="result-container">
            <h1 className="vibe-title">Your Vibe Is...</h1>
            <div className="princess-card">
                <span className="result-tag">✨ QUIZ RESULT</span>
                <h2 className="result-name">Saigon Princess!</h2>
                <div className="mascot-circle"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Coco&backgroundColor=ffc2d1" alt="mascot" /></div>
                <div className="result-details"><p className="detail-tag">100% ICONIC</p><p className="detail-desc">Iconic & Sweet</p></div>
                <div style={{marginTop:'30px', opacity:0.3, fontWeight:900}}>NAMBAC.XYZ</div>
            </div>
            <button className="share-btn-grad">Share to Instagram Story</button>
            <div className="bottom-actions"><button onClick={() => navigate('/')}>🔄 Replay</button><button onClick={() => navigate('/')}>▦ More</button></div>
        </div>
    );
};
export default Result;
