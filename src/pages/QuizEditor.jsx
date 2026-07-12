import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/apiConfig';
import { createAdminApi, uploadQuizImage } from '../lib/adminApi';
import { QUIZ_CATEGORIES, DEFAULT_QUIZ_CATEGORY, normalizeCategory, getPersonas } from '../constants/categories';
import { QUIZ_TEMPLATES } from '../../shared/quizTemplates.js';
import './QuizEditor.css';

const QUIZ_TYPES = [
    { value: 'binary_5q', label: '🎯 이지선다 5문항', desc: '5문항 A/B (기본)', qCount: 5, rCount: 8 },
    { value: 'name_input', label: '✍️ 이름 입력', desc: '이름 → 랜덤 결과', qCount: 0, rCount: 10 },
    { value: 'mbti_12q', label: '🧠 MBTI 12문항', desc: '12문항 → 16유형', qCount: 12, rCount: 16 },
    { value: 'sponsor', label: '💎 스폰서', desc: '브랜드 디자인 + 영상', qCount: 5, rCount: 4 },
    { value: 'full_custom', label: '⚙️ 완전 커스텀', desc: '모든 항목 직접 편집', qCount: 5, rCount: 4 },
];

const QUIZ_TYPE_NAMES = Object.fromEntries(QUIZ_TYPES.map((t) => [t.value, t.label]));

const EDITOR_CATEGORIES = QUIZ_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.labelKo || c.label,
}));

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

