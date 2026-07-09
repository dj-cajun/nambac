import { useState, useEffect, useMemo, useCallback } from 'react';
import { QUIZ_CATEGORIES, getFilterTypes, getCategoryLabel, matchesCategory, normalizeCategory } from '../constants/categories';
import { getImageUrl } from '../lib/apiConfig';
import { createAdminApi } from '../lib/adminApi';
import { getAdminKey, setAdminKey } from '../lib/adminKey';
import { getArchetypesByGroup } from '../../shared/personalityArchetypes.js';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const getAdminCategoryLabel = (type) => {
    if (!type || type === 'all') return '전체';
    const cat = QUIZ_CATEGORIES.find((c) => c.id === normalizeCategory(type));
    return cat?.labelKo || getCategoryLabel(type);
};

const Admin = () => {
    const { isAdmin: isGoogleAdmin } = useAuth();
    const [adminKey, setAdminKeyState] = useState(() => getAdminKey());
    const isAdminAuthed = Boolean(adminKey) || isGoogleAdmin;
    const [unlockInput, setUnlockInput] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [unlockLoading, setUnlockLoading] = useState(false);
    const api = useMemo(() => createAdminApi(adminKey), [adminKey]);

    const [quizzes, setQuizzes] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [factoryOpen, setFactoryOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const [adminTab, setAdminTab] = useState('quizzes');
    const [inquiries, setInquiries] = useState([]);
    const [inquiriesLoading, setInquiriesLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersLoading, setUsersLoading] = useState(false);
    const [generatingArchetypeId, setGeneratingArchetypeId] = useState(null);
    const [archetypeStatus, setArchetypeStatus] = useState('');
    const [factoryWithImages, setFactoryWithImages] = useState(true);
    const [modalTab, setModalTab] = useState('info');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editQuestions, setEditQuestions] = useState([]);
    const [editResults, setEditResults] = useState([]);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [bundleLoading, setBundleLoading] = useState(false);
    const [bundleError, setBundleError] = useState('');

    const mbtiArchetypes = getArchetypesByGroup('mbti');
    const personalityArchetypes = getArchetypesByGroup('personality');
    const filterTypes = getFilterTypes();

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 3200);
    }, []);

    const handleUnlock = async (e) => {
        e.preventDefault();
        const key = unlockInput.trim();
        if (!key) return;
        setUnlockLoading(true);
        setUnlockError('');
        try {
            const testApi = createAdminApi(key);
            await testApi.fetchAllQuizzes();
            setAdminKey(key);
            setAdminKeyState(key);
            setUnlockInput('');
        } catch {
            setUnlockError('Admin key가 올바르지 않습니다.');
        } finally {
            setUnlockLoading(false);
        }
    };

    const displayedQuizzes = useMemo(() => {
        let list = quizzes;
        if (filterType !== 'all') {
            list = list.filter((q) => matchesCategory(q.category, filterType));
        }
        if (statusFilter === 'on') {
            list = list.filter((q) => q.is_active !== false && q.status !== 'hidden');
        } else if (statusFilter === 'off') {
            list = list.filter((q) => q.is_active === false || q.status === 'hidden');
        }
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter((quiz) =>
                quiz.title?.toLowerCase().includes(q)
                || quiz.id?.toLowerCase().includes(q)
                || getAdminCategoryLabel(quiz.category).toLowerCase().includes(q),
            );
        }
        return list;
    }, [quizzes, filterType, statusFilter, searchQuery]);

    const quizStats = useMemo(() => ({
        total: quizzes.length,
        active: quizzes.filter((q) => q.is_active !== false && q.status !== 'hidden').length,
        hidden: quizzes.filter((q) => q.is_active === false || q.status === 'hidden').length,
    }), [quizzes]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const combined = await api.fetchAllQuizzes();
            setQuizzes(combined);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast('퀴즈 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminAuthed) {
            fetchQuizzes();
        }
    }, [isAdminAuthed]);

    const fetchInquiries = async () => {
        setInquiriesLoading(true);
        try {
            const data = await api.fetchInquiries();
            setInquiries(data);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setInquiriesLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminAuthed && adminTab === 'b2b') {
            fetchInquiries();
        }
    }, [isAdminAuthed, adminTab]);

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const data = await api.fetchAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminAuthed && adminTab === 'analytics') {
            fetchAnalytics();
        }
    }, [isAdminAuthed, adminTab]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await api.fetchUsers();
            setUsers(data.users || []);
            setUsersTotal(data.total || 0);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('사용자 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (isAdminAuthed && adminTab === 'users') {
            fetchUsers();
        }
    }, [isAdminAuthed, adminTab]);

    const updateUserRole = async (userId, role) => {
        try {
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
            await api.updateUserRole(userId, role);
            showToast('권한이 변경되었습니다.', 'success');
        } catch (error) {
            console.error('Error updating user role:', error);
            showToast(`권한 변경 실패: ${error.message}`, 'error');
            fetchUsers();
        }
    };

    const updateInquiryStatus = async (id, newStatus) => {
        try {
            setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
            await api.updateInquiryStatus(id, newStatus);
        } catch (error) {
            console.error("Error updating inquiry status:", error);
            showToast(`문의 상태 변경 실패: ${error.message}`, 'error');
            fetchInquiries();
        }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('이 문의를 삭제할까요?')) return;
        try {
            setInquiries(prev => prev.filter(inq => inq.id !== id));
            await api.deleteInquiry(id);
            showToast('문의가 삭제되었습니다.', 'success');
        } catch (error) {
            console.error("Error deleting inquiry:", error);
            showToast(`문의 삭제 실패: ${error.message}`, 'error');
            fetchInquiries();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const handleGenerate = () => setShowEditor(true);

    const toggleStatus = async (id) => {
        try {
            const quiz = quizzes.find(q => q.id === id);
            if (!quiz) return;
            
            const newIsActive = quiz.is_active === false ? true : false;
            const newStatus = newIsActive ? 'visible' : 'hidden';

            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, is_active: newIsActive } : q));

            await api.updateQuizStatus(id, newIsActive, newStatus);
            showToast(newIsActive ? '퀴즈 공개됨' : '퀴즈 숨김 처리됨', 'success');
        } catch (error) {
            console.error("Error toggling status:", error);
            showToast(`상태 변경 실패: ${error.message}`, 'error');
            fetchQuizzes();
        }
    };

    const deleteQuiz = async (quizId) => {
        const id = quizId;
        if (!window.confirm('이 퀴즈를 삭제할까요?')) return;
        
        try {
            await api.deleteQuiz(id);
            setQuizzes(prev => prev.filter(q => q.id !== id));
            if (editingQuiz?.id === id) closeEditModal();
            showToast('퀴즈가 삭제되었습니다.', 'success');
        } catch (error) {
            console.error("Error deleting quiz:", error);
            showToast(`삭제 실패: ${error.message}`, 'error');
        }
    };

    const copyQuizLink = (id) => {
        const url = `${window.location.origin}/quiz/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast('링크가 복사되었습니다.', 'success');
        });
    };

    const handleGenerateArchetype = async (archetype) => {
        if (generatingArchetypeId) return;

        setGeneratingArchetypeId(archetype.id);
        const started = Date.now();
        const tick = () => {
            const sec = Math.floor((Date.now() - started) / 1000);
            const phase = factoryWithImages
                ? '텍스트 저장 중 (이미지는 완료 후 백그라운드)'
                : '텍스트만 생성 중';
            setArchetypeStatus(`${archetype.emoji} ${archetype.labelKo || archetype.label} — ${phase}… ${sec}초`);
        };
        tick();
        const timer = window.setInterval(tick, 1000);
        setFactoryOpen(true);

        try {
            const result = await api.generateArchetypeQuiz(archetype.id, {
                generateImages: factoryWithImages,
            });
            if (result.imagesSkippedReason) {
                setArchetypeStatus(`완료: ${result.title} (이미지는 로컬 backfill 필요)`);
                showToast(result.imagesSkippedReason, 'error');
            } else if (result.imagesPending) {
                setArchetypeStatus(`완료: ${result.title} (이미지 백그라운드 생성 중 — 5~8분)`);
                showToast('퀴즈 저장 완료! 이미지는 백그라운드에서 생성됩니다. 완료 후 git commit 필요.', 'success');
            } else {
                setArchetypeStatus(`완료: ${result.title}`);
                showToast(`퀴즈 생성 완료: ${result.title}`, 'success');
            }
            await fetchQuizzes();
            window.open(`/quiz/${result.id}`, '_blank');
        } catch (error) {
            console.error('Archetype quiz error:', error);
            setArchetypeStatus('');
            showToast(`생성 실패: ${error.message}`, 'error');
        } finally {
            window.clearInterval(timer);
            setGeneratingArchetypeId(null);
        }
    };

    const buildResultSlots = (bundleResults = [], quizType = '') => {
        const parsed = (bundleResults || []).map((r) => ({
            ...r,
            result_code: parseInt(r.result_code, 10),
            title: r.title || r.type_name || '',
            description: r.description || '',
        })).filter((r) => !Number.isNaN(r.result_code));

        const slotCount = quizType === 'mbti_12q'
            ? 16
            : Math.max(8, ...(parsed.length ? parsed.map((r) => r.result_code + 1) : [8]));

        return Array.from({ length: slotCount }, (_, i) => {
            const found = parsed.find((r) => r.result_code === i);
            return found || { result_code: i, title: '', description: '' };
        });
    };

    const openEditModal = async (quiz) => {
        setEditingQuiz(quiz);
        setModalTab('info');
        setEditTitle(quiz.title || '');
        setEditDescription(quiz.description || '');
        setEditCategory(normalizeCategory(quiz.category || ''));
        setEditImagePreview(quiz.image_url || '');
        setEditQuestions([]);
        setEditResults(buildResultSlots([], quiz.quiz_type));
        setBundleError('');
        setBundleLoading(true);

        try {
            const bundle = await api.fetchQuizBundle(quiz.id);
            if (bundle.questions?.length) {
                setEditQuestions(bundle.questions);
            }
            setEditResults(buildResultSlots(bundle.results, bundle.quiz?.quiz_type || quiz.quiz_type));
        } catch (error) {
            console.error("Error fetching quiz details:", error);
            setBundleError(error.message || '문항을 불러오지 못했습니다.');
            showToast('문항을 불러오지 못했습니다.', 'error');
        } finally {
            setBundleLoading(false);
        }
    };

    const closeEditModal = () => {
        setEditingQuiz(null);
        setModalTab('info');
        setEditTitle('');
        setEditDescription('');
        setEditCategory('');
        setEditQuestions([]);
        setEditResults([]);
        setEditImagePreview('');
        setBundleLoading(false);
        setBundleError('');
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...editQuestions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setEditQuestions(updatedQuestions);
    };

    const handleResultChange = (index, field, value) => {
        const updatedResults = [...editResults];
        updatedResults[index] = { ...updatedResults[index], [field]: value };
        setEditResults(updatedResults);
    };

    const handleClearResult = (index) => {
        if (!window.confirm('이 결과 내용을 비울까요?')) return;
        const updatedResults = [...editResults];
        updatedResults[index] = {
            ...updatedResults[index],
            title: '',
            description: '',
            image_url: ''
        };
        setEditResults(updatedResults);
    };

    const toScoreDisplay = (code) => `${code} pts`;

    const handleDeleteQuestion = async (idx) => {
        const question = editQuestions[idx];
        if (!question) return;
        if (!window.confirm('이 문항을 삭제할까요?')) return;

        try {
            if (question.id) {
                await api.deleteQuestion(editingQuiz.id, question.id);
            }
            setEditQuestions(prev => prev.filter((_, i) => i !== idx));
        } catch (error) {
            console.error("Error deleting question:", error);
            showToast(`문항 삭제 실패: ${error.message}`, 'error');
        }
    };

    const saveQuiz = async () => {
        if (!editingQuiz) return;

        try {
            await api.saveQuiz(editingQuiz.id, {
                quiz: {
                    title: editTitle,
                    description: editDescription,
                    category: normalizeCategory(editCategory),
                    image_url: editImagePreview,
                },
                questions: editQuestions.length > 0 ? editQuestions : undefined,
                results: editResults.filter(r => r.title || r.description),
            });
            setQuizzes(prev => prev.map(q =>
                q.id === editingQuiz.id
                    ? { ...q, title: editTitle, description: editDescription, category: editCategory, image_url: editImagePreview }
                    : q
            ));
            
            showToast('퀴즈가 저장되었습니다.', 'success');
            closeEditModal();
        } catch (error) {
            console.error('Error updating quiz:', error);
            showToast(`저장 실패: ${error.message}`, 'error');
        }
    };

    return (
        <div className="admin-shell">
        {!isAdminAuthed ? (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-4 border-[3px] border-black rounded-lg p-8 bg-white shadow-md">
                    <h1 className="text-xl font-black">Admin</h1>
                    <p className="text-sm text-gray-600">Google 계정 또는 Admin API key로 로그인하세요.</p>
                    <GoogleLoginButton returnTo="/admin" label="Google로 로그인" />
                    <div className="text-center text-xs font-bold text-gray-400">또는</div>
                    <form onSubmit={handleUnlock} className="space-y-4">
                    <input
                        type="password"
                        value={unlockInput}
                        onChange={(e) => setUnlockInput(e.target.value)}
                        className="w-full border-2 border-black rounded px-3 py-2"
                        placeholder="ADMIN_API_KEY"
                        autoComplete="off"
                    />
                    {unlockError && <p className="text-sm text-red-600 font-bold">{unlockError}</p>}
                    <button
                        type="submit"
                        disabled={unlockLoading}
                        className="w-full py-2 bg-[#FF2D85] text-white font-black rounded border-2 border-black disabled:opacity-50"
                    >
                        {unlockLoading ? '확인 중…' : 'Unlock'}
                    </button>
                    </form>
                </div>
            </div>
        ) : (
        <>
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
                    <div style={{ backgroundColor: '#FFFFFF' }} className="border-[3px] border-black rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b-[1.5px] border-black flex justify-between items-center bg-white">
                            <h3 className="text-lg font-bold text-black">퀴즈 편집 — {editTitle || '제목 없음'}</h3>
                            <button type="button" onClick={closeEditModal} className="w-8 h-8 bg-white text-black rounded-sm border-[1.5px] border-black" aria-label="닫기">✕</button>
                        </div>
                        <div className="flex gap-0 bg-white border-b-[1.5px] border-black">
                            {[{ id: 'info', label: '기본 정보' }, { id: 'questions', label: 'Questions' }, { id: 'results', label: '결과' }].map(tab => (
                                <button key={tab.id} type="button" onClick={() => setModalTab(tab.id)} className={`px-4 py-2 font-black text-sm ${modalTab === tab.id ? 'text-black border-b-[3px] border-black' : 'text-gray-500'}`}>{tab.label}</button>
                            ))}
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {bundleLoading && (
                                <p className="text-sm font-bold text-[#FF2D85] mb-4">문항·결과 불러오는 중…</p>
                            )}
                            {bundleError && !bundleLoading && (
                                <p className="text-sm font-bold text-red-600 mb-4">{bundleError}</p>
                            )}
                            {modalTab === 'info' && (
                                <div className="space-y-5 max-w-2xl">
                                    {editImagePreview && (
                                        <div className="flex items-center gap-4">
                                            <img src={getImageUrl(editImagePreview)} alt="커버" className="w-[300px] h-[300px] object-cover rounded-lg border-[1.5px] border-black shadow-sm" />
                                            <span className="text-xs font-bold text-gray-400">커버 썸네일</span>
                                        </div>
                                    )}
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-3 border-[1.5px] border-black rounded-sm" placeholder="퀴즈 제목" />
                                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border-[1.5px] border-black rounded-sm" placeholder="설명" />
                                    <label className="block text-xs font-bold text-gray-500">카테고리</label>
                                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-4 py-3 border-[1.5px] border-black rounded-sm bg-white">
                                        {QUIZ_CATEGORIES.map((c) => (
                                            <option key={c.id} value={c.id}>{c.labelKo || c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {modalTab === 'questions' && (
                                <div className="space-y-4">
                                    {editQuestions.length === 0 && !bundleLoading && (
                                        <p className="text-sm text-gray-500">문항이 없습니다.</p>
                                    )}
                                    {editQuestions.map((q, idx) => (
                                        <div key={idx} className="border-[1.5px] border-black p-5 rounded-lg">
                                            <input type="text" value={q.question_text || ''} onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)} className="w-full px-4 py-2 mb-3 border-[1.5px] border-black" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" value={q.option_a || ''} onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)} className="px-3 py-2 border-[1.5px] border-black" />
                                                <input type="text" value={q.option_b || ''} onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)} className="px-3 py-2 border-[1.5px] border-black" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {modalTab === 'results' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {editResults.map((result, idx) => (
                                        <div key={idx} className="border-[1.5px] border-black p-4 rounded-lg flex flex-col">
                                            {result.image_url && (
                                                <div className="mb-3 shrink-0 flex justify-center">
                                                    <img src={getImageUrl(result.image_url)} alt="결과" className="w-[300px] h-[300px] object-cover rounded-md border border-gray-300" />
                                                </div>
                                            )}
                                            <input type="text" value={result.title || ''} onChange={(e) => handleResultChange(idx, 'title', e.target.value)} className="w-full px-3 py-2 mb-2 border-[1.5px] border-black" placeholder="결과 제목" />
                                            <textarea value={result.description || ''} onChange={(e) => handleResultChange(idx, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border-[1.5px] border-black" placeholder="결과 설명" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t-[1.5px] border-black bg-white flex justify-between">
                            <button type="button" onClick={() => deleteQuiz(editingQuiz.id)} className="text-red-600 font-semibold text-sm">퀴즈 삭제</button>
                            <button type="button" onClick={saveQuiz} className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg">저장</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-page">
                <div className="admin-inner">
                    {!showEditor && (
                        <div className="admin-topbar">
                            <div className="admin-topbar-row">
                                <div className="admin-tabs">
                                    {[
                                        { id: 'quizzes', label: '퀴즈' },
                                        { id: 'b2b', label: 'B2B 문의' },
                                        { id: 'users', label: '사용자' },
                                        { id: 'analytics', label: '통계' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            className={`admin-tab ${adminTab === tab.id ? 'active' : ''}`}
                                            onClick={() => setAdminTab(tab.id)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="admin-actions">
                                    {adminTab === 'quizzes' && (
                                        <>
                                            <button type="button" className="admin-btn admin-btn-secondary" onClick={fetchQuizzes} disabled={loading}>
                                                {loading ? '…' : '↻ 새로고침'}
                                            </button>
                                            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowEditor(true)}>
                                                + 새 퀴즈
                                            </button>
                                        </>
                                    )}
                                    {adminTab === 'analytics' && (
                                        <button type="button" className="admin-btn admin-btn-secondary" onClick={fetchAnalytics} disabled={analyticsLoading}>
                                            ↻ 새로고침
                                        </button>
                                    )}
                                    {adminTab === 'users' && (
                                        <button type="button" className="admin-btn admin-btn-secondary" onClick={fetchUsers} disabled={usersLoading}>
                                            ↻ 새로고침
                                        </button>
                                    )}
                                </div>
                            </div>
                            {adminTab === 'quizzes' && (
                                <div className="admin-stats">
                                    <span className="admin-stat">전체 {quizStats.total}</span>
                                    <span className="admin-stat">공개 {quizStats.active}</span>
                                    <span className="admin-stat">숨김 {quizStats.hidden}</span>
                                    <span className="admin-stat">표시 {displayedQuizzes.length}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <section className="admin-panel">
                        {showEditor ? (
                            <div className="p-0 bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEditor(false)}
                                    className="absolute top-4 right-4 z-10 bg-white px-4 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200"
                                >
                                    ← 목록으로
                                </button>
                                <QuizEditor embedded={true} initialAuth={true} adminKey={adminKey} />
                            </div>
                        ) : (
                            <>
                                <div className="admin-panel-head">
                                    {adminTab === 'quizzes' ? '퀴즈 관리' :
                                     adminTab === 'b2b' ? '브랜드 문의' :
                                     adminTab === 'users' ? `Google 사용자 (${usersTotal})` : '통계'}
                                </div>
                                <div className="admin-panel-body">
                                    {adminTab === 'quizzes' ? (
                                        <>
                                            <div className="admin-factory">
                                                <button
                                                    type="button"
                                                    className="admin-factory-toggle"
                                                    onClick={() => setFactoryOpen((v) => !v)}
                                                    aria-expanded={factoryOpen}
                                                >
                                                    <div>
                                                        <h3>AI 퀴즈 팩토리</h3>
                                                        <p>MBTI · 성격 테스트 · Gemini 이미지 자동 생성 · {factoryOpen ? '접기' : '펼치기'}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">텍스트 1~2분 · 이미지는 저장 후 백그라운드 5~8분</p>
                                                    </div>
                                                    <span style={{ fontWeight: 900 }}>{factoryOpen ? '▲' : '▼'}</span>
                                                </button>
                                                {factoryOpen && (
                                                    <div className="admin-factory-body">
                                                        {archetypeStatus && (
                                                            <p className="text-xs font-bold text-[#FF2D85] mb-2">{archetypeStatus}</p>
                                                        )}
                                                        <label className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-600 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={factoryWithImages}
                                                                disabled={!!generatingArchetypeId}
                                                                onChange={(e) => setFactoryWithImages(e.target.checked)}
                                                            />
                                                            커버+결과 이미지 포함 (텍스트 저장 후 백그라운드, 약 5~8분)
                                                        </label>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mt-2">MBTI</p>
                                                        <div className="admin-archetype-grid">
                                                            {mbtiArchetypes.map((arch) => (
                                                                <button
                                                                    key={arch.id}
                                                                    type="button"
                                                                    disabled={!!generatingArchetypeId}
                                                                    onClick={() => handleGenerateArchetype(arch)}
                                                                    className={`admin-archetype-btn ${generatingArchetypeId === arch.id ? 'generating' : ''}`}
                                                                >
                                                                    <span className="text-xl">{arch.emoji}</span>
                                                                    <span className="block text-[11px] font-black mt-1 leading-tight">{arch.labelKo || arch.label}</span>
                                                                    <span className="block text-[9px] text-gray-400 font-bold">{arch.quiz_type === 'mbti_12q' ? '12Q→16' : '5Q→8'}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-pink-600 mt-4">성격 테스트</p>
                                                        <div className="admin-archetype-grid">
                                                            {personalityArchetypes.map((arch) => (
                                                                <button
                                                                    key={arch.id}
                                                                    type="button"
                                                                    disabled={!!generatingArchetypeId}
                                                                    onClick={() => handleGenerateArchetype(arch)}
                                                                    className={`admin-archetype-btn ${generatingArchetypeId === arch.id ? 'generating' : ''}`}
                                                                >
                                                                    <span className="text-xl">{arch.emoji}</span>
                                                                    <span className="block text-[11px] font-black mt-1 leading-tight">{arch.labelKo || arch.label}</span>
                                                                    <span className="block text-[9px] text-gray-400 font-bold">5Q→8</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="admin-toolbar">
                                                <input
                                                    type="search"
                                                    className="admin-search"
                                                    placeholder="제목, ID, 카테고리 검색…"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <div className="admin-filters">
                                                    {['all', 'on', 'off'].map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            className={`admin-filter-chip ${statusFilter === s ? 'active' : ''}`}
                                                            onClick={() => setStatusFilter(s)}
                                                        >
                                                            {s === 'all' ? '전체' : s === 'on' ? '공개' : '숨김'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="admin-filters mb-4">
                                                {filterTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFilterType(type)}
                                                        className={`admin-filter-chip ${filterType === type ? 'active' : ''}`}
                                                    >
                                                        {type === 'all' ? '전체' : getAdminCategoryLabel(type)}
                                                    </button>
                                                ))}
                                            </div>

                                            {loading && !quizzes.length ? (
                                                <div className="admin-loading">
                                                    <div className="admin-spinner" />
                                                    <p className="text-gray-500 mt-3">불러오는 중…</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="admin-quiz-table">
                                                        <thead>
                                                            <tr>
                                                                <th>썸네일</th>
                                                                <th>제목</th>
                                                                <th className="hide-mobile">카테고리</th>
                                                                <th className="hide-mobile">생성일</th>
                                                                <th className="text-center">상태</th>
                                                                <th className="text-center">작업</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {displayedQuizzes.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="6" className="admin-empty">퀴즈가 없습니다.</td>
                                                                </tr>
                                                            ) : (
                                                                displayedQuizzes.map((quiz) => (
                                                                    <tr key={quiz.id}>
                                                                        <td>
                                                                            <img
                                                                                src={getImageUrl(quiz.image_url) || '/images/default_cover.png'}
                                                                                alt=""
                                                                                className="admin-quiz-thumb"
                                                                                onError={(e) => { e.target.src = '/images/default_cover.png'; }}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <button type="button" className="admin-quiz-title-btn" onClick={() => openEditModal(quiz)}>
                                                                                {quiz.title}
                                                                            </button>
                                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{quiz.id?.slice(0, 8)}…</div>
                                                                        </td>
                                                                        <td className="hide-mobile">
                                                                            <span className="admin-filter-chip active" style={{ cursor: 'default' }}>
                                                                                {getAdminCategoryLabel(quiz.category)}
                                                                            </span>
                                                                        </td>
                                                                        <td className="hide-mobile text-sm text-gray-500">
                                                                            {formatDate(quiz.created_at)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleStatus(quiz.id)}
                                                                                className={quiz.is_active !== false && quiz.status !== 'hidden' ? 'admin-status-on' : 'admin-status-off'}
                                                                            >
                                                                                {quiz.is_active !== false && quiz.status !== 'hidden' ? '공개' : '숨김'}
                                                                            </button>
                                                                        </td>
                                                                        <td>
                                                                            <div className="admin-row-actions">
                                                                                <button type="button" className="admin-icon-btn" onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}>미리보기</button>
                                                                                <button type="button" className="admin-icon-btn" onClick={() => copyQuizLink(quiz.id)}>링크</button>
                                                                                <button type="button" className="admin-icon-btn" onClick={() => openEditModal(quiz)}>편집</button>
                                                                                <button type="button" className="admin-icon-btn danger" onClick={() => deleteQuiz(quiz.id)}>삭제</button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    ) : adminTab === 'b2b' ? (
                                        <>
                                            {inquiriesLoading ? (
                                                <div className="p-12 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4"></div>
                                                    <p className="text-gray-500">문의 목록 불러오는 중…</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">기업 / 담당자</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">퀴즈 컨셉</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">예산</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">접수일</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">상태</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">작업</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {inquiries.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" className="p-8 text-center text-gray-400">
                                                                        접수된 문의가 없습니다.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                inquiries.map((inq) => (
                                                                    <tr key={inq.id} className="hover:bg-pink-50 transition-colors">
                                                                        <td className="p-4">
                                                                            <div className="font-bold text-gray-900">{inq.company_name}</div>
                                                                            <div className="text-xs text-gray-500 mt-0.5">{inq.contact_person}</div>
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-600">
                                                                            <div>📧 {inq.email}</div>
                                                                            <div className="mt-1">📞 {inq.phone || '-'}</div>
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-700 max-w-[300px] truncate" title={inq.quiz_concept}>
                                                                            {inq.quiz_concept}
                                                                        </td>
                                                                        <td className="p-4 text-center font-bold text-pink-600 text-sm">
                                                                            {inq.budget_tier === 'basic' ? '$500 미만' :
                                                                             inq.budget_tier === 'standard' ? '$500 – $2,000' :
                                                                             inq.budget_tier === 'enterprise' ? '$2,000 이상' : inq.budget_tier || '-'}
                                                                        </td>
                                                                        <td className="p-4 text-center text-sm text-gray-600">
                                                                            {formatDate(inq.created_at)}
                                                                        </td>
                                                                        <td className="p-4 text-center">
                                                                            <select
                                                                                value={inq.status || 'pending'}
                                                                                onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300 focus:outline-none transition-all ${
                                                                                    inq.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                                                    inq.status === 'contacted' ? 'bg-green-100 text-green-800' :
                                                                                    inq.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                                                                }`}
                                                                            >
                                                                                <option value="pending">대기</option>
                                                                                <option value="reviewed">검토 중</option>
                                                                                <option value="contacted">연락 완료</option>
                                                                                <option value="closed">종료</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="p-4 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => deleteInquiry(inq.id)}
                                                                                className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-500 rounded-lg transition-all duration-200"
                                                                            >
                                                                                삭제
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    ) : adminTab === 'users' ? (
                                        <>
                                            {usersLoading ? (
                                                <div className="p-12 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4"></div>
                                                    <p className="text-gray-500">사용자 목록 불러오는 중…</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">사용자</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">권한</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">최근 로그인</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">가입일</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {users.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                                                        아직 Google 로그인 사용자가 없습니다.
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                users.map((u) => (
                                                                    <tr key={u.id} className="hover:bg-pink-50 transition-colors">
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-3">
                                                                                {u.picture_url ? (
                                                                                    <img src={u.picture_url} alt="" className="w-9 h-9 rounded-full border border-gray-200 object-cover" />
                                                                                ) : (
                                                                                    <span className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 font-black flex items-center justify-center text-sm">
                                                                                        {(u.name || u.email || '?')[0]}
                                                                                    </span>
                                                                                )}
                                                                                <span className="font-bold text-gray-900">{u.name || '-'}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-600">{u.email}</td>
                                                                        <td className="p-4 text-center">
                                                                            <select
                                                                                value={u.role || 'user'}
                                                                                onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300 focus:outline-none ${
                                                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                                                }`}
                                                                            >
                                                                                <option value="user">user</option>
                                                                                <option value="admin">admin</option>
                                                                            </select>
                                                                        </td>
                                                                        <td className="p-4 text-center text-sm text-gray-600">{formatDate(u.last_login_at)}</td>
                                                                        <td className="p-4 text-center text-sm text-gray-600">{formatDate(u.created_at)}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {analyticsLoading ? (
                                                <div className="p-12 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4"></div>
                                                    <p className="text-gray-500">통계 불러오는 중…</p>
                                                </div>
                                            ) : analytics ? (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                        <div className="bg-pink-50 border-2 border-pink-100 rounded-2xl p-6 text-center">
                                                            <p className="text-xs font-black text-gray-400 uppercase">총 조회수</p>
                                                            <p className="text-3xl font-black text-[#FF2D85]">{analytics.totals.views.toLocaleString()}</p>
                                                        </div>
                                                        <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-6 text-center">
                                                            <p className="text-xs font-black text-gray-400 uppercase">참여자</p>
                                                            <p className="text-3xl font-black text-green-600">{analytics.totals.participants.toLocaleString()}</p>
                                                        </div>
                                                        <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-6 text-center">
                                                            <p className="text-xs font-black text-gray-400 uppercase">공유</p>
                                                            <p className="text-3xl font-black text-yellow-600">{analytics.totals.shares.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase">퀴즈</th>
                                                                    <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase">조회</th>
                                                                    <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase">참여</th>
                                                                    <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase">공유</th>
                                                                    <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase">좋아요</th>
                                                                    <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase">공유율</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {analytics.quizzes.map((q) => (
                                                                    <tr key={q.id} className="hover:bg-pink-50">
                                                                        <td className="p-3 font-medium">{q.title}</td>
                                                                        <td className="p-3 text-center">{q.view_count}</td>
                                                                        <td className="p-3 text-center">{q.participant_count}</td>
                                                                        <td className="p-3 text-center">{q.share_count}</td>
                                                                        <td className="p-3 text-center">{q.like_count || 0}</td>
                                                                        <td className="p-3 text-center font-bold text-[#FF2D85]">
                                                                            {q.participant_count ? Math.round((q.share_count / q.participant_count) * 100) : 0}%
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center text-gray-400 p-12">통계 데이터가 없습니다.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>

            {toast && (
                <div className={`admin-toast ${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'error' : ''}`} role="status">
                    {toast.message}
                </div>
            )}
        </>
        )}
        </div>
    );
};

export default Admin;