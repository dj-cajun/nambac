import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/apiConfig';
import { supabase } from '../lib/supabase';
import './QuizEditor.css';

const QUIZ_TYPES = [
    { value: 'binary_5q', label: '🎯 Binary 5Q', desc: '5문항 A/B (현재 기본)', qCount: 5, rCount: 8 },
    { value: 'name_input', label: '✍️ 이름 입력형', desc: '이름 → 랜덤 결과', qCount: 0, rCount: 10 },
    { value: 'mbti_12q', label: '🧠 MBTI 12Q', desc: '12문항 → 16유형', qCount: 12, rCount: 16 },
    { value: 'sponsor', label: '💎 스폰서', desc: '커스텀 디자인+영상', qCount: 5, rCount: 4 },
    { value: 'full_custom', label: '⚙️ 풀 커스텀', desc: '모든 것 수정 가능', qCount: 5, rCount: 4 },
];

const CATEGORIES = [
    { value: 'personality', label: '🧬 personality' },
    { value: 'mbti', label: '🧠 mbti' },
    { value: 'fortune', label: '🔮 fortune' },
    { value: 'fun', label: '🎉 fun' },
    { value: 'sponsor', label: '💎 sponsor' },
    { value: 'trend', label: '📈 trend' },
];

const MBTI_DIMENSIONS = ['EI', 'SN', 'TF', 'JP'];

const emptyQuestion = (quizType, orderNum = 1) => {
    const base = {
        order_number: orderNum,
        question_text: '',
        option_a: '',
        option_b: '',
        score_a: 0,
        score_b: 0,
        image_url: null,
    };
    if (quizType === 'mbti_12q') {
        base.dimension = MBTI_DIMENSIONS[Math.floor((orderNum - 1) / 3)] || 'EI';
    }
    return base;
};

const emptyResult = (code = 0) => ({
    result_code: code,
    title: '',
    description: '',
    traits: [],
    image_url: null,
});

const BINARY_SCORES = [
    [0, 4], [0, 2], [0, 1], [0, 0], [0, 0] // Q1=4, Q2=2, Q3=1, Q4/Q5=0
];

