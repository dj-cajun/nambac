import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/apiConfig';
import { supabase } from '../lib/supabase';
import { generateQuizContent } from '../lib/gemini';
import { generateCoverImage, generateResultImage, base64ToFile } from '../lib/imagen';
import { QUIZ_CATEGORIES } from '../constants/categories';
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

export default function QuizEditor({ embedded = false, initialAuth = false }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const zipInputRef = useRef(null);

    // Auth
    const [isAuth, setIsAuth] = useState(initialAuth);
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

    // AI Generation state
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(false);

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

    // AI Generation handler
    // AI Generation handler — Category-based Expert Agents
    const [selectedPersona, setSelectedPersona] = useState({ name: 'MBTI', emoji: '🧠', prompt: 'MBTI' });
    const personas = [
        { name: 'MBTI', emoji: '🧠', prompt: 'MBTI' },
        { name: 'Personality', emoji: '🎭', prompt: 'Personality' },
        { name: 'PastLife', emoji: '🧞', prompt: 'PastLife' },
        { name: 'Fortune', emoji: '🔮', prompt: 'Fortune' },
        { name: 'Survival', emoji: '🏋️', prompt: 'Survival' },
        { name: 'Trendy', emoji: '🔥', prompt: 'Trendy' },
        { name: 'Delivery', emoji: '🛵', prompt: 'Delivery' },
        { name: 'Lookalike', emoji: '🔗', prompt: 'Lookalike' },
    ];

    const handleAiGenerate = async (e) => {
        e.preventDefault();
        setIsAiGenerating(true);
        setGenerateStatus('🤖 AI 에이전트가 퀴즈를 기획하는 중...');
        
        try {
            // Direct Gemini API call (works on both local and production)
            const topic = selectedPersona?.prompt || aiTopic || category;
            const data = await generateQuizContent(topic, category);
            console.log("AI Generation Successful:", data);

            // Populate state from Gemini response
            setTitle(data.title || '');
            setDescription(data.description || '');
            if (data.category) setCategory(data.category);
            
            // Format Questions
            const formattedQs = (data.questions || []).map((q, i) => ({
                ...q,
                order_number: i + 1,
                score_a: q.score_a ?? 0,
                score_b: q.score_b ?? 0
            }));
            setQuestions(formattedQs);

            // Format Results
            const formattedRs = (data.results || []).map(r => ({
                ...r,
                result_code: r.result_code ?? r.score ?? 0,
                title: r.type_name || r.result_title || r.title || '',
                description: r.description || r.result_description || '',
                traits: Array.isArray(r.traits) ? r.traits : []
            }));

            // Ensure we have exactly 8 results for binary_5q
            const finalResults = Array.from({ length: 8 }, (_, i) => {
                const found = formattedRs.find(r => r.score === i || r.result_code === i);
                const resultObj = found || formattedRs[i] || emptyResult(i);
                return { ...resultObj, result_code: i, title: resultObj.type_name || resultObj.title || '' };
            });
            setResults(finalResults);

            // Notify user of progress (Do NOT go to step 2 yet)
            console.log('✨ 텍스트 완성! 백그라운드 이미지 생성 시작...');

            // Background Image Generation & Save
            try {
                // Cover Image
                let finalThumbnailUrl = null;
                const quizTitleStr = data.title || '';
                const quizCatStr = data.category || 'fun';
                const quizDescStr = data.description || '';
                
                let coverB64 = null;
                try {
                    coverB64 = await generateCoverImage(quizTitleStr, quizCatStr, quizDescStr);
                } catch(e) { console.error("Cover image error:", e); }

                let coverFile = null;
                if (coverB64) {
                    coverFile = base64ToFile(coverB64, 'cover.png');
                    setThumbnail(coverFile);
                    setThumbnailPreview(URL.createObjectURL(coverFile));
                    // Upload cover directly to Supabase
                    const fileName = `quiz_${Date.now()}_cover.png`;
                    const { error: uploadError } = await supabase.storage.from('quiz-images').upload(fileName, coverFile);
                    if (!uploadError) finalThumbnailUrl = `/${fileName}`;
                }

                // Result Images
                let completedResults = [...finalResults];
                
                for (let i = 0; i < completedResults.length; i++) {
                    const r = completedResults[i];
                    try {
                        const b64 = await generateResultImage(r.title || '', r.description || '');
                        if (b64) {
                            const file = base64ToFile(b64, `result_${i}.png`);
                            // Upload result image to Supabase
                            const rFileName = `result_${Date.now()}_${i}.png`;
                            const { error: rUploadError } = await supabase.storage.from('quiz-images').upload(rFileName, file);
                            if (!rUploadError) {
                                r.image_url = `/${rFileName}`;
                            }
                            setResults(prev => prev.map((res, idx) => idx === i ? { ...res, image_file: file, preview_url: URL.createObjectURL(file), image_url: r.image_url } : res));
                        }
                    } catch (e) {
                        console.error(`Result ${i} image err:`, e);
                    }
                    // Short delay between requests to prevent 429 Too Many Requests
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // 🚀 AUTO-SAVE: Direct Supabase Save 🚀
                setSaving(true);
                try {
                    // 1. Save quiz metadata
                    const { data: quizData, error: quizError } = await supabase
                        .from('quizzes')
                        .insert({
                            title: quizTitleStr,
                            description: quizDescStr,
                            category: quizCatStr,
                            quiz_type: 'binary_5q',
                            image_url: finalThumbnailUrl,
                            is_active: true,
                        })
                        .select()
                        .single();

                    if (quizError) throw new Error(`퀴즈 저장 실패: ${quizError.message}`);
                    const newQuizId = quizData.id;

                    // 2. Save questions
                    const questionRows = formattedQs.map(q => ({
                        quiz_id: newQuizId,
                        order_number: q.order_number,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        score_a: q.score_a,
                        score_b: q.score_b,
                    }));
                    const { error: qError } = await supabase.from('questions').insert(questionRows);
                    if (qError) console.error('질문 저장 에러:', qError);

                    // 3. Save results
                    const resultRows = completedResults.map(r => ({
                        quiz_id: newQuizId,
                        result_code: r.result_code,
                        title: r.title || r.type_name || '',
                        description: r.description || '',
                        traits: r.traits || [],
                        image_url: r.image_url || null,
                    }));
                    const { error: rError } = await supabase.from('results').insert(resultRows);
                    if (rError) console.error('결과 저장 에러:', rError);

                    alert('🎉 AI 퀴즈가 성공적으로 생성되고 저장되었습니다!');
                    navigate('/admin');
                } catch (saveErr) {
                    console.error("Auto-save Error:", saveErr);
                    alert(`❌ 저장 실패: ${saveErr.message}\n하지만 텍스트와 이미지는 에디터에 남겨두었습니다.`);
                } finally {
                    setSaving(false);
                }

            } catch (err) {
                console.error("AI Image Trigger Error:", err);
            }
        } catch (err) {
            console.error("AI Gen Error:", err);
            alert(`❌ AI 생성 실패: ${err.message}`);
        } finally {
            setIsAiGenerating(false);
        }
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
                const rPayload = await Promise.all(results.map(async r => {
                    let finalResUrl = r.image_url;
                    if (r.image_file) {
                        const rFileName = `result_${Date.now()}_${r.result_code}_${r.image_file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                        const { error: rUploadError } = await supabase.storage.from('quiz-images').upload(rFileName, r.image_file);
                        if (rUploadError) throw rUploadError;
                        finalResUrl = `/${rFileName}`;
                    }
                    const { image_file, preview_url, ...dbPayload } = r;
                    return { ...dbPayload, image_url: finalResUrl, quiz_id: newQuizId };
                }));
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
            <div className="editor-container flex items-center justify-center p-6">
                <div className="editor-auth-card w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-6">⚙️</div>
                        <h1 className="text-3xl font-black text-[#FF2D85] tracking-tight m-0">Quiz Editor</h1>
                        <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-xs">NamBac Dashboard</p>
                    </div>
                    
                    <form onSubmit={handleAuth} className="flex flex-col gap-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin Password"
                            className="editor-input text-center"
                            autoFocus
                        />
                        <button type="submit" className="editor-btn primary w-full text-lg py-4">
                            접속하기
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={`editor-container ${embedded ? 'embedded' : ''}`}>
            {/* Header */}
            {!embedded && (
                <div className="editor-header">
                    <div className="flex flex-col items-center mb-2">
                        <h1 className="editor-logo">🎮 EDITOR</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Quiz Factory</p>
                    </div>
                </div>
            )}
                <div className="editor-steps">
                    {['타입', '정보', '질문', '결과', '완료'].map((label, i) => (
                        <div
                            key={i}
                            className={`step-dot ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
                            onClick={() => step > i + 1 && setStep(i + 1)}
                        >
                            <span className="step-num text-[10px]">{step > i + 1 ? '✓' : i + 1}</span>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
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
                    
                    <div className="ai-gen-wrapper">
                        {!showAiInput ? (
                            <button 
                                className="editor-btn ai-btn transition-transform hover:scale-[1.02]"
                                onClick={() => setShowAiInput(true)}
                                disabled={isAiGenerating}
                            >
                                <span className="text-2xl">✨</span>
                                <span>AI로 10초 만에 퀴즈 만들기</span>
                            </button>
                        ) : (
                            <form onSubmit={handleAiGenerate} className="ai-input-form">
                                <h3 className="text-sm font-black text-[#FF2D85] mb-2 uppercase tracking-widest text-center">AI Persona Choice</h3>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                                    {personas.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => setSelectedPersona(p)}
                                            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${selectedPersona.name === p.name 
                                                ? 'bg-black text-white border-black scale-110 z-10' 
                                                : 'bg-white text-gray-400 border-gray-100 opacity-60 hover:opacity-100'}`}
                                        >
                                            <span className="text-xl">{p.emoji}</span>
                                            <span className="text-[8px] font-black">{p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-[#FF2D85] text-white py-4 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 mt-4 shadow-lg flex items-center justify-center gap-2"
                                    disabled={isAiGenerating}
                                >
                                    {isAiGenerating ? (
                                        <>생성 중... <span className="animate-spin text-lg">⏳</span></>
                                    ) : (
                                        <>이 카테고리로 AI 퀴즈 자동 생성하기 🚀</>
                                    )}
                                </button>
                                <button type="button" className="text-gray-400 font-bold text-[10px] mt-4 underline block w-full text-center" onClick={() => setShowAiInput(false)}>취소</button>
                            </form>
                        )}
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
                    <h2 className="section-title">✨ Quiz Information</h2>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            className="editor-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: Bạn là loại cà phê nào?"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="editor-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="퀴즈 설명을 입력하세요..."
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
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
                        <label>Thumbnail Image</label>
                        <div className="flex items-center gap-6">
                            <div className="thumbnail-upload group relative" onClick={() => fileInputRef.current?.click()}>
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="thumb" className="thumb-preview" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl group-hover:scale-125 transition-transform">📷</span>
                                        <span className="text-[10px] font-black text-gray-400">UPLOAD</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 font-bold leading-relaxed">
                                <p>• 추천 사이즈: 1080x1080</p>
                                <p>• JPG, PNG, WEBP 지원</p>
                                <p>• 5MB 이하 권장</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnail}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="form-row mt-10">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(1)}>Back</button>
                        <button
                            className="editor-btn primary px-10"
                            onClick={() => setStep(quizType === 'name_input' ? 4 : 3)}
                            disabled={!title.trim()}
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Questions */}
            {step === 3 && quizType !== 'name_input' && (
                <div className="editor-section">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="section-title !m-0">📝 Questions</h2>
                        <span className="badge">{QUIZ_TYPES.find(t => t.value === quizType)?.label}</span>
                    </div>

                    <div className="questions-list">
                        {questions.map((q, idx) => (
                            <div key={idx} className="question-editor-card group relative">
                                <div className="q-header mb-4">
                                    <div className="flex items-center gap-3">
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
                                    </div>
                                    {(quizType === 'full_custom' || quizType === 'sponsor') && (
                                        <button className="q-remove hover:scale-110 transition-transform" onClick={() => removeQuestion(idx)}>✕</button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <input
                                        className="editor-input"
                                        placeholder="Type your question here..."
                                        value={q.question_text}
                                        onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                                    />
                                    <div className="option-row">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">A</span>
                                            <input
                                                className="editor-input option-input !pl-8"
                                                placeholder="Option A"
                                                value={q.option_a}
                                                onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">B</span>
                                            <input
                                                className="editor-input option-input !pl-8"
                                                placeholder="Option B"
                                                value={q.option_b}
                                                onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {quizType === 'binary_5q' && (
                                        <div className="flex gap-4 px-2">
                                            <span className="text-[10px] font-black text-[#FF2D85]">{q.score_a}pt</span>
                                            <span className="text-[10px] font-black text-gray-400">SCORE PATTERN</span>
                                            <span className="text-[10px] font-black text-[#FF2D85]">{q.score_b}pt</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {(quizType === 'full_custom' || quizType === 'sponsor') && (
                        <button className="editor-btn secondary add-btn group" onClick={addQuestion}>
                            <span className="group-hover:rotate-90 transition-transform inline-block">+</span>
                            <span>Add Question</span>
                        </button>
                    )}

                    <div className="form-row mt-6">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(2)}>Back</button>
                        <button className="editor-btn primary px-10" onClick={() => setStep(4)}>Next Step</button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && (
                <div className="editor-section">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="section-title !m-0">🏆 Results</h2>
                        {quizType === 'mbti_12q' && <span className="badge">16 Types</span>}
                    </div>

                    <div className="results-list">
                        {results.map((r, idx) => (
                            <div key={idx} className="result-editor-card">
                                <div className="r-header mb-4">
                                    <span className="r-code">
                                        {quizType === 'binary_5q' ? `Level ${r.result_code}` :
                                            quizType === 'mbti_12q' ? `Type #${idx + 1}` :
                                                `Result ${idx + 1}`}
                                    </span>
                                    {(quizType === 'full_custom' || quizType === 'sponsor' || quizType === 'name_input') && (
                                        <button className="q-remove hover:scale-110 transition-transform" onClick={() => removeResult(idx)}>✕</button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <input
                                        className="editor-input"
                                        placeholder="Result Title (e.g. The Coffee Master ☕)"
                                        value={r.title}
                                        onChange={(e) => updateResult(idx, 'title', e.target.value)}
                                    />
                                    <textarea
                                        className="editor-textarea !min-h-[80px]"
                                        placeholder="Detailed description..."
                                        value={r.description}
                                        onChange={(e) => updateResult(idx, 'description', e.target.value)}
                                        rows={2}
                                    />
                                    <input
                                        className="editor-input"
                                        placeholder="Tags (comma separated: strong, bold, fast)"
                                        value={(r.traits || []).join(', ')}
                                        onChange={(e) => updateResultTraits(idx, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {(quizType === 'full_custom' || quizType === 'sponsor' || quizType === 'name_input') && (
                        <button className="editor-btn secondary add-btn group" onClick={addResult}>
                            <span className="group-hover:rotate-90 transition-transform inline-block">+</span>
                            <span>Add Result Type</span>
                        </button>
                    )}

                    <div className="form-row mt-6">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(quizType === 'name_input' ? 2 : 3)}>
                            Back
                        </button>
                        <button
                            className="editor-btn primary save-btn px-10"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : '💾 Save Quiz'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Complete */}
            {step === 5 && saveResult?.success && (
                <div className="editor-section complete-section">
                    <div className="complete-card">
                        <span className="complete-emoji">💎</span>
                        <h2 className="text-3xl font-black mb-2">Quiz Published!</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Successfully saved to database</p>
                        
                        <div className="complete-info mb-10">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <span className="text-xs font-black text-gray-400 uppercase">Title</span>
                                <span className="font-bold text-gray-900">{saveResult.data.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Type</span>
                                    <span className="font-bold text-sm bg-pink-50 text-[#FF2D85] px-2 py-1 rounded-lg border border-pink-100">{saveResult.data.quiz_type}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Stats</span>
                                    <span className="font-bold text-sm">{saveResult.data.question_count}Q / {saveResult.data.result_count}R</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button className="editor-btn primary w-full text-lg py-5" onClick={() => navigate('/admin')}>
                                Go to Admin Dashboard
                            </button>
                            <button className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-[#FF2D85] transition-colors" onClick={() => {
                                setStep(1);
                                setTitle('');
                                setDescription('');
                                setQuestions([]);
                                setResults([]);
                                setThumbnail(null);
                                setThumbnailPreview('');
                                setSaveResult(null);
                            }}>
                                Create New Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