export default function QuizEditor({ embedded = false, onClose }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const zipInputRef = useRef(null);
    const api = useMemo(() => createAdminApi(), []);

    const saveImageFile = async (file) => {
        try {
            return await uploadQuizImage(file);
        } catch (err) {
            console.warn('Image upload failed:', err.message);
            return `/images/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        }
    };

    const exitEditor = () => {
        if (embedded && onClose) {
            onClose();
            return;
        }
        navigate('/admin');
    };

    // Editor state
    const [step, setStep] = useState(1); // 1=type, 2=info, 3=questions, 4=results, 5=preview
    const [quizType, setQuizType] = useState('binary_5q');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(DEFAULT_QUIZ_CATEGORY);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);
    const [design, setDesign] = useState({});
    const [quizConfig, setQuizConfig] = useState({});

    // AI Generation state
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(false);
    const [generateStatus, setGenerateStatus] = useState('');

    const goToAiEditorDraft = (notice) => {
        setQuizType('binary_5q');
        setStep(2);
        setShowAiInput(false);
        if (notice) setGenerateStatus(notice);
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

    const applyTemplate = (template) => {
        selectQuizType(template.quiz_type);
        setTitle(template.title);
        setDescription(template.description);
        setCategory(normalizeCategory(template.category));
        setDesign(template.design || {});
        setQuizConfig(template.config || {});
        if (template.questions?.length) {
            setQuestions(template.questions.map((q, i) => ({ ...emptyQuestion(template.quiz_type, i + 1), ...q, order_number: i + 1 })));
        }
        if (template.results?.length) {
            setResults(template.results.map((r, i) => ({ ...emptyResult(i), ...r })));
        }
        setStep(2);
    };

    const updateDesign = (field, value) => {
        setDesign((prev) => ({ ...prev, [field]: value }));
    };

    // AI Generation handler
    // AI Generation handler — Category-based Expert Agents
    const personas = getPersonas();
    const [selectedPersona, setSelectedPersona] = useState(personas[0]);

    const handleAiGenerate = async (e) => {
        e.preventDefault();
        setIsAiGenerating(true);
        setGenerateStatus('🤖 AI가 퀴즈 시나리오를 작성 중…');
        
        try {
            // Server-side Gemini (Admin API key required)
            const activeCategory = normalizeCategory(selectedPersona?.category || category);
            const categoryLabel = QUIZ_CATEGORIES.find((c) => c.id === activeCategory)?.labelKo || activeCategory;
            setGenerateStatus(`🤖 ${categoryLabel} 에이전트가 퀴즈를 생성 중…`);

            const data = await api.generateQuizContent(activeCategory);
            console.log("AI Generation Successful:", data);

            // Populate state from Gemini response
            setTitle(data.title || '');
            setDescription(data.description || '');
            setCategory(activeCategory);
            
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
            setQuizType('binary_5q');

            setGenerateStatus('🎨 Gemini가 프롬프트 작성 및 만화 이미지 생성 중 (9장: 커버 + 결과)…');

            try {
                const quizTitleStr = data.title || '';
                const quizCatStr = activeCategory;
                const quizDescStr = data.description || '';

                const { images } = await api.generateQuizImages({
                    title: quizTitleStr,
                    description: quizDescStr,
                    category: quizCatStr,
                    questions: formattedQs,
                    results: finalResults,
                    idPrefix: `editor_${Date.now()}`,
                    delayMs: 2500,
                });

                const finalThumbnailUrl = images.cover_url;
                if (finalThumbnailUrl) {
                    setThumbnailPreview(getImageUrl(finalThumbnailUrl));
                }

                const qsWithImages = formattedQs.map((q, i) => ({
                    ...q,
                    image_url: images.questions.find((x) => x.order_number === i + 1)?.image_url || null,
                }));
                setQuestions(qsWithImages);

                const completedResults = finalResults.map((r) => ({
                    ...r,
                    image_url: images.results.find((x) => x.result_code === r.result_code)?.image_url || r.image_url,
                }));
                setResults(completedResults);

                setSaving(true);
                try {
                    await api.createQuiz({
                        title: quizTitleStr,
                        description: quizDescStr,
                        category: quizCatStr,
                        quiz_type: 'binary_5q',
                        image_url: finalThumbnailUrl,
                        questions: qsWithImages.map((q) => ({
                            order_number: q.order_number,
                            question_text: q.question_text,
                            option_a: q.option_a,
                            option_b: q.option_b,
                            score_a: q.score_a,
                            score_b: q.score_b,
                            image_url: q.image_url,
                        })),
                        results: completedResults.map((r) => ({
                            result_code: r.result_code,
                            title: r.title || r.type_name || '',
                            description: r.description || '',
                            traits: r.traits || [],
                            image_url: r.image_url || null,
                        })),
                    });

                    setGenerateStatus('');
                    alert('🎉 AI 퀴즈가 생성되어 저장되었습니다!');
                    exitEditor();
                } catch (saveErr) {
                    console.error('Auto-save Error:', saveErr);
                    goToAiEditorDraft(`⚠️ 저장 실패: ${saveErr.message} — 내용을 확인한 뒤 직접 저장해 주세요.`);
                    alert(`❌ 저장 실패: ${saveErr.message}\n에디터에서 내용을 확인한 뒤 저장해 주세요.`);
                } finally {
                    setSaving(false);
                }
            } catch (imgErr) {
                console.error('Image pipeline error:', imgErr);
                goToAiEditorDraft(`⚠️ 이미지 생성 실패: ${imgErr.message} — 텍스트는 준비되었습니다. 확인 후 저장해 주세요.`);
                alert(`❌ 이미지 생성 실패: ${imgErr.message}\n생성된 텍스트는 에디터에서 확인할 수 있습니다.`);
            }
        } catch (err) {
            console.error("AI Gen Error:", err);
            setGenerateStatus('');
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
    const handleZipUpload = async () => {
        alert('서버리스 환경에서는 ZIP 업로드를 사용할 수 없습니다. 직접 퀴즈를 만들어 주세요.');
    };

    // Save quiz via Turso API
    const handleSave = async () => {
        if (!title.trim()) return alert('퀴즈 제목을 입력하세요');
        if (quizType !== 'name_input' && questions.some(q => !q.question_text.trim())) {
            return alert('모든 문항을 완성해 주세요');
        }
        if (results.some(r => !r.title.trim())) {
            return alert('모든 결과 제목을 완성해 주세요');
        }

        setSaving(true);
        try {
            let finalThumbnailUrl = null;
            if (thumbnail) {
                finalThumbnailUrl = await saveImageFile(thumbnail);
            }

            const resultPayload = await Promise.all(results.map(async r => {
                let finalResUrl = r.image_url;
                if (r.image_file) {
                    finalResUrl = await saveImageFile(r.image_file);
                }
                const { image_file: _imageFile, preview_url: _previewUrl, ...dbPayload } = r;
                return { ...dbPayload, image_url: finalResUrl };
            }));

            const created = await api.createQuiz({
                title,
                description,
                category: normalizeCategory(category),
                quiz_type: quizType,
                image_url: finalThumbnailUrl,
                design: Object.keys(design).length ? design : undefined,
                config: Object.keys(quizConfig).length ? quizConfig : undefined,
                questions: quizType !== 'name_input'
                    ? questions.map((q, i) => ({ ...q, order_number: i + 1 }))
                    : [],
                results: resultPayload,
            });

            setSaveResult({
                success: true,
                data: {
                    title,
                    quiz_type: quizType,
                    question_count: questions.length,
                    result_count: results.length,
                    id: created.id,
                    brand_report_token: created.brand_report_token,
                },
            });
            setStep(5);
        } catch (err) {
            console.error("Save Error:", err);
            alert(`❌ 오류: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`editor-container ${embedded ? 'embedded' : ''}`}>
            {/* Header */}
            {!embedded && (
                <div className="editor-header">
                    <div className="flex flex-col items-center mb-2">
                        <h1 className="editor-logo">🎮 퀴즈 에디터</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI 퀴즈 팩토리</p>
                    </div>
                </div>
            )}
                <div className="editor-steps">
                    {['유형', '기본정보', '문항', '결과', '완료'].map((label, i) => (
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

            {(isAiGenerating || generateStatus) && (
                <div className={`editor-generate-status ${isAiGenerating ? 'is-loading' : 'is-notice'}`} role="status" aria-live="polite">
                    {isAiGenerating && <span className="editor-generate-spinner" aria-hidden="true" />}
                    <p className="editor-generate-status-text">{generateStatus}</p>
                    {!isAiGenerating && generateStatus && (
                        <button
                            type="button"
                            className="editor-generate-status-dismiss"
                            onClick={() => setGenerateStatus('')}
                        >
                            닫기
                        </button>
                    )}
                </div>
            )}

            {/* Step 1: Quiz Type Selection */}
            {step === 1 && (
                <div className="editor-section">
                    <h2 className="section-title">퀴즈 유형 선택</h2>
                    <div className="type-grid">
                        {QUIZ_TYPES.map(t => (
                            <button
                                key={t.value}
                                className={`type-card ${quizType === t.value ? 'selected' : ''}`}
                                onClick={() => selectQuizType(t.value)}
                            >
                                <span className="type-label">{t.label}</span>
                                <span className="type-desc">{t.desc}</span>
                                <span className="type-meta">문항: {t.qCount} / 결과: {t.rCount}</span>
                            </button>
                        ))}
                    </div>

                    <div className="divider-or">또는 B2B 템플릿 사용</div>

                    <div className="template-grid">
                        {QUIZ_TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                type="button"
                                className="type-card template-card"
                                onClick={() => applyTemplate(tpl)}
                            >
                                <span className="type-label">{tpl.labelKo || tpl.label}</span>
                                <span className="type-desc">{tpl.titleKo || tpl.title}</span>
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
                                <h3 className="text-sm font-black text-[#FF2D85] mb-2 uppercase tracking-widest text-center">AI 페르소나 선택</h3>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                                    {personas.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPersona(p);
                                                setCategory(p.category);
                                            }}
                                            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${selectedPersona.name === p.name 
                                                ? 'bg-black text-white border-black scale-110 z-10' 
                                                : 'bg-white text-gray-400 border-gray-100 opacity-60 hover:opacity-100'}`}
                                        >
                                            <span className="text-xl">{p.emoji}</span>
                                            <span className="text-[8px] font-black">{p.labelKo || p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-[#FF2D85] text-white py-4 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 mt-4 shadow-lg flex items-center justify-center gap-2"
                                    disabled={isAiGenerating}
                                >
                                    {isAiGenerating ? (
                                        <>생성 중… <span className="animate-spin text-lg">⏳</span></>
                                    ) : (
                                        <>이 카테고리로 AI 퀴즈 생성 🚀</>
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
                        📦 ZIP 업로드
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
                    <h2 className="section-title">✨ 퀴즈 기본 정보</h2>
                    <div className="form-group">
                        <label>제목</label>
                        <input
                            className="editor-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 당신은 어떤 커피 타입인가요?"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label>설명</label>
                        <textarea
                            className="editor-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="퀴즈 설명…"
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>카테고리</label>
                        <div className="category-chips">
                            {EDITOR_CATEGORIES.map(c => (
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
                        <div className="flex items-center gap-6">
                            <div className="thumbnail-upload group relative" onClick={() => fileInputRef.current?.click()}>
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="썸네일" className="thumb-preview" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl group-hover:scale-125 transition-transform">📷</span>
                                        <span className="text-[10px] font-black text-gray-400">업로드</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 font-bold leading-relaxed">
                                <p>• 권장 크기: 1080×1080</p>
                                <p>• JPG, PNG, WEBP</p>
                                <p>• 최대 5MB</p>
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
                    {(quizType === 'sponsor' || quizType === 'full_custom') && (
                        <div className="form-group sponsor-design-block">
                            <label>💎 브랜드 디자인</label>
                            <input
                                className="editor-input mb-2"
                                placeholder="브랜드명 (예: Grab Vietnam)"
                                value={design.brand_name || ''}
                                onChange={(e) => updateDesign('brand_name', e.target.value)}
                            />
                            <input
                                className="editor-input mb-2"
                                placeholder="로고 URL (/images/sponsor-logo.png)"
                                value={design.sponsor_logo || ''}
                                onChange={(e) => updateDesign('sponsor_logo', e.target.value)}
                            />
                            <input
                                className="editor-input mb-2"
                                placeholder="배너 URL (/images/sponsor-banner.png)"
                                value={design.sponsor_banner || ''}
                                onChange={(e) => updateDesign('sponsor_banner', e.target.value)}
                            />
                            <input
                                className="editor-input"
                                placeholder="메인 컬러 (#FF2D85)"
                                value={design.primary_color || ''}
                                onChange={(e) => updateDesign('primary_color', e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-row mt-10">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(1)}>이전</button>
                        <button
                            className="editor-btn primary px-10"
                            onClick={() => setStep(quizType === 'name_input' ? 4 : 3)}
                            disabled={!title.trim()}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Questions */}
            {step === 3 && quizType !== 'name_input' && (
                <div className="editor-section">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="section-title !m-0">📝 문항</h2>
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
                                        placeholder="문항을 입력하세요…"
                                        value={q.question_text}
                                        onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                                    />
                                    <div className="option-row">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">A</span>
                                            <input
                                                className="editor-input option-input !pl-8"
                                                placeholder="선택지 A"
                                                value={q.option_a}
                                                onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">B</span>
                                            <input
                                                className="editor-input option-input !pl-8"
                                                placeholder="선택지 B"
                                                value={q.option_b}
                                                onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {quizType === 'binary_5q' && (
                                        <div className="flex gap-4 px-2">
                                            <span className="text-[10px] font-black text-[#FF2D85]">{q.score_a}점</span>
                                            <span className="text-[10px] font-black text-gray-400">점수 패턴</span>
                                            <span className="text-[10px] font-black text-[#FF2D85]">{q.score_b}점</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {(quizType === 'full_custom' || quizType === 'sponsor') && (
                        <button className="editor-btn secondary add-btn group" onClick={addQuestion}>
                            <span className="group-hover:rotate-90 transition-transform inline-block">+</span>
                            <span>문항 추가</span>
                        </button>
                    )}

                    <div className="form-row mt-6">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(2)}>이전</button>
                        <button className="editor-btn primary px-10" onClick={() => setStep(4)}>다음</button>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && (
                <div className="editor-section">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="section-title !m-0">🏆 결과</h2>
                        {quizType === 'mbti_12q' && <span className="badge">16유형</span>}
                    </div>

                    <div className="results-list">
                        {results.map((r, idx) => (
                            <div key={idx} className="result-editor-card">
                                <div className="r-header mb-4">
                                    <span className="r-code">
                                        {quizType === 'binary_5q' ? `레벨 ${r.result_code}` :
                                            quizType === 'mbti_12q' ? `유형 #${idx + 1}` :
                                                `결과 ${idx + 1}`}
                                    </span>
                                    {(quizType === 'full_custom' || quizType === 'sponsor' || quizType === 'name_input') && (
                                        <button className="q-remove hover:scale-110 transition-transform" onClick={() => removeResult(idx)}>✕</button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <input
                                        className="editor-input"
                                        placeholder="결과 제목 (예: 커피 마스터 ☕)"
                                        value={r.title}
                                        onChange={(e) => updateResult(idx, 'title', e.target.value)}
                                    />
                                    <textarea
                                        className="editor-textarea !min-h-[80px]"
                                        placeholder="상세 설명…"
                                        value={r.description}
                                        onChange={(e) => updateResult(idx, 'description', e.target.value)}
                                        rows={2}
                                    />
                                    <input
                                        className="editor-input"
                                        placeholder="태그 (쉼표로 구분: 강함, 대담, 빠름)"
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
                            <span>결과 유형 추가</span>
                        </button>
                    )}

                    <div className="form-row mt-6">
                        <button className="editor-btn secondary px-10" onClick={() => setStep(quizType === 'name_input' ? 2 : 3)}>
                            이전
                        </button>
                        <button
                            className="editor-btn primary save-btn px-10"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>저장 중…</span>
                                </div>
                            ) : '💾 퀴즈 저장'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Complete */}
            {step === 5 && saveResult?.success && (
                <div className="editor-section complete-section">
                    <div className="complete-card">
                        <span className="complete-emoji">💎</span>
                        <h2 className="text-3xl font-black mb-2">퀴즈 게시 완료!</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">데이터베이스에 저장되었습니다</p>
                        
                        <div className="complete-info mb-10">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <span className="text-xs font-black text-gray-400 uppercase">제목</span>
                                <span className="font-bold text-gray-900">{saveResult.data.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase mb-1">유형</span>
                                    <span className="font-bold text-sm bg-pink-50 text-[#FF2D85] px-2 py-1 rounded-lg border border-pink-100">{QUIZ_TYPE_NAMES[saveResult.data.quiz_type] || saveResult.data.quiz_type}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase mb-1">통계</span>
                                    <span className="font-bold text-sm">{saveResult.data.question_count}문항 / {saveResult.data.result_count}결과</span>
                                </div>
                            </div>
                        </div>

                        {saveResult.data.brand_report_token && saveResult.data.id && (
                            <div className="brand-report-link-box mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                                <p className="text-xs font-black text-yellow-800 uppercase mb-2">📊 브랜드 리포트 링크</p>
                                <code className="text-[11px] break-all text-gray-700">
                                    /brands/report/{saveResult.data.id}/{saveResult.data.brand_report_token}
                                </code>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <button className="editor-btn primary w-full text-lg py-5" onClick={exitEditor}>
                                관리자 대시보드로
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
                                새 퀴즈 만들기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