export default function QuizEditor() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const zipInputRef = useRef(null);

    // Auth
    const [isAuth, setIsAuth] = useState(false);
    const [password, setPassword] = useState('');
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '0922';

    // Editor state
    const [step, setStep] = useState(1); // 1=type, 2=info, 3=questions, 4=results, 5=preview
    const [quizType, setQuizType] = useState('binary_5q');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('fun');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);

    // Auth handler
    const handleAuth = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuth(true);
        } else {
            alert('❌ 비밀번호 틀림!');
            setPassword('');
        }
    };

    // Initialize questions/results when type is selected
    const selectQuizType = (type) => {
        setQuizType(type);
        const typeConfig = QUIZ_TYPES.find(t => t.value === type);

        if (type === 'name_input') {
            setQuestions([]); // No questions for name input
        } else if (type === 'mbti_12q') {
            const qs = [];
            MBTI_DIMENSIONS.forEach(dim => {
                for (let i = 0; i < 3; i++) {
                    qs.push({ ...emptyQuestion(type, qs.length + 1), dimension: dim });
                }
            });
            setQuestions(qs);
        } else if (type === 'binary_5q') {
            setQuestions(Array.from({ length: 5 }, (_, i) => ({
                ...emptyQuestion(type, i + 1),
                score_a: BINARY_SCORES[i][0],
                score_b: BINARY_SCORES[i][1],
            })));
        } else {
            setQuestions(Array.from({ length: typeConfig?.qCount || 5 }, (_, i) =>
                emptyQuestion(type, i + 1)
            ));
        }

        const rCount = typeConfig?.rCount || 8;
        setResults(Array.from({ length: rCount }, (_, i) => emptyResult(i)));
        setStep(2);
    };

    // Question handlers
    const updateQuestion = (idx, field, value) => {
        setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, emptyQuestion(quizType, prev.length + 1)]);
    };

    const removeQuestion = (idx) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_number: i + 1 })));
    };

    // Result handlers
    const updateResult = (idx, field, value) => {
        setResults(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const updateResultTraits = (idx, traitsStr) => {
        const traits = traitsStr.split(',').map(t => t.trim()).filter(Boolean);
        updateResult(idx, 'traits', traits);
    };

    const addResult = () => {
        setResults(prev => [...prev, emptyResult(prev.length)]);
    };

    const removeResult = (idx) => {
        setResults(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, result_code: i })));
    };

    // Thumbnail
    const handleThumbnail = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // ZIP Upload (Disabled in serverless)
    const handleZipUpload = async (e) => {
        alert("ZIP upload is disabled in serverless mode. Please create quizzes from scratch.");
    };

    // Save quiz (Supabase direct upload)
    const handleSave = async () => {
        if (!title.trim()) return alert('제목을 입력하세요');
        if (quizType !== 'name_input' && questions.some(q => !q.question_text.trim())) {
            return alert('모든 질문을 작성하세요');
        }
        if (results.some(r => !r.title.trim())) {
            return alert('모든 결과 유형의 제목을 입력하세요');
        }

        setSaving(true);
        try {
            let finalThumbnailUrl = null;
            if (thumbnail) {
                const fileName = `quiz_${Date.now()}_${thumbnail.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const { error: uploadError } = await supabase.storage.from('quiz-images').upload(fileName, thumbnail);
                if (uploadError) throw uploadError;
                finalThumbnailUrl = `/${fileName}`; // getImageUrl automatically appends supabase URL based on filename
            }

            // Insert Quiz
            const { data: qData, error: qError } = await supabase.from('quizzes').insert({
                title, description, category, quiz_type: quizType, image_url: finalThumbnailUrl
            }).select().single();
            
            if (qError) throw qError;
            const newQuizId = qData.id;

            // Insert Questions
            if (quizType !== 'name_input' && questions.length > 0) {
                const qPayload = questions.map((q, i) => ({ ...q, quiz_id: newQuizId, order_number: i + 1 }));
                const { error: errQ } = await supabase.from('questions').insert(qPayload);
                if (errQ) throw errQ;
            }

            // Insert Results
            if (results.length > 0) {
                const rPayload = results.map(r => ({ ...r, quiz_id: newQuizId }));
                const { error: errR } = await supabase.from('results').insert(rPayload);
                if (errR) throw errR;
            }

            setSaveResult({ success: true, data: { title, quiz_type: quizType, question_count: questions.length, result_count: results.length } });
            setStep(5);
        } catch (err) {
            console.error("Save Error:", err);
            alert(`❌ Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Auth Screen
    if (!isAuth) {
        return (
            <div className="editor-container">
                <div className="editor-auth-card">
                    <h1>🔐 Quiz Editor</h1>
                    <form onSubmit={handleAuth}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin Password"
                            className="editor-input"
                            autoFocus
                        />
                        <button type="submit" className="editor-btn primary">접속</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-container">
            {/* Header */}
            <div className="editor-header">
                <h1 className="editor-logo">🎮 Quiz Editor</h1>
                <div className="editor-steps">
                    {['타입', '정보', '질문', '결과', '완료'].map((label, i) => (
                        <div
                            key={i}
                            className={`step-dot ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
                            onClick={() => step > i + 1 && setStep(i + 1)}
                        >
                            <span className="step-num">{step > i + 1 ? '✓' : i + 1}</span>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Quiz Type Selection */}
            {step === 1 && (
                <div className="editor-section">
                    <h2 className="section-title">퀴즈 타입 선택</h2>
                    <div className="type-grid">
                        {QUIZ_TYPES.map(t => (
                            <button
                                key={t.value}
                                className={`type-card ${quizType === t.value ? 'selected' : ''}`}
                                onClick={() => selectQuizType(t.value)}
                            >
                                <span className="type-label">{t.label}</span>
                                <span className="type-desc">{t.desc}</span>
                                <span className="type-meta">Q: {t.qCount} / R: {t.rCount}</span>
                            </button>
                        ))}
                    </div>

                    <div className="divider-or">또는</div>

                    <button
                        className="editor-btn secondary zip-btn"
                        onClick={() => zipInputRef.current?.click()}
                        disabled={saving}
                    >
                        📦 ZIP 파일 업로드
                    </button>
                    <input
                        ref={zipInputRef}
                        type="file"
                        accept=".zip"
                        onChange={handleZipUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {/* Step 2: Quiz Info */}
            {step === 2 && (
                <div className="editor-section">
                    <h2 className="section-title">퀴즈 정보</h2>
                    <div className="form-group">
                        <label>퀴즈 제목</label>
                        <input
                            className="editor-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: Bạn là loại cà phê nào?"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label>설명</label>
                        <textarea
                            className="editor-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="퀴즈 설명을 입력하세요..."
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>카테고리</label>
                        <div className="category-chips">
                            {CATEGORIES.map(c => (
                                <button
                                    key={c.value}
                                    className={`chip ${category === c.value ? 'active' : ''}`}
                                    onClick={() => setCategory(c.value)}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>썸네일 이미지</label>
                        <div className="thumbnail-upload" onClick={() => fileInputRef.current?.click()}>
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} alt="thumb" className="thumb-preview" />
                            ) : (
                                <span className="thumb-placeholder">📷 클릭해서 업로드</span>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnail}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="form-row">
                        <button className="editor-btn secondary" onClick={() => setStep(1)}>← 이전</button>
                        <button
                            className="editor-btn primary"
                            onClick={() => setStep(quizType === 'name_input' ? 4 : 3)}
                            disabled={!title.trim()}
                        >
                            다음 →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Questions */}
            {step === 3 && quizType !== 'name_input' && (
                <div className="editor-section">
                    <h2 className="section-title">
                        질문 편집 ({questions.length}개)
                        <span className="badge">{QUIZ_TYPES.find(t => t.value === quizType)?.label}</span>
                    </h2>

                    <div className="questions-list">
                        {questions.map((q, idx) => (
                            <div key={idx} className="question-editor-card">
                                <div className="q-header">
                                    <span className="q-num">Q{idx + 1}</span>
                                    {quizType === 'mbti_12q' && (
                                        <select
                                            className="dim-select"
                                            value={q.dimension || 'EI'}
                                            onChange={(e) => updateQuestion(idx, 'dimension', e.target.value)}
                                        >
                                            {MBTI_DIMENSIONS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    )}
                                    {(quizType === 'full_custom' || quizType === 'sponsor') && (
                                        <button className="q-remove" onClick={() => removeQuestion(idx)}>✕</button>
                                    )}
                                </div>

                                <input
                                    className="editor-input"
                                    placeholder="질문 텍스트"
                                    value={q.question_text}
                                    onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                                />
                                <div className="option-row">
                                    <input
                                        className="editor-input option-input"
                                        placeholder="Option A"
                                        value={q.option_a}
                                        onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)}
                                    />
                                    <input
                                        className="editor-input option-input"
                                        placeholder="Option B"
                                        value={q.option_b}
                                        onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)}
                                    />
                                </div>
                                {quizType === 'binary_5q' && (
                                    <div className="score-row">
                                        <span className="score-label">A점수: {q.score_a}</span>
                                        <span className="score-label">B점수: {q.score_b}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {(quizType === 'full_custom' || quizType === 'sponsor') && (
                        <button className="editor-btn secondary add-btn" onClick={addQuestion}>
                            + 질문 추가
                        </button>
                    )}

                    <div className="form-row">
                        <button className="editor-btn secondary" onClick={() => setStep(2)}>← 이전</button>
                        <button className="editor-btn primary" onClick={() => setStep(4)}>다음 →</button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && (
                <div className="editor-section">
                    <h2 className="section-title">
                        결과 유형 ({results.length}개)
                        {quizType === 'mbti_12q' && <span className="badge">16 MBTI Types</span>}
                    </h2>

                    <div className="results-list">
                        {results.map((r, idx) => (
                            <div key={idx} className="result-editor-card">
                                <div className="r-header">
                                    <span className="r-code">
                                        {quizType === 'binary_5q' ? `Score ${r.result_code}` :
                                            quizType === 'mbti_12q' ? `#${idx + 1}` :
                                                `Result ${idx + 1}`}
                                    </span>
                                    {(quizType === 'full_custom' || quizType === 'sponsor' || quizType === 'name_input') && (
                                        <button className="q-remove" onClick={() => removeResult(idx)}>✕</button>
                                    )}
                                </div>
                                <input
                                    className="editor-input"
                                    placeholder="결과 제목 (예: Espresso 타입 ☕)"
                                    value={r.title}
                                    onChange={(e) => updateResult(idx, 'title', e.target.value)}
                                />
                                <textarea
                                    className="editor-textarea small"
                                    placeholder="결과 설명..."
                                    value={r.description}
                                    onChange={(e) => updateResult(idx, 'description', e.target.value)}
                                    rows={2}
                                />
                                <input
                                    className="editor-input"
                                    placeholder="특성 태그 (쉼표로 구분: 강함, 집중, 단순)"
                                    value={(r.traits || []).join(', ')}
                                    onChange={(e) => updateResultTraits(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {(quizType === 'full_custom' || quizType === 'sponsor' || quizType === 'name_input') && (
                        <button className="editor-btn secondary add-btn" onClick={addResult}>
                            + 결과 추가
                        </button>
                    )}

                    <div className="form-row">
                        <button className="editor-btn secondary" onClick={() => setStep(quizType === 'name_input' ? 2 : 3)}>
                            ← 이전
                        </button>
                        <button
                            className="editor-btn primary save-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? '저장 중...' : '💾 퀴즈 저장'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Complete */}
            {step === 5 && saveResult?.success && (
                <div className="editor-section complete-section">
                    <div className="complete-card">
                        <span className="complete-emoji">🎉</span>
                        <h2>퀴즈 생성 완료!</h2>
                        <div className="complete-info">
                            <p><strong>제목:</strong> {saveResult.data.title}</p>
                            <p><strong>타입:</strong> {saveResult.data.quiz_type}</p>
                            <p><strong>질문:</strong> {saveResult.data.question_count}개</p>
                            <p><strong>결과:</strong> {saveResult.data.result_count}개</p>
                        </div>
                        <div className="form-row">
                            <button className="editor-btn secondary" onClick={() => {
                                setStep(1);
                                setTitle('');
                                setDescription('');
                                setQuestions([]);
                                setResults([]);
                                setThumbnail(null);
                                setThumbnailPreview('');
                                setSaveResult(null);
                            }}>
                                새 퀴즈 만들기
                            </button>
                            <button className="editor-btn primary" onClick={() => navigate('/admin')}>
                                Admin으로 이동
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
