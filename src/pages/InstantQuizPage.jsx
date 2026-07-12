import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, Zap, RefreshCw, Home, Heart } from 'lucide-react';
import { calculateScore } from '../logic/scoring';
import './QuizPage.css';
import './Result.css';

export default function InstantQuizPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [quizData, setQuizData] = useState(null);
  
  // Gameplay states
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finalResult, setFinalResult] = useState(null);

  const loadingMessages = [
    "AI đang lên ý tưởng giáo án độc lạ... 🧠",
    "Đang phác thảo câu hỏi chuẩn vibe Sài Gòn... 🛵",
    "Đang viết các phương án lựa chọn lầy lội... ☕",
    "Hoàn thành các archetype kết quả bá đạo... 🪄"
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setQuizData(null);
    setAnswers([]);
    setCurrentIndex(0);
    setPlaying(false);
    setShowResult(false);

    try {
      const res = await fetch(`/api/ai/instant-quiz?topic=${encodeURIComponent(topic.trim())}`);
      if (!res.ok) throw new Error("Failed to generate quiz");
      const data = await res.json();
      setQuizData(data);
      setPlaying(true);
    } catch (err) {
      console.error(err);
      alert("AI đang bận một chút, bạn hãy thử nhập chủ đề khác nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    // calculateScore expects true when Option B is selected
    const nextAnswers = [...answers, optionIndex === 1];
    setAnswers(nextAnswers);

    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const calculatedScore = calculateScore(nextAnswers, quizData.questions);
      setScore(calculatedScore);
      const match = quizData.results.find((r) => Number(r.result_code) === calculatedScore)
        || quizData.results[0];
      setFinalResult(match);
      setPlaying(false);
      setShowResult(true);
    }
  };

  return (
    <div className="quiz-page-container result-page-container" style={{ paddingBottom: '40px', minHeight: '100vh', maxWidth: '480px', margin: '0 auto' }}>
      <Helmet>
        <title>Tự tạo Quiz AI tức thì | nambac.xyz</title>
        <meta name="description" content="Nhập chủ đề bất kỳ, AI nambac sẽ tạo ngay cho bạn một bài trắc nghiệm tính cách Gen Z độc lạ!" />
      </Helmet>

      {/* Header bar */}
      <header style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '2.5px solid #1e293b', background: '#fff' }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#1e293b' }}>
          <Home size={18} /> Trang chủ
        </button>
        <span style={{ margin: '0 auto', fontWeight: 900, color: '#7c3aed' }}>🪄 nambac AI Lab</span>
      </header>

      <main style={{ width: '90%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* State 1: Input form */}
        {!playing && !showResult && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', border: '2.5px solid #1e293b', borderRadius: '1.25rem', padding: '20px', boxShadow: '4px 4px 0 #1e293b' }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#1e293b' }}>Tự Tạo Quiz AI Tức Thì 🪄</h2>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '20px', lineHeight: 1.5 }}>
              Chỉ cần nhập một chủ đề bất kỳ (ví dụ: "cơn thèm trà sữa", "hội ghét đi Grab", "fan K-Pop"), AI sẽ tự động lên câu hỏi và bói tính cách cho riêng bạn!
            </p>

            <form onSubmit={handleGenerate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px', color: '#475569' }}>Nhập chủ đề bạn thích:</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. nghiện trà sữa Sài Gòn"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #1e293b',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.05)'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#7c3aed',
                  color: '#fff',
                  border: '2.5px solid #1e293b',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: '14px',
                  boxShadow: '4px 4px 0 #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                TẠO QUIZ NGAY <Sparkles size={18} />
              </button>
            </form>
          </motion.div>
        )}

        {/* State 2: Loading screen */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="animate-spin" style={{ width: '48px', height: '48px', border: '5px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%' }} />
            <div>
              <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.2rem', marginBottom: '8px' }}>AI đang viết quiz...</h3>
              <p style={{ fontSize: '14px', color: '#6d28d9', fontWeight: '800', minHeight: '24px' }}>
                {loadingMessages[loadingMsgIdx]}
              </p>
            </div>
          </div>
        )}

        {/* State 3: Quiz Gameplay */}
        {playing && quizData && (
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: '#fff', border: '2.5px solid #1e293b', borderRadius: '1.25rem', padding: '20px', boxShadow: '4px 4px 0 #1e293b' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, background: '#f5f3ff', color: '#7c3aed', padding: '4px 8px', borderRadius: '20px', border: '1px solid #ddd' }}>
                CHỦ ĐỀ: {topic}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#4b5563' }}>
                Câu {currentIndex + 1}/5
              </span>
            </div>

            <div style={{ height: '6px', width: '100%', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ height: '100%', background: '#7c3aed', width: `${((currentIndex + 1) / 5) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1e293b', lineHeight: 1.5, marginBottom: '28px' }}>
              {quizData.questions[currentIndex].question_text}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleAnswer(0)}
                style={{
                  textAlign: 'left',
                  background: '#fff',
                  border: '2px solid #1e293b',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: '#1e293b',
                  boxShadow: '3px 3px 0 #1e293b',
                  cursor: 'pointer'
                }}
              >
                {quizData.questions[currentIndex].option_a}
              </button>
              <button
                onClick={() => handleAnswer(1)}
                style={{
                  textAlign: 'left',
                  background: '#fff',
                  border: '2px solid #1e293b',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: '#1e293b',
                  boxShadow: '3px 3px 0 #1e293b',
                  cursor: 'pointer'
                }}
              >
                {quizData.questions[currentIndex].option_b}
              </button>
            </div>
          </motion.div>
        )}

        {/* State 4: Results Display */}
        {showResult && finalResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div className="result-unified-card" style={{ width: '100%' }}>
              <div className="result-image-wrap">
                <img
                  src="/images/default_cover.png"
                  alt="Result Character"
                  className="result-full-img"
                />
              </div>

              <div className="result-text-panel">
                <div className="result-title-badge">
                  {finalResult.type_name}
                </div>

                <p className="result-description-text" style={{ fontSize: '13.5px', lineHeight: 1.5, fontWeight: '600' }}>
                  {finalResult.description}
                </p>

                {finalResult.traits && finalResult.traits.length > 0 && (
                  <div className="result-traits" style={{ marginTop: '12px' }}>
                    {finalResult.traits.map((trait, i) => (
                      <span key={i} className="trait-tag" style={{ background: '#f5f3ff', border: '1.5px solid #1e293b', color: '#7c3aed' }}>#{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Custom interpretations specifically for this custom topic result */}
            <div className="result-grade-card" style={{ background: 'linear-gradient(135deg, #fffbeb, #ffffff)', borderColor: '#fbbf24', width: '100%' }}>
              <h4 style={{ fontWeight: 900, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '8px' }}>
                <Sparkles size={16} /> Lời phê từ AI Giáo Viên:
              </h4>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#451a03', fontWeight: '600' }}>
                Bạn quả là một nhân tố thú vị về chủ đề <strong>{topic}</strong>. AI nhận thấy nét tính cách "{finalResult.type_name}" thể hiện rất rõ qua 5 lựa chọn của bạn. Về nhà nhớ củng cố thêm độ slay nhé!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setPlaying(false);
                  setShowResult(false);
                  setQuizData(null);
                }}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: '2.5px solid #1e293b',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: '14px',
                  boxShadow: '3px 3px 0 #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> LÀM CHỦ ĐỀ KHÁC
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#fff',
                  color: '#1e293b',
                  border: '2.5px solid #1e293b',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: '14px',
                  boxShadow: '3px 3px 0 #1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                VỀ TRANG CHỦ
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
