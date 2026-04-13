import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_CATEGORIES, SERVICE_CATEGORIES, getFilterTypes, getCategoryLabel, getPersonas } from '../constants/categories';
import { API_BASE_URL, getImageUrl } from '../lib/apiConfig';
import { supabase } from '../lib/supabase';

import QuizEditor from './QuizEditor';

const Admin = () => {
    const navigate = useNavigate();
    // Password Protection
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '0922';
    const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || password;

    const passwordInputRef = useRef(null);

    // Focus password input on mount
    useEffect(() => {
        if (!isAuthenticated && passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    }, [isAuthenticated]);

    // Authenticated fetch wrapper — adds X-Admin-Key header
    const adminFetch = async (url, options = {}) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': adminKey,
                ...options.headers,
            },
        });
        if (res.status === 401) {
            alert('🚫 인증 만료. 다시 로그인해주세요.');
            setIsAuthenticated(false);
            setAdminKey('');
            setPassword('');
        }
        return res;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            // Use the password as the admin API key for backend auth
            const key = import.meta.env.VITE_ADMIN_API_KEY || password;
            setAdminKey(key);
            setIsAuthenticated(true);
            setPasswordError(false);
        } else {
            setPasswordError(true);
            setPassword('');
        }
    };

    // State Management
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [availableAgents, setAvailableAgents] = useState([]);


    // Edit Modal State
    const [modalTab, setModalTab] = useState('info'); // 'info' | 'questions' | 'results'
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editQuestions, setEditQuestions] = useState([]);
    const [editResults, setEditResults] = useState([]); // 8 result types
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [isDragging, setIsDragging] = useState(false);


    // Constants (from shared categories)
    const filterTypes = getFilterTypes();
    const basePersonas = getPersonas();

    // Dynamic Personas: Sync with available .md agents
    const syncedPersonas = basePersonas.filter(p => {
        return availableAgents.some(agent =>
            agent.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(agent.replace('Expert_', '').toLowerCase())
        );
    }).map(p => {
        const matchingAgent = availableAgents.find(agent =>
            agent.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(agent.replace('Expert_', '').toLowerCase())
        );
        return { ...p, agent_name: matchingAgent };
    });

    const extraPersonas = availableAgents.filter(agent => {
        return !basePersonas.some(p =>
            agent.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(agent.replace('Expert_', '').toLowerCase())
        );
    }).map(agent => ({
        name: `${agent.replace('Expert_', '').replace('Quiz_', '').replace(/_/g, ' ')}`,
        prompt: `Generate a viral quiz about this topic.`,
        category: agent.replace('Expert_', '').replace('Quiz_', ''),
        emoji: '🤖',
        agent_name: agent
    }));

    const personas = [...syncedPersonas, ...extraPersonas];

    // Handle filtering
    useEffect(() => {
        if (filterType === 'all') {
            setFilteredQuizzes(quizzes);
        } else {
            setFilteredQuizzes(quizzes.filter(q => 
                q.quiz_type === filterType || q.category === filterType
            ));
        }
    }, [quizzes, filterType]);

    // Fetch Quizzes
    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data: cloudData } = await supabase
                .from('quizzes')
                .select('*')
                .order('created_at', { ascending: false });

            const combined = (cloudData || []);

            setQuizzes(combined);
            setFilteredQuizzes(combined);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchQuizzes();
        }
    }, [isAuthenticated]);

    // Filtering
    useEffect(() => {
        if (filterType === 'all') {
            setFilteredQuizzes(quizzes);
        } else {
            setFilteredQuizzes(quizzes.filter(q => q.category === filterType));
        }
    }, [filterType, quizzes]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const getTypeLabel = (type) => getCategoryLabel(type) || type;

    const handleGenerate = (persona) => {
        navigate('/editor');
    };

    const toggleStatus = async (id) => {
        try {
            const quiz = quizzes.find(q => q.id === id);
            if (!quiz) return;
            
            const newIsActive = quiz.is_active === false ? true : false;
            const newStatus = newIsActive ? 'visible' : 'hidden';

            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, is_active: newIsActive } : q));

            const { error } = await supabase
                .from('quizzes')
                .update({ is_active: newIsActive, status: newStatus })
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error("Error toggling status:", error);
            alert(`Error toggling status: ${error.message}`);
            fetchQuizzes();
        }
    };

    const deleteQuiz = async (quizId) => {
        const id = quizId;
        if (!window.confirm(`Are you sure you want to delete this quiz?`)) return;
        
        try {
            const { error: cloudError } = await supabase.from('quizzes').delete().eq('id', id);
            
            if (!cloudError) {
                setQuizzes(prev => prev.filter(q => q.id !== id));
                setFilteredQuizzes(prev => prev.filter(q => q.id !== id));
                alert("✅ Quiz deleted successfully.");
            } else {
                throw new Error(cloudError.message || "Could not delete quiz from database.");
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert(`Error deleting quiz: ${error.message}`);
        }
    };

    const copyQuizLink = (id) => {
        const url = `${window.location.origin}/quiz/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("🔗 Link copied to clipboard!");
        });
    };

    const openEditModal = async (quiz) => {
        setEditingQuiz(quiz);
        setModalTab('info');
        setEditTitle(quiz.title || '');
        setEditDescription(quiz.description || '');
        setEditCategory(quiz.category || '');
        setEditImagePreview(quiz.image_url || '');
        setEditQuestions([]);

        const defaultResults = Array.from({ length: 8 }, (_, i) => ({
            result_code: i,
            title: '',
            description: '',
        }));
        setEditResults(defaultResults);

        try {
            const { data: qData } = await supabase.from('questions').select('*').eq('quiz_id', quiz.id).order('order_number', { ascending: true });
            if (qData) setEditQuestions(qData);

            const { data: rData } = await supabase.from('results').select('*').eq('quiz_id', quiz.id);
            if (rData && rData.length > 0) {
                const mergedResults = defaultResults.map(dr => {
                    const found = rData.find(r => r.result_code === dr.result_code);
                    return found || dr;
                });
                setEditResults(mergedResults);
            }
        } catch (error) {
            console.error("Error fetching quiz details:", error);
            alert("Warning: Could not load questions.");
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
        if (!window.confirm("Clear this result?")) return;
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
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            if (question.id) {
                const { error } = await supabase.from('questions').delete().eq('id', question.id);
                if (error) throw error;
            }
            setEditQuestions(prev => prev.filter((_, i) => i !== idx));
        } catch (error) {
            console.error("Error deleting question:", error);
            alert(`Error deleting question: ${error.message}`);
        }
    };

    const saveQuiz = async () => {
        if (!editingQuiz) return;

        try {
            const { error: qError } = await supabase
                    .from('quizzes')
                    .update({
                        title: editTitle,
                        description: editDescription,
                        category: editCategory,
                        image_url: editImagePreview
                    })
                    .eq('id', editingQuiz.id);
                if (qError) throw qError;

                if (editQuestions.length > 0) {
                    const questionsToUpsert = editQuestions.map((q, idx) => {
                        const { id, quiz_id, order_number, question_text, option_a, option_b, score_a, score_b, image_url, dimension, options } = q;
                        const cleanQ = { quiz_id: quiz_id || editingQuiz.id, order_number: idx + 1, question_text, option_a, option_b, score_a, score_b, image_url, dimension, options };
                        if (id && id.length > 20) cleanQ.id = id;
                        return cleanQ;
                    });
                    const { error: errQ } = await supabase.from('questions').upsert(questionsToUpsert, { onConflict: 'id' });
                    if (errQ) throw errQ;
                }

                if (editResults.length > 0) {
                    const resultsToUpsert = editResults.filter(r => r.title || r.description).map((r, idx) => {
                        const { id, quiz_id, result_code, title, description, traits, image_url } = r;
                        const cleanR = { quiz_id: quiz_id || editingQuiz.id, result_code: r.result_code ?? idx, title, description, traits, image_url };
                        if (id && id.length > 20) cleanR.id = id;
                        return cleanR;
                    });
                    if (resultsToUpsert.length > 0) {
                        const { error: errR } = await supabase.from('results').upsert(resultsToUpsert, { onConflict: 'id' });
                        if (errR) throw errR;
                    }
                }
            setQuizzes(prev => prev.map(q =>
                q.id === editingQuiz.id
                    ? { ...q, title: editTitle, description: editDescription, category: editCategory, image_url: editImagePreview }
                    : q
            ));
            
            alert(`✅ Quiz updated successfully!`);
            closeEditModal();
        } catch (error) {
            console.error('Error updating quiz:', error);
            alert(`Error updating quiz: ${error.message}`);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9fc] p-6">
                <div className="jelly-card p-10 w-full max-w-md bg-white">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-4">🔐</div>
                        <h2 className="text-3xl font-black text-[#FF2D85] tracking-tight">Admin Access</h2>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <input
                            ref={passwordInputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Admin Password"
                            className="w-full px-5 py-4 bg-white border-2 border-black rounded-2xl focus:outline-none"
                        />
                        <button type="submit" className="w-full jelly-btn bg-[#FF2D85] text-white font-black py-4 text-lg">Unlock Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
                    <div style={{ backgroundColor: '#FFFFFF' }} className="border-[3px] border-black rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b-[1.5px] border-black flex justify-between items-center bg-white">
                            <h3 className="text-lg font-bold text-black">Quiz Editor — {editTitle || 'Untitled'}</h3>
                            <button onClick={closeEditModal} className="w-8 h-8 bg-white text-black rounded-sm border-[1.5px] border-black">✕</button>
                        </div>
                        <div className="flex gap-0 bg-white border-b-[1.5px] border-black">
                            {[{ id: 'info', label: 'Basic Info' }, { id: 'questions', label: 'Questions' }, { id: 'results', label: 'Results' }].map(tab => (
                                <button key={tab.id} onClick={() => setModalTab(tab.id)} className={`px-4 py-2 font-black text-sm ${modalTab === tab.id ? 'text-black border-b-[3px] border-black' : 'text-gray-500'}`}>{tab.label}</button>
                            ))}
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {modalTab === 'info' && (
                                <div className="space-y-5 max-w-2xl">
                                    {editImagePreview && (
                                        <div className="flex items-center gap-4">
                                            <img src={getImageUrl(editImagePreview)} alt="Cover" className="w-24 h-24 object-cover rounded-lg border-[1.5px] border-black shadow-sm" />
                                            <span className="text-xs font-bold text-gray-400">Cover Thumbnail</span>
                                        </div>
                                    )}
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-3 border-[1.5px] border-black rounded-sm" placeholder="Quiz title..." />
                                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border-[1.5px] border-black rounded-sm" placeholder="Description..." />
                                </div>
                            )}
                            {modalTab === 'questions' && (
                                <div className="space-y-4">
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
                                                <div className="mb-3 shrink-0">
                                                    <img src={getImageUrl(result.image_url)} alt="Result" className="w-16 h-16 object-cover rounded-md border border-gray-300" />
                                                </div>
                                            )}
                                            <input type="text" value={result.title || ''} onChange={(e) => handleResultChange(idx, 'title', e.target.value)} className="w-full px-3 py-2 mb-2 border-[1.5px] border-black" placeholder="Result title" />
                                            <textarea value={result.description || ''} onChange={(e) => handleResultChange(idx, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border-[1.5px] border-black" placeholder="Description..." />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t-[1.5px] border-black bg-white flex justify-between">
                            <button onClick={() => deleteQuiz(editingQuiz.id, editingQuiz.is_local)} className="text-red-600 font-semibold text-sm">Delete Quiz</button>
                            <button onClick={saveQuiz} className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#fff9fc] p-8 pt-24 font-sans text-gray-800">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-black text-[#FF2D85] tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 font-bold mt-2">Manage your interactive quizzes</p>
                    </header>

                    {/* Compact Header for Admin */}
                    {!showEditor && (
                        <div className="flex justify-between items-center mb-8 px-4">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900">🧩 Quiz Inventory</h2>
                                <p className="text-gray-400 text-sm font-bold mt-1">Manage your interactive content</p>
                            </div>
                            <button 
                                onClick={() => setShowEditor(true)}
                                className="bg-[#FF2D85] text-white px-8 py-3 rounded-2xl font-black shadow-[4px_4px_0px_0px_#000000] border-2 border-black hover:translate-y-[-2px] active:translate-y-[2px] transition-all"
                            >
                                ✨ CREATE NEW QUIZ
                            </button>
                        </div>
                    )}

                    <section className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 min-h-[600px]">
                        {showEditor ? (
                            <div className="p-0 bg-gray-50 relative">
                                <button 
                                    onClick={() => setShowEditor(false)}
                                    className="absolute top-4 right-4 z-10 bg-white px-4 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-100 shadow-sm"
                                >
                                    ✕ CLOSE EDITOR
                                </button>
                                <QuizEditor embedded={true} initialAuth={true} />
                            </div>
                        ) : (
                            <>
                                <div className="bg-gradient-to-r from-[#FF2D85] to-pink-400 p-4 flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-white">
                                        🎮 Quiz Management
                                    </h2>
                                </div>
                                <div className="p-6">
                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {filterTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${filterType === type
                                                    ? 'bg-[#FF2D85] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type === 'all' ? 'All Content' : getTypeLabel(type)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Table */}
                                    {loading && !quizzes.length ? (
                                        <div className="p-12 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4"></div>
                                            <p className="text-gray-500">Loading quizzes...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredQuizzes.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="p-8 text-center text-gray-400">
                                                                No quizzes found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredQuizzes.map((quiz) => (
                                                            <tr key={quiz.id} className="hover:bg-pink-50 transition-colors">
                                                                <td className="p-4 text-sm text-gray-600 font-mono">
                                                                    {quiz.id?.toString().slice(0, 8)}...
                                                                </td>
                                                                <td className="p-4">
                                                                    <button
                                                                        onClick={() => openEditModal(quiz)}
                                                                        className="font-medium text-gray-900 hover:text-[#FF2D85] hover:underline text-left transition-colors"
                                                                    >
                                                                        {quiz.title}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <span className="inline-block px-3 py-1 bg-pink-100 text-[#FF2D85] rounded-full text-sm font-medium">
                                                                        {getTypeLabel(quiz.category)}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-center text-sm text-gray-600">
                                                                    {new Date(quiz.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <button
                                                                        onClick={() => toggleStatus(quiz.id)}
                                                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${quiz.is_active !== false && quiz.status !== 'hidden'
                                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                                            : 'bg-red-500 text-white hover:bg-red-600'
                                                                            }`}
                                                                    >
                                                                        {quiz.is_active !== false && quiz.status !== 'hidden' ? 'ON' : 'OFF'}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')} className="px-2 py-1.5 text-xs font-bold text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Preview">👁️</button>
                                                                        <button
                                                                            onClick={() => deleteQuiz(quiz.id, quiz.is_local)}
                                                                            className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-500 rounded-lg transition-all duration-200"
                                                                        >
                                                                            🗑️ Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
};

export default Admin;