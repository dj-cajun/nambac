import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../lib/apiConfig';
import { createAdminApi, uploadQuizImage } from '../lib/adminApi';
import { QUIZ_CATEGORIES, DEFAULT_QUIZ_CATEGORY, normalizeCategory, getPersonas } from '../constants/categories';
import { QUIZ_TEMPLATES } from '../../shared/quizTemplates.js';
import './QuizEditor.css';

const QUIZ_TYPES = [
    { value: 'binary_5q', label: '🎯 Binary 5Q', desc: '5 câu A/B (mặc định)', qCount: 5, rCount: 8 },
    { value: 'name_input', label: '✍️ Nhập tên', desc: 'Tên → kết quả ngẫu nhiên', qCount: 0, rCount: 10 },
    { value: 'mbti_12q', label: '🧠 MBTI 12Q', desc: '12 câu → 16 kiểu', qCount: 12, rCount: 16 },
    { value: 'sponsor', label: '💎 Nhà tài trợ', desc: 'Thiết kế + video tùy chỉnh', qCount: 5, rCount: 4 },
    { value: 'full_custom', label: '⚙️ Full custom', desc: 'Chỉnh sửa mọi thứ', qCount: 5, rCount: 4 },
];

const EDITOR_CATEGORIES = QUIZ_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
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

    const [isAuth, setIsAuth] = useState(true);

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
        setGenerateStatus('🤖 AI đang lên kịch bản quiz...');
        
        try {
            // Server-side Gemini (Admin API key required)
            const activeCategory = normalizeCategory(selectedPersona?.category || category);
            setGenerateStatus(`🤖 Agent ${activeCategory} đang tạo quiz...`);

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

            // Notify user of progress (Do NOT go to step 2 yet)
            setGenerateStatus('🎨 Gemini đang viết prompt + tạo ảnh manga (9 ảnh: cover + kết quả)...');

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

                    alert('🎉 Quiz AI đã tạo và lưu thành công!');
                    exitEditor();
                } catch (saveErr) {
                    console.error('Auto-save Error:', saveErr);
                    alert(`❌ Lưu thất bại: ${saveErr.message}\nNội dung vẫn còn trong editor.`);
                } finally {
                    setSaving(false);
                }
            } catch (imgErr) {
                console.error('Image pipeline error:', imgErr);
                alert(`❌ Tạo ảnh thất bại: ${imgErr.message}`);
            }
        } catch (err) {
            console.error("AI Gen Error:", err);
            alert(`❌ AI thất bại: ${err.message}`);
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

    // Save quiz via Turso API
    const handleSave = async () => {
        if (!title.trim()) return alert('Nhập tiêu đề quiz');
        if (quizType !== 'name_input' && questions.some(q => !q.question_text.trim())) {
            return alert('Hoàn thiện tất cả câu hỏi');
        }
        if (results.some(r => !r.title.trim())) {
            return alert('Hoàn thiện tiêu đề tất cả kết quả');
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
                const { image_file, preview_url, ...dbPayload } = r;
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
            alert(`❌ Error: ${err.message}`);
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
                        <h1 className="editor-logo">🎮 EDITOR</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Quiz Factory</p>
                    </div>
                </div>
            )}
                <div className="editor-steps">
                    {['Loại', 'Thông tin', 'Câu hỏi', 'Kết quả', 'Xong'].map((label, i) => (
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
                    <h2 className="section-title">Chọn loại quiz</h2>
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

                    <div className="divider-or">hoặc dùng template B2B</div>

                    <div className="template-grid">
                        {QUIZ_TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                type="button"
                                className="type-card template-card"
                                onClick={() => applyTemplate(tpl)}
                            >
                                <span className="type-label">{tpl.label}</span>
                                <span className="type-desc">{tpl.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="divider-or">hoặc</div>
                    
                    <div className="ai-gen-wrapper">
                        {!showAiInput ? (
                            <button 
                                className="editor-btn ai-btn transition-transform hover:scale-[1.02]"
                                onClick={() => setShowAiInput(true)}
                                disabled={isAiGenerating}
                            >
                                <span className="text-2xl">✨</span>
                                <span>Tạo quiz bằng AI trong 10 giây</span>
                            </button>
                        ) : (
                            <form onSubmit={handleAiGenerate} className="ai-input-form">
                                <h3 className="text-sm font-black text-[#FF2D85] mb-2 uppercase tracking-widest text-center">AI Persona Choice</h3>
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
                                        <>Đang tạo... <span className="animate-spin text-lg">⏳</span></>
                                    ) : (
                                        <>Tạo quiz AI theo danh mục này 🚀</>
                                    )}
                                </button>
                                <button type="button" className="text-gray-400 font-bold text-[10px] mt-4 underline block w-full text-center" onClick={() => setShowAiInput(false)}>Hủy</button>
                            </form>
                        )}
                    </div>

                    <div className="divider-or">hoặc</div>

                    <button
                        className="editor-btn secondary zip-btn"
                        onClick={() => zipInputRef.current?.click()}
                        disabled={saving}
                    >
                        📦 Tải lên ZIP
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
                            placeholder="VD: Bạn là loại cà phê nào?"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="editor-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả quiz..."
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
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
                                <p>• Kích thước: 1080×1080</p>
                                <p>• JPG, PNG, WEBP</p>
                                <p>• Tối đa 5MB</p>
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
                            <label>💎 Thiết kế thương hiệu</label>
                            <input
                                className="editor-input mb-2"
                                placeholder="Tên thương hiệu (VD: Grab Vietnam)"
                                value={design.brand_name || ''}
                                onChange={(e) => updateDesign('brand_name', e.target.value)}
                            />
                            <input
                                className="editor-input mb-2"
                                placeholder="Logo URL (/images/sponsor-logo.png)"
                                value={design.sponsor_logo || ''}
                                onChange={(e) => updateDesign('sponsor_logo', e.target.value)}
                            />
                            <input
                                className="editor-input mb-2"
                                placeholder="Banner URL (/images/sponsor-banner.png)"
                                value={design.sponsor_banner || ''}
                                onChange={(e) => updateDesign('sponsor_banner', e.target.value)}
                            />
                            <input
                                className="editor-input"
                                placeholder="Màu chủ đạo (#FF2D85)"
                                value={design.primary_color || ''}
                                onChange={(e) => updateDesign('primary_color', e.target.value)}
                            />
                        </div>
                    )}
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

                        {saveResult.data.brand_report_token && saveResult.data.id && (
                            <div className="brand-report-link-box mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                                <p className="text-xs font-black text-yellow-800 uppercase mb-2">📊 Brand Report Link</p>
                                <code className="text-[11px] break-all text-gray-700">
                                    /brands/report/{saveResult.data.id}/{saveResult.data.brand_report_token}
                                </code>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <button className="editor-btn primary w-full text-lg py-5" onClick={exitEditor}>
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
