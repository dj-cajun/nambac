import { useState, useEffect } from 'react';
import { QUIZ_CATEGORIES, SERVICE_CATEGORIES, getFilterTypes, getCategoryLabel, getPersonas } from '../constants/categories';

const Admin = () => {
    // Password Protection
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const ADMIN_PASSWORD = '0922';

    // Check session storage on mount
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('admin_authenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
            setPasswordError(false);
        } else {
            setPasswordError(true);
            setPassword('');
        }
    };

    // State Management
    const [quizzes, setQuizzes] = useState([]);
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('quizzes');
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [availableAgents, setAvailableAgents] = useState([]);

    // Service Form State
    const [newServiceTitle, setNewServiceTitle] = useState('');
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServiceUrl, setNewServiceUrl] = useState('');
    const [newServiceImage, setNewServiceImage] = useState('');
    const [newServiceCategory, setNewServiceCategory] = useState('');

    // Edit Modal State
    const [editingQuiz, setEditingQuiz] = useState(null);
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

    // Fetch Quizzes and Services
    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/quizzes');
            const data = await response.json();
            const quizList = data.quizzes || data || [];
            // Sort by Created Date descend (UUID strings aren't subtractable)
            quizList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setQuizzes(quizList);
            setFilteredQuizzes(quizList);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/services');
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/agents');
            const data = await response.json();
            setAvailableAgents(data.agents || []);
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchQuizzes();
            fetchServices();
            fetchAgents();
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

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    // Get Type Label (from shared categories)
    const getTypeLabel = (type) => getCategoryLabel(type) || type;

    // --- Actions ---

    const handleGenerate = async (persona) => {
        setLoading(true);
        try {
            // Call actual AI endpoint to create quiz
            const response = await fetch('http://localhost:8000/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: persona.prompt, // Backend expects 'topic'
                    category: persona.category,
                    agent_name: persona.agent_name, // Pass the specific agent file name
                    generate_images: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ Quiz Generated Successfully!\nTitle: ${data.quiz?.title || 'Unknown'}`);
                fetchQuizzes();
            } else {
                const err = await response.json();
                console.error("AI Generation Failed:", err);
                alert(`❌ Generation Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("❌ Network Error during generation.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const quiz = quizzes.find(q => q.id === id);
            const newStatus = (quiz.status === 'visible' || quiz.is_active !== false) ? 'hidden' : 'visible';

            // Optimistic update
            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, is_active: newStatus === 'visible' } : q));

            await fetch(`http://localhost:8000/api/quizzes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, is_active: newStatus === 'visible' })
            });

        } catch (error) {
            console.error("Error toggling status:", error);
            fetchQuizzes(); // Revert
        }
    };

    const deleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await fetch(`http://localhost:8000/api/quizzes/${id}`, { method: 'DELETE' });
            setQuizzes(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            console.error("Error deleting quiz:", error);
        }
    };

    const handleAddService = async () => {
        if (!newServiceTitle || !newServiceUrl) {
            alert("Title and URL are required!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newServiceTitle,
                    description: newServiceDesc,
                    url: newServiceUrl,
                    image_url: newServiceImage || 'https://via.placeholder.com/150',
                    category: newServiceCategory || 'Other'
                })
            });

            if (response.ok) {
                alert("✅ Service Added!");
                setNewServiceTitle('');
                setNewServiceDesc('');
                setNewServiceUrl('');
                setNewServiceImage('');
                setNewServiceCategory('');
                fetchServices();
            } else {
                alert("Failed to add service");
            }
        } catch (error) {
            console.error("Error adding service:", error);
            alert("Error adding service");
        }
    };

    // --- Edit Modal Functions ---

    const openEditModal = async (quiz) => {
        setEditingQuiz(quiz);
        setModalTab('info'); // Reset to info tab
        setEditTitle(quiz.title || '');
        setEditDescription(quiz.description || '');
        setEditCategory(quiz.category || '');
        setEditImage(null);
        setEditImagePreview(quiz.image_url || '');
        setEditQuestions([]);

        // Initialize 6 default results (Score: 0-5)
        const defaultResults = Array.from({ length: 6 }, (_, i) => ({
            result_code: i,
            title: '',
            description: '',
        }));
        setEditResults(defaultResults);

        // Fetch full details including questions and results
        try {
            const response = await fetch(`http://localhost:8000/api/quizzes/${quiz.id}`);
            const data = await response.json();
            if (data.questions) {
                setEditQuestions(data.questions);
            }
            if (data.results && data.results.length > 0) {
                // Merge with default results to ensure all 8 exist
                const mergedResults = defaultResults.map(dr => {
                    const found = data.results.find(r => r.result_code === dr.result_code);
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
        setEditImage(null);
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

// Helper: Format result_code to display score
    const toScoreDisplay = (code) => {
        return `${code} pts`;
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteQuestion = async (idx) => {
        const question = editQuestions[idx];
        if (!question) return;

        if (!window.confirm("Are you sure you want to delete this question?")) return;

        // If it has an ID, delete from backend
        if (question.id) {
            try {
                const response = await fetch(`http://localhost:8000/api/questions/${question.id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    alert("Failed to delete question from server.");
                    return;
                }
            } catch (error) {
                console.error("Error deleting question:", error);
                alert("Error connecting to server.");
                return;
            }
        }

        // Update local state
        const updatedQuestions = editQuestions.filter((_, i) => i !== idx);
        setEditQuestions(updatedQuestions);
    };

    const saveQuiz = async () => {
        if (!editingQuiz) return;

        try {
            const response = await fetch(`http://localhost:8000/api/quizzes/${editingQuiz.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    category: editCategory,
                    questions: editQuestions,
                    results: editResults,
                    // image handling would need form data or base64 usually, sticking to JSON for now
                    image_url: editImagePreview // Simplification
                }),
            });

            if (response.ok) {
                setQuizzes(prev => prev.map(q =>
                    q.id === editingQuiz.id
                        ? { ...q, title: editTitle, description: editDescription, category: editCategory, questions: editQuestions }
                        : q
                ));
                alert('✅ Quiz updated successfully!');
                closeEditModal();
            } else {
                alert('Failed to update quiz.');
            }
        } catch (error) {
            console.error('Error updating quiz:', error);
            alert('Error updating quiz.');
        }
    };

    // --- Render ---

    // 1. Login View
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF0F6]">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-pink-200">
                    <h2 className="text-2xl font-black text-[#FF2D85] mb-6 text-center">🔐 Admin Access</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Admin Password"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF2D85] focus:outline-none transition-colors"
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm font-bold mt-2 ml-1">🚫 Access Denied. Try again.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#FF2D85] text-white font-bold py-3 rounded-xl hover:bg-[#E01E70] transition-colors shadow-lg shadow-pink-200"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Dashboard View
    return (
        <>
            {/* ✅ Opaque Business Contrast Modal */}
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
                    {/* Modal Container: 100% Opaque White + Thin Black Border */}
                    <div style={{ backgroundColor: '#FFFFFF' }} className="border-[3px] border-black rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-md overflow-hidden">

                        {/* Header: Clean White */}
                        <div className="px-6 py-4 border-b-[1.5px] border-black flex justify-between items-center bg-white">
                            <h3 className="text-lg font-bold text-black tracking-tight">
                                Quiz Editor — {editTitle || 'Untitled'}
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="w-8 h-8 bg-white text-black rounded-sm flex items-center justify-center font-bold text-lg hover:bg-gray-100 transition-colors border-[1.5px] border-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tab Navigation: Underline Style */}
                        <div className="flex gap-0 bg-white border-b-[1.5px] border-black">
                            {[
                                { id: 'info', label: 'Basic Info' },
                                { id: 'questions', label: 'Questions' },
                                { id: 'results', label: 'Results' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setModalTab(tab.id)}
                                    className={`px-4 py-2 font-black text-sm transition-all
                                         ${modalTab === tab.id
                                            ? 'text-black border-b-[3px] border-black -mb-[1.5px] bg-white'
                                            : 'text-gray-500 hover:text-black hover:bg-white'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content: Scrollable White */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white">

                            {/* [INFO TAB] */}
                            {modalTab === 'info' && (
                                <div className="space-y-5 max-w-2xl">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Quiz Title</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border-[1.5px] border-black rounded-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Enter quiz title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {QUIZ_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setEditCategory(cat.id)}
                                                    className={`px-4 py-2 rounded-sm font-medium text-sm border-[1.5px] border-black transition-all
                                                        ${editCategory === cat.id
                                                            ? 'bg-black text-white'
                                                            : 'bg-white text-black hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white border-[1.5px] border-black rounded-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                            placeholder="Enter quiz description..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* [QUESTIONS TAB] */}
                            {modalTab === 'questions' && (
                                <div className="space-y-4 bg-white">
                                    {editQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-white border-[1.5px] border-black rounded-lg p-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-black">Question {idx + 1}</span>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(idx)}
                                                        className="px-2 py-0.5 text-red-500 hover:bg-red-50 text-[10px] font-bold border border-red-200 rounded transition-all flex items-center gap-1"
                                                        title="Delete Question"
                                                    >
                                                        🗑️ DELETE
                                                    </button>
                                                </div>
                                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold border border-black">
                                                    Weight: +1
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={q.question_text || ''}
                                                onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                                                className="w-full px-4 py-2.5 mb-3 bg-white border-[1.5px] border-black rounded-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Question text..."
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 block mb-1">Option A (0 pt)</span>
                                                    <input
                                                        type="text"
                                                        value={q.option_a || ''}
                                                        onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-[1.5px] border-black rounded-sm text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                  <div>
                                                      <span className="text-xs font-semibold text-gray-500 block mb-1">Option B (+1 pt)</span>
                                                      <input
                                                          type="text"
                                                          value={q.option_b || ''}
                                                          onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                                                          className="w-full px-3 py-2 bg-white border-[1.5px] border-black rounded-sm text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                      />
                                                  </div>
                                            </div>

                                            {/* Question Image Management */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 items-start">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Question Image URL</label>
                                                    <input
                                                        type="text"
                                                        value={q.image_url || ''}
                                                        onChange={(e) => handleQuestionChange(idx, 'image_url', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:border-black"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {q.image_url ? (
                                                        <img src={q.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 font-bold uppercase">No Image</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* [RESULTS TAB] */}
                            {modalTab === 'results' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {editResults.map((result, idx) => (
                                        <div key={idx} className="bg-white border-[1.5px] border-black rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-600">Result #{idx + 1}</span>
                                                 <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded border border-black">
                                                     {toScoreDisplay(result.result_code)}
                                                 </span>
                                                <button
                                                    onClick={() => handleClearResult(idx)}
                                                    className="text-gray-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-tighter"
                                                    title="Clear Result"
                                                >
                                                    🗑️ Clear
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={result.title || ''}
                                                onChange={(e) => handleResultChange(idx, 'title', e.target.value)}
                                                className="w-full px-3 py-2 mb-2 bg-white border-[1.5px] border-black rounded-sm font-semibold text-sm text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Result title"
                                            />
                                            <textarea
                                                value={result.description || ''}
                                                onChange={(e) => handleResultChange(idx, 'description', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white border-[1.5px] border-black rounded-sm text-xs font-medium text-black resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Result description..."
                                            />

                                            {/* Result Image Management */}
                                            <div className="mt-3 flex gap-3 items-center">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={result.image_url || ''}
                                                        onChange={(e) => handleResultChange(idx, 'image_url', e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono focus:outline-none"
                                                        placeholder="Result Image URL..."
                                                    />
                                                </div>
                                                <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {result.image_url ? (
                                                        <img src={result.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] text-gray-300 font-bold uppercase">No Img</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer: Action Buttons */}
                        <div className="px-6 py-4 border-t-[1.5px] border-black bg-white flex justify-between items-center">
                            <button
                                onClick={() => { if (window.confirm('Are you sure you want to delete this quiz?')) { deleteQuiz(editingQuiz.id); closeEditModal(); } }}
                                className="text-red-600 font-semibold text-sm hover:underline"
                            >
                                Delete Quiz
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeEditModal}
                                    className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg border-[1.5px] border-black hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveQuiz}
                                    className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg border-[1.5px] border-black hover:bg-gray-800 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div >
                </div >
            )}

            {/* Main Content */}
            <div className="min-h-screen bg-[#FFF0F6] p-8 pt-24 font-sans text-gray-800">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-10 text-center">
                        <h1 className="text-4xl font-black text-[#FF2D85] mb-2 drop-shadow-sm">
                            ⚡ AI POWER STATION
                        </h1>
                    </header>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white border-b-2 border-black flex shadow-none">
                            <button
                                onClick={() => setActiveTab('quizzes')}
                                className={`px-4 py-2 font-black transition-all border-b-2 ${activeTab === 'quizzes' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'}`}
                            >
                                🧩 Quizzes
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-4 py-2 font-black transition-all border-b-2 ${activeTab === 'services' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'}`}
                            >
                                🔗 AI Services
                            </button>
                        </div>
                    </div>

                    {/* AI Buttons (Only for Quizzes) */}
                    {activeTab === 'quizzes' && (
                        <section className="bg-white border-[1.5px] border-black rounded-lg p-6 mb-12 shadow-md">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {personas.map((persona, index) => {
                                    const pastelColors = [
                                        'bg-blue-100 hover:bg-blue-200',
                                        'bg-yellow-100 hover:bg-yellow-200',
                                        'bg-green-100 hover:bg-green-200',
                                        'bg-purple-100 hover:bg-purple-200',
                                        'bg-pink-100 hover:bg-pink-200',
                                        'bg-orange-100 hover:bg-orange-200',
                                        'bg-teal-100 hover:bg-teal-200',
                                        'bg-rose-100 hover:bg-rose-200'
                                    ];
                                    const colorClass = pastelColors[index % pastelColors.length];

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleGenerate(persona)}
                                            disabled={loading}
                                            className={`group relative p-4 flex flex-col items-center justify-center transition-all duration-200 transform
                                                 bg-white border-[1.5px] border-black rounded-lg hover:bg-gray-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                             `}
                                        >
                                            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform filter drop-shadow-sm">
                                                {persona.emoji}
                                            </span>
                                            <span className="font-black text-sm text-gray-800 text-center leading-tight">
                                                {persona.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                                                {persona.category}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {loading && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-[#FF2D85] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[#FF2D85] font-bold animate-pulse">AI is generating your quiz...</span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Dashboard Content */}
                    <section className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-[#FF2D85] to-pink-400 p-4 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">
                                {activeTab === 'quizzes' ? '🎮 Quiz Management' : '🔗 Service Management'}
                            </h2>
                        </div>

                        {activeTab === 'quizzes' ? (
                            <>
                                {/* Filters */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {filterTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${filterType === type
                                                    ? 'bg-[#FF2D85] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type === 'all' ? 'All' : getTypeLabel(type)}
                                            </button>
                                        ))}
                                    </div>
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
                                                        <td colSpan={6} className="p-8 text-center text-gray-400">
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
                                                                {formatDate(quiz.created_at)}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => toggleStatus(quiz.id)}
                                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${quiz.status === 'visible' || quiz.is_active !== false
                                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                                        }`}
                                                                >
                                                                    {quiz.status === 'visible' || quiz.is_active !== false ? 'ON' : 'OFF'}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => deleteQuiz(quiz.id)}
                                                                    className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-500 rounded-lg transition-all duration-200"
                                                                >
                                                                    🗑️ Delete
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
                        ) : (
                            <div className="p-6">
                                {/* Add Service Form */}
                                <div className="bg-pink-50 rounded-xl p-6 mb-8 border border-pink-100">
                                    <h3 className="text-lg font-bold text-[#FF2D85] mb-4">✨ Add New AI Service</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Service Name"
                                            value={newServiceTitle}
                                            onChange={(e) => setNewServiceTitle(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <select
                                            value={newServiceCategory}
                                            onChange={(e) => setNewServiceCategory(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        >
                                            <option value="">Select Category</option>
                                            {SERVICE_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Service URL (https://...)"
                                            value={newServiceUrl}
                                            onChange={(e) => setNewServiceUrl(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            value={newServiceImage}
                                            onChange={(e) => setNewServiceImage(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <div className="md:col-span-2">
                                            <textarea
                                                placeholder="Description (Short & Catchy)"
                                                value={newServiceDesc}
                                                onChange={(e) => setNewServiceDesc(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddService}
                                        className="bg-[#FF2D85] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#E01E70] transition-colors shadow-md"
                                    >
                                        + Add Service
                                    </button>
                                </div>

                                {/* Services List */}
                                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name</th>
                                                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                                                <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {services.map((svc) => (
                                                <tr key={svc.id} className="hover:bg-pink-50 transition-colors">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img src={svc.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        <div>
                                                            <div className="font-bold text-gray-800">{svc.title}</div>
                                                            <div className="text-xs text-gray-500">{svc.description}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-blue-500 truncate max-w-[200px]">
                                                        <a href={svc.url} target="_blank" rel="noreferrer" className="hover:underline">{svc.url}</a>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500">{svc.category}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Delete service?')) {
                                                                    await fetch(`http://localhost:8000/api/services/${svc.id}`, { method: 'DELETE' });
                                                                    fetchServices();
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
};

export default Admin;