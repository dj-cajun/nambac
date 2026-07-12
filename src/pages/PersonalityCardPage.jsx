import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Sparkles, User, RefreshCw, Home, Compass } from 'lucide-react';
import { loadSbtiResult } from '../lib/vbti/session.js';
import { fetchPlayerGrade } from '../lib/playerGrade.js';
import './Result.css';

export default function PersonalityCardPage() {
  const navigate = useNavigate();
  const [sbtiResult, setSbtiResult] = useState(null);
  const [playerGrade, setPlayerGrade] = useState(null);
  const [characterMatches, setCharacterMatches] = useState([]);
  const [characterLoading, setCharacterLoading] = useState(false);

  useEffect(() => {
    // Load local results
    const sbti = loadSbtiResult();
    if (sbti?.result?.finalType) {
      setSbtiResult(sbti.result.finalType);
    }
    
    fetchPlayerGrade().then((grade) => {
      if (grade) setPlayerGrade(grade);
    });
  }, []);

  // Fetch character matches once VBTI is loaded
  useEffect(() => {
    if (!sbtiResult?.code) return;

    const fetchMatches = async () => {
      setCharacterLoading(true);
      try {
        const res = await fetch(`/api/ai/character-match?mbti=${encodeURIComponent(sbtiResult.code)}`);
        if (!res.ok) throw new Error("Failed to load character matches");
        const data = await res.json();
        if (data.matches) setCharacterMatches(data.matches);
      } catch (err) {
        console.error(err);
      } finally {
        setCharacterLoading(false);
      }
    };
    fetchMatches();
  }, [sbtiResult]);

  return (
    <div className="quiz-page-container result-page-container" style={{ paddingBottom: '60px', minHeight: '100vh', maxWidth: '480px', margin: '0 auto' }}>
      <Helmet>
        <title>Hồ sơ cá nhân AI &amp; Thẻ VBTI | nambac.xyz</title>
      </Helmet>

      {/* Header bar */}
      <header style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '2.5px solid #1e293b', background: '#fff' }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#1e293b' }}>
          <Home size={18} /> Trang chủ
        </button>
        <span style={{ margin: '0 auto', fontWeight: 900, color: '#7c3aed' }}>🆔 Thẻ Cá Nhân AI</span>
      </header>

      <main style={{ width: '90%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Main Personality Identity Card */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #7c3aed, #c084fc)', 
            border: '3px solid #1e293b', 
            borderRadius: '24px', 
            padding: '24px 20px', 
            boxShadow: '6px 6px 0 #1e293b', 
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-10px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          {/* Top band */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', background: '#1e293b', color: '#a78bfa', padding: '3px 8px', borderRadius: '6px' }}>
              SAI GON MZ PASS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={16} />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>nambac 2.0</span>
            </div>
          </div>

          {/* User details */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', border: '2px solid #1e293b', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#7c3aed', overflow: 'hidden' }}>
              <User size={36} style={{ margin: 'auto' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textShadow: '2px 2px 0 rgba(0,0,0,0.15)', margin: 0 }}>
                Gen Z Sài Gòn
              </h2>
              <p style={{ fontSize: '12px', opacity: 0.9, fontWeight: 700, margin: '2px 0 0' }}>
                Hạng: {playerGrade?.grade?.label ? `${playerGrade.grade.emoji} ${playerGrade.grade.label}` : '🎯 Thành viên mới'}
              </p>
            </div>
          </div>

          {/* VBTI type box */}
          {sbtiResult ? (
            <div style={{ background: '#fff', color: '#1e293b', padding: '16px', borderRadius: '16px', border: '2px solid #1e293b', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 950, color: '#7c3aed' }}>{sbtiResult.code}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#6b7280' }}>Type VBTI của bạn</span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>{sbtiResult.name}</p>
              <p style={{ fontSize: '11.5px', color: '#6b7280', fontWeight: '600', lineHeight: 1.4 }}>{sbtiResult.intro}</p>
            </div>
          ) : (
            <div style={{ background: '#fff', color: '#1e293b', padding: '20px 16px', borderRadius: '16px', border: '2px solid #1e293b', textAlign: 'center' }}>
              <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#4b5563', marginBottom: '12px' }}>
                Bạn chưa làm bài kiểm tra tính cách VBTI Việt Nam!
              </p>
              <button 
                onClick={() => navigate('/vbti')}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: '2px solid #1e293b',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #1e293b'
                }}
              >
                LÀM VBTI NGAY 🎭
              </button>
            </div>
          )}

          {/* Stats footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '12px', fontSize: '11px', fontWeight: 800 }}>
            <span>ĐÃ CHƠI: {playerGrade?.uniqueQuizzes || 0} QUIZ</span>
            <span>RANK POINT: {(playerGrade?.uniqueQuizzes || 0) * 100} PTS</span>
          </div>
        </div>

        {/* Anime / Gaming character matches */}
        {sbtiResult && (
          <div className="result-grade-card" style={{ background: '#fff', border: '2.5px solid #1e293b', boxShadow: '4px 4px 0 #1e293b', width: '100%', padding: '16px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              <Sparkles size={16} style={{ color: '#a855f7' }} /> Nhân Vật Anime / Game Đồng Điệu
            </h3>

            {characterLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: '#6b7280', fontWeight: 700 }}>
                AI đang tìm kiếm nhân vật đồng điệu... ⚡
              </div>
            )}

            {!characterLoading && characterMatches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {characterMatches.map((char, index) => (
                  <div key={index} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 850, fontSize: '13px', color: '#1e293b' }}>
                        {char.name} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>({char.franchise})</span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 900, background: '#f5f3ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '12px', border: '1px solid #c084fc' }}>
                        Khớp {char.matchRate}%
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, fontWeight: '600' }}>{char.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover section loops */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={() => navigate('/explore')}
            style={{
              background: '#f8fafc',
              border: '2px solid #1e293b',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 900,
              fontSize: '13px',
              boxShadow: '3px 3px 0 #1e293b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Compass size={18} /> KHÁM PHÁ THÊM QUIZ DÀNH CHO BẠN
          </button>
        </div>

      </main>
    </div>
  );
}
